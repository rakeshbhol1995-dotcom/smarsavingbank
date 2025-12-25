// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";
import "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";

/**
 * @title Invest One Dollar
 * @dev Advanced No-Loss Lottery Protocol on Polygon
 * Upgrade: Chainlink VRF v2 & Automation
 * Note: Cleaned up duplicates and unused variables. 
 */

interface IPool {
    function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external;
    function withdraw(address asset, uint256 amount, address to) external returns (uint256);
}

interface IPoolAddressesProvider {
    function getPool() external view returns (address);
}

// INHERITANCE: VRFConsumerBaseV2Plus handles ownership (ConfirmedOwner)
contract SmartSavingBank is VRFConsumerBaseV2Plus, AutomationCompatibleInterface {
    IERC20 public usdtToken;

    // --- Chainlink VRF Variables ---
    uint256 public s_subscriptionId;
    bytes32 public keyHash; // Gas Lane
    uint32 public callbackGasLimit = 2500000; // Increased
    uint16 public requestConfirmations = 3;
    uint32 public numWords = 1;

    // --- Automation State ---
    uint256 public lastDailyDrawTime;
    uint256 public lastWeeklyDrawTime;
    uint256 public lastGrantDrawTime; // NEW

    enum DrawType { NONE, DAILY, WEEKLY, GRANT }
    mapping(uint256 => DrawType) public s_requests; /* requestId -> DrawType */

    // --- Constants ---
    uint256 public constant PASS_PRICE_E6 = 1050000; // 1.05 USDT
    uint256 public constant PRINCIPAL_E6 = 1000000;  // 1.00 USDT
    uint256 public constant FEE_E6 = 50000;          // 0.05 USDT
    uint256 public constant WEEKLY_CAP_E6 = 113000 * 1e6; 
    uint256 public constant HIGH_TVL_THRESHOLD_E6 = 1000000 * 1e6; 

    // --- State Variables ---
    struct Pass {
        uint256 id;
        address owner; // This is the PASS OWNER, not contract owner.
        uint256 timestamp;
        uint256 luckMultiplier; 
    }

    Pass[] public passes;
    mapping(address => uint256[]) public userPassIndices;


    // --- Pools ---
    uint256 public dailyPool;
    uint256 public weeklyPool;
    uint256 public grantPool;

    // --- Admin Seeding (SAFETY LOCK) ---
    uint256 public adminSeedPrincipal; 

    // --- Events ---
    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event PassBought(address indexed user, uint256 quantity, uint256[] passIds);
    event PassSold(address indexed user, uint256 quantity);
    event AdminSeedDeposited(uint256 amount);
    event AdminSeedWithdrawn(uint256 amount);
    event YieldDistributed(uint256 daily, uint256 weekly, uint256 fee);
    event DailyWinner(uint256 indexed passId, uint256 amount, string winCategory);
    event WeeklyWinner(uint256 indexed passId, uint256 amount, uint256 overflowAmount);
    event GrantDistributed(uint256 totalAmount, uint256 beneficiaries);
    event GrantApplied(address indexed user);
    event GrantWinner(address indexed user, uint256 amount); 
    event RequestSent(uint256 requestId, DrawType drawType);

    // --- Aave V3 Interfaces ---
    // (Defined at top of file)

    IPool public aavePool;
    address public constant AAVE_PROVIDER = 0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb; // Polygon V3

    constructor(
        address _usdtTokenAddress,
        address _vrfCoordinator,
        bytes32 _keyHash,
        uint256 _subscriptionId
    ) 
        VRFConsumerBaseV2Plus(_vrfCoordinator) 
    {
        usdtToken = IERC20(_usdtTokenAddress);
        keyHash = _keyHash;
        s_subscriptionId = _subscriptionId;
        
        // Init Aave Pool
        aavePool = IPool(IPoolAddressesProvider(AAVE_PROVIDER).getPool());

        lastDailyDrawTime = block.timestamp;
        lastWeeklyDrawTime = block.timestamp;
        lastGrantDrawTime = block.timestamp;
    }

    // ======================================
    // 1. Core User Functions (Direct Aave Integration)
    // ======================================

    // NOTE: 'deposit' and 'withdraw' removed. 
    // We use strict "Direct Flow":
    // Buy -> Wallet to Aave
    // Sell -> Aave to Wallet

    function buyPass(uint256 quantity) external {
        require(quantity > 0, "Min 1 pass");
        uint256 totalCost = PASS_PRICE_E6 * quantity;
        
        // Direct Buy (Pull from Wallet -> Aave)
        // 1. Pull USDT from User
        require(usdtToken.transferFrom(msg.sender, address(this), totalCost), "Transfer failed");
        
        // 2. Supply to Aave (Yield Generation)
        usdtToken.approve(address(aavePool), totalCost);
        aavePool.supply(address(usdtToken), totalCost, address(this), 0);
        
        // 3. Admin Fee (Extracted immediately from Aave to Owner)
        // Optimization: We could leave it, but for clarity we pay it out.
        uint256 feeAmount = FEE_E6 * quantity;
        try aavePool.withdraw(address(usdtToken), feeAmount, owner()) {} catch {}

        uint256[] memory newIds = new uint256[](quantity);
        for (uint256 i = 0; i < quantity; i++) {
            uint256 newId = passes.length;
            passes.push(Pass({
                id: newId,
                owner: msg.sender,
                timestamp: block.timestamp,
                luckMultiplier: 1000
            }));
            userPassIndices[msg.sender].push(newId);
            newIds[i] = newId;
        }
        emit PassBought(msg.sender, quantity, newIds);
    }

    function sellPass(uint256 quantity) external {
        require(userPassIndices[msg.sender].length >= quantity, "Not enough passes");
        for(uint256 i=0; i<quantity; i++) {
            uint256 lastUserPassIndex = userPassIndices[msg.sender].length - 1;
            uint256 indexToRemove = userPassIndices[msg.sender][lastUserPassIndex];

            uint256 lastIndexInArray = passes.length - 1;

            if (indexToRemove != lastIndexInArray) {
                Pass storage lastPass = passes[lastIndexInArray];
                passes[indexToRemove] = lastPass;

                uint256[] storage ownerIndices = userPassIndices[lastPass.owner];
                for (uint256 j = 0; j < ownerIndices.length; j++) {
                    if (ownerIndices[j] == lastIndexInArray) {
                        ownerIndices[j] = indexToRemove;
                        break;
                    }
                }
            }
            
            passes.pop(); 
            userPassIndices[msg.sender].pop();
        }
        
        uint256 refundAmount = PRINCIPAL_E6 * quantity;
        
        // AUTOMATIC WITHDRAWAL TO WALLET
        // Withdraw from Aave -> Send to User
        aavePool.withdraw(address(usdtToken), refundAmount, msg.sender);
        
        // No update to walletBalance needed as it goes OUT.
        emit PassSold(msg.sender, quantity);
    }

    // ======================================
    // 2. Admin Seeding & Yield
    // ======================================

    function depositSeed(uint256 amount) external onlyOwner {
        require(amount > 0, "Zero amount");
        require(usdtToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        adminSeedPrincipal += amount;
        emit AdminSeedDeposited(amount);
    }

    function withdrawSeed(uint256 amount) external onlyOwner {
        require(adminSeedPrincipal >= amount, "Insufficient seed balance");
        adminSeedPrincipal -= amount;
        require(usdtToken.transfer(msg.sender, amount), "Transfer failed");
        emit AdminSeedWithdrawn(amount);
    }

    function distributeYield(uint256 amount) external onlyOwner {
        uint256 dailyPart = (amount * 90) / 100;
        uint256 weeklyPart = (amount * 5) / 100;
        uint256 adminPart = amount - dailyPart - weeklyPart;

        dailyPool += dailyPart;
        weeklyPool += weeklyPart;
        aavePool.withdraw(address(usdtToken), adminPart, owner());
        emit YieldDistributed(dailyPart, weeklyPart, adminPart);
    }

    // ======================================
    // 3. Grant Application System
    // ======================================
    address[] public grantApplicants;
    mapping(address => bool) public hasAppliedForGrant;
    uint256 public grantWinnerCount = 20; // Default 20

    // Events moved to top

    function setGrantWinnerCount(uint256 _count) external onlyOwner {
        require(_count > 0, "Count must be > 0");
        grantWinnerCount = _count;
    }

    function applyForGrant() external {
        require(userPassIndices[msg.sender].length > 0, "Must hold a pass");
        require(!hasAppliedForGrant[msg.sender], "Already applied");
        
        grantApplicants.push(msg.sender);
        hasAppliedForGrant[msg.sender] = true;
        emit GrantApplied(msg.sender);
    }

    function _executeGrantDraw(uint256 randomness) internal {
        if (grantPool == 0 || grantApplicants.length == 0) return;

        // Use Admin Configured Count (capped by actual applicants)
        uint256 count = grantWinnerCount;
        if (grantApplicants.length < count) {
            count = grantApplicants.length;
        }

        uint256 amountPerUser = grantPool / count;
        uint256 distributed = 0;

        for (uint256 i = 0; i < count; i++) {
            // Vintage Logic for Grants: 50% Old, 50% New
            // We try to find a matching candidate
            address winner = address(0);
            
            // Try up to 5 times to find a match for the weighted criteria
            for (uint256 k = 0; k < 5; k++) {
                uint256 seed = uint256(keccak256(abi.encode(randomness, i, k)));
                uint256 candidateIndex = seed % grantApplicants.length;
                address candidate = grantApplicants[candidateIndex];

                // Check Vintage of Candidate (Based on their first pass)
                bool isOld = false;
                uint256[] memory pIds = userPassIndices[candidate];
                if (pIds.length > 0) {
                     // Check oldest pass (index 0 usually if sequential)
                     // Optimization: Just check the first one.
                     if (block.timestamp - passes[pIds[0]].timestamp >= 24 hours) {
                         isOld = true;
                     }
                }

                // 50/50 Split Rule
                bool seekOld = (seed % 100) < 50;
                
                if (seekOld == isOld) {
                    winner = candidate;
                    break;
                }
            }

            // Fallback if no match found
            if (winner == address(0)) {
                uint256 fbIndex = uint256(keccak256(abi.encode(randomness, i, 999))) % grantApplicants.length;
                winner = grantApplicants[fbIndex];
            }

            // Direct Payout
            try aavePool.withdraw(address(usdtToken), amountPerUser, winner) {
                distributed += amountPerUser;
                emit GrantWinner(winner, amountPerUser); 
            } catch {}
        }

        // Reset Grant Epoch
        emit GrantDistributed(distributed, count);
        grantPool = 0;
        
        // Reset Applicants for next week
        for(uint256 j=0; j<grantApplicants.length; j++){
            hasAppliedForGrant[grantApplicants[j]] = false;
        }
        delete grantApplicants;
    }

    function _selectWeightedMultiplier(uint256 seed) internal view returns (uint256) {
        return seed % passes.length;
    }

    // ======================================
    // 3. Chainlink Automation & VRF Requests
    // ======================================
    // ... (Keep existing automation triggers as they are fine) ...

    function requestDailyDraw() external onlyOwner {
        require(passes.length > 0, "No passes");
        require(dailyPool > 0, "No pool");
        _requestRandomWords(DrawType.DAILY);
    }

    function requestWeeklyDraw() external onlyOwner {
        require(passes.length > 0, "No passes");
        require(weeklyPool > 0, "No pool");
        _requestRandomWords(DrawType.WEEKLY);
    }

    function requestGrantDraw() external onlyOwner {
        require(passes.length > 0, "No passes");
        require(grantPool > 0, "No pool");
        _requestRandomWords(DrawType.GRANT);
    }

    // Automation Triggers
    function checkUpkeep(bytes calldata /* checkData */) external view override returns (bool upkeepNeeded, bytes memory performData) {
        bool dailyDue = (block.timestamp > lastDailyDrawTime + 24 hours) && (dailyPool > 0) && (passes.length > 0);
        bool weeklyDue = (block.timestamp > lastWeeklyDrawTime + 7 days) && (weeklyPool > 0) && (passes.length > 0);
        bool grantDue = (block.timestamp > lastGrantDrawTime + 7 days) && (grantPool > 0) && (passes.length > 0);
        
        upkeepNeeded = dailyDue || weeklyDue || grantDue;
        
        if (dailyDue) {
            performData = abi.encode(DrawType.DAILY);
        } else if (weeklyDue) {
            performData = abi.encode(DrawType.WEEKLY);
        } else if (grantDue) {
            performData = abi.encode(DrawType.GRANT);
        }
    }

    function performUpkeep(bytes calldata performData) external override {
        DrawType drawType = abi.decode(performData, (DrawType));
        
        if (drawType == DrawType.DAILY) {
            require((block.timestamp > lastDailyDrawTime + 24 hours) && (dailyPool > 0), "Daily not ready");
            lastDailyDrawTime = block.timestamp;
            _requestRandomWords(DrawType.DAILY);
        } else if (drawType == DrawType.WEEKLY) {
            require((block.timestamp > lastWeeklyDrawTime + 7 days) && (weeklyPool > 0), "Weekly not ready");
            lastWeeklyDrawTime = block.timestamp;
            _requestRandomWords(DrawType.WEEKLY);
        } else if (drawType == DrawType.GRANT) {
            require((block.timestamp > lastGrantDrawTime + 7 days) && (grantPool > 0), "Grant not ready");
            lastGrantDrawTime = block.timestamp;
            _requestRandomWords(DrawType.GRANT);
        }
    }

    function _requestRandomWords(DrawType drawType) internal {
        VRFV2PlusClient.RandomWordsRequest memory req = VRFV2PlusClient.RandomWordsRequest({
            keyHash: keyHash,
            subId: s_subscriptionId,
            requestConfirmations: requestConfirmations,
            callbackGasLimit: callbackGasLimit,
            numWords: numWords,
            extraArgs: VRFV2PlusClient._argsToBytes(VRFV2PlusClient.ExtraArgsV1({nativePayment: false}))
        });
        uint256 requestId = s_vrfCoordinator.requestRandomWords(req);
        s_requests[requestId] = drawType;
        emit RequestSent(requestId, drawType);
    }

    function fulfillRandomWords(uint256 requestId, uint256[] calldata randomWords) internal override {
        DrawType drawType = s_requests[requestId];
        uint256 randomness = randomWords[0];

        if (drawType == DrawType.DAILY) {
            _executeDailyDraw(randomness);
        } else if (drawType == DrawType.WEEKLY) {
            _executeWeeklyDraw(randomness);
        } else if (drawType == DrawType.GRANT) {
            _executeGrantDraw(randomness);
        }
    }

    // ======================================
    // 4. Core Draw Execution (Internal) 
    // ======================================

    function calculateTVL() public view returns (uint256) {
        uint256 passValue = passes.length * PRINCIPAL_E6;
        return passValue + dailyPool + weeklyPool + grantPool + adminSeedPrincipal;
    }

    event MinorWinnersDistributed(uint256 totalAmount, uint256 count);
    event CommunityWinnersDistributed(uint256 totalAmount, uint256 count);

    function _distributeToWinners(uint256 seed, uint256 count, uint256 totalAmount) internal {
        if (count == 0 || passes.length == 0) return;
        uint256 amountPerUser = totalAmount / count;
        
        for (uint256 i = 0; i < count; i++) {
            uint256 iterSeed = uint256(keccak256(abi.encode(seed, i, "BATCH")));
            uint256 winnerIndex = _selectWeightedWinner(iterSeed, 50); 
            Pass storage p = passes[winnerIndex];
            
            // Direct Payout
            try aavePool.withdraw(address(usdtToken), amountPerUser, p.owner) {} catch {}
        }
    }

    function _executeDailyDraw(uint256 randomness) internal {
        if (passes.length == 0 || dailyPool == 0) return;

        uint256 tvl = calculateTVL();
        bool isHighTVL = tvl > HIGH_TVL_THRESHOLD_E6;

        uint256 grantTax = (dailyPool * 10) / 100;
        uint256 netPrize = dailyPool - grantTax;
        grantPool += grantTax;
        dailyPool = 0;

        // Daily: 90% Old, 10% New
        uint256 winnerIndex = _selectWeightedWinner(randomness, 90);
        Pass storage p = passes[winnerIndex];

        if (isHighTVL) {
            uint256 majorPrize = (netPrize * 40) / 100;
            uint256 minorPrizePool = netPrize - majorPrize;
            
            // Major Winner Direct Payout
            try aavePool.withdraw(address(usdtToken), majorPrize, p.owner) {} catch {}
            emit DailyWinner(p.id, majorPrize, "Major");
            p.luckMultiplier = 10; 

            // Distribute remaining 60% to 50 Minor Winners
            _distributeToWinners(randomness, 50, minorPrizePool);
            emit MinorWinnersDistributed(minorPrizePool, 50);
        } else {
            // Standard Winner Direct Payout
            try aavePool.withdraw(address(usdtToken), netPrize, p.owner) {} catch {}
            emit DailyWinner(p.id, netPrize, "Standard");
        }
    }

    function _executeWeeklyDraw(uint256 randomness) internal {
        if (passes.length == 0) return;

        uint256 grossPrize = weeklyPool;
        uint256 overflow = 0;

        if (grossPrize > WEEKLY_CAP_E6) {
            overflow = grossPrize - WEEKLY_CAP_E6;
            grossPrize = WEEKLY_CAP_E6;
        }

        uint256 tax = (grossPrize * 10) / 100;
        uint256 overflowTax = (overflow * 10) / 100;
        
        uint256 netPrize = grossPrize - tax;
        uint256 netOverflow = overflow - overflowTax;

        grantPool += (tax + overflowTax);
        weeklyPool = 0;

        // Weekly: 70% Old, 30% New
        uint256 winnerIndex = _selectWeightedWinner(randomness, 70);
        Pass storage p = passes[winnerIndex];
        
        // Winner Direct Payout
        try aavePool.withdraw(address(usdtToken), netPrize, p.owner) {} catch {}

        if (overflow > 0) {
            _distributeToWinners(randomness, 100, netOverflow);
            emit CommunityWinnersDistributed(netOverflow, 100);
        }

        if (calculateTVL() > HIGH_TVL_THRESHOLD_E6) {
            p.luckMultiplier = 10;
        }
        emit WeeklyWinner(p.id, netPrize, netOverflow);
    }

    // ======================================
    // 5. Helpers (Weighted Logic)
    // ======================================

    function _selectWeightedWinner(uint256 seed, uint256 threshold) internal view returns (uint256) {
        bool seekOld = (seed % 100) < threshold;
        
        for (uint256 i = 0; i < 8; i++) { // Increased attempts for better fairness
            uint256 candidateIndex = uint256(keccak256(abi.encode(seed, i))) % passes.length;
            Pass storage p = passes[candidateIndex];
            
            uint256 ageSeconds = block.timestamp - p.timestamp;
            
            if (seekOld) {
                // OLDER = HIGHER CHANCE
                // Cap at 90 days (3 Months) for max vintage weight
                // Logic: A pass wins if its "Vintage Score" beats a sub-random check
                
                uint256 vintageScore = 0;
                if (ageSeconds >= 90 days) {
                    vintageScore = 100;
                } else {
                    // Scaled 0 to 100 based on age
                    vintageScore = (ageSeconds * 100) / 90 days; 
                }
                
                // Use a different slice of local randomness for the probability check
                uint256 check = uint256(keccak256(abi.encode(seed, i, "VINTAGE"))) % 100;
                
                // Acceptance Logic:
                // 1. Must be > 24 hours to even be considered "Old"
                // 2. The older it is (higher vintageScore), the more likely it passes the check.
                if (ageSeconds > 24 hours && vintageScore >= check) {
                    return candidateIndex;
                }
            } else {
                // SEEK NEW: Prioritize recent passes (< 24 hrs)
                if (ageSeconds <= 24 hours) return candidateIndex;
            }
        }
        // Fallback: Just return a random one if loop fails
        return uint256(keccak256(abi.encode(seed, 999))) % passes.length;
    }
    function getUserPassIds(address user) external view returns (uint256[] memory) {
        return userPassIndices[user];
    }

    function getPass(uint256 id) external view returns (Pass memory) {
        return passes[id];
    }
}

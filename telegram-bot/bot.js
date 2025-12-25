require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { ethers } = require('ethers');
const fs = require('fs');
const CONTRACT_ABI = require('./abi');

// 1. Configuration
const token = process.env.TELEGRAM_BOT_TOKEN;
const CONTRACT_ADDRESS = "0x86B4a475D1C672e63864A2b682FBcbD154960333";
// Using public Polygon RPC
const RPC_URL = "https://polygon-rpc.com";

if (!token) {
    console.error("ERROR: TELEGRAM_BOT_TOKEN is missing in .env file");
    process.exit(1);
}

// Setup Provider & Contract
const provider = new ethers.JsonRpcProvider(RPC_URL);
const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

// 2. Setup Bot
const bot = new TelegramBot(token, { polling: true });

console.log("🤖 Smart Saving Bank Bot is STARTING...");

// Verify connection
bot.getMe().then((me) => {
    console.log(`✅ SUCCESS: Connected as @${me.username}`);
    console.log("🚀 Bot is ready to receive commands!");
}).catch((err) => {
    console.error("❌ CONNECTION ERROR:", err.code);
});

// Error Handling
bot.on("polling_error", (err) => {
    console.log("Polling Error (Ignored):", err.code);
});

bot.on("webhook_error", (err) => {
    console.log("Webhook Error:", err);
});

// DEBUG: Log every message
bot.on('message', (msg) => {
    console.log(`[DEBUG] Received message from ${msg.chat.first_name}: ${msg.text}`);
});

// 3. Command: /start
bot.onText(/\/start/, (msg) => {
    console.log(`[DEBUG] /start command received from ${msg.chat.first_name}`);
    const chatId = msg.chat.id;
    const welcomeMessage = `
<b>🏦 Welcome to Smart Saving Bank Bot!</b>

Use this bot to track your savings and check winners.

<b>Commands:</b>
/status - Check Protocol TVL
/winners - See Latest Winners
/my_pass &lt;address&gt; - Check your Pass Balance
    `;
    bot.sendMessage(chatId, welcomeMessage, { parse_mode: "HTML" }).then(() => {
        console.log(`[DEBUG] Welcome message sent to ${msg.chat.first_name}`);
    }).catch((err) => {
        console.error(`[ERROR] Failed to send welcome message:`, err);
    });
});

// 4. Command: /status (Fetch live TVL)
bot.onText(/\/status/, async (msg) => {
    bot.sendMessage(msg.chat.id, "🔍 Fetching TVL...");
    try {
        const tvl = await contract.calculateTVL();
        const formattedTVL = ethers.formatUnits(tvl, 6);
        bot.sendMessage(msg.chat.id, `🟢 *System is Online*\n💰 *Current TVL:* $${Math.floor(Number(formattedTVL))}`, { parse_mode: "Markdown" });
    } catch (error) {
        console.error(error);
        bot.sendMessage(msg.chat.id, "❌ Error fetching TVL. Try again later.");
    }
});

// 5. Command: /my_pass (Check Balance)
bot.onText(/\/my_pass (.+)/, async (msg, match) => {
    const address = match[1];
    if (!ethers.isAddress(address)) {
        bot.sendMessage(msg.chat.id, "❌ Invalid Address provided.");
        return;
    }

    bot.sendMessage(msg.chat.id, "🔍 Checking Passes...");
    try {
        const passIds = await contract.getUserPassIds(address);
        if (passIds.length === 0) {
            bot.sendMessage(msg.chat.id, "🎫 You have *0 Passes*.", { parse_mode: "Markdown" });
        } else {
            bot.sendMessage(msg.chat.id, `🎫 *Your Passes:* ${passIds.length}\nIDs: ${passIds.join(', ')}`, { parse_mode: "Markdown" });
        }
    } catch (error) {
        console.error(error);
        bot.sendMessage(msg.chat.id, "❌ Error fetching passes.");
    }
});

// 6. Command: /winners (Fetch latest event logs)
bot.onText(/\/winners/, async (msg) => {
    bot.sendMessage(msg.chat.id, "🔍 Searching for Winners...");
    try {
        // Look for last 5000 blocks for DailyWinner event
        const filter = contract.filters.DailyWinner();
        const currentBlock = await provider.getBlockNumber();
        const startBlock = currentBlock - 10000; // Check last ~10000 blocks

        const events = await contract.queryFilter(filter, startBlock);

        if (events.length === 0) {
            bot.sendMessage(msg.chat.id, "⏳ No recent winners found (Last 24h).");
        } else {
            const lastEvent = events[events.length - 1]; // Only show the very last one
            const winnerId = lastEvent.args[0].toString();
            const amount = ethers.formatUnits(lastEvent.args[1], 6);

            bot.sendMessage(msg.chat.id, `🏆 *Latest Winner!*\n\n🎟 *Pass ID:* ${winnerId}\n💰 *Prize:* $${amount}`, { parse_mode: "Markdown" });
        }
    } catch (error) {
        console.error(error);
        bot.sendMessage(msg.chat.id, "❌ Error fetching winners.");
    }
});

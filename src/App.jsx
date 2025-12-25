import React, { useState, useEffect, useCallback } from 'react';
import {
  Wallet, TrendingUp, ShieldCheck, Award, ArrowRight, Users, Clock,
  ChevronRight, Landmark, Briefcase, Gift, Lock, Loader, CheckCircle2,
  AlertCircle, DollarSign, ExternalLink, Menu, X, Home, PiggyBank,
  Heart, FileText, Smartphone, RefreshCw, Info, Sparkles, HandCoins, Flag,
  LogOut, Globe, Zap, CreditCard, ChevronDown, Layers, Lightbulb, Ticket, QrCode, Settings, Download, Crown
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ethers } from 'ethers';
import { EthereumProvider } from '@walletconnect/ethereum-provider';

// Polyfill check - handled by vite-plugin-node-polyfills
// if (typeof window !== 'undefined') {
//   if (!window.global) window.global = window;
//   // if (!window.Buffer) window.Buffer = require('buffer').Buffer; // CRASHES VITE
//   if (!window.process) window.process = { env: {} };
// }

// Web3Auth Removed as per user request
// const WEB3AUTH_CLIENT_ID = "REMOVED";
import LegalDocs from './LegalDocs';

// --- Web3 Constants ---
const CONTRACT_ADDRESS = "0x86B4a475D1C672e63864A2b682FBcbD154960333";

// --- CONFIGURATION ZONE (EDIT HERE) ---
const ADMIN_CONFIG = {
  UPI_ID: "your-upi-id@okicici", // CHANGE THIS: Your UPI ID
  WHATSAPP_NUMBER: "919000000000", // CHANGE THIS: Your WhatsApp Number (with country code)
  QR_IMAGE_URL: "", // Optional: URL to your QR Code Image
  IS_P2P_ENABLED: true, // Toggle for Binance P2P Button
  ONRAMP_APP_ID: "1", // Onramp.money App ID (Default: 1 for Demo)
};
// ----------------------------------------


const USDT_ADDRESS = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F";
const READ_ONLY_PROVIDER_URL = "https://polygon-rpc.com"; // Public RPC


const CONTRACT_ABI = [{ "inputs": [{ "internalType": "address", "name": "_usdtTokenAddress", "type": "address" }, { "internalType": "address", "name": "_vrfCoordinator", "type": "address" }, { "internalType": "bytes32", "name": "_keyHash", "type": "bytes32" }, { "internalType": "uint256", "name": "_subscriptionId", "type": "uint256" }], "stateMutability": "nonpayable", "type": "constructor" }, { "inputs": [{ "internalType": "address", "name": "have", "type": "address" }, { "internalType": "address", "name": "want", "type": "address" }], "name": "OnlyCoordinatorCanFulfill", "type": "error" }, { "inputs": [{ "internalType": "address", "name": "have", "type": "address" }, { "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "coordinator", "type": "address" }], "name": "OnlyOwnerOrCoordinator", "type": "error" }, { "inputs": [], "name": "ZeroAddress", "type": "error" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "AdminSeedDeposited", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "AdminSeedWithdrawn", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "totalAmount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "count", "type": "uint256" }], "name": "CommunityWinnersDistributed", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "vrfCoordinator", "type": "address" }], "name": "CoordinatorSet", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "uint256", "name": "passId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }, { "indexed": false, "internalType": "string", "name": "winCategory", "type": "string" }], "name": "DailyWinner", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "Deposited", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "user", "type": "address" }], "name": "GrantApplied", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "totalAmount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "beneficiaries", "type": "uint256" }], "name": "GrantDistributed", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "GrantWinner", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "totalAmount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "count", "type": "uint256" }], "name": "MinorWinnersDistributed", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }], "name": "OwnershipTransferRequested", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }], "name": "OwnershipTransferred", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "quantity", "type": "uint256" }, { "indexed": false, "internalType": "uint256[]", "name": "passIds", "type": "uint256[]" }], "name": "PassBought", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "quantity", "type": "uint256" }], "name": "PassSold", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "requestId", "type": "uint256" }, { "indexed": false, "internalType": "enum SmartSavingBank.DrawType", "name": "drawType", "type": "uint8" }], "name": "RequestSent", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "uint256", "name": "passId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "overflowAmount", "type": "uint256" }], "name": "WeeklyWinner", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "Withdrawn", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "daily", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "weekly", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "fee", "type": "uint256" }], "name": "YieldDistributed", "type": "event" }, { "inputs": [], "name": "AAVE_PROVIDER", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "FEE_E6", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "HIGH_TVL_THRESHOLD_E6", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "PASS_PRICE_E6", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "PRINCIPAL_E6", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "WEEKLY_CAP_E6", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "aavePool", "outputs": [{ "internalType": "contract IPool", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "acceptOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "adminSeedPrincipal", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "applyForGrant", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "quantity", "type": "uint256" }], "name": "buyPass", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "calculateTVL", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "callbackGasLimit", "outputs": [{ "internalType": "uint32", "name": "", "type": "uint32" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "bytes", "name": "", "type": "bytes" }], "name": "checkUpkeep", "outputs": [{ "internalType": "bool", "name": "upkeepNeeded", "type": "bool" }, { "internalType": "bytes", "name": "performData", "type": "bytes" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "dailyPool", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "depositSeed", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "distributeYield", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "id", "type": "uint256" }], "name": "getPass", "outputs": [{ "components": [{ "internalType": "uint256", "name": "id", "type": "uint256" }, { "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "uint256", "name": "timestamp", "type": "uint256" }, { "internalType": "uint256", "name": "luckMultiplier", "type": "uint256" }], "internalType": "struct SmartSavingBank.Pass", "name": "", "type": "tuple" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "user", "type": "address" }], "name": "getUserPassIds", "outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "grantApplicants", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "grantPool", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "grantWinnerCount", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "hasAppliedForGrant", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "keyHash", "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "lastDailyDrawTime", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "lastGrantDrawTime", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "lastWeeklyDrawTime", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "numWords", "outputs": [{ "internalType": "uint32", "name": "", "type": "uint32" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "owner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "passes", "outputs": [{ "internalType": "uint256", "name": "id", "type": "uint256" }, { "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "uint256", "name": "timestamp", "type": "uint256" }, { "internalType": "uint256", "name": "luckMultiplier", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "bytes", "name": "performData", "type": "bytes" }], "name": "performUpkeep", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "requestId", "type": "uint256" }, { "internalType": "uint256[]", "name": "randomWords", "type": "uint256[]" }], "name": "rawFulfillRandomWords", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "requestConfirmations", "outputs": [{ "internalType": "uint16", "name": "", "type": "uint16" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "requestDailyDraw", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "requestGrantDraw", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "requestWeeklyDraw", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "s_requests", "outputs": [{ "internalType": "enum SmartSavingBank.DrawType", "name": "", "type": "uint8" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "s_subscriptionId", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "s_vrfCoordinator", "outputs": [{ "internalType": "contract IVRFCoordinatorV2Plus", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "quantity", "type": "uint256" }], "name": "sellPass", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_vrfCoordinator", "type": "address" }], "name": "setCoordinator", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_count", "type": "uint256" }], "name": "setGrantWinnerCount", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "to", "type": "address" }], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "usdtToken", "outputs": [{ "internalType": "contract IERC20", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }, { "internalType": "uint256", "name": "", "type": "uint256" }], "name": "userPassIndices", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "weeklyPool", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "withdrawSeed", "outputs": [], "stateMutability": "nonpayable", "type": "function" }];

const USDT_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)"
];

const AAVE_POOL_DATA_PROVIDER = "0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654";
const AAVE_ABI = [
  "function getReserveData(address asset) view returns (uint256 unbacked, uint256 accruedToTreasury, uint256 totalAToken, uint256 totalStableDebt, uint256 totalVariableDebt, uint256 liquidityRate, uint256 variableBorrowRate, uint256 stableBorrowRate, uint256 averageStableBorrowRate, uint256 liquidityIndex, uint256 variableBorrowIndex, uint40 lastUpdateTimestamp)"
];

// --- Utility ---
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// V43: Cosmetic Serial Number Generator (Deterministic)
// V45: Fully Unique Hash-based Serial (Hides sequential ID)
const generateSerialNumber = (id, timestamp) => {
  // Logic: TKT-{Year}-{Hash(ID, Timestamp)}
  // This ensures no "0" or "1" logic is visible, looking like a real lottery ticket.

  const ts = timestamp || (1672531200000 + Number(id) * 60000);
  const dateObj = new Date(ts);
  const year = dateObj.getFullYear().toString().slice(-2);
  const day = dateObj.getDate().toString().padStart(2, '0');

  // Create a deterministic hash from ID and Timestamp
  // We use a simple mix function to get a random-looking hex string
  const seed = Number(id) * 1337 + (ts % 99999);
  const hash = (seed * 997).toString(16).toUpperCase().slice(-6).padStart(6, 'X');

  // Format: TKT-2431-A1B2C3
  return `TKT-${year}${day}-${hash}`;
};

// Vintage Power Calculator (0 to 100%)
// Vintage Power Calculator (0 to 100%)
// Logic: 90 Days = Max Power (100%)
const getVintagePower = (timestamp) => {
  const ONE_DAY_MS = 86400000;
  const ageMs = Date.now() - timestamp;
  const ageDays = ageMs / ONE_DAY_MS;

  // Power = (Age / 90) * 100, capped at 100
  const power = Math.min(100, (ageDays / 90) * 100);
  return Math.floor(power);
};

// --- Component Primitives ---
const GlassCard = ({ children, className, glow = false }) => (
  <div
    className={cn(
      "glass-panel rounded-3xl p-8 relative overflow-hidden group border border-white/5 bg-white/5 backdrop-blur-2xl transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 hover:border-white/10",
      glow && "after:absolute after:inset-0 after:bg-financial-green/5 after:opacity-0 after:hover:opacity-100 after:transition-opacity after:duration-500",
      className
    )}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    {children}
  </div>
);

// ErrorBoundary Removed


const Button = ({ children, className, variant = 'primary', onClick, disabled, fullWidth }) => {
  const variants = {
    primary: "bg-gradient-to-r from-financial-green to-emerald-600 hover:from-financial-green-glow hover:to-emerald-500 text-white shadow-lg shadow-emerald-900/30 border border-emerald-500/20",
    secondary: "bg-white/5 hover:bg-white/10 text-white border border-white/10 backdrop-blur-md",
    outline: "bg-transparent border border-white/10 hover:border-white/30 text-slate-400 hover:text-white",
    gold: "bg-gradient-to-r from-amber-400 to-premium-gold text-rich-dark font-bold shadow-lg shadow-amber-900/20",
    cta: "bg-white text-slate-950 hover:bg-slate-200 font-bold shadow-xl shadow-white/10"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "py-4 px-8 rounded-2xl font-medium transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105 active:scale-95",
        variants[variant],
        disabled && "opacity-50 cursor-not-allowed grayscale",
        fullWidth && "w-full",
        className
      )}
    >
      {children}
    </button>
  );
};

const LiveFeedSection = ({ winners, status }) => (
  <div className="w-full bg-slate-950 border-y border-white/5 py-2 overflow-hidden relative">
    <div className="max-w-7xl mx-auto flex items-center gap-4">
      {/* ... header ... */}
      <div className="flex items-center gap-2 px-4 border-r border-white/10 shrink-0">
        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
        <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Live Feed</span>
      </div>

      <div className="flex-1 overflow-hidden relative group">
        <div className="flex gap-12 animate-marquee whitespace-nowrap hover:[animation-play-state:paused]">
          {winners.length > 0 ? winners.map((w, i) => (
            // ... existing map ...
            <div key={i} className="flex items-center gap-2 text-xs font-mono">
              <span className={cn(
                "font-bold",
                w.type === 'Daily' && "text-financial-green",
                String(w.type || '').includes('Weekly') && "text-purple-400",
                String(w.type || '').includes('Grant') && "text-cyan-400",
                w.type === 'Buy' && "text-blue-400",
                w.type === 'Deposit' && "text-emerald-400"
              )}>{w.type}</span>
              <span className="text-slate-500">•</span>
              <span className="text-white">{w.user}</span>
              <span className="text-slate-500">{w.action || 'won'}</span>
              <span className="text-premium-gold font-bold">{w.amountDisplay}</span>
              <a href={`https://polygonscan.com/tx/${w.txHash}`} target="_blank" rel="noopener" className="opacity-50 hover:opacity-100"><ExternalLink className="w-3 h-3 text-slate-500" /></a>
            </div>
          )) : (
            <span className="text-slate-600 text-xs text-center w-full block animate-pulse">{status || "INITIALIZING_SYSTEM... (Please Wait)"}</span>
          )}
        </div>
      </div>
    </div>
  </div>
);

// --- Auth Screen ---
// --- Footer ---
const Footer = () => (
  <footer className="bg-[#020617] py-12 border-t border-white/5 relative z-10">
    <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">

      {/* Brand (Left) */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-financial-green/10 rounded-xl flex items-center justify-center border border-financial-green/20">
          <Landmark className="text-financial-green w-6 h-6" />
        </div>
        <div>
          <h4 className="text-white font-bold text-lg">Smart Saving Bank</h4>
          <p className="text-slate-500 text-xs text-left">Decentralized No-Loss Savings Protocol</p>
        </div>
      </div>

      {/* Contract Address (Center) */}
      <a
        href={`https://polygonscan.com/address/${CONTRACT_ADDRESS}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-xs text-slate-300 hover:text-financial-green transition-colors bg-white/5 px-4 py-2 rounded-xl border border-white/10 hover:border-financial-green/30 hover:bg-white/10"
      >
        <ShieldCheck className="w-4 h-4 text-financial-green" />
        <span className="font-mono tracking-wide">Contract: {CONTRACT_ADDRESS.slice(0, 6)}...{CONTRACT_ADDRESS.slice(-4)}</span>
        <ExternalLink className="w-3 h-3 ml-1 opacity-50" />
      </a>

      {/* Socials (Right) */}
      <div className="flex items-center gap-6">
        <a href="https://t.me/your_telegram_link" target="_blank" rel="noopener noreferrer" className="bg-slate-800 p-3 rounded-full text-slate-400 hover:text-blue-400 hover:bg-black transition-all border border-white/5 hover:border-blue-500/30 group">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-send w-5 h-5 group-hover:scale-110 transition-transform"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>
        </a>
        <a href="https://twitter.com/your_twitter_handle" target="_blank" rel="noopener noreferrer" className="bg-slate-800 p-3 rounded-full text-slate-400 hover:text-sky-500 hover:bg-black transition-all border border-white/5 hover:border-sky-500/30 group">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 group-hover:scale-110 transition-transform"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" /></svg>
        </a>
      </div>
    </div>
    <div className="text-center mt-8 text-slate-600 text-xs">
      &copy; 2024 Smart Saving Bank. All rights reserved.
    </div>
  </footer>
);

const LoginScreen = ({ onLogin, isLoggingIn }) => (
  <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-[#020617]">
    {/* Animated Background */}
    <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/20 via-[#020617] to-[#020617] z-0" />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-financial-green/10 rounded-full blur-[120px] animate-pulse-slow pointer-events-none" />

    <GlassCard className="max-w-md w-full relative z-10 p-10 border-t border-white/10 bg-slate-900/80 shadow-2xl">
      <div className="text-center mb-12">
        <div
          className="w-20 h-20 bg-gradient-to-tr from-financial-green to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-500/20 ring-1 ring-white/20"
        >
          <Landmark className="text-white w-10 h-10" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">Smart Saving Bank</h1>

        <p className="text-slate-400 text-lg">The Future of No-Loss Rewards.</p>
      </div>

      {/* Live Winners Ticker */}
      <div className="w-full bg-black/40 rounded-xl p-3 mb-6 overflow-hidden relative flex items-center border border-white/5">
        <div className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-slate-900 to-transparent z-10"></div>
        <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-slate-900 to-transparent z-10"></div>
        <div className="animate-marquee whitespace-nowrap flex gap-8 items-center">
          <span className="text-slate-500 text-xs font-bold uppercase">Recent Winners:</span>
          <span className="text-financial-green text-xs font-mono">0x71...8A21 won $50.00 (Daily)</span>
          <span className="text-purple-400 text-xs font-mono">0x33...9B12 won $1,240.00 (Weekly)</span>
          <span className="text-cyan-400 text-xs font-mono">0x99...1C2C won $25.00 (Grant)</span>
          <span className="text-financial-green text-xs font-mono">0xAA...1122 won $45.00 (Daily)</span>
        </div>
      </div>

      <div className="space-y-4">
        {/* MetaMask / Browser Wallet Only */}
        <Button fullWidth variant="primary" onClick={() => onLogin('metamask')} disabled={isLoggingIn} className="h-14 font-bold text-lg shadow-xl shadow-financial-green/20">
          {isLoggingIn ? <Loader className="w-5 h-5 animate-spin text-white" /> : <><Wallet className="w-5 h-5 mr-2" /> Connect Wallet</>}
        </Button>
      </div>

      <p className="text-center text-xs text-slate-500 mt-10">
        Requires MetaMask, TrustWallet, or any Web3 Browser.
      </p>
    </GlassCard>
  </div>
);

// --- Sections ---

const Navbar = ({ scrollToSection, account, onLogout, onBuyCrypto, onConnect }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={cn(
      "fixed top-0 inset-x-0 z-50 transition-all duration-300 border-b border-transparent",
      scrolled ? "bg-slate-900/80 backdrop-blur-xl border-white/5 py-4" : "bg-transparent py-6"
    )}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-financial-green rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Landmark className="text-white w-6 h-6" />
          </div>
          <span className="font-bold text-white text-xl tracking-tight hidden sm:block">Smart Saving Bank</span>
          <div className="flex items-center gap-1 bg-financial-green/10 text-financial-green px-2 py-1 rounded-full border border-financial-green/20 ml-2">
            <ShieldCheck className="w-3 h-3" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Audited</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8 bg-white/5 px-8 py-3 rounded-full border border-white/5 backdrop-blur-md">
          {['Dashboard', 'Save', 'Impact', 'Roadmap', 'Transparency'].map(item => (
            <button
              key={item}
              onClick={() => scrollToSection(item.toLowerCase())}
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              {item}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onBuyCrypto}
            className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white px-4 py-2 rounded-full font-bold shadow-lg shadow-indigo-900/20 border border-indigo-400/20 transition-all text-xs uppercase tracking-wider"
          >
            <CreditCard className="w-4 h-4" /> Buy Crypto
          </button>

          {!account ? (
            <button
              onClick={onConnect}
              className="flex items-center gap-2 bg-financial-green hover:bg-emerald-500 text-white px-5 py-2 rounded-full font-bold shadow-lg shadow-emerald-500/20 transition-all"
            >
              <Wallet className="w-4 h-4" /> Connect
            </button>
          ) : (
            <>
              <div className="hidden md:flex flex-col items-end mr-2">
                <span className="text-[10px] font-bold text-financial-green uppercase tracking-widest">Connected</span>
                <span className="text-xs font-mono text-slate-400">
                  {account.slice(0, 6)}...{account.slice(-4)}
                </span>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold ring-2 ring-white/10">
                {account.substring(2, 4).toUpperCase()}
              </div>
              <button
                onClick={onLogout}
                className="ml-2 p-2 rounded-full bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-white/5 hover:border-red-500/30 transition-all"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

const HeroSection = ({ protocolTVL = 0, dailyPool = 0, weeklyPool = 0 }) => (
  <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
    {/* Background FX - Now Transparent to show global background */}
    <div className="absolute top-0 inset-x-0 h-[800px] bg-gradient-to-b from-indigo-950/30 to-transparent pointer-events-none" />
    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-financial-green/5 rounded-full blur-[150px] pointer-events-none" />

    <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
      <div> {/* Replaced motion.div */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-emerald-300 text-sm font-medium mb-8 backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-premium-gold" /> Web3 Savings Reimagined
        </div>

        <h1 className="text-6xl md:text-8xl font-bold text-white tracking-tighter mb-8 leading-[1.1]">
          Smart Saving Bank.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-financial-green via-emerald-400 to-cyan-400">Where Savings Meet Destiny.</span>
        </h1>

        <p className="text-xl text-slate-400 max-w-lg mb-12 leading-relaxed">
          The world's first no-loss DeFi lottery powered by Polygon.
          Deposit USDT, keep your principal safe, and win daily rewards powered by Aave yields.
        </p>

        <div className="flex flex-wrap gap-4">
          <Button variant="cta" onClick={() => document.getElementById('save').scrollIntoView({ behavior: 'smooth' })}>
            Start Saving Now <ArrowRight className="w-5 h-5" />
          </Button>
          <Button variant="secondary" onClick={() => document.getElementById('dashboard').scrollIntoView({ behavior: 'smooth' })}>
            View Dashboard
          </Button>
        </div>

        <div className="mt-12 flex items-center gap-8 text-slate-500 text-sm font-medium">
          <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-financial-green" /> Principal 100% Safe</span>
          <span className="flex items-center gap-2"><Lock className="w-4 h-4 text-financial-green" /> Audited Contracts</span>
        </div>
      </div>

      {/* Hero Visual / Dashboard Preview */}
      <div className="relative hidden lg:block"> {/* Replaced motion.div */}
        <div className="absolute inset-0 bg-gradient-to-tr from-financial-green to-blue-500 rounded-[3rem] blur-2xl opacity-20 -z-10" />
        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl transform rotate-[-3deg] hover:rotate-0 transition-all duration-700">
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Total Value Locked</p>
              <p className="text-6xl font-bold text-white tracking-tight">${(Number(protocolTVL) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center">
              <TrendingUp className="text-financial-green w-8 h-8" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-black/40 rounded-xl p-4 flex items-center justify-between">
              <span className="text-slate-300">Daily Prize Pool</span>
              <span className="text-premium-gold font-bold text-xl">${(Number(dailyPool) || 0).toFixed(2)}</span>
            </div>
            <div className="bg-black/40 rounded-xl p-4 flex items-center justify-between">
              <span className="text-slate-300">Weekly Jackpot</span>
              <span className="text-purple-400 font-bold text-xl">${(Number(weeklyPool) || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Scroll Indicator */}
    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
      <ChevronDown className="w-8 h-8 text-slate-500 opacity-50" />
    </div>
  </section>
);

const DashboardSection = ({ walletBalance, passes, dailyPool, weeklyPool, grantPool, aaveApy, adminSeedAmount, protocolTVL, onAdminDeposit, onAdminWithdraw, hasAppliedForGrant, onApplyGrant, winners, onAddFunds, isOwner }) => {

  const safePasses = passes || [];
  const totalSavings = (Number(walletBalance) || 0) + (safePasses.length * 1.05);
  // TVL = Real Global TVL from Contract
  const totalProtocolLiquidity = protocolTVL;

  return (
    <section id="dashboard" className="pt-32 pb-20 relative">
      <div className="max-w-7xl mx-auto px-6">
        {/* V22: Protocol Stats Banner */}
        <div className="mb-12 bg-gradient-to-r from-indigo-950/40 to-slate-900/40 border border-white/5 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-financial-green via-premium-gold to-indigo-500 opacity-50"></div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">

            {/* TVL Block */}
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-500/10 rounded-xl">
                <TrendingUp className="w-8 h-8 text-indigo-400" />
              </div>
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Protocol Total Value Locked (TVL)</p>
                <h3 className="text-4xl font-bold text-white tracking-tight">
                  ${(Number(totalProtocolLiquidity) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
              </div>
            </div>

            {/* Divider (Desktop) */}
            <div className="hidden md:block w-[1px] h-12 bg-white/10"></div>

            {/* Live Yield Block */}
            <div className="flex items-center gap-4">
              <div className="p-3 bg-financial-green/10 rounded-xl relative">
                <Zap className="w-8 h-8 text-financial-green animate-pulse" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
              </div>
              <div>
                <a href="https://app.aave.com/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 group/link cursor-pointer">
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider group-hover/link:text-financial-green transition-colors">Live Aave APY (Polygon) <ExternalLink className="w-3 h-3 inline mb-1" /></p>
                </a>
                <div className="flex items-center gap-2">
                  <h3 className="text-3xl font-bold text-financial-green tracking-tight">
                    {aaveApy}%
                  </h3>
                  <span className="text-xs text-slate-500 font-mono bg-white/5 px-2 py-1 rounded">Real-Time</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-white">Your Dashboard</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <GlassCard className="bg-gradient-to-br from-slate-900 to-indigo-950/30">
            <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">My Total Net Worth</p>
            <h3 className="text-5xl font-bold text-white mb-4">${totalSavings.toFixed(2)}</h3>
            <div className="flex gap-2 mb-4">
              <button onClick={onAddFunds} className="flex-1 bg-financial-green/10 hover:bg-financial-green/20 text-financial-green py-2 rounded-lg text-xs font-bold uppercase border border-financial-green/20 transition-colors">
                + Get USDT (Deposit)
              </button>
              {/* Withdraw Removed - Automatic Payouts */}
            </div>
            <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-financial-green" style={{ width: `${Math.min(totalSavings, 100)}%` }} />
            </div>
            <p className="text-xs text-slate-500 mt-4">Wallet Balance (${walletBalance.toFixed(2)}) + Active Passes ({passes.length})</p>
          </GlassCard>

          <GlassCard className="bg-gradient-to-br from-slate-900 to-amber-950/20 border-premium-gold/10 relative overflow-hidden">
            <div className="absolute top-right-0 p-2"><Sparkles className="text-premium-gold/20 w-20 h-20 absolute top-[-10px] right-[-10px]" /></div>
            <div className="absolute top-right-0 p-2"><Sparkles className="text-premium-gold/20 w-20 h-20 absolute top-[-10px] right-[-10px]" /></div>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Daily Prize Pool (90%)</p>
            <h3 className="text-5xl font-bold text-premium-gold mb-6">${(Number(dailyPool) || 0).toFixed(4)}</h3>
            <div className="h-10 flex items-center justify-center text-xs text-premium-gold/50 font-mono border border-premium-gold/10 rounded-lg bg-premium-gold/5">
              Automated via Chainlink VRF
            </div>
          </GlassCard>

          <GlassCard className="bg-slate-900/40">
            <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Weekly Jackpot (5%)</p>
            <h3 className="text-5xl font-bold text-premium-gold mb-6">${(Number(weeklyPool) || 0).toFixed(4)}</h3>
            <div className="h-10 flex items-center justify-center text-xs text-purple-400/50 font-mono border border-purple-500/10 rounded-lg bg-purple-500/5">
              Automated via Chainlink Automation
            </div>
          </GlassCard>

          <GlassCard className="bg-slate-900/40 relative overflow-hidden">
            <div className="absolute top-right-0 p-2"><Users className="text-cyan-500/20 w-16 h-16 absolute top-[-5px] right-[-5px]" /></div>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Community Grant</p>
            <h3 className="text-3xl font-bold text-cyan-400 mb-4">${(Number(grantPool) || 0).toFixed(4)}</h3>

            {hasAppliedForGrant ? (
              <div className="w-full py-2 rounded-xl bg-green-500/20 border border-green-500/30 text-green-400 font-bold text-center text-xs flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Applied
              </div>
            ) : (
              <button
                onClick={onApplyGrant}
                className="w-full py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 text-cyan-400 font-bold text-xs uppercase transition-all"
              >
                Apply to Win
              </button>
            )}
            <p className="text-[10px] text-slate-500 mt-3 text-center">Weekly Draw • 50/50 Vintage Chance</p>
          </GlassCard>
        </div>



        {isOwner && (
          <div className="mt-8">
            <GlassCard className="bg-slate-900/80 border-red-500/30">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="text-xl font-bold text-red-400 mb-1 flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6" /> Admin Control Panel
                  </h3>
                  <div className="flex items-center gap-3 mb-2">
                    <p className="text-xs text-slate-500">Only visible to Contract Owner ({isOwner}).</p>
                    <div className="bg-red-500/10 border border-red-500/20 px-3 py-1 rounded text-xs font-bold text-red-400">
                      Verified Reserve: ${(Number(adminSeedAmount) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button onClick={onAdminDeposit} className="bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20">
                    + Add Liquidity (Seed)
                  </Button>
                  <Button onClick={onAdminWithdraw} variant="outline" className="text-red-400 border-red-500/20 hover:border-red-500/40">
                    - Withdraw Seed
                  </Button>
                </div>
              </div>
            </GlassCard>
            <p className="text-center text-xs text-slate-600 mt-4">
              * Liquidity added here increases the "Protocol Total Value Locked" for all users.
            </p>
          </div>
        )}

      </div >
      <LiveFeedSection winners={winners || []} />
    </section >
  );
};



const ImpactSection = ({ grantPool, hasAppliedForGrant, onApplyGrant, onDownloadReport }) => {

  return (
    <section id="impact" className="py-32 relative border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <h2 className="text-4xl font-bold text-white mb-6">Chainlink VRF Grants</h2>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed">
              Fairness guaranteed. We use Chainlink Verifiable Random Function (VRF) to automatically select 20 winners who receive a share of the accumulated tax.
            </p>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="p-6 bg-white/5 rounded-2xl border border-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-20"><Heart className="w-12 h-12 text-pink-500" /></div>
                <p className="text-slate-500 text-xs font-bold uppercase mb-2">Live Grant Pool</p>
                <p className="text-3xl font-bold text-white">${grantPool.toFixed(4)}</p>
              </div>
              <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-slate-500 text-xs font-bold uppercase mb-2">Winners Selected</p>
                <p className="text-3xl font-bold text-white">20</p>
              </div>
            </div>

            <div className="mb-8 w-full h-12 flex items-center justify-center bg-pink-600/10 border border-pink-500/20 text-pink-500 rounded-xl font-bold uppercase tracking-widest text-xs">
              <Heart className="w-4 h-4 mr-2" /> Grants Distributed Automatically
            </div>

            {!hasAppliedForGrant ? (
              <Button
                onClick={onApplyGrant}
                className="w-full h-14 text-lg bg-pink-600 hover:bg-pink-700 shadow-xl shadow-pink-500/20"
              >
                <Sparkles className="w-5 h-5 mr-2 text-white" /> Apply for Grant
              </Button>
            ) : (
              <Button variant="secondary" disabled className="w-full h-14 bg-financial-green/10 text-financial-green border-financial-green/20">
                <CheckCircle2 className="w-5 h-5 mr-2" /> Already Applied (Weekly)
              </Button>
            )}

            <div className="flex items-center justify-between mt-6">
              <p className="text-xs text-slate-500">One click entry. No forms needed.</p>
              <button
                onClick={onDownloadReport}
                className="text-xs text-pink-400 hover:text-pink-300 underline flex items-center gap-1"
              >
                <Download className="w-3 h-3" /> Download Weekly Report
              </button>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-4">Recent Grants</h3>
            {[1, 2, 3].map(i => (
              <GlassCard key={i} className="flex items-center justify-between p-6 bg-slate-900/40">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400">
                    <Heart className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-white">Medical Emergency Relief</p>
                    <p className="text-xs text-slate-500">Sent to 0x32...99AA • 2h ago</p>
                  </div>
                </div>
                <span className="font-bold text-white">$150.00</span>
              </GlassCard>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};




const RoadmapSection = () => (
  <section id="roadmap" className="py-24 relative overflow-hidden bg-[#020617]">
    {/* Background Elements */}
    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
    <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent"></div>

    <div className="max-w-7xl mx-auto px-6">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold text-white mb-4">Project Roadmap</h2>
        <p className="text-slate-400">Our vision for the future of decentralized savings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Phase 1 */}
        <GlassCard className="border-financial-green/30 bg-financial-green/5 relative group hover:-translate-y-2 transition-transform duration-300">
          <div className="absolute top-4 right-4 bg-financial-green text-black font-bold px-3 py-1 rounded-full text-[10px] tracking-widest shadow-lg shadow-financial-green/20">PHASE 1</div>
          <div className="h-12 w-12 bg-financial-green/20 rounded-xl flex items-center justify-center mb-4 text-financial-green border border-financial-green/20">
            <Flag className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-1">Foundation</h3>
          <p className="text-xs text-financial-green font-bold mb-4 uppercase tracking-wider">Completed</p>
          <ul className="text-slate-400 text-xs space-y-2.5">
            <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-financial-green shrink-0" /> Protocol Launch (Polygon)</li>
            <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-financial-green shrink-0" /> Smart Contract Audit</li>
            <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-financial-green shrink-0" /> Community Building</li>
          </ul>
        </GlassCard>

        {/* Phase 2 */}
        <GlassCard className="border-blue-500/30 bg-blue-500/5 relative group hover:-translate-y-2 transition-transform duration-300">
          <div className="absolute top-4 right-4 bg-blue-500 text-white font-bold px-3 py-1 rounded-full text-[10px] tracking-widest shadow-lg shadow-blue-500/20">PHASE 2</div>
          <div className="h-12 w-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4 text-blue-400 border border-blue-500/20">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-1">Growth</h3>
          <p className="text-xs text-blue-400 font-bold mb-4 uppercase tracking-wider">In Progress</p>
          <ul className="text-slate-400 text-xs space-y-2.5">
            <li className="flex gap-2"><div className="w-4 h-4 rounded-full border border-blue-500/50 flex items-center justify-center text-[8px] text-blue-500">➜</div> User Base: 10,000+</li>
            <li className="flex gap-2"><div className="w-4 h-4 rounded-full border border-blue-500/50 flex items-center justify-center text-[8px] text-blue-500">➜</div> Mobile App Launch</li>
            <li className="flex gap-2"><div className="w-4 h-4 rounded-full border border-blue-500/50 flex items-center justify-center text-[8px] text-blue-500">➜</div> Marketing campaign</li>
          </ul>
        </GlassCard>

        {/* Phase 3 */}
        <GlassCard className="border-purple-500/30 bg-purple-500/5 relative group hover:-translate-y-2 transition-transform duration-300">
          <div className="absolute top-4 right-4 bg-purple-500 text-white font-bold px-3 py-1 rounded-full text-[10px] tracking-widest shadow-lg shadow-purple-500/20">PHASE 3</div>
          <div className="h-12 w-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4 text-purple-400 border border-purple-500/20">
            <Globe className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-1">Ecosystem</h3>
          <p className="text-xs text-purple-400 font-bold mb-4 uppercase tracking-wider">Upcoming</p>
          <ul className="text-slate-400 text-xs space-y-2.5">
            <li className="flex gap-2"><div className="w-4 h-4 rounded-full border border-slate-700 block"></div> Multi-Chain (BSC/Arb)</li>
            <li className="flex gap-2"><div className="w-4 h-4 rounded-full border border-slate-700 block"></div> Governance Token</li>
            <li className="flex gap-2"><div className="w-4 h-4 rounded-full border border-slate-700 block"></div> DAO Voting System</li>
          </ul>
        </GlassCard>

        {/* Phase 4 */}
        <GlassCard className="border-premium-gold/30 bg-premium-gold/5 relative group hover:-translate-y-2 transition-transform duration-300">
          <div className="absolute top-4 right-4 bg-premium-gold text-black font-bold px-3 py-1 rounded-full text-[10px] tracking-widest shadow-lg shadow-premium-gold/20">PHASE 4</div>
          <div className="h-12 w-12 bg-premium-gold/20 rounded-xl flex items-center justify-center mb-4 text-premium-gold border border-premium-gold/20">
            <Crown className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-1">Token Launch</h3>
          <p className="text-xs text-premium-gold font-bold mb-4 uppercase tracking-wider">Future Vision</p>
          <ul className="text-slate-400 text-xs space-y-2.5">
            <li className="flex gap-2"><div className="w-4 h-4 rounded-full border border-slate-700 block"></div> Native Token ($BANK) Launch</li>
            <li className="flex gap-2"><div className="w-4 h-4 rounded-full border border-slate-700 block"></div> <strong>Airdrop to Pass Holders</strong></li>
            <li className="flex gap-2"><div className="w-4 h-4 rounded-full border border-slate-700 block"></div> Global Payment Card</li>
          </ul>
        </GlassCard>

      </div>
    </div>
  </section>
);


const YieldStructureSection = () => (
  <section className="py-24 bg-gradient-to-b from-[#020617] to-slate-900 border-t border-white/5 relative overflow-hidden">
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

    <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">

      {/* Visual Chart Side */}
      <div className="relative flex justify-center">
        <div className="absolute inset-0 bg-financial-green/20 blur-[60px] rounded-full animate-pulse-slow" />

        <div className="relative w-80 h-80 md:w-96 md:h-96 rounded-full bg-slate-900 border-8 border-slate-800 shadow-2xl flex items-center justify-center p-6">
          {/* Conic Gradient: Rotated to show 5% Weekly on Right */}
          <div
            className="absolute inset-0 rounded-full opacity-90"
            style={{
              background: `conic-gradient(from 126deg,
                #10b981 0deg 324deg, 
                #a855f7 324deg 342deg, 
                #fbbf24 342deg 360deg
              )`,
              maskImage: 'radial-gradient(transparent 62%, black 63%)',
              WebkitMaskImage: 'radial-gradient(transparent 62%, black 63%)'
            }}
          />

          <div className="flex flex-col items-center justify-center text-center z-10 bg-slate-950/90 backdrop-blur-sm rounded-full w-48 h-48 md:w-56 md:h-56 border border-white/10 shadow-inner">
            <ShieldCheck className="w-12 h-12 text-financial-green mb-2" />
            <h3 className="text-3xl font-bold text-white leading-none">100%</h3>
            <p className="text-emerald-400 text-xs font-bold uppercase tracking-wider mt-1">Principal Safe</p>
            <p className="text-[10px] text-slate-500 mt-2 max-w-[140px]">Deposit & Withdraw Anytime. No Locking.</p>
          </div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="absolute -left-2 top-1/4 bg-slate-900/90 backdrop-blur border border-financial-green/30 p-3 rounded-xl shadow-lg shadow-financial-green/10"
          >
            <p className="text-financial-green font-bold text-xl">90%</p>
            <p className="text-[10px] text-slate-400 uppercase font-bold">Daily Winners</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="absolute -right-2 top-1/3 bg-slate-900/90 backdrop-blur border border-purple-500/30 p-3 rounded-xl shadow-lg shadow-purple-500/10"
          >
            <p className="text-purple-400 font-bold text-xl">5%</p>
            <p className="text-[10px] text-slate-400 uppercase font-bold">Weekly Jackpot</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur border border-amber-500/30 p-3 rounded-xl shadow-lg shadow-amber-500/10"
          >
            <p className="text-amber-400 font-bold text-xl">5%</p>
            <p className="text-[10px] text-slate-400 uppercase font-bold">Operations</p>
          </motion.div>

        </div>
      </div>

      {/* Info Side */}
      <div>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-6">
          <Info className="w-4 h-4" /> Transparent Distribution
        </div>

        <h2 className="text-4xl font-bold text-white mb-6 leading-tight">Where does the <span className="text-financial-green">Reward Money</span> come from?</h2>
        <p className="text-slate-400 text-lg mb-8 leading-relaxed">
          Your Principal is deposited into <span className="text-white font-bold">Aave/Polygon</span> safe lending protocols. We only use the <span className="text-financial-green">Interest Generated</span> to fund the prizes.
        </p>

        <div className="space-y-6">
          <div className="flex items-center gap-5 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
            <div className="w-12 h-12 bg-financial-green/20 rounded-full flex items-center justify-center shrink-0">
              <Gift className="w-6 h-6 text-financial-green" />
            </div>
            <div>
              <h4 className="text-white font-bold text-lg">90% to Daily Winners</h4>
              <p className="text-xs text-slate-400 uppercase tracking-wider">Distributed every 24 hours</p>
            </div>
          </div>

          <div className="flex items-center gap-5 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
            <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center shrink-0">
              <Award className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h4 className="text-white font-bold text-lg">5% to Weekly Jackpot</h4>
              <p className="text-xs text-slate-400 uppercase tracking-wider">Massive accumulation pot</p>
            </div>
          </div>

          <div className="flex items-center gap-5 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h4 className="text-emerald-400 font-bold text-lg">Principal Always 100% Safe</h4>
              <p className="text-xs text-emerald-500/70 uppercase tracking-wider">Zero Loss Guarantee</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const TransparencySection = ({ onExportStats, onExportGlobal, onOpenLegal, winners, currentBlock }) => (
  <section id="transparency" className="py-32 bg-slate-950 border-t border-white/5">
    <div className="max-w-7xl mx-auto px-6 text-center">
      <h2 className="text-4xl font-bold text-white mb-2">100% On-Chain Transparency</h2>
      <p className="text-slate-400 mb-12">Every deposit, withdrawal, and reward is verifiable on PolygonScan.</p>

      {/* V28: Admin / Data Tools */}
      <div className="mb-12 flex flex-wrap justify-center gap-4">
        {/* User Button */}
        <Button onClick={onExportStats} variant="outline" className="border-financial-green/30 text-financial-green hover:bg-financial-green/10">
          <FileText className="w-4 h-4 mr-2" /> My Ledger (Personal)
        </Button>

        {/* Global Button */}
        <Button onClick={onExportGlobal} variant="primary" className="shadow-lg shadow-blue-500/20 bg-blue-600 hover:bg-blue-700 border-blue-400/20">
          <Globe className="w-4 h-4 mr-2" /> Download Global Ledger (Public)
        </Button>

      </div>

      <div className="overflow-x-auto rounded-3xl border border-white/10 bg-slate-900/50 text-left mx-auto max-w-5xl">
        <table className="w-full">
          <thead className="bg-white/5 text-slate-400 text-xs font-bold uppercase">
            <tr>
              <th className="p-6">Tx Hash</th>
              <th className="p-6">Type</th>
              <th className="p-6">Amount</th>
              <th className="p-6">Time (Block)</th>
              <th className="p-6 text-right">Verify</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-white/5">
            {(winners && winners.length > 0) ? winners.slice(0, 10).map((w, i) => (
              <tr key={i} className="hover:bg-white/5 transition-colors">
                <td className="p-6 font-mono text-slate-500">
                  {w.txHash ? `${w.txHash.slice(0, 6)}...${w.txHash.slice(-4)}` : 'Mining...'}
                </td>
                <td className="p-6 text-white font-medium">
                  <span className={cn(
                    "px-2 py-1 rounded text-xs font-bold",
                    w.type === 'Daily' && "bg-financial-green/10 text-financial-green",
                    String(w.type || '').includes('Weekly') && "bg-purple-500/10 text-purple-400",
                    String(w.type || '').includes('Grant') && "bg-cyan-500/10 text-cyan-400",
                    w.type === 'Buy' && "bg-blue-500/10 text-blue-400",
                    w.type === 'Sell' && "bg-red-500/10 text-red-400",
                    w.type === 'Deposit' && "bg-emerald-500/10 text-emerald-400"
                  )}>
                    {w.type === 'Daily' ? 'Reward Payout' : w.type}
                  </span>
                </td>
                <td className={cn("p-6 font-bold", w.type === 'Deposit' ? "text-white" : "text-financial-green")}>
                  {w.amountDisplay}
                </td>
                <td className="p-6 text-slate-500">
                  {w.blockNumber ? (currentBlock ? `${currentBlock - w.blockNumber} blks ago` : `Block #${w.blockNumber}`) : 'Pending'}
                </td>
                <td className="p-6 text-right">
                  <a href={`https://polygonscan.com/tx/${w.txHash}`} target="_blank" rel="noopener">
                    <ExternalLink className="w-4 h-4 text-slate-400 inline hover:text-white cursor-pointer" />
                  </a>
                </td>
              </tr>
            )) : (
              <tr className="hover:bg-white/5 transition-colors">
                <td colSpan="5" className="p-6 text-center text-slate-500 italic">
                  Waiting for blockchain activity...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center gap-8 mt-16 text-xs text-slate-500 font-medium uppercase tracking-widest">
        <button onClick={() => onOpenLegal('terms')} className="hover:text-white transition-colors uppercase">Terms of Service</button>
        <button onClick={() => onOpenLegal('privacy')} className="hover:text-white transition-colors uppercase">Privacy Policy</button>
        <button onClick={() => onOpenLegal('refund')} className="hover:text-white transition-colors uppercase">Withdrawal Policy</button>
        <button onClick={() => onOpenLegal('contact')} className="hover:text-white transition-colors uppercase">Contact Us</button>
      </div>
    </div>
  </section>
);

// --- Main App Logic ---



const PassStoreSection = ({
  walletBalance,
  onBuyPass
}) => {
  const [passQuantity, setPassQuantity] = useState(1);

  return (
    <section id="save" className="py-32 bg-slate-950/50 relative border-t border-white/5">
      <div className="max-w-4xl mx-auto px-6">

        {/* Buy Pass Module - Centered */}
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold text-white mb-4">Start Your Savings Journey</h2>
          <p className="text-slate-400">Buy a 'Smart Saving Pass' to enter all future draws automatically. 100% Refundable.</p>
        </div>

        <GlassCard className="p-10 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-900 border-financial-green/30 relative overflow-hidden shadow-2xl max-w-lg mx-auto transform hover:scale-[1.02] transition-transform duration-500">
          <div className="absolute top-0 right-0 p-4 bg-financial-green/10 rounded-bl-3xl border-l border-b border-financial-green/20">
            <span className="text-financial-green font-bold text-xs uppercase tracking-wider">Best Value</span>
          </div>

          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-tr from-financial-green to-emerald-500 rounded-full mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-6 ring-4 ring-white/5">
              <Award className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-white">Smart Saving Pass</h3>
            <p className="text-slate-400 text-sm mt-3">Entry ticket to all daily draws. Fully refundable anytime.</p>
          </div>

          {/* Quantity Input */}
          <div className="mb-8">
            <label className="text-slate-500 font-bold uppercase mb-4 block text-center text-xs">Enter Quantity</label>
            <div className="flex items-center justify-center gap-6">
              <button onClick={() => setPassQuantity(Math.max(1, passQuantity - 1))} className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 active:scale-95 transition-all text-xl font-bold">-</button>
              <input
                type="number"
                value={passQuantity}
                onChange={(e) => setPassQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-28 h-14 bg-slate-950 border border-financial-green/50 rounded-2xl text-center text-2xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-financial-green shadow-inner"
              />
              <button onClick={() => setPassQuantity(passQuantity + 1)} className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 active:scale-95 transition-all text-xl font-bold">+</button>
            </div>
          </div>

          <div className="py-6 border-t border-b border-white/5 mb-8 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Base Value (x{passQuantity})</span>
              <span className="text-white font-mono">{(1.00 * passQuantity).toFixed(2)} USDT</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Bank Maintenance Fee (5%)</span>
              <span className="text-white font-mono">{(0.05 * passQuantity).toFixed(2)} USDT</span>
            </div>
            <div className="flex justify-between items-center text-lg font-bold pt-2">
              <span className="text-white">Total Cost</span>
              <span className="text-financial-green">{(1.05 * passQuantity).toFixed(2)} USDT</span>
            </div>
          </div>

          <div className="space-y-4">
            <Button onClick={() => onBuyPass(passQuantity)} fullWidth className="h-14 text-lg shadow-xl shadow-financial-green/20">
              Buy {passQuantity} Pass{passQuantity > 1 ? 'es' : ''} Now
            </Button>
            <p className="text-[10px] text-center text-slate-500">
              <ShieldCheck className="w-3 h-3 inline mr-1" />
              Your principal ({(1.00 * passQuantity).toFixed(2)} USDT) is 100% safe & withdrawable 24/7.
            </p>
          </div>
        </GlassCard>
      </div>
    </section>
  );
};

const TicketIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
  </svg>
);

const StrategySection = () => (
  <section className="py-20 bg-gradient-to-b from-slate-900/50 to-slate-950 border-t border-white/5 relative overflow-hidden">
    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-premium-gold/20 to-transparent"></div>

    <div className="max-w-7xl mx-auto px-6">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-premium-gold/10 border border-premium-gold/20 text-premium-gold text-sm font-bold mb-4">
          <Lightbulb className="w-4 h-4" /> Pro Tips & Strategies
        </div>
        <h2 className="text-4xl font-bold text-white mb-4">How to Maximize Your Wins</h2>
        <p className="text-slate-400 max-w-2xl mx-auto">Smart Saving Bank is a strategy game. Follow these expert tips to increase your probability of winning Daily and Weekly prizes.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Strategy 1: Quantity */}
        <GlassCard className="bg-slate-900/40 hover:bg-slate-900/60 transition-colors group">
          <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/20 group-hover:border-blue-500/40 transition-colors">
            <Layers className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-3">Buy in Bulk</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Buying 1 Pass has a low probability. Experts recommend holding <span className="text-white font-bold">10-50 Passes</span>. This instantly increases your winning chance by <span className="text-blue-400 font-bold">10x to 50x</span>.
          </p>
        </GlassCard>

        {/* Strategy 2: Time */}
        <GlassCard className="bg-slate-900/40 hover:bg-slate-900/60 transition-colors group">
          <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/20 group-hover:border-emerald-500/40 transition-colors">
            <Clock className="w-8 h-8 text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-3">Hold for &gt; 24 Hours</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Patience pays! <span className="text-white font-bold">90%</span> of the Daily Prize is reserved for <span className="text-emerald-400 font-bold">'Old Passes'</span> (older than 24 hours). Don't sell immediately after buying.
          </p>
        </GlassCard>

        {/* Strategy 3: Anti-Curse */}
        <GlassCard className="bg-slate-900/40 hover:bg-slate-900/60 transition-colors group">
          <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 border border-purple-500/20 group-hover:border-purple-500/40 transition-colors">
            <ShieldCheck className="w-8 h-8 text-purple-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-3">Beat the Winner's Curse</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            If you win, that specific Pass loses 99% luck. By holding <span className="text-white font-bold">multiple passes</span> (e.g., 100 USDT split into 100 passes), only one gets penalized while the others remain at full power.
          </p>
        </GlassCard>
      </div>
    </div>
  </section>
);

const InventorySection = ({ passes, onSellPass, onSellBatch }) => {
  const [expandedDate, setExpandedDate] = useState(null);

  // Group passes by date with Safe Checks
  const groupedPasses = (passes || []).reduce((groups, pass) => {
    if (!pass || !pass.timestamp) return groups; // Skip invalid passes

    try {
      const date = new Date(pass.timestamp).toDateString();
      if (date === "Invalid Date") return groups;

      if (!groups[date]) groups[date] = [];
      groups[date].push(pass);
    } catch (err) {
      console.warn("Error grouping pass:", pass, err);
    }
    return groups;
  }, {});

  return (
    <section className="py-20 border-t border-white/5 bg-black/20">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl font-bold text-white">My Inventory</h2>
          <div className="bg-white/5 px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-premium-gold" />
            <span className="text-sm font-bold text-slate-300">Total Luck Score: <span className="text-white">{((passes || []).length * 1.2).toFixed(1)}x</span></span>
            <button onClick={window.exportCSV} className="ml-2 hover:bg-white/10 p-1 rounded transition-colors" title="Export CSV">
              <FileText className="w-4 h-4 text-emerald-400" />
            </button>
          </div>
        </div>

        {(!passes || passes.length === 0) ? (
          <div className="text-center py-16 border-2 border-dashed border-white/5 rounded-3xl">
            <Award className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-500">No active passes. Buy one to start earning.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {Object.keys(groupedPasses).map((date) => (
              <div key={date}>
                {/* Summary Card for Batch */}
                <div
                  className="group relative overflow-hidden rounded-3xl border border-premium-gold/30 bg-gradient-to-r from-slate-900 to-indigo-950 p-6 flex flex-col md:flex-row items-center justify-between shadow-lg shadow-premium-gold/5 transition-all hover:scale-[1.01]"
                >
                  <div
                    onClick={() => setExpandedDate(expandedDate === date ? null : date)}
                    className="flex items-center gap-4 cursor-pointer flex-1"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-premium-gold to-amber-600 rounded-2xl flex items-center justify-center text-black font-bold shadow-lg shadow-amber-500/20">
                      <TicketIcon className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{groupedPasses[date].length} Passes</h3>
                      <p className="text-slate-400 text-sm">Purchase Date: {date}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 mt-4 md:mt-0 justify-end">
                    <span className="bg-white/10 px-3 py-1 rounded-lg text-xs font-bold text-premium-gold border border-premium-gold/20">
                      Value: ${(groupedPasses[date].length * 1.00).toFixed(2)}
                    </span>

                    {/* Flexible Sell Input */}
                    <div className="flex items-center gap-2 bg-black/40 p-1 rounded-lg border border-white/10">
                      <input
                        type="number"
                        placeholder="Qty"
                        className="w-16 h-8 bg-transparent text-white text-xs px-2 focus:outline-none text-right"
                        min="1"
                        max={groupedPasses[date].length}
                        id={`sell-input-${date}`}
                      />
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          const input = document.getElementById(`sell-input-${date}`);
                          const qty = input.value ? parseInt(input.value) : groupedPasses[date].length;
                          onSellBatch(date, qty);
                        }}
                        className="h-8 text-[10px] px-3 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border-red-500/20"
                      >
                        Sell
                      </Button>
                    </div>

                    <button onClick={() => setExpandedDate(expandedDate === date ? null : date)}>
                      <ChevronDown className={cn("w-6 h-6 text-slate-500 transition-transform ml-2", expandedDate === date ? "rotate-180" : "")} />
                    </button>
                  </div>
                </div>

                {/* Expanded Grid (No Motion) */}
                {expandedDate === date && (
                  <div className="mt-4 pl-4 border-l-2 border-white/5">
                    {/* Compact ID View (V20) */}
                    <div className="mb-4">
                      <p className="text-xs text-slate-500 mb-2">Unique Pass Numbers:</p>
                      <div className="flex flex-wrap gap-2">
                        {groupedPasses[date].slice(0, 100).map((pass) => (
                          <div key={pass.id} className="flex flex-col bg-slate-800/50 border border-white/10 px-3 py-2 rounded text-center min-w-[120px]">
                            <span className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Serial Number</span>
                            <span className="text-sm font-mono text-premium-gold tracking-widest font-bold select-all">
                              {generateSerialNumber(pass.id, pass.timestamp)}
                            </span>
                          </div>
                        ))}

                        {groupedPasses[date].length > 100 && (
                          <div className="bg-white/5 px-3 py-1.5 rounded text-[11px] text-slate-500 italic">
                            + {groupedPasses[date].length - 100} more IDs...
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

// --- V33: P2P Deposit Modal (Direct Gateway) ---
// --- V34: Admin Settings Modal (Persistence) ---
// Extracted Content for reuse in Full Page Admin View
const AdminSettingsContent = ({ config, onSave }) => {
  const [upi, setUpi] = useState(config.UPI_ID);
  const [whatsapp, setWhatsapp] = useState(config.WHATSAPP_NUMBER);
  const [qr, setQr] = useState(config.QR_IMAGE_URL);
  const [onrampAppId, setOnrampAppId] = useState(config.ONRAMP_APP_ID || "1");
  const [isP2pEnabled, setIsP2pEnabled] = useState(config.IS_P2P_ENABLED);

  useEffect(() => {
    setUpi(config.UPI_ID);
    setWhatsapp(config.WHATSAPP_NUMBER);
    setQr(config.QR_IMAGE_URL);
    setOnrampAppId(config.ONRAMP_APP_ID || "1");
    setIsP2pEnabled(config.IS_P2P_ENABLED);
  }, [config]);

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-slate-400 block mb-1">Onramp App ID</label>
        <input value={onrampAppId} onChange={e => setOnrampAppId(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-sm text-white" placeholder="1" />
        <p className="text-[10px] text-slate-500 mt-1">Use '1' for Demo. Enter real App ID for production.</p>
      </div>
      <div>
        <label className="text-xs text-slate-400 block mb-1">Your UPI ID</label>
        <input value={upi} onChange={e => setUpi(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-sm text-white" />
      </div>
      <div>
        <label className="text-xs text-slate-400 block mb-1">WhatsApp Number</label>
        <input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-sm text-white" />
      </div>
      <div>
        <label className="text-xs text-slate-400 block mb-1">QR Code Image URL (Optional)</label>
        <input value={qr} onChange={e => setQr(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-sm text-white" placeholder="https://..." />
      </div>

      <div className="flex items-center justify-between bg-black/30 p-3 rounded-lg border border-white/10">
        <span className="text-sm text-slate-300">Enable Binance P2P Button</span>
        <button
          onClick={() => setIsP2pEnabled(!isP2pEnabled)}
          className={`w-10 h-6 rounded-full relative transition-colors ${isP2pEnabled ? 'bg-financial-green' : 'bg-slate-700'}`}
        >
          <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${isP2pEnabled ? 'translate-x-4' : ''}`} />
        </button>
      </div>

      <button
        onClick={() => onSave({ UPI_ID: upi, WHATSAPP_NUMBER: whatsapp, QR_IMAGE_URL: qr, IS_P2P_ENABLED: isP2pEnabled, ONRAMP_APP_ID: onrampAppId })}
        className="w-full py-3 bg-financial-green hover:bg-emerald-500 text-white font-bold rounded-lg transition-all"
      >
        Save Configuration
      </button>
    </div>
  );
};

const AdminSettingsModal = ({ isOpen, onClose, config, onSave }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        <div className="p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-slate-400" /> Admin Settings
          </h2>
          <AdminSettingsContent config={config} onSave={(newConfig) => { onSave(newConfig); onClose(); }} />
        </div>
      </div>
    </div>
  );
};

// --- V35: Deposit Modal with On-Ramp & Gas Guard ---
const DepositModal = ({ isOpen, onClose, userAddress, config, onDeposit, usdtContract }) => {
  const [activeTab, setActiveTab] = useState('onramp'); // 'onramp', 'p2p'
  const [amount, setAmount] = useState("");
  const [utr, setUtr] = useState("");
  const [cryptoAmount, setCryptoAmount] = useState("");
  const [externalBalance, setExternalBalance] = useState(null);
  const [maticBalance, setMaticBalance] = useState(null); // Gas Check
  const [balanceError, setBalanceError] = useState(false);

  // Helper to fetch balance
  const fetchBalances = useCallback(async () => {
    if (!userAddress || !usdtContract) {
      setExternalBalance("0.00");
      setMaticBalance("0.00");
      return;
    }
    try {
      setExternalBalance(null); // Loading
      setBalanceError(false);

      // 1. USDT Balance
      const usdtPromise = usdtContract.balanceOf(userAddress);
      // 2. MATIC Balance (Gas Check)
      const maticPromise = new ethers.BrowserProvider(window.ethereum).getBalance(userAddress);

      const [usdtBal, maticBal] = await Promise.all([usdtPromise, maticPromise]);

      setExternalBalance(parseFloat(ethers.formatUnits(usdtBal, 6)));
      setMaticBalance(parseFloat(ethers.formatUnits(maticBal, 18)));

    } catch (e) {
      console.error("Balance fetch error:", e);
      setBalanceError(true);
      setExternalBalance("0.00");
      setMaticBalance("0.00");
    }
  }, [userAddress, usdtContract]);

  useEffect(() => {
    if (isOpen) fetchBalances();
  }, [isOpen, fetchBalances]);

  const openOnramp = (coinCode) => {
    // Standard Onramp.money URL
    const appId = config.ONRAMP_APP_ID || "1";
    let url = `https://onramp.money/main/buy/?appId=${appId}&walletAddress=${userAddress}`;

    // If a specific coin is requested, we lock it to Polygon
    if (coinCode) {
      url += `&coinCode=${coinCode}&network=polygon`;
    }
    // If no coinCode is passed (Search Mode), we DO NOT send network, 
    // because Onramp requires coinCode if network is present.
    // This allows the user to select any Coin on any Network manually.

    window.open(url, '_blank', 'width=500,height=700');
  };

  const handleSubmitP2P = () => {
    const msg = `*New Deposit Request*%0A%0A*User:* ${userAddress}%0A*Amount:* ₹${amount}%0A*UTR:* ${utr}%0A%0APlease verify and credit.`;
    const waUrl = `https://wa.me/${config.WHATSAPP_NUMBER}?text=${msg}`;
    window.open(waUrl, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4">
      <div className="bg-[#0f172a] border border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors z-10">
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Add Funds</h2>

          {/* Navigation Tabs */}
          <div className="flex bg-slate-900 p-1 rounded-xl border border-white/10 mb-6">
            <button onClick={() => setActiveTab('onramp')} className={cn("flex-1 py-2.5 rounded-lg text-xs font-bold transition-all", activeTab === 'onramp' ? "bg-blue-600 text-white shadow-lg" : "text-slate-500 hover:text-white")}>
              Buy (Card)
            </button>
            <button onClick={() => setActiveTab('p2p')} className={cn("flex-1 py-2.5 rounded-lg text-xs font-bold transition-all", activeTab === 'p2p' ? "bg-slate-700 text-white shadow-lg" : "text-slate-500 hover:text-white")}>
              UPI (P2P)
            </button>
          </div>

          {/* --- TAB 2: ON-RAMP (BUY) --- */}
          {activeTab === 'onramp' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              {/* Smart Gas Guard */}
              {maticBalance !== null && maticBalance < 0.2 && (
                <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                    <p className="text-amber-400 font-bold text-sm">Low Gas Warning</p>
                  </div>
                  <p className="text-slate-400 text-xs mb-3">
                    You have <strong>{maticBalance} MATIC</strong>. You need Gas to transact.
                    Please buy Gas first to avoid stuck transactions.
                  </p>
                  <button
                    onClick={() => openOnramp()}
                    className="w-full py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 text-xs font-bold rounded-lg border border-amber-500/30 transition-colors uppercase tracking-wider"
                  >
                    Buy POL (Gas) First
                  </button>
                </div>
              )}

              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-white font-bold">Buy USDT Instantly</h3>
                <p className="text-slate-400 text-xs px-4">
                  Use your Credit Card, Debit Card, or NetBanking via Onramp.money.
                  Funds are credited directly to your wallet.
                </p>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={() => openOnramp('USDT')}
                  className="flex-1 h-12 text-sm bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 border border-blue-400/20"
                >
                  Buy USDT <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  onClick={() => openOnramp()}
                  className="flex-1 h-12 text-sm bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-600/20 border border-purple-400/20"
                >
                  Buy POL <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </div>

              <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
                <p className="text-[10px] text-blue-200 text-center leading-relaxed">
                  <strong>Note:</strong> If USDT is disabled for INR on Polygon, please <strong>Buy POL</strong> instead and swap it for USDT in your wallet (MetaMask/Phantom).
                </p>
              </div>

              <p className="text-[10px] text-slate-600 text-center">
                Processed by Onramp.money (Third Party Gateway)
              </p>
            </div>
          )}

          {/* --- TAB 3: P2P (UPI) --- */}
          {activeTab === 'p2p' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="bg-black/30 p-4 rounded-xl border border-white/5 text-center relative">
                <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">Scan to Pay</p>
                <div className="w-32 h-32 bg-white mx-auto rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                  {config.QR_IMAGE_URL ? (
                    <img src={config.QR_IMAGE_URL} alt="QR" className="w-full h-full object-cover" />
                  ) : (
                    <QrCode className="w-24 h-24 text-black" />
                  )}
                </div>
                <p className="text-white font-mono text-sm bg-black/40 py-1 px-3 rounded inline-block">
                  {config.UPI_ID || "admin@upi"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none text-sm"
                  placeholder="Amount (INR)"
                />
                <input
                  type="text"
                  value={utr}
                  onChange={(e) => setUtr(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm"
                  placeholder="UTR / Ref Number"
                />
                <Button onClick={handleSubmitP2P} fullWidth variant="secondary" className="h-10">
                  Verify via WhatsApp
                </Button>
              </div>

              {config.IS_P2P_ENABLED && (
                <div className="pt-4 border-t border-white/5">
                  <div className="flex items-center gap-4 bg-[#FCD535]/10 p-3 rounded-lg border border-[#FCD535]/20">
                    <div className="w-10 h-10 bg-[#FCD535] rounded-full flex items-center justify-center shrink-0">
                      <span className="text-black font-bold text-xs">BIN</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-bold text-xs">Binance P2P (Trusted)</p>
                      <p className="text-[#FCD535] text-[10px]">Buy USDT with INR safely</p>
                    </div>
                    <Button
                      onClick={() => window.open("https://p2p.binance.com/en/trade/sell/USDT?fiat=INR&payment=UPI", "_blank")}
                      className="h-8 text-[10px] bg-[#FCD535] text-black hover:bg-[#FCD535]/90 border-none px-4"
                    >
                      Open
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- V35: Withdraw Modal with Sell Option ---
const WithdrawModal = ({ isOpen, onClose, onWithdraw, balance, config }) => {
  const [activeTab, setActiveTab] = useState('direct'); // 'direct', 'sell'
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");

  const openSellWidget = () => {
    // Standard Onramp.money SELL URL
    const appId = config.ONRAMP_APP_ID || "1";
    const url = `https://onramp.money/main/sell/?appId=${appId}&walletAddress=${address || ""}&coinCode=USDT&network=polygon`;
    window.open(url, '_blank', 'width=500,height=700');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4">
      <div className="bg-[#0f172a] border border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors z-10">
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Withdraw Funds</h2>

          {/* Navigation Tabs */}
          <div className="flex bg-slate-900 p-1 rounded-xl border border-white/10 mb-6">
            <button
              onClick={() => setActiveTab('direct')}
              className={cn("flex-1 py-2.5 rounded-lg text-xs font-bold transition-all", activeTab === 'direct' ? "bg-red-500 text-white shadow-lg" : "text-slate-500 hover:text-white")}
            >
              Direct Transfer
            </button>
            <button
              onClick={() => setActiveTab('sell')}
              className={cn("flex-1 py-2.5 rounded-lg text-xs font-bold transition-all", activeTab === 'sell' ? "bg-blue-600 text-white shadow-lg" : "text-slate-500 hover:text-white")}
            >
              Sell to Bank (INR)
            </button>
          </div>

          {/* --- TAB 1: DIRECT TRANSFER --- */}
          {activeTab === 'direct' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="bg-red-500/10 p-4 rounded-xl border border-red-500/20 flex items-center gap-3">
                <Wallet className="w-6 h-6 text-red-500" />
                <div>
                  <p className="text-white font-bold text-sm">Transfer Crypto</p>
                  <p className="text-slate-400 text-xs">Send USDT to another wallet.</p>
                </div>
              </div>

              <div>
                <label className="text-slate-400 text-xs block mb-1 ml-1">Amount (USDT)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-red-500"
                  placeholder="0.00"
                />
                <p className="text-right text-[10px] text-slate-500 mt-1">Available: ${balance.toFixed(2)}</p>
              </div>
              <div>
                <label className="text-slate-400 text-xs block mb-1 ml-1">Destination Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-red-500"
                  placeholder="0x..."
                />
              </div>

              <Button
                onClick={() => { onWithdraw(amount, address); onClose(); }}
                disabled={!amount || !address || parseFloat(amount) > balance}
                fullWidth
                className="bg-red-500 hover:bg-red-600 text-white border-none shadow-lg shadow-red-900/20 h-12"
              >
                Confirm Withdrawal <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          )}

          {/* --- TAB 2: SELL TO BANK --- */}
          {activeTab === 'sell' && (
            <div className="space-y-6 animate-in slide-in-from-left-4 duration-300">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Landmark className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-white font-bold">Sell USDT for INR</h3>
                <p className="text-slate-400 text-xs px-4">
                  Withdraw funds directly to your Bank Account via Onramp.money.
                </p>
              </div>

              <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5 text-center">
                <p className="text-slate-500 text-xs mb-1">Available to Sell</p>
                <p className="text-xl font-bold text-white">${balance.toFixed(2)} USDT</p>
              </div>

              <Button
                onClick={openSellWidget}
                fullWidth
                className="h-12 text-lg bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 border border-blue-400/20"
              >
                Sell Now <ExternalLink className="w-4 h-4 ml-2" />
              </Button>

              <p className="text-[10px] text-slate-600 text-center">
                Requires KYC with Onramp.money
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const WalletSelectionModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const getDeepLink = (schema) => {
    const currentUrl = window.location.href.split('//')[1];
    const fullUrl = window.location.href;

    switch (schema) {
      case 'metamask':
        return `https://metamask.app.link/dapp/${currentUrl}`;
      case 'trust':
        return `https://link.trustwallet.com/open_url?coin_id=60&url=${encodeURIComponent(fullUrl)}`;
      case 'coinbase':
        return `https://go.cb-w.com/dapp?cb_url=${encodeURIComponent(fullUrl)}`;
      default:
        return '#';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors z-10">
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-financial-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Wallet className="w-8 h-8 text-financial-green" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Connect Wallet</h2>
          <p className="text-slate-400 text-sm mb-8">Select your mobile wallet to connect.</p>

          <div className="space-y-3">
            <a
              href={getDeepLink('metamask')}
              className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group"
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MetaMask" className="w-10 h-10" />
              <div className="text-left flex-1">
                <p className="text-white font-bold group-hover:text-[#F6851B] transition-colors">MetaMask</p>
                <p className="text-xs text-slate-500">Popular</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white" />
            </a>

            <a
              href={getDeepLink('trust')}
              className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group"
            >
              <img src="https://assets.coingecko.com/coins/images/11085/small/Trust.png" alt="Trust Wallet" className="w-10 h-10 rounded-full" />
              <div className="text-left flex-1">
                <p className="text-white font-bold group-hover:text-[#3375BB] transition-colors">Trust Wallet</p>
                <p className="text-xs text-slate-500">Secure</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white" />
            </a>

            <a
              href={getDeepLink('coinbase')}
              className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group"
            >
              <img src="https://avatars.githubusercontent.com/u/18067910?s=200&v=4" alt="Coinbase" className="w-10 h-10 rounded-full" />
              <div className="text-left flex-1">
                <p className="text-white font-bold group-hover:text-[#0052FF] transition-colors">Coinbase Wallet</p>
                <p className="text-xs text-slate-500">Trusted</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Error Boundary for Crash Prevention ---
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-900 flex flex-col items-center justify-center text-center p-6 text-white font-sans">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Something went wrong.</h1>
          <p className="text-slate-400 max-w-md mb-8">
            The app encountered an unexpected error. Please verify your wallet connection and try again.
            <br /><br />
            <span className="text-xs font-mono bg-black/30 p-2 rounded text-red-400">
              {this.state.error && this.state.error.toString()}
            </span>
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-financial-green hover:bg-emerald-500 text-white rounded-xl font-bold transition-all"
          >
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// --- Main App Logic ---

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [activeCurrency, setActiveCurrency] = useState('USDT');
  const [depositAmount, setDepositAmount] = useState('');
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isAdminSettingsOpen, setIsAdminSettingsOpen] = useState(false);
  const [activeLegalDoc, setActiveLegalDoc] = useState(null);
  const [isWalletSelectionOpen, setIsWalletSelectionOpen] = useState(false);
  const [contractOwner, setContractOwner] = useState(null);

  // V37: Hash Routing for Admin Page
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'admin'
  const [adminPinVerified, setAdminPinVerified] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#admin') {
        const pin = prompt("Enter Admin PIN to Access Dashboard:");
        if (pin === "1234") {
          setAdminPinVerified(true);
          setCurrentView('admin');
        } else {
          alert("Wrong PIN. Redirecting to Home.");
          window.location.hash = '';
          setCurrentView('home');
        }
      } else {
        setCurrentView('home');
        setAdminPinVerified(false);
      }
    };

    // Check on mount
    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // V34: Admin Config State with Compatibility Check
  const [adminConfig, setAdminConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('ADMIN_CONFIG_V1');
      // Merge saved config with default options to ensure new keys (like IS_P2P_ENABLED) exist
      return saved ? { ...ADMIN_CONFIG, ...JSON.parse(saved) } : ADMIN_CONFIG;
    } catch (e) {
      console.error("Config Load Error", e);
      return ADMIN_CONFIG;
    }
  });

  const handleSaveAdminConfig = (newConfig) => {
    setAdminConfig(newConfig);
    localStorage.setItem('ADMIN_CONFIG_V1', JSON.stringify(newConfig));
    alert("Configurations Saved! Future deposits will use these details.");
  };

  // V10 State: Wallet & Passes
  const [walletBalance, setWalletBalance] = useState(0.00);
  const [passes, setPasses] = useState([]); // Array of { id, timestamp, luckMultiplier }

  // V16: Advanced Logic State
  const [yieldGenerated, setYieldGenerated] = useState(0.00);
  const [dailyPool, setDailyPool] = useState(0.00);
  const [weeklyPool, setWeeklyPool] = useState(0.00);
  const [grantPool, setGrantPool] = useState(0.00);
  const [adminWallet, setAdminWallet] = useState(0.00);
  // NEW: Admin Liquidity Seeding (Risk-Free Principal)
  const [adminSeedAmount, setAdminSeedAmount] = useState(0); // Real Data Only
  const [protocolTVL, setProtocolTVL] = useState(0.00); // NEW: Real Global TVL from Contract
  const [hasAppliedForGrant, setHasAppliedForGrant] = useState(false); // NEW
  const [nextDailyDraw, setNextDailyDraw] = useState(Date.now() + 86400000);
  const [winners, setWinners] = useState([]);
  const [currentBlock, setCurrentBlock] = useState(0); // V47: For Time Ago Calcs
  const [feedStatus, setFeedStatus] = useState("Initializing..."); // DEBUG STATE

  // --- Web3 State ---
  // const { open, isOpen: isWeb3ModalOpen } = useWeb3Modal();
  // const { address, isConnected } = useWeb3ModalAccount();
  // const { walletProvider } = useWeb3ModalProvider();
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [usdtContract, setUsdtContract] = useState(null);
  const [provider, setProvider] = useState(null);

  // useEffect(() => {
  //   // Web3Auth Removed
  // }, []);

  const connectWallet = async () => {
    setIsLoggingIn(true);
    console.log("Attempting connection...");

    const onConnectSuccess = async (provider, address) => {
      const signer = await provider.getSigner();
      const bankContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const usdt = new ethers.Contract(USDT_ADDRESS, USDT_ABI, signer);

      setAccount(address);
      setProvider(provider);
      setContract(bankContract);
      setUsdtContract(usdt);
      setIsAuthenticated(true);
      setIsLoggingIn(false);
    };

    if (window.ethereum) {
      try {
        // V36: Optimized Connection & Network Check
        try {
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          if (chainId !== '0x89') {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0x89' }],
            });
          }
        } catch (switchError) {
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: '0x89',
                  chainName: 'Polygon Mainnet',
                  rpcUrls: ['https://polygon-rpc.com/'],
                  nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
                  blockExplorerUrls: ['https://polygonscan.com/'],
                }],
              });
            } catch (e) { console.error(e); }
          }
        }

        const newProvider = new ethers.BrowserProvider(window.ethereum);
        const signer = await newProvider.getSigner();
        const address = await signer.getAddress();
        await onConnectSuccess(newProvider, address);

      } catch (err) {
        console.error("MetaMask Connect Failed:", err);
        alert("Connection Error: " + (err.reason || err.message));
        setIsLoggingIn(false);
      }
    } else {
      // WalletConnect Fallback (Mobile)
      try {
        const wcProvider = await EthereumProvider.init({
          projectId: '833e728e9381c00657989508544e3b78', // Free Demo ID. Replace with your own from cloud.walletconnect.com
          chains: [137], // Polygon
          showQrModal: true,
          methods: ['eth_sendTransaction', 'eth_personalSign'],
          events: ['chainChanged', 'accountsChanged'],
          metadata: {
            name: 'Smart Saving Bank',
            description: 'No-Loss DeFi Savings',
            url: 'https://smartsavingbank.com',
            icons: ['https://avatars.githubusercontent.com/u/37784886']
          }
        });

        await wcProvider.connect();

        const provider = new ethers.BrowserProvider(wcProvider);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        await onConnectSuccess(provider, address);

      } catch (err) {
        console.error("WalletConnect Error:", err);
        alert("Mobile Connection Failed. Please try again.");
        setIsLoggingIn(false);
      }
    }
  };

  const fetchData = async () => {
    if (!contract || !account || !usdtContract) return; // Strict Safety Check

    try {
      // 1. Balances & Pools
      // V40: Direct Wallet Flow - Fetch Real USDT Balance
      const balance = await usdtContract.balanceOf(account);
      // const balance = await contract.walletBalance(account); // Legacy

      const dPool = await contract.dailyPool();
      const wPool = await contract.weeklyPool();
      const gPool = await contract.grantPool();
      const seed = await contract.adminSeedPrincipal();
      const tvl = await contract.calculateTVL();
      const _owner = await contract.owner();

      setWalletBalance(parseFloat(ethers.formatUnits(balance, 6)));
      setDailyPool(parseFloat(ethers.formatUnits(dPool, 6)));
      setWeeklyPool(parseFloat(ethers.formatUnits(wPool, 6)));
      setGrantPool(parseFloat(ethers.formatUnits(gPool, 6)));
      setAdminSeedAmount(parseFloat(ethers.formatUnits(seed, 6)));
      setWeeklyPool(parseFloat(ethers.formatUnits(wPool, 6)));
      setGrantPool(parseFloat(ethers.formatUnits(gPool, 6)));
      setAdminSeedAmount(parseFloat(ethers.formatUnits(seed, 6)));
      // setProtocolTVL(parseFloat(ethers.formatUnits(tvl, 6))); // Wrong (Includes Fee)

      // V42: TVL Correction Patch (Remove 5% Fee from Pass Value)
      // Contract returns: (Passes * 1.05) + Pools + Seed
      // We want: (Passes * 1.00) + Pools + Seed
      // Math: PassValueWithFee = TVL - Pools - Seed
      //       RealPassValue = PassValueWithFee * (100 / 105)
      const tvlVal = parseFloat(ethers.formatUnits(tvl, 6));
      const poolsVal = parseFloat(ethers.formatUnits(dPool + wPool + gPool + seed, 6));
      const passValueWithFee = tvlVal - poolsVal;
      const realPassValue = passValueWithFee * (1.00 / 1.05);
      const correctedTVL = realPassValue + poolsVal;

      setProtocolTVL(correctedTVL);

      setContractOwner(_owner);

      // Check Grant Application Status
      const applied = await contract.hasAppliedForGrant(account);
      setHasAppliedForGrant(applied);

      // 2. Fetch User Passes (Robust Fallback System)
      try {
        let passIds = [];
        let method = "DIRECT";

        // Strategy A: Try Direct View Function (Best/Fastest)
        try {
          passIds = await contract.getUserPassIds(account);
          passIds = passIds.map(id => id.toString());
        } catch (directError) {
          console.warn("View function failed/missing. Switching to Event Logs...", directError);
          method = "EVENT_LOGS";
        }

        // Strategy B: Event Reconstruction (If Strategy A failed)
        // This handles the case where deployed contract doesn't have getUserPassIds
        if (method === "EVENT_LOGS" || !passIds) {
          const filterBought = contract.filters.PassBought(account);
          const filterSold = contract.filters.PassSold(account);

          // Use a safe query range. Public RPC often limits to 10k-50k blocks.
          // We will try fetching from block 0 (genesis). If it fails, we fall back to manual range.
          // However, simple queryFilter with fromBlock=0 usually works on robust RPCs or reverts with limit.
          // We'll wrap in catch and try a smaller range if needed.

          // Strategy B2: Smart Log Fetching (Use Safe Range)
          // Public RPC often fails on "fromBlock: 0". We try specific range.
          const currentBlock = await provider.getBlockNumber();
          const safeRange = 50000; // ~2 days on Polygon
          const fromBlock = Math.max(0, currentBlock - safeRange);

          // fetch logs
          const [logsBought, logsSold] = await Promise.all([
            contract.queryFilter(filterBought, fromBlock).catch(e => { console.warn("Log Bought Recent Fail", e); return []; }),
            contract.queryFilter(filterSold, fromBlock).catch(e => { console.warn("Log Sold Recent Fail", e); return []; })
          ]);

          // Attempt deep fetch if recent is empty and we suspect user has passes
          if (logsBought.length === 0) {
            console.log("No recent passes, attempting deeper fetch (risky on public RPC)...");
            try {
              // Try fetching from a static block (deployment block approx)
              // Assuming deployment happened around block 65000000 (just an example, using 0 for now with catch)
              const deepLogs = await contract.queryFilter(filterBought, 0, fromBlock);
              logsBought.push(...deepLogs);
            } catch (e) {
              console.warn("Deep fetch failed (expected on public RPC).");
            }
          }

          let allBoughtIds = [];
          logsBought.forEach(log => {
            if (log.args && log.args[2]) {
              const ids = log.args[2];
              // Handle both Array and ParseObject
              if (Array.isArray(ids) || ids.length !== undefined) {
                for (let i = 0; i < ids.length; i++) {
                  allBoughtIds.push(ids[i]);
                }
              }
            }
          });

          let totalSold = 0;
          logsSold.forEach(log => {
            if (log.args && log.args[1]) {
              totalSold += Number(log.args[1]);
            }
          });

          const remainingCount = Math.max(0, allBoughtIds.length - totalSold);
          if (remainingCount > 0) {
            passIds = allBoughtIds.slice(0, remainingCount).map(id => id.toString());
          } else {
            passIds = [];
          }
        }

        // Fetch Details for ID list
        if (passIds && passIds.length > 0) {
          const passPromises = passIds.map(id => contract.getPass(id));
          const passData = await Promise.all(passPromises);

          const formattedPasses = passData.map(p => ({
            id: p.id.toString(),
            owner: p.owner,
            timestamp: Number(p.timestamp) * 1000,
            luckMultiplier: Number(p.luckMultiplier)
          }));

          // Sort by ID descending (Newest first)
          formattedPasses.sort((a, b) => Number(b.id) - Number(a.id));
          setPasses(formattedPasses);
        } else {
          setPasses([]);
        }
      } catch (err) {
        console.warn("Pass Fetch Critical Error:", err);
        setPasses([]);
      }


      // setWinners([]); // V47: Removed to preserve Global Feed

    } catch (e) {
      console.error("Fetch Data Error", e);
    }
  };

  // V99: New Robust Data Fetching (Prioritizes Connection)
  const fetchGlobalData = async () => {
    setFeedStatus("INITIALIZING CONNECTION...");
    try {
      // 1. Setup RPC & Contract
      const rpcUrls = ["https://polygon-rpc.com", "https://rpc.ankr.com/polygon", "https://polygon.drpc.org"];
      let activeProvider = null;
      let activeReadContract = null;
      let currentBlock = 0;

      // Smart Connect Logic
      for (const url of rpcUrls) {
        try {
          if (!activeReadContract) setFeedStatus(`Trying Connect: ${url.split('/')[2]}...`);

          const p = new ethers.JsonRpcProvider(url);
          // Timeout race 5s
          const bn = await Promise.race([
            p.getBlockNumber(),
            new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 5000))
          ]);

          if (bn > 0) {
            activeProvider = p;
            activeReadContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, p);
            currentBlock = bn;
            if (setCurrentBlock) setCurrentBlock(bn);
            break; // Valid connection found
          }
        } catch (e) {
          console.warn(`RPC Failed: ${url}`, e);
        }
      }

      if (!activeReadContract || !currentBlock) {
        setFeedStatus("FATAL: All RPCs Failed. Check Internet.");
        return;
      }

      setFeedStatus("Connected. Fetching Data...");

      // 2. Fetch Global Stats (Safe now)
      try {
        const [dPool, wPool, gPool, seed, tvl] = await Promise.all([
          activeReadContract.dailyPool(),
          activeReadContract.weeklyPool(),
          activeReadContract.grantPool(),
          activeReadContract.adminSeedPrincipal(),
          activeReadContract.calculateTVL()
        ]);

        setDailyPool(parseFloat(ethers.formatUnits(dPool, 6)));
        setWeeklyPool(parseFloat(ethers.formatUnits(wPool, 6)));
        setGrantPool(parseFloat(ethers.formatUnits(gPool, 6)));
        setAdminSeedAmount(parseFloat(ethers.formatUnits(seed, 6)));

        const tvlVal = parseFloat(ethers.formatUnits(tvl, 6));
        const poolsVal = parseFloat(ethers.formatUnits(dPool + wPool + gPool + seed, 6));
        const passValueWithFee = tvlVal - poolsVal;
        const realPassValue = passValueWithFee * (1.00 / 1.05);
        const correctedTVL = realPassValue + poolsVal;
        setProtocolTVL(correctedTVL);
      } catch (e) {
        console.warn("Stats Fetch Error (Non-Fatal):", e);
      }

      // 3. Smart Chunked Fetching (Deep Scan: 20k Blocks)
      const MAX_DEPTH = 20000;
      const CHUNK_SIZE = 2000;
      const chunkedEvents = [];

      setFeedStatus(`Smart Scan: Checking last ${MAX_DEPTH} blocks in chunks...`);

      for (let i = 0; i < MAX_DEPTH; i += CHUNK_SIZE) {
        const toBlock = currentBlock - i;
        const fromBlock = Math.max(0, toBlock - CHUNK_SIZE);
        if (toBlock <= 0) break;

        setFeedStatus(`Deep Scan: Blocks ${fromBlock}-${toBlock} [Total: ${chunkedEvents.length}]...`);

        try {
          // Parallel fetch for this chunk
          const batch = await Promise.all([
            activeReadContract.queryFilter(activeReadContract.filters.PassBought(), fromBlock, toBlock),
            activeReadContract.queryFilter(activeReadContract.filters.PassSold(), fromBlock, toBlock),
            activeReadContract.queryFilter(activeReadContract.filters.Deposited(), fromBlock, toBlock),
            activeReadContract.queryFilter(activeReadContract.filters.DailyWinner(), fromBlock, toBlock),
            activeReadContract.queryFilter(activeReadContract.filters.GrantWinner(), fromBlock, toBlock)
          ]);
          batch.forEach(evs => chunkedEvents.push(...evs));
        } catch (e) {
          console.warn(`Chunk failed ${fromBlock}-${toBlock}`, e);
        }
        // Small throttle
        await new Promise(r => setTimeout(r, 100));
      }

      // Convert chunkedEvents to "results" format
      const results = [
        { status: 'fulfilled', value: chunkedEvents.filter(e => e.fragment.name === 'PassBought') },
        { status: 'fulfilled', value: chunkedEvents.filter(e => e.fragment.name === 'PassSold') },
        { status: 'fulfilled', value: chunkedEvents.filter(e => e.fragment.name === 'Deposited') },
        { status: 'fulfilled', value: chunkedEvents.filter(e => e.fragment.name === 'DailyWinner') },
        { status: 'fulfilled', value: chunkedEvents.filter(e => e.fragment.name === 'GrantWinner') }
      ];

      // 4. Process Logs
      const activity = [];
      const processLogs = (logs, type, action) => {
        if (!logs || !Array.isArray(logs)) return;
        logs.forEach(l => {
          if (!l.args) return;
          try {
            let user = l.args[0];
            let val = 0;
            let disp = "";

            if (type === 'Daily') {
              user = `Pass #${Number(l.args[0]) + 1}`;
              val = parseFloat(ethers.formatUnits(l.args[1], 6));
              disp = `$${val.toFixed(2)}`;
            } else if (type === 'Buy' || type === 'Sell') {
              const qty = Number(l.args[1]);
              val = qty;
              disp = `${qty} Passes`;
            } else {
              val = parseFloat(ethers.formatUnits(l.args[1], 6));
              disp = `$${val.toFixed(2)}`;
            }

            activity.push({
              type, user: (typeof user === 'string' && user.length > 20) ? `${user.slice(0, 6)}...${user.slice(-4)}` : user,
              action, amountDisplay: disp, amount: val,
              txHash: l.transactionHash, blockNumber: l.blockNumber, index: l.index
            });
          } catch (e) { /* skip */ }
        });
      };

      if (results[0].status === 'fulfilled') processLogs(results[0].value, 'Buy', 'bought');
      if (results[1].status === 'fulfilled') processLogs(results[1].value, 'Sell', 'sold');
      if (results[2].status === 'fulfilled') processLogs(results[2].value, 'Deposit', 'deposited');
      if (results[3].status === 'fulfilled') processLogs(results[3].value, 'Daily', 'won');
      if (results[4].status === 'fulfilled') processLogs(results[4].value, 'Grant', 'received');

      activity.sort((a, b) => b.blockNumber - a.blockNumber);
      setWinners(activity.slice(0, 50));

      const time = new Date().toLocaleTimeString();
      const getCount = (r) => (r.status === 'fulfilled' ? (r.value || []).length : 'ERR');
      const counts = `B:${getCount(results[0])} S:${getCount(results[1])}`;

      if (activity.length === 0) {
        setFeedStatus(`Scan Done (Block ${currentBlock}) @ ${time}. Found 0 events [${counts}] in 1k blocks.`);
      } else {
        setFeedStatus(`Live @ ${time}. Showing ${activity.length} events [${counts}].`);
      }

    } catch (e) {
      console.error("Fetch Data Error", e);
      setFeedStatus("Critical Error: " + e.message);
    }
  };

  // V41: Public Read-Only Data Fetching (LEGACY - BROKEN)
  const fetchGlobalData_BROKEN = async () => {
    try {
      // Use Read-Only Provider
      const readProvider = new ethers.JsonRpcProvider(READ_ONLY_PROVIDER_URL);
      const readContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, readProvider);

      console.log("Fetching Global Stats (Read-Only)...");

      const dPool = await readContract.dailyPool();
      const wPool = await readContract.weeklyPool();
      const gPool = await readContract.grantPool();
      const seed = await readContract.adminSeedPrincipal();
      const tvl = await readContract.calculateTVL();

      setDailyPool(parseFloat(ethers.formatUnits(dPool, 6)));
      setWeeklyPool(parseFloat(ethers.formatUnits(wPool, 6)));
      setGrantPool(parseFloat(ethers.formatUnits(gPool, 6)));
      setAdminSeedAmount(parseFloat(ethers.formatUnits(seed, 6)));
      // setProtocolTVL(parseFloat(ethers.formatUnits(tvl, 6)));

      // V42: Read-Only TVL Correction
      const tvlVal = parseFloat(ethers.formatUnits(tvl, 6));
      const poolsVal = parseFloat(ethers.formatUnits(dPool + wPool + gPool + seed, 6));
      const passValueWithFee = tvlVal - poolsVal;
      const realPassValue = passValueWithFee * (1.00 / 1.05);
      const correctedTVL = realPassValue + poolsVal;

      setProtocolTVL(correctedTVL);

      // --- RESTORED LIVE FEED LOGIC ---
      const rpcUrls = ["https://rpc.ankr.com/polygon", "https://polygon.drpc.org", "https://polygon-rpc.com"];
      let currentBlock = 0;
      let activeReadContract = readContract;

      // 1. Get Block Number (Multi-RPC)
      const initRpc = async () => {
        setFeedStatus("Connecting to RPC...");
        try {
          const bn = await readProvider.getBlockNumber();
          if (setCurrentBlock) setCurrentBlock(bn);
          currentBlock = bn;
        } catch (e) { /* silent fail */ }

        if (!currentBlock) {
          for (const url of rpcUrls) {
            try {
              setFeedStatus(`Connecting to ${url.split('/')[2]}...`);
              const fb = new ethers.JsonRpcProvider(url);
              const bn = await fb.getBlockNumber();
              if (setCurrentBlock) setCurrentBlock(bn);
              currentBlock = bn;
              activeReadContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, fb);
              break;
            } catch (e) { }
          }
        }
      };

      await initRpc();
      if (!currentBlock) {
        setFeedStatus("RPC Connection Failed.");
        return;
      }

      // 2. Fetch Logs (Defensive)
      const fromBlock = Math.max(0, currentBlock - 20000); // 20k blocks ~15 hours
      setFeedStatus(`Scanning last 20k blocks (from ${fromBlock})...`);

      const results = await Promise.allSettled([
        activeReadContract.queryFilter(activeReadContract.filters.PassBought(), fromBlock),
        activeReadContract.queryFilter(activeReadContract.filters.PassSold(), fromBlock),
        activeReadContract.queryFilter(activeReadContract.filters.Deposited(), fromBlock),
        activeReadContract.queryFilter(activeReadContract.filters.DailyWinner(), fromBlock),
        activeReadContract.queryFilter(activeReadContract.filters.GrantWinner(), fromBlock)
      ]);

      // 3. Process Logs safely
      const activity = [];
      const processLogs = (logs, type, action) => {
        if (!logs || !Array.isArray(logs)) return;
        logs.forEach(l => {
          if (!l.args) return;
          try {
            let user = l.args[0];
            let val = 0;
            let disp = "";

            if (type === 'Daily') {
              user = `Pass #${Number(l.args[0]) + 1}`;
              val = parseFloat(ethers.formatUnits(l.args[1], 6));
              disp = `$${val.toFixed(2)}`;
            } else if (type === 'Buy' || type === 'Sell') {
              const qty = Number(l.args[1]);
              val = qty;
              disp = `${qty} Passes`;
            } else {
              val = parseFloat(ethers.formatUnits(l.args[1], 6));
              disp = `$${val.toFixed(2)}`;
            }

            activity.push({
              type, user: (typeof user === 'string' && user.length > 20) ? `${user.slice(0, 6)}...${user.slice(-4)}` : user,
              action, amountDisplay: disp, amount: val,
              txHash: l.transactionHash, blockNumber: l.blockNumber, index: l.index
            });
          } catch (e) { /* skip bad log */ }
        });
      };

      if (results[0].status === 'fulfilled') processLogs(results[0].value, 'Buy', 'bought');
      if (results[1].status === 'fulfilled') processLogs(results[1].value, 'Sell', 'sold');
      if (results[2].status === 'fulfilled') processLogs(results[2].value, 'Deposit', 'deposited');
      if (results[3].status === 'fulfilled') processLogs(results[3].value, 'Daily', 'won');
      if (results[4].status === 'fulfilled') processLogs(results[4].value, 'Grant', 'received');

      activity.sort((a, b) => b.blockNumber - a.blockNumber);
      setWinners(activity.slice(0, 50));

      setWinners(activity.slice(0, 50));

      const time = new Date().toLocaleTimeString();
      const counts = `B:${(results[0].value || []).length} S:${(results[1].value || []).length} D:${(results[2].value || []).length}`;

      if (activity.length === 0) {
        setFeedStatus(`Scan Done (Block ${currentBlock}) @ ${time}. Found 0 events [${counts}] in 20k blocks.`);
      } else {
        setFeedStatus(`Live @ ${time}. Showing ${activity.length} events [${counts}].`);
      }

    } catch (e) {
      console.warn("Global Fetch Error:", e);
      setFeedStatus("Fetch Error");
    }
  };

  // Initial Load (Read-Only) & Polling
  useEffect(() => {
    fetchGlobalData();
    const interval = setInterval(fetchGlobalData, 60000); // Update Global Stats & Feed every 60s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (contract && account) {
      fetchData();
      // Increase Poll Interval to 30s to prevent congestion
      const interval = setInterval(fetchData, 30000);
      return () => clearInterval(interval);
    }
  }, [contract, account]);

  // --- V16: Simulation Engine REPLACED with Live Aave Data ---
  const [aaveApy, setAaveApy] = useState("4.50"); // Default Fallback

  useEffect(() => {
    // Disabled Aave Fetching to prevent RPC Hangs
    /*
    const fetchAaveData = async () => { ... }
    fetchAaveData();
    */
  }, [provider]);

  // Removed Manual Simulation Logic (Daily/Weekly/Grants) as per user request.
  // These are now handled by Chainlink VRF and Automation on-chain.

  // --- SAFE MODE COMPONENT ---
  const SafeDashboard = ({ onAdminDeposit, onAdminWithdraw, walletBalance, adminSeedAmount }) => (
    <div className="pt-32 px-6 max-w-lg mx-auto">
      <div className="bg-slate-800 p-8 rounded-2xl border border-white/20 shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-6">Safe Mode Admin Panel</h2>

        <div className="bg-black/30 p-4 rounded-xl mb-6">
          <p className="text-slate-400 text-xs uppercase mb-1">My Balance</p>
          <p className="text-2xl font-bold text-white">${(Number(walletBalance) || 0).toFixed(2)}</p>
        </div>

        <div className="bg-indigo-900/30 p-4 rounded-xl mb-6 border border-indigo-500/30">
          <p className="text-indigo-300 text-xs uppercase mb-1">Reserve Fund (Seed)</p>
          <p className="text-2xl font-bold text-white">${(Number(adminSeedAmount) || 0).toFixed(2)}</p>
        </div>

        <div className="space-y-4">
          <button onClick={onAdminDeposit} className="w-full py-4 bg-financial-green hover:bg-emerald-500 text-white font-bold rounded-xl transition-all">
            + Deposit Seed (USDT)
          </button>
          <button onClick={onAdminWithdraw} className="w-full py-4 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-all">
            Withdraw Seed
          </button>
        </div>

        <p className="text-xs text-slate-500 mt-6 text-center">
          Running in Reduced Graphics Mode for Stability.
        </p>
      </div>
    </div>
  );

  const handleLogin = async (loginType) => {
    // If Web3Auth is used, the modal handles selection (Google, MetaMask, etc.)
    // We can trigger specific providers if needed, or just open the modal.
    if (loginType === 'google' || loginType === 'metamask') {
      connectWallet(loginType); // Opens Unified Modal or Fast Path
    } else {
      setIsLoggingIn(true);
      setTimeout(() => {
        setIsAuthenticated(true);
      }, 1500);
    }
  };

  const handleDeposit = async (manualAmount) => {
    if (!contract || !usdtContract) {
      alert("Please connect wallet.");
      return;
    }
    const amountVal = manualAmount || depositAmount;
    if (!amountVal) return;

    try {
      console.log("Starting Deposit:", amountVal);
      const amount = ethers.parseUnits(amountVal.toString(), 6); // USDT uses 6 decimals

      // 1. Approve
      const currentAllowance = await usdtContract.allowance(account, CONTRACT_ADDRESS);
      if (currentAllowance < amount) {
        console.log("Requesting Approval...");
        const txApprove = await usdtContract.approve(CONTRACT_ADDRESS, amount);
        await txApprove.wait();
      }

      // 2. Deposit
      console.log("Requesting Deposit...");
      const txDeposit = await contract.deposit(amount);
      await txDeposit.wait();

      setWalletBalance(prev => prev + parseFloat(amountVal)); // Optimistic UI update
      setDepositAmount('');
      alert(`Success! Deposited ${amountVal} USDT.`);
      fetchData(contract, account);
    } catch (err) {
      console.error(err);
      alert("Deposit Failed: " + (err.reason || err.message));
    }
  };

  // V35: Direct Wallet Buy (Auto-Deposit if insufficient)
  const handleBuyPass = async (quantity = 1) => {
    if (!contract || !usdtContract) {
      alert("Please connect your wallet first.");
      connectWallet();
      return;
    }

    try {
      const pricePerPass = 1.05;
      const totalCost = pricePerPass * quantity;

      // V40: Direct Wallet Logic (No Internal Balance)
      const totalCostWei = ethers.parseUnits(totalCost.toFixed(6), 6);

      const usdtBalanceWei = await usdtContract.balanceOf(account);
      const usdtBalance = parseFloat(ethers.formatUnits(usdtBalanceWei, 6));

      if (usdtBalance < totalCost) {
        alert("Insufficient USDT! Please deposit via On-Ramp/P2P.");
        setIsDepositModalOpen(true);
        return;
      }

      // Check Allowance
      const allowance = await usdtContract.allowance(account, CONTRACT_ADDRESS);
      if (allowance < totalCostWei) {
        // console.log("Approving USDT...");
        const txApprove = await usdtContract.approve(CONTRACT_ADDRESS, totalCostWei);
        await txApprove.wait();
      }

      // Execute Buy
      // console.log("Buying Pass...");
      const txBuy = await contract.buyPass(quantity);
      await txBuy.wait();

      alert("Success! Pass Purchased.");
      fetchData(); // Refresh

    } catch (err) {
      console.error(err);
      // specific error handling
      if (err.message.includes("user rejected")) return;
      alert("Transaction Failed: " + (err.reason || err.message || "Unknown error"));
    }
  };

  const handleApplyGrant = async () => {
    if (!contract) return;
    try {
      const tx = await contract.applyForGrant();
      await tx.wait();
      alert("Successfully Applied for Weekly Grant!");
      fetchData();
    } catch (err) {
      alert("Application Failed: " + (err.reason || err.message));
    }
  };

  // V28: Export User Ledger (Aggregated)
  const handleExportUserStats = () => {
    if (passes.length === 0) return alert("No data to export.");

    // Aggregate Data
    const stats = {};
    passes.forEach(p => {
      const owner = p.owner || "Unknown";
      if (!stats[owner]) {
        stats[owner] = { count: 0, invested: 0 };
      }
      stats[owner].count += 1;
      stats[owner].invested += 1.05; // Cost per pass
    });

    // Convert to CSV
    const csvContent = [
      ["Account Number (Address)", "Total Passes", "Total Invested (USDT)", "Ownership %"],
      ...Object.entries(stats).map(([address, data]) => {
        const ownership = ((data.count / passes.length) * 100).toFixed(4) + "%";
        return [address, data.count, data.invested.toFixed(2), ownership];
      })
    ].map(e => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `smart_saving_user_ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSellPass = async (id) => {
    if (!contract) return alert("Please connect wallet.");

    // Note: Smart Contract sells passes LIFO (Last In First Out). 
    // We cannot guarantee specific ID selling, but we sell 1 quantity.
    if (!confirm("Confirm Transaction:\n\nSell 1 Pass for 1.00 USDT?\nFunds will be sent DIRECTLY to your Wallet.")) return;

    try {
      const tx = await contract.sellPass(1);
      console.log("Selling 1 Pass...", tx.hash);
      await tx.wait();

      alert("Success! 1.00 USDT sent to your Wallet.");
      fetchData(); // Refresh UI
    } catch (err) {
      console.error("Sell Error:", err);
      alert("Sell Failed: " + (err.reason || err.message));
    }
  };

  const handleSellBatch = async (date, quantityToSell) => {
    if (!contract) return alert("Please connect wallet.");

    const qty = parseInt(quantityToSell);
    if (!qty || qty <= 0) return alert("Invalid quantity.");

    const totalValue = qty * 1.00;

    if (!confirm(`CONFIRM SELL:\n\nSell ${qty} passes?\n\nYou will receive: $${totalValue.toFixed(2)} USDT DIRECTLY to your wallet.`)) return;

    try {
      const tx = await contract.sellPass(qty);
      console.log(`Selling ${qty} Passes...`, tx.hash);
      await tx.wait();

      alert(`Success! Sold ${qty} passes. $${totalValue.toFixed(2)} sent to Wallet.`);
      fetchData();
    } catch (err) {
      console.error("Sell Batch Error:", err);
      alert("Sell Failed: " + (err.reason || err.message));
    }
  };

  // Expose functions to window for UI buttons
  useEffect(() => {
    window.exportCSV = handleExportCSV;
    window.checkWinChance = checkWinProbability;
  }, [passes]); // Re-bind when passes change to get latest state



  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // V23: Export CSV
  const handleExportCSV = () => {
    if (passes.length === 0) return alert("No passes to export!");

    const csvContent = [
      ["Serial Number", "Purchase Date", "Age (Hours)", "Luck Score", "Status"],
      ...passes.map(p => {
        const ageHours = ((Date.now() - p.timestamp) / (1000 * 60 * 60)).toFixed(1);
        return [generateSerialNumber(p.id, p.timestamp), new Date(p.timestamp).toLocaleString(), ageHours, p.luckMultiplier, "Active"];
      })
    ].map(e => e.join(",")).join("\n");

    // V46: Mobile Download Fix (Data URI vs Blob)
    // Blob URLs often fail in mobile Web3 browsers (MetaMask/Trust).
    // Switching to direct Data URI for better compatibility.
    const encodedUri = "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `smart_saving_pass_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // V29: Export Global Public Ledger (Blockchain Events)
  const handleExportGlobalLedger = async () => {
    if (!contract) return alert("Please connect wallet to sync blockchain data.");

    try {
      alert("Syncing Global History from Blockchain... This may take a few seconds.");

      // Fetch all PassBought events from deployment block to latest
      // Event: PassBought(address indexed user, uint256 quantity, uint256[] passIds)
      const DEPLOYMENT_BLOCK = 66000000;
      const filter = contract.filters.PassBought();
      const events = await contract.queryFilter(filter, DEPLOYMENT_BLOCK, "latest");

      if (events.length === 0) return alert("No purchase history found on-chain.");

      // Aggregate Data
      const globalStats = {};

      for (const event of events) {
        const user = event.args[0]; // address
        const quantity = Number(event.args[1]); // uint256
        // const passIds = event.args[2]; 

        if (!globalStats[user]) {
          globalStats[user] = { passes: 0, invested: 0, lastActive: 0 };
        }

        globalStats[user].passes += quantity;
        globalStats[user].invested += (quantity * 1.05);
        // globalStats[user].lastActive = ... (could get block timestamp if needed, skipping for speed)
      }

      // Convert to Array & Sort by Passes
      const leaderboard = Object.entries(globalStats)
        .map(([address, data]) => ({ address, ...data }))
        .sort((a, b) => b.passes - a.passes);

      const csvContent = [
        ["Rank", "Wallet Address", "Total Passes Owned", "Total Invested (USDT)", "Share %"],
        ...leaderboard.map((user, index) => {
          const totalPasses = leaderboard.reduce((acc, curr) => acc + curr.passes, 0);
          const share = ((user.passes / totalPasses) * 100).toFixed(4) + "%";
          return [index + 1, user.address, user.passes, user.invested.toFixed(2), share];
        })
      ].map(e => e.join(",")).join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `SMART_SAVING_GLOBAL_LEDGER_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err) {
      console.error("Global Export Error:", err);
      alert("Failed to fetch global history: " + err.message);
    }
  };

  // V23: Check Win Probability
  const checkWinProbability = () => {
    const id = prompt("Enter Pass ID to check winning chance:");
    if (!id) return;

    const pass = passes.find(p => p.id === id);
    if (!pass) return alert("Pass ID not found in your inventory.");

    const ninetyDays = 90 * 24 * 60 * 60 * 1000; // 90 days
    const now = Date.now();
    const isOld = (now - pass.timestamp) > ninetyDays;

    const oldPassesCount = passes.filter(p => (now - p.timestamp) > ninetyDays).length;
    const newPassesCount = passes.filter(p => (now - p.timestamp) <= ninetyDays).length;

    // Daily Chance (90/10)
    let dailyProb = 0;
    if (isOld && oldPassesCount > 0) dailyProb = 0.90 / oldPassesCount;
    if (!isOld && newPassesCount > 0) dailyProb = 0.10 / newPassesCount;
    // Edge cases
    if (oldPassesCount === 0 && newPassesCount > 0) dailyProb = 1.0 / newPassesCount;
    if (newPassesCount === 0 && oldPassesCount > 0) dailyProb = 1.0 / oldPassesCount;

    // Weekly Chance (70/30)
    let weeklyProb = 0;
    if (isOld && oldPassesCount > 0) weeklyProb = 0.70 / oldPassesCount;
    if (!isOld && newPassesCount > 0) weeklyProb = 0.30 / newPassesCount;

    const power = getVintagePower(pass.timestamp);

    alert(`🔮 WIN PREDICTOR\n\nPass ID: ${id}\nVintage Power: ${power}% (${isOld ? 'High Priority' : 'Building Power'})\n\n📊 Est. Winning Chances:\n- Daily Draw: ${(dailyProb * 100).toFixed(4)}%\n- Weekly Jackpot: ${(weeklyProb * 100).toFixed(4)}%\n\n(Vintage Power increases your chance of entering the 'Priority Pool' for Daily Draws)`);
  };

  // V27: Real Admin Seeding Logic
  const handleAdminDeposit = async () => {
    if (!contract || !usdtContract) return alert("Please connect wallet first.");

    // Check if user is owner (basic check, contract will verify too)
    // const owner = await contract.owner();
    // if (owner.toLowerCase() !== account.toLowerCase()) return alert("Only Admin can seed.");

    const amountStr = prompt("Enter amount to deposit into Liquidity Seed (USDT):");
    if (!amountStr) return;
    const amountVal = parseFloat(amountStr);

    if (isNaN(amountVal) || amountVal <= 0) return alert("Invalid amount.");

    try {
      const amountWei = ethers.parseUnits(amountVal.toString(), 6);

      // 1. Approve
      const allowance = await usdtContract.allowance(account, CONTRACT_ADDRESS);
      if (allowance < amountWei) {
        // alert("Approving USDT...");
        const txApprove = await usdtContract.approve(CONTRACT_ADDRESS, amountWei);
        await txApprove.wait();
      }

      // 2. Deposit Seed
      const tx = await contract.depositSeed(amountWei);
      await tx.wait();

      alert(`Success! Added $${amountVal.toLocaleString()} to Protocol Liquidity. Yields will increase immediately.`);
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Seed Deposit Failed: " + (err.reason || err.message));
    }
  };

  const handleAdminWithdraw = async () => {
    if (!contract) return alert("Please connect wallet first.");

    const amountStr = prompt(`Enter amount to withdraw from Liquidity Seed (Max: $${adminSeedAmount.toFixed(2)}):`);
    if (!amountStr) return;
    const amountVal = parseFloat(amountStr);

    if (isNaN(amountVal) || amountVal <= 0) return alert("Invalid amount.");

    try {
      const amountWei = ethers.parseUnits(amountVal.toString(), 6);

      const tx = await contract.withdrawSeed(amountWei);
      await tx.wait();

      alert(`Success! Withdrew $${amountVal.toLocaleString()} from Protocol Liquidity.`);
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Seed Withdrawal Failed: " + (err.reason || err.message));
    }
  };

  const handleLogout = () => {
    if (confirm("Are you sure you want to disconnect?")) {
      setAccount(null);
      setContract(null);
      setProvider(null);
      setUsdtContract(null);
      setIsAuthenticated(false);
      // Optional: Clear any local storage if used
    }
  };

  const handleWithdraw = async (amount, destination) => {
    if (!usdtContract) return alert("Please connect wallet.");

    try {
      const amountWei = ethers.parseUnits(amount.toString(), 6);
      console.log(`Transferring ${amount} USDT to ${destination}`);

      const tx = await usdtContract.transfer(destination, amountWei);
      await tx.wait();

      alert(`Success! Transfer complete.`);
      fetchData();
    } catch (err) {
      console.error("Transfer Error:", err);
      alert("Transfer Failed: " + (err.reason || err.message));
    }
  };

  // V31: Fiat On-Ramp (Transak Staging)


  // V35: Direct Wallet Buy V2 (Stable)
  // V35: Direct Wallet Buy (Aave Integrated)
  const handleBuyPassV2 = async (quantity = 1) => {
    if (!contract || !usdtContract) {
      alert("Please connect your wallet first.");
      connectWallet();
      return;
    }

    try {
      const pricePerPass = 1.05;
      const totalCost = pricePerPass * quantity;
      const totalCostWei = ethers.parseUnits(totalCost.toFixed(6), 6);

      // Check Balances
      const [usdtBal, maticBal] = await Promise.all([
        usdtContract.balanceOf(account),
        provider.getBalance(account)
      ]);

      const balance = parseFloat(ethers.formatUnits(usdtBal, 6));
      const gasBalance = parseFloat(ethers.formatUnits(maticBal, 18));

      // 1. Check Gas (MATIC)
      if (gasBalance < 0.01) {
        alert("Insufficient MATIC (Gas)! You need MATIC to pay for transaction fees.\n\nOpening 'Add Funds' to buy Gas.");
        setIsDepositModalOpen(true);
        return;
      }

      // 2. Check USDT
      if (balance < totalCost) {
        // Trigger On-Ramp if funds insufficient
        alert(`Insufficient USDT Balance.\n\nRequired: $${totalCost.toFixed(2)}\nAvailable: $${balance.toFixed(2)}\n\nPlease Buy USDT via UPI/Card to continue.`);
        setIsDepositModalOpen(true); // Opens Fiat On-Ramp
        return;
      }

      // Check Allowance
      const allowance = await usdtContract.allowance(account, CONTRACT_ADDRESS);
      if (allowance < totalCostWei) {
        // console.log("Approving USDT...");
        const txApprove = await usdtContract.approve(CONTRACT_ADDRESS, totalCostWei, { gasLimit: 100000 });
        await txApprove.wait();
      }

      // Buy Pass (Direct to Aave)
      // FIX: Added manual gasLimit to help Mobile Wallets (Trust Wallet) estimate correctly
      const tx = await contract.buyPass(quantity, { gasLimit: 500000 });
      await tx.wait();

      alert(`Success! Purchased ${quantity} Pass(es). Yield generating immediately.`);
      fetchData();

    } catch (err) {
      console.error("Buy Error:", err);
      if (err.message && err.message.includes("user rejected")) return;
      alert("Transaction Failed: " + (err.reason || err.message));
    }
  };



  // if (!isAuthenticated) return <LoginScreen onLogin={handleLogin} isLoggingIn={isLoggingIn} />;


  // --- ADMIN VIEW ---
  if (currentView === 'admin' && adminPinVerified) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Settings className="w-8 h-8 text-financial-green" /> Admin Dashboard
            </h1>
            <button onClick={() => { window.location.hash = ''; }} className="bg-slate-800 px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors">
              Exit to Home
            </button>
          </div>

          <div className="bg-slate-950 border border-white/10 rounded-2xl p-8 shadow-2xl">
            <h2 className="text-xl font-bold mb-6 text-slate-300">Global Configuration</h2>
            <p className="text-sm text-slate-500 mb-6">Settings here apply to all users immediately.</p>

            {/* Re-using the AdminSettingsModal Content logic but inline */}
            <AdminSettingsContent config={adminConfig} onSave={handleSaveAdminConfig} />
          </div>
        </div>
      </div>
    );
  }

  const handleDownloadGrantReport = async () => {
    if (!contract) return alert("Please connect wallet first");

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const currentBlock = await provider.getBlockNumber();
      const startBlock = currentBlock - 300000; // Approx 1 week on Polygon

      // Fetch Events
      const filterApplied = contract.filters.GrantApplied();
      const filterWinner = contract.filters.GrantWinner();

      const [appliedEvents, winnerEvents] = await Promise.all([
        contract.queryFilter(filterApplied, startBlock, currentBlock),
        contract.queryFilter(filterWinner, startBlock, currentBlock)
      ]);

      // Process Data
      const reportData = [];

      // 1. Add Applicants
      appliedEvents.forEach(e => {
        reportData.push({
          Type: "APPLICANT",
          Address: e.args[0],
          Amount: "0",
          TxHash: e.transactionHash
        });
      });

      // 2. Add Winners
      winnerEvents.forEach(e => {
        reportData.push({
          Type: "WINNER",
          Address: e.args[0],
          Amount: ethers.formatUnits(e.args[1], 6),
          TxHash: e.transactionHash
        });
      });

      if (reportData.length === 0) {
        return alert("No grant activity found in the last week.");
      }

      // Generate CSV
      const csvContent = "data:text/csv;charset=utf-8,"
        + "Type,Address,Amount (USDT),TxHash\n"
        + reportData.map(e => `${e.Type},${e.Address},${e.Amount},${e.TxHash}`).join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Grant_Report_Week_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err) {
      console.error("Error generating report:", err);
      alert("Failed to generate report. See console.");
    }
  };

  // --- HOME VIEW ---
  // --- RESTORED HOME VIEW ---
  return (
    <ErrorBoundary>
      <div className="relative min-h-screen bg-[#020617] text-slate-200 selection:bg-financial-green/30 overflow-hidden">
        {/* ... legacy content ... */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[120px]" />
          <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[60%] bg-financial-green/5 rounded-full blur-[120px]" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150" />
        </div>

        {/* Content Wrapper */}
        <div className="relative z-10 transition-colors duration-300">

          <Navbar
            scrollToSection={scrollToSection}
            account={account}
            onLogout={handleLogout}
            onBuyCrypto={() => setIsDepositModalOpen(true)}
            onConnect={() => connectWallet('metamask')}
          />

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <LiveFeedSection winners={winners} status={feedStatus} />
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.2 }}>
            <HeroSection protocolTVL={protocolTVL} dailyPool={dailyPool} weeklyPool={weeklyPool} />
          </motion.div>

          <DashboardSection
            walletBalance={walletBalance}
            passes={passes}
            dailyPool={dailyPool}
            weeklyPool={weeklyPool}
            grantPool={grantPool}
            aaveApy={aaveApy}
            adminSeedAmount={adminSeedAmount}
            protocolTVL={protocolTVL}
            onAdminDeposit={handleAdminDeposit}
            onAdminWithdraw={handleAdminWithdraw}
            hasAppliedForGrant={hasAppliedForGrant}
            onApplyGrant={handleApplyGrant}
            winners={winners}
            onAddFunds={() => setIsDepositModalOpen(true)}
            isOwner={account && contractOwner && account.toLowerCase() === contractOwner.toLowerCase()}
          />

          <PassStoreSection
            walletBalance={walletBalance}
            onBuyPass={handleBuyPassV2}
          />

          <StrategySection />

          <InventorySection
            passes={passes}
            onSellPass={handleSellPass}
            onSellBatch={handleSellBatch}
          />

          <YieldStructureSection />

          <ImpactSection
            grantPool={grantPool}
            hasAppliedForGrant={hasAppliedForGrant}
            onApplyGrant={handleApplyGrant}
            onDownloadReport={handleDownloadGrantReport}
          />

          <RoadmapSection />

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <TransparencySection
              onExportStats={handleExportUserStats}
              onExportGlobal={handleExportGlobalLedger}
              onOpenLegal={(doc) => setActiveLegalDoc(doc)}
              winners={winners}
              currentBlock={currentBlock}
            />
          </motion.div>

          <Footer />

          <AdminSettingsModal isOpen={isAdminSettingsOpen} onClose={() => setIsAdminSettingsOpen(false)} config={adminConfig} onSave={handleSaveAdminConfig} />
          <DepositModal isOpen={isDepositModalOpen} onClose={() => setIsDepositModalOpen(false)} userAddress={account} config={adminConfig} onDeposit={handleDeposit} usdtContract={usdtContract} />
          <WithdrawModal isOpen={isWithdrawModalOpen} onClose={() => setIsWithdrawModalOpen(false)} onWithdraw={handleWithdraw} balance={walletBalance} />
          <WalletSelectionModal isOpen={isWalletSelectionOpen} onClose={() => setIsWalletSelectionOpen(false)} />

          <LegalDocs activeDoc={activeLegalDoc} onClose={() => setActiveLegalDoc(null)} />
        </div>
      </div>
    </ErrorBoundary>
  );
}





require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: false });

console.log("🔍 Checking for updates manually...");

bot.getUpdates().then((updates) => {
    console.log(`✅ Found ${updates.length} updates.`);
    updates.forEach((u) => {
        const text = u.message ? u.message.text : "No text (Action?)";
        console.log(`- Update ID: ${u.update_id} | Text: ${text}`);
    });
}).catch((err) => {
    console.error("❌ ERROR Fetching Updates:", err.code);
    console.error(err.message);
});

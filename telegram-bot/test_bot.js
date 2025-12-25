require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const token = process.env.TELEGRAM_BOT_TOKEN;
console.log("Testing Token:", token ? "Token Exists" : "Token Missing");

const bot = new TelegramBot(token, { polling: false }); // Disable polling for this test

bot.getMe()
    .then((me) => {
        console.log("SUCCESS! Bot is connected:");
        console.log("Name:", me.first_name);
        console.log("Username:", me.username);
    })
    .catch((err) => {
        console.error("FAILED to connect:");
        console.error(err.code);
        console.error(err.message);
    });

let TelegramBot = require('node-telegram-bot-api');
let token = "TOKEN";
export default new TelegramBot(token, {polling: true});

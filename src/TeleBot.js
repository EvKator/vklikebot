let TelegramBot = require('node-telegram-bot-api');
let token = "275206810:AAF8UOGALom--cuL5pkXhA_0_YJQ--JwlbQ";//"333202194:AAEs1mkbq-x8mNEB2f5XjfmU4JQbgEO3gM0";
export default new TelegramBot(token, {polling: true});
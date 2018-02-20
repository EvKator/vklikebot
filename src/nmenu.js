var dataManage = require('dataManage.js');
import bot from './TeleBot';

function sendNewMenu(user) {
    var menu = {
        reply_markup: {
            "inline_keyboard": [
                [{"text":"My statistics", "callback_data" :"/stats"}],
                [{"text":"My VK profiles", "callback_data" :"/profiles"}],
                [{"text":"My tasks", "callback_data" :"/tasks"}],
                [{"text":"Earn coins", "callback_data" :"/earn"}]
            ]
        }};
    bot.sendMessage(user.id,"Choose what do you want to do from list below", menu).then(function (msg) {
        var m_id = msg.message_id;
        //bot.editMessageText( 'new text', { chat_id: chat_id, message_id: m_id });
        user.menu_id = m_id;
        dataManage.changeUser(user);
    });
}

function sendMenu(user) {
    var reply_markup = {
            "inline_keyboard": [
                [{"text":"My statistics", "callback_data" :"/stats"}],
                [{"text":"My VK profiles", "callback_data" :"/profiles"}],
                [{"text":"My tasks", "callback_data" :"/tasks"}],
                [{"text":"Earn coins", "callback_data" :"/earn"}]
            ]
        }
        var text = "Choose what do you want to do from list below";
    bot.editMessageText( text, { chat_id: user.id, message_id: user.menu_id, reply_markup:reply_markup });
    //bot.editMessageReplyMarkup(menu,{ chat_id: user.id, message_id: user.menu_id });
}


function sendProfilesEditionMenu(user) {
    var menu = {
            "inline_keyboard": [
                [{"text":"Add VK profile", "callback_data" :"/addVkAcc"}],
                [{"text":"Remove VK profile", "callback_data" :"/removeVkAcc"}],
                [{"text":"Back", "callback_data" :"/menu"}]
            ]
        }
    bot.editMessageReplyMarkup(menu,{ chat_id: user.id, message_id: user.menu_id });
}

function sendTasksMenu(user) {
    var menu = {
            "inline_keyboard": [
                [{"text":"Create task", "callback_data" :"/createTask"}],
                [{"text":"Delete task", "callback_data" :"/deleteTask"}],
                [{"text":"Back", "callback_data" :"/menu"}]
            ]
        }
    bot.editMessageReplyMarkup(menu,{ chat_id: user.id, message_id: user.menu_id });
}

function sendCreationTaskMenu(user) {
    var menu = {
            "inline_keyboard": [
                [{"text":"Likes on photo", "callback_data" :"/vk_photo_like"}],
                [{"text":"Likes on video", "callback_data" :"/vk_video_like"}],
                [{"text":"Back", "callback_data" :"/menu"}]
            ]
        }
    bot.editMessageReplyMarkup(menu,{ chat_id: user.id, message_id: user.menu_id });
}

function sendEarnMenu(user) {
    var menu = {
            "inline_keyboard": [
                [{"text":"Likes on photo", "callback_data" :"/earn_vk_photo_like"}],
                [{"text":"Likes on video", "callback_data" :"/earn_vk_video_like"}],
                [{"text":"Back", "callback_data" :"/menu"}]
            ]
        }
    bot.editMessageReplyMarkup(menu,{ chat_id: user.id, message_id: user.menu_id });
}



function sendEarnOperationButton(user, task) {
        parse_mode = "Markdown";
        reply_markup = {
            "inline_keyboard": [
                [{"text":"Go To Photo", "url" : task.url, "callback_data" :"/goToPhoto(" + task.name + ")"}],
                [{"text":"Confirm", "callback_data" :"/goToPhoto(" + task.name + ")"}],
                [{"text":"Back", "callback_data" :"/menu"}]
            ]
        };
    //bot.sendMessage(user.id,"Choose what do you want to do from list below", urlkey);
    var text = "Choose what do you want to do from list below";
    bot.editMessageText( text , { chat_id: user.id, message_id: user.menu_id, reply_markup:reply_markup, parse_mode : parse_mode });
}

function sendStats(user) {
    var reply_markup = {
            "inline_keyboard": [
                [{"text":"Back", "callback_data" :"/menu"}]
            ]
    }
    var accCount = 0;
    if(typeof user.vk_accs !== 'undefined' && typeof user.vk_accs !== null)
        accCount = user.vk_accs.length;
    var statText = "<b>Stats of " + user.first_name + " " + user.last_name + " :</b>\n" +
        "Connected VK accounts: " + accCount + "\n" +
        "Balance: " + user.balance + " coins";
    //bot.sendMessage(chat_id, statText, back, {});
    bot.editMessageText( statText, { chat_id: user.id, message_id: user.menu_id, reply_markup:reply_markup, parse_mode : "HTML" });
}


module.exports = {
    sendMenu : sendMenu,
    sendNewMenu : sendNewMenu,
    sendProfilesEditionMenu : sendProfilesEditionMenu,
    sendTasksMenu:sendTasksMenu,
    sendCreationTaskMenu : sendCreationTaskMenu,
    sendEarnMenu : sendEarnMenu,
    sendEarnOperationButton : sendEarnOperationButton,
    sendStats: sendStats
};
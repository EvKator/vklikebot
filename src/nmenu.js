import bot from './TeleBot';

export default class nMenu {

    static async sendMenu(user) {
        const menu = {
            reply_markup: {
                "inline_keyboard": [
                    [{"text": "My statistics", "callback_data": "/stats"}],
                    [{"text": "My VK profiles", "callback_data": "/profiles"}],
                    [{"text": "My tasks", "callback_data": "/tasks"}],
                    [{"text": "Earn coins", "callback_data": "/earn"}]
                ]
            }
        };
        await nMenu.deleteMenu(user);
        bot.sendMessage(user.id, "Choose what do you want to do from list below", menu).then(function (msg) {
            
            user.menu_id = msg.message_id;
        });
    }

    static async deleteMenu(user){
        await bot.deleteMessage(user.id, user.menu_id);
    }

    static async sendAccsEditionMenu(user) {
        const menu = {
            "inline_keyboard": [
                [{"text": "Add VK profile", "callback_data": "/addVkAcc"}, {"text": "Remove VK profile", "callback_data": "/removeVkAcc"}],
                [{"text": "Back", "callback_data": "/menu"}]
            ]
        };
        await bot.editMessageReplyMarkup(menu, {chat_id: user.id, message_id: user.menu_id});
    }

    static async sendTasksMenu(user) {
        const menu = {
            "inline_keyboard": [
                [{"text": "Create task", "callback_data": "/createTask(vk_photo_like)"},{"text": "Delete task", "callback_data": "/deleteTask"}],
                [{"text": "Back", "callback_data": "/menu"}]
            ]
        };
        await bot.editMessageReplyMarkup(menu, {chat_id: user.id, message_id: user.menu_id});
    }

    static async sendCreationTaskMenu(user) {
        const menu = {
            "inline_keyboard": [
                [{"text": "Likes on VK photo", "callback_data": "/vk_photo_like"}, {"text": "Likes on video", "callback_data": "/vk_video_like"}],
                [{"text": "Back", "callback_data": "/menu"}]
            ]
        };
        await bot.editMessageReplyMarkup(menu, {chat_id: user.id, message_id: user.menu_id});
    }

    static async sendEarnMenu(user) {
        const menu = {
            "inline_keyboard": [
                [{"text": "Likes on VK photo", "callback_data": "/earn_vk_photo_like"}, {"text": "Likes on VK video", "callback_data": "/earn_vk_video_like"}],
                [{"text": "Back", "callback_data": "/menu"}]
            ]
        };
        await bot.editMessageReplyMarkup(menu, {chat_id: user.id, message_id: user.menu_id});
    }

    static async sendNextTaskMenu(user, tasktype){
        const menu = {
            "inline_keyboard": [
                [{"text": "Next task", "callback_data": "/"+tasktype}],
                [{"text": "Back", "callback_data": "/earn"}]
            ]
        };
        await bot.editMessageReplyMarkup(menu, {chat_id: user.id, message_id: user.menu_id});
    }

    static async sendVkPhotoLikeTaskMenu(user, task) {
        const parse_mode = "Markdown";
        const reply_markup = {
            "inline_keyboard": [
                [{"text": "Go To Photo", "url": task.url, "callback_data": "/goToPhoto(" + task.taskname + ")"}],
                [{"text": "Confirm", "callback_data": "/confirm(" + task.taskname + ")"}],
                [{"text": "Skip", "callback_data": "/skip(" + task.taskname + ")"}],
                [{"text": "Back", "callback_data": "/menu"}]
            ]
        };
        const text = "Choose what do you want to do from list below";
        await bot.editMessageText(text, {
            chat_id: user.id,
            message_id: user.menu_id,
            reply_markup: reply_markup,
            parse_mode: parse_mode
        });
    }

    static async sendStats(user) {
        const reply_markup = {
            "inline_keyboard": [
                [{"text": "Back", "callback_data": "/menu"}]
            ]
        };
        let accCount = 0;
        if (typeof user.vk_acc !== 'undefined' && typeof user.vk_acc !== null)
            accCount = user.vk_acc.length;
        let statText = "<b>Stats of " + user.first_name + " " + user.last_name + " :</b>\n" +
            "Connected VK accounts: " + accCount + "\n" +
            "Balance: " + user.balance + " coins";
        let dta = {
            chat_id: user.id,
            message_id: user.menu_id,
            reply_markup: reply_markup,
            parse_mode: "HTML"
        };
        await bot.editMessageText(statText, {
            chat_id: user.id,
            message_id: user.menu_id,
            reply_markup: reply_markup,
            parse_mode: "HTML"
        });
    }
}
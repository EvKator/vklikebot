import bot from './TeleBot';
import VkPhotoLikeTask from './VkPhotoLikeTask';

export default class nMenu {

    static async sendMenu(user) {
        const text = "Чего желаешь, пользователь?";
        const reply_markup = {
                "inline_keyboard": [
                    [{"text": "Статистика", "callback_data": "/stats"}],
                    [{"text": "Выполнять задания", "callback_data": "/earn"}],
                    [{"text": "Создать задание", "callback_data": "/createTask"}],
                    [{"text": "Привязать аккаунт", "callback_data": "/profiles"}],
                    [{"text": "Вывод средств", "callback_data": "/withdrawMoney"}],
                    [{"text": "Пополнить счет", "callback_data": "/replenishMoney"}],
                    [{"text": "Помощь", "url": "https://telegram.me/olebysh", "callback_data": "https://telegram.me/olebysh"}]
                ]
        }
        await nMenu._sendMessage(user, text, reply_markup);
    }


    static async sendAccsEditionMenu(user) {
        let text;
        let reply_markup;
        if(!user.vk_acc.uname){
            text = "Сейчас твой ВК аккаунт не привязан. Хочешь привязать?";
            reply_markup = {
                "inline_keyboard": [
                    [{"text": "Привязать аккаунт", "callback_data": "/addVkAcc"}],
                    [{"text": "В меню!", "callback_data": "/menu"}]
                ]
            };
        }
        else{
            text = "Ты привязал страницу http://vk.com/" + user.vk_acc.uname;
            reply_markup = {
                "inline_keyboard": [
                    [{"text": "Отвязать аккаунт", "callback_data": "/delVkAcc"}],
                    [{"text": "В меню!", "callback_data": "/menu"}]
                ]
            };
        }
        await nMenu._sendMessage(user, text, reply_markup);
    }
    static async sendVkCreationTaskMenu(user) {
        const text = "Какое задание хочешь создать?";
        const reply_markup = {
            "inline_keyboard": [
                [{"text": "Накрутка лайков ВК", "callback_data": "/create_vk_photo_like_task"}],
                [{"text": "Назад", "callback_data": "/menu"}]
            ]
        };
        await nMenu._sendMessage(user,text,reply_markup);
    }

    static async sendEarnMenu(user, sendNew) {
        const text = "Какие задания хочешь выполнять?";
        const reply_markup = {
            "inline_keyboard": [
                [{"text": "Лайки на фото в ВК", "callback_data": "/earn_vk_photo_like_task"}],
                [{"text": "Подписки в ВК", "callback_data": "/earn_vk_subscribers_task"}],
                [{"text": "Просмотр постов tg", "callback_data": "/earn_tg_post_view_task"}],
                [{"text": "Подписки в tg", "callback_data": "/earn_tg_subscribers_task"}],
                [{"text": "Назад", "callback_data": "/menu"}]
            ]
        };
        await nMenu._sendMessage(user,text,reply_markup);
    }

    static async sendNextTaskMenu(user, tasktype, text){
        if(!text)
            text = "Чего желаешь, человек?";
        const reply_markup = {
            "inline_keyboard": [
                [{"text": "Следующее задание", "callback_data": "/earn_"+tasktype}],
                [{"text": "Выйти в меню", "callback_data": "/menu"}]
            ]
        };
        await nMenu._sendMessage(user,text,reply_markup);
    }

    static async sendEarnVkPhotoLikeTaskMenu(user, task) {
        const text = "Поставь лайк на [фотографию](" + task.url + ")";
        const parse_mode = "Markdown";
        const reply_markup = {
            "inline_keyboard": [
                [{"text": "Перейти к фотке", "url": task.url, "callback_data": "/goToPhoto(" + task.taskname + ")"}],
                [{"text": "Я поставил лайк", "callback_data": "/confirm(" + task.taskname + ")"}],
                [{"text": "Пропустить", "callback_data": "/skip(" + task.taskname + ")"}],
                [{"text": "В меню!", "callback_data": "/menu"}]
            ]
        };
        await nMenu._sendMessage(user,text,reply_markup, parse_mode);
    }

    static async sendStats(user) {
        const parse_mode = 'Markdown';
        const reply_markup = {
            "inline_keyboard": [
                [{"text": "В меню!", "callback_data": "/menu"}]
            ]
        };
        let text = "Баланс: " + user.balance + " руб" + "\n";

        let tasks = await user.createdTasks();
        if(tasks.length > 0){
            text += "Созданные задания:\n\n";

            for(var i = 0; i < tasks.length; i++){
                switch (tasks[i].type)
                {
                    case 'vk_photo_like_task':
                        text += VkPhotoLikeTask.toString(tasks[i]) + "\n";
                        break;
                    default:
                        break;
                }
            }
        }
        else{
            text += "Вы еще не создавали задания";
        }
        
        await nMenu._sendMessage(user,text,reply_markup, parse_mode);
    }

    static async sendConfitmVkAccMenu(user){
        const parse_mode = 'HTML';
        let text = "Укажи на странице в статусе этот код: <code>" +
            user.key + "</code> и ПОСЛЕ пришли ссылку на нее";
        const reply_markup = {
            "inline_keyboard": [
                [{"text":"Перейти к ВК", "callback_data" :"/openvk", "url" : "https://vk.com/id0"}],
                [{"text":"В меню!", "callback_data" :"/menu"}]
            ]
        };
        await nMenu._sendMessage(user,text,reply_markup, parse_mode);
    }

    static async deleteMenu(user){
        try{
            bot.deleteMessage(user.id, user.menu_id);
        }
        catch(err){}
    }

    static async _sendMessage(user, text, reply_markup, parse_mode){
        let sendNew = !(user.last_message_id == user.menu_id);
        if(sendNew){
            await nMenu._sendNew(user, text, reply_markup, parse_mode);
        }
        else{
            try{
                await nMenu._replaceText(user, text, reply_markup, parse_mode);
            }
            catch(err){
                await nMenu._sendNew(user, text, reply_markup, parse_mode);
            }
        }
    }

    static async _replaceMarkup(user, text, reply_markup, parse_mode){
        await bot.editMessageReplyMarkup(reply_markup, {chat_id: user.id, message_id: user.menu_id});
    }

    static async _replaceText(user, text, reply_markup, parse_mode){
        await bot.editMessageText(text, {chat_id: user.id, message_id: user.menu_id, reply_markup: reply_markup, parse_mode: parse_mode});
    }
    

    static async _sendNew(user, text, reply_markup, parse_mode){
        //try{
            await nMenu.deleteMenu(user);
        //}
        //catch(err){}
        nMenu._sendAndRemember(user, text, reply_markup, parse_mode);
    }

    static async _sendAndRemember(user, text, reply_markup, parse_mode){
        await bot.sendMessage(user.id, text, {parse_mode: 'HTML', reply_markup: reply_markup}).then(function (msg) {
            user.menu_id = msg.message_id;
            user.last_message_id = msg.message_id;
        });
    }

    static async sendTextMessage(user, text, reply_markup, parse_mode){
        reply_markup = {
            "inline_keyboard": [
                [{"text": "В меню!", "callback_data": "/menu"}]
            ]
        };
        nMenu._sendNew(user,text,reply_markup);
        // await bot.sendMessage(user.id, text, {parse_mode: 'HTML', reply_markup: reply_markup}).then(function (msg) {
        //     user.last_message_id = msg.message_id;
        // });
    }
}
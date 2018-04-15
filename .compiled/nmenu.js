'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _TeleBot = require('./TeleBot');

var _TeleBot2 = _interopRequireDefault(_TeleBot);

var _VkPhotoLikeTask = require('./VkPhotoLikeTask');

var _VkPhotoLikeTask2 = _interopRequireDefault(_VkPhotoLikeTask);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var nMenu = function () {
    function nMenu() {
        _classCallCheck(this, nMenu);
    }

    _createClass(nMenu, null, [{
        key: 'sendMenu',
        value: async function sendMenu(user) {
            var text = "Чего желаешь, пользователь?";
            var reply_markup = {
                "inline_keyboard": [[{ "text": "Статистика", "callback_data": "/stats" }], [{ "text": "Выполнять задания", "callback_data": "/earn" }], [{ "text": "Создать задание", "callback_data": "/createTask" }], [{ "text": "Привязать аккаунт", "callback_data": "/profiles" }], [{ "text": "Вывод средств", "callback_data": "/withdrawMoney" }], [{ "text": "Пополнить счет", "callback_data": "/replenishMoney" }], [{ "text": "Помощь", "url": "https://telegram.me/olebysh", "callback_data": "https://telegram.me/olebysh" }]]
            };
            await nMenu._sendMessage(user, text, reply_markup);
        }
    }, {
        key: 'sendAccsEditionMenu',
        value: async function sendAccsEditionMenu(user) {
            var text = void 0;
            var reply_markup = void 0;
            if (!user.vk_acc.uname) {
                text = "Сейчас твой ВК аккаунт не привязан. Хочешь привязать?";
                reply_markup = {
                    "inline_keyboard": [[{ "text": "Привязать аккаунт", "callback_data": "/addVkAcc" }], [{ "text": "В меню!", "callback_data": "/menu" }]]
                };
            } else {
                text = "Ты привязал страницу http://vk.com/" + user.vk_acc.uname;
                reply_markup = {
                    "inline_keyboard": [[{ "text": "Отвязать аккаунт", "callback_data": "/delVkAcc" }], [{ "text": "В меню!", "callback_data": "/menu" }]]
                };
            }
            await nMenu._sendMessage(user, text, reply_markup);
        }
    }, {
        key: 'sendVkCreationTaskMenu',
        value: async function sendVkCreationTaskMenu(user) {
            var text = "Какое задание хочешь создать?";
            var reply_markup = {
                "inline_keyboard": [[{ "text": "Накрутка лайков ВК", "callback_data": "/create_vk_photo_like_task" }], [{ "text": "Назад", "callback_data": "/menu" }]]
            };
            await nMenu._sendMessage(user, text, reply_markup);
        }
    }, {
        key: 'sendEarnMenu',
        value: async function sendEarnMenu(user, sendNew) {
            var text = "Какие задания хочешь выполнять?";
            var reply_markup = {
                "inline_keyboard": [[{ "text": "Лайки на фото в ВК", "callback_data": "/earn_vk_photo_like_task" }], [{ "text": "Подписки в ВК", "callback_data": "/earn_vk_subscribers_task" }], [{ "text": "Просмотр постов tg", "callback_data": "/earn_tg_post_view_task" }], [{ "text": "Подписки в tg", "callback_data": "/earn_tg_subscribers_task" }], [{ "text": "Назад", "callback_data": "/menu" }]]
            };
            await nMenu._sendMessage(user, text, reply_markup);
        }
    }, {
        key: 'sendNextTaskMenu',
        value: async function sendNextTaskMenu(user, tasktype, text) {
            if (!text) text = "Чего желаешь, человек?";
            var reply_markup = {
                "inline_keyboard": [[{ "text": "Следующее задание", "callback_data": "/earn_" + tasktype }], [{ "text": "Выйти в меню", "callback_data": "/menu" }]]
            };
            await nMenu._sendMessage(user, text, reply_markup);
        }
    }, {
        key: 'sendEarnVkPhotoLikeTaskMenu',
        value: async function sendEarnVkPhotoLikeTaskMenu(user, task) {
            var text = "Поставь лайк на [фотографию](" + task.url + ")";
            var parse_mode = "Markdown";
            var reply_markup = {
                "inline_keyboard": [[{ "text": "Перейти к фотке", "url": task.url, "callback_data": "/goToPhoto(" + task.taskname + ")" }], [{ "text": "Я поставил лайк", "callback_data": "/confirm(" + task.taskname + ")" }], [{ "text": "Пропустить", "callback_data": "/skip(" + task.taskname + ")" }], [{ "text": "В меню!", "callback_data": "/menu" }]]
            };
            await nMenu._sendMessage(user, text, reply_markup, parse_mode);
        }
    }, {
        key: 'sendStats',
        value: async function sendStats(user) {
            var parse_mode = 'Markdown';
            var reply_markup = {
                "inline_keyboard": [[{ "text": "В меню!", "callback_data": "/menu" }]]
            };
            var text = "Баланс: " + user.balance + " руб" + "\n";

            var tasks = await user.createdTasks();
            if (tasks.length > 0) {
                text += "Созданные задания:\n\n";

                for (var i = 0; i < tasks.length; i++) {
                    switch (tasks[i].type) {
                        case 'vk_photo_like_task':
                            text += _VkPhotoLikeTask2.default.toString(tasks[i]) + "\n";
                            break;
                        default:
                            break;
                    }
                }
            } else {
                text += "Вы еще не создавали задания";
            }

            await nMenu._sendMessage(user, text, reply_markup, parse_mode);
        }
    }, {
        key: 'sendConfitmVkAccMenu',
        value: async function sendConfitmVkAccMenu(user) {
            var parse_mode = 'HTML';
            var text = "Укажи на странице в статусе этот код: <code>" + user.key + "</code> и ПОСЛЕ пришли ссылку на нее";
            var reply_markup = {
                "inline_keyboard": [[{ "text": "Перейти к ВК", "callback_data": "/openvk", "url": "https://vk.com/id0" }], [{ "text": "В меню!", "callback_data": "/menu" }]]
            };
            await nMenu._sendMessage(user, text, reply_markup, parse_mode);
        }
    }, {
        key: 'deleteMenu',
        value: async function deleteMenu(user) {
            try {
                _TeleBot2.default.deleteMessage(user.id, user.menu_id);
            } catch (err) {}
        }
    }, {
        key: '_sendMessage',
        value: async function _sendMessage(user, text, reply_markup, parse_mode) {
            var sendNew = !(user.last_message_id == user.menu_id);
            if (sendNew) {
                await nMenu._sendNew(user, text, reply_markup, parse_mode);
            } else {
                try {
                    await nMenu._replaceText(user, text, reply_markup, parse_mode);
                } catch (err) {
                    await nMenu._sendNew(user, text, reply_markup, parse_mode);
                }
            }
        }
    }, {
        key: '_replaceMarkup',
        value: async function _replaceMarkup(user, text, reply_markup, parse_mode) {
            await _TeleBot2.default.editMessageReplyMarkup(reply_markup, { chat_id: user.id, message_id: user.menu_id });
        }
    }, {
        key: '_replaceText',
        value: async function _replaceText(user, text, reply_markup, parse_mode) {
            await _TeleBot2.default.editMessageText(text, { chat_id: user.id, message_id: user.menu_id, reply_markup: reply_markup, parse_mode: parse_mode });
        }
    }, {
        key: '_sendNew',
        value: async function _sendNew(user, text, reply_markup, parse_mode) {
            //try{
            await nMenu.deleteMenu(user);
            //}
            //catch(err){}
            nMenu._sendAndRemember(user, text, reply_markup, parse_mode);
        }
    }, {
        key: '_sendAndRemember',
        value: async function _sendAndRemember(user, text, reply_markup, parse_mode) {
            await _TeleBot2.default.sendMessage(user.id, text, { parse_mode: 'HTML', reply_markup: reply_markup }).then(function (msg) {
                user.menu_id = msg.message_id;
                user.last_message_id = msg.message_id;
            });
        }
    }, {
        key: 'sendTextMessage',
        value: async function sendTextMessage(user, text, reply_markup, parse_mode) {
            reply_markup = {
                "inline_keyboard": [[{ "text": "В меню!", "callback_data": "/menu" }]]
            };
            nMenu._sendNew(user, text, reply_markup);
            // await bot.sendMessage(user.id, text, {parse_mode: 'HTML', reply_markup: reply_markup}).then(function (msg) {
            //     user.last_message_id = msg.message_id;
            // });
        }
    }]);

    return nMenu;
}();

exports.default = nMenu;
//# sourceMappingURL=nmenu.js.map
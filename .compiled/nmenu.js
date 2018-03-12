"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _TeleBot = require("./TeleBot");

var _TeleBot2 = _interopRequireDefault(_TeleBot);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var nMenu = function () {
    function nMenu() {
        _classCallCheck(this, nMenu);
    }

    _createClass(nMenu, null, [{
        key: "sendNewMenu",
        value: function sendNewMenu(user) {
            var menu = {
                reply_markup: {
                    "inline_keyboard": [[{ "text": "My statistics", "callback_data": "/stats" }], [{ "text": "My VK profiles", "callback_data": "/profiles" }], [{ "text": "My tasks", "callback_data": "/tasks" }], [{ "text": "Earn coins", "callback_data": "/earn" }]]
                }
            };
            _TeleBot2.default.sendMessage(user.id, "Choose what do you want to do from list below", menu).then(function (msg) {
                nMenu.deleteMenu(user);
                user.menu_id = msg.message_id;
            });
        }
    }, {
        key: "sendMenu",
        value: function sendMenu(user) {
            var reply_markup = {
                "inline_keyboard": [[{ "text": "My statistics", "callback_data": "/stats" }], [{ "text": "My VK profiles", "callback_data": "/profiles" }], [{ "text": "My tasks", "callback_data": "/tasks" }], [{ "text": "Earn coins", "callback_data": "/earn" }]]
            };
            var text = "Choose what do you want to do from list below";
            _TeleBot2.default.editMessageText(text, { chat_id: user.id, message_id: user.menu_id, reply_markup: reply_markup });
        }
    }, {
        key: "deleteMenu",
        value: async function deleteMenu(user) {
            await _TeleBot2.default.deleteMessage(user.id, user.menu_id);
        }
    }, {
        key: "sendProfilesEditionMenu",
        value: async function sendProfilesEditionMenu(user) {
            var menu = {
                "inline_keyboard": [[{ "text": "Add VK profile", "callback_data": "/addVkAcc" }, { "text": "Remove VK profile", "callback_data": "/removeVkAcc" }], [{ "text": "Back", "callback_data": "/menu" }]]
            };
            await _TeleBot2.default.editMessageReplyMarkup(menu, { chat_id: user.id, message_id: user.menu_id });
        }
    }, {
        key: "sendTasksMenu",
        value: async function sendTasksMenu(user) {
            var menu = {
                "inline_keyboard": [[{ "text": "Create task", "callback_data": "/createTask(vk_photo_like)" }, { "text": "Delete task", "callback_data": "/deleteTask" }], [{ "text": "Back", "callback_data": "/menu" }]]
            };
            await _TeleBot2.default.editMessageReplyMarkup(menu, { chat_id: user.id, message_id: user.menu_id });
        }
    }, {
        key: "sendCreationTaskMenu",
        value: async function sendCreationTaskMenu(user) {
            var menu = {
                "inline_keyboard": [[{ "text": "Likes on VK photo", "callback_data": "/vk_photo_like" }, { "text": "Likes on video", "callback_data": "/vk_video_like" }], [{ "text": "Back", "callback_data": "/menu" }]]
            };
            await _TeleBot2.default.editMessageReplyMarkup(menu, { chat_id: user.id, message_id: user.menu_id });
        }
    }, {
        key: "sendEarnMenu",
        value: async function sendEarnMenu(user) {
            var menu = {
                "inline_keyboard": [[{ "text": "Likes on VK photo", "callback_data": "/earn_vk_photo_like" }, { "text": "Likes on VK video", "callback_data": "/earn_vk_video_like" }], [{ "text": "Back", "callback_data": "/menu" }]]
            };
            await _TeleBot2.default.editMessageReplyMarkup(menu, { chat_id: user.id, message_id: user.menu_id });
        }
    }, {
        key: "sendEarnOperationButton",
        value: async function sendEarnOperationButton(user, task) {
            var parse_mode = "Markdown";
            var reply_markup = {
                "inline_keyboard": [[{ "text": "Go To Photo", "url": task.url, "callback_data": "/goToPhoto(" + task.taskname + ")" }], [{ "text": "Confirm", "callback_data": "/confirm(" + task.taskname + ")" }], [{ "text": "Confirm", "callback_data": "/skip(" + task.taskname + ")" }], [{ "text": "Back", "callback_data": "/menu" }]]
            };
            //bot.sendMessage(user.id,"Choose what do you want to do from list below", urlkey);
            var text = "Choose what do you want to do from list below";
            await _TeleBot2.default.editMessageText(text, {
                chat_id: user.id,
                message_id: user.menu_id,
                reply_markup: reply_markup,
                parse_mode: parse_mode
            });
        }
    }, {
        key: "sendStats",
        value: async function sendStats(user) {
            var reply_markup = {
                "inline_keyboard": [[{ "text": "Back", "callback_data": "/menu" }]]
            };
            var accCount = 0;
            if (typeof user.vk_acc !== 'undefined' && typeof user.vk_acc !== null) accCount = user.vk_acc.length;
            var statText = "<b>Stats of " + user.first_name + " " + user.last_name + " :</b>\n" + "Connected VK accounts: " + accCount + "\n" + "Balance: " + user.balance + " coins";
            var dta = {
                chat_id: user.id,
                message_id: user.menu_id,
                reply_markup: reply_markup,
                parse_mode: "HTML"
            };
            await _TeleBot2.default.editMessageText(statText, {
                chat_id: user.id,
                message_id: user.menu_id,
                reply_markup: reply_markup,
                parse_mode: "HTML"
            });
        }
    }]);

    return nMenu;
}();

exports.default = nMenu;
//# sourceMappingURL=nmenu.js.map
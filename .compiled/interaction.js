'use strict';

var _nmenu = require('./nmenu');

var _nmenu2 = _interopRequireDefault(_nmenu);

var _TeleBot = require('./TeleBot');

var _TeleBot2 = _interopRequireDefault(_TeleBot);

var _user = require('./user');

var _user2 = _interopRequireDefault(_user);

var _task2 = require('./task');

var _task3 = _interopRequireDefault(_task2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var request = require('request');
var cheerio = require('cheerio');
//let work = require('work.js');
//let task = require('task.js');


////////////////////////////////////////TASK/////////////////////////////////////////////////////////
_TeleBot2.default.onText(/\/start/, async function (msg, match) {

    var user = await _user2.default.getSender(msg);
    if (!user.ExistInDB) {
        await user.saveToDB();
        var greeting = "Hello! This bot will help you easily and reliably exchange your " + "likes with our other users. To connect your account, click the appropriate button.";
        user.sendMessage(greeting);
    }
});

_TeleBot2.default.onText(/\/menu/, async function (msg, match) {
    var user = await _user2.default.getSender(msg);
    _nmenu2.default.sendNewMenu(user);
});

_TeleBot2.default.on('callback_query', async function (msg) {
    var user = await _user2.default.getSender(msg);
    var patt = /goToPhoto\((.+)\)/g;
    console.log(msg.data);
    if (patt.test(msg.data)) {
        /*console.log(msg.data);
        var mat = patt.exec(msg.data);
        var taskName = mat[1];
        user.tasks.push(taskName);
        dataManage.changeUser(user);
        dataManage.setStatus(user, 'task_creation(vk_photo_like)');
        work.getVkLikeTask(user);*/
    }
    switch (msg.data) {
        case '/stats':
            console.log('ssssss');
            _nmenu2.default.sendStats(user);
            break;
        case '/profiles':
            _nmenu2.default.sendProfilesEditionMenu(user);
            break;
        case '/earn':
            _nmenu2.default.sendEarnMenu(user);
            //dataManage.setStatus(user, 'earning');
            //bot.sendMessage(msg.message.chat.id, "Send me a link to the photo for a wrapping of likes");
            break;
        case '/tasks':
            _nmenu2.default.sendTasksMenu(user);
            //earn(msg);
            break;
        case '/createTask(vk_photo_like)':
            _TeleBot2.default.sendMessage(user.id, 'send the link to the photo');
            user.status = 'task_creation(vk_photo_like)[link]';
        case '/vk_photo_like':
            /*dataManage.setStatus(user, 'task_creation(vk_photo_like)');
            bot.sendMessage(msg.message.chat.id, "Send me a link to the photo for a wrapping of likes");*/
            break;
        case '/addVkAcc':
            var key = createKey(30);
            user.status = 'vk_acc_addition';
            user.key = key;
            var urlkey = {
                parse_mode: "Markdown",
                reply_markup: {
                    "inline_keyboard": [[{ "text": "Open VK", "callback_data": "/menu", "url": "https://vk.com/id0" }]]
                } };
            _TeleBot2.default.sendMessage(msg.message.chat.id, "Indicate in the status of your VK page this key: `" + key + "` (press to copy) and AFTER send me its ID", urlkey, { parse_mode: "Markdown" });
            break;
        case '/removeVkAcc':
            break;
        case '/menu':
            _nmenu2.default.sendMenu(user);
            break;

        case '/earn_vk_photo_like':
            var task = await _task3.default.GetTaskForUser(user, 'vk_photo_like_task');
            console.log(task);
            if (task) {
                _nmenu2.default.sendEarnOperationButton(user, task);
            } else {
                _TeleBot2.default.sendMessage(user.id, "There are no this type tasks for you"); //////////////////////////////////////
            }
            break;
        default:
            var taskname = /\/confirm\((.*)\)/g.exec(msg.data)[1];
            if (taskname) {
                var text = "";
                var _task = await user.confirmTask(taskname);
                console.log('sssssss');
                console.log(_task);
                if (_task) {
                    text = "Success, you will get " + _task._cost + " coins";
                } else {
                    text = "Failure";
                }
                _TeleBot2.default.sendMessage(user.id, text);
                user.status = 'free';
            }
    }
    _TeleBot2.default.answerCallbackQuery(msg.id, "", true);
});

_TeleBot2.default.onText(/\/confirm\((.*)\)/, async function (msg, match) {
    var user = await _user2.default.getSender(msg);
    await user.confirmTask(match[1]);
});

_TeleBot2.default.onText(/\/skip\((.*)\)/, async function (msg, match) {
    var user = await _user2.default.getSender(msg);
    await user.skipTask(match[1]);
});

_TeleBot2.default.onText(/(.*)/, async function (msg, match) {
    var user = await _user2.default.getSender(msg);
    _nmenu2.default.deleteMenu(user);
    console.log(user.status);
    switch (user.status) {
        case 'vk_acc_addition':
            user.addVkAcc(match[1]);
            user.status = 'free';
            break;
        case 'vk_acc_removal':
            break;
        case 'task_creation(vk_photo_like)[link]':
            user.status = 'task_creation(vk_photo_like{' + match[1] + '})[required]';
            _TeleBot2.default.sendMessage(msg.chat.id, "How many likes do you want to wind?");
            break;
        default:
            var link = /task_creation\(vk_photo_like\{(.*)\}\)\[required\]/g.exec(user.status)[1];
            if (link) {
                var required = /(\d*)/g.exec(match)[1];
                if (required) {
                    console.log(user.balance);
                    if (Number(required) <= Number(user.balance)) {
                        ///....
                        user.createVkPhotoLikeTask(link, match[1]);
                        _TeleBot2.default.sendMessage(msg.chat.id, "ok, " + required);
                    } else _TeleBot2.default.sendMessage(msg.chat.id, "Too low a balance for this operation");
                }
                user.status = 'free';
            }

    }

    //dataManage.setStatus(user, 'free');
});

_TeleBot2.default.onText(/\/balance\((\d+)\)/, function (msg, match) {
    /*user = dataManage.getUser(msg.from.id);
    console.log(match[1]);
    dataManage.setBalance(user, match[1]);
      //dataManage.setStatus(user, 'free');*/
});

_TeleBot2.default.onText(/\/cltask/, function (msg, match) {
    /*user = dataManage.getUser(msg.from.id);
    console.log(match[1]);
    user.tasks = new Array();
    dataManage.changeUser(user);
      //dataManage.setStatus(user, 'free');*/
});

function createKey(n) {
    var s = '';
    while (s.length < n) {
        s += String.fromCharCode(Math.random() * 1106).replace(/[^a-zA-Z]|_/g, '');
    }return s;
}
//# sourceMappingURL=interaction.js.map
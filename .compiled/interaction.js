'use strict';

var _nmenu = require('./nmenu');

var _nmenu2 = _interopRequireDefault(_nmenu);

var _TeleBot = require('./TeleBot');

var _TeleBot2 = _interopRequireDefault(_TeleBot);

var _user = require('./user');

var _user2 = _interopRequireDefault(_user);

var _task3 = require('./task');

var _task4 = _interopRequireDefault(_task3);

var _admin = require('./admin');

var _admin2 = _interopRequireDefault(_admin);

var _constants = require('constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var request = require('request');
var cheerio = require('cheerio');


_TeleBot2.default.onText(/\/start/, async function (msg, match) {

    var user = await _user2.default.getSender(msg);
    if (!user.ExistInDB) {
        await user.saveToDB();
        var greeting = "Привет! \n" + " Этот бот поможет тебе накрутить лайки на фотографии, посты в ВК, подписчиков, или заработать на этом.  \n" + " Также есть возможность просматривать посты, подписываться на каналы в телеграм, получая за это оплату.  \n" + " Стоимость одного лайка - 20 коп. \n" + " Каждому пользователю предоставляется при регистрации 1 руб (4 лайка).  \n" + " Далее, чтобы пополнять  \n" + "баланс, следует выполнять задания или пополнить счет через банковскую карту. \n" + " Чтобы выполнять задания, следует привязать аккаунт ВК. \n" + " ВАЖНО: \n" + "1) Аккаунт должен быть открыт для всех в интернете \n" + "2) Должна стоять аватарка \n" + "3) За отписки, снятие лайков после выполнения задания баланс обнуляется. \n" + " \n" + "  За АБСОЛЮТНО ЛЮБОЙ помощью можете обращаться в техподдержку (пункт \"Помощь\" главного меню). Мы - адекватные, общительные люди."; //"Привет! Этот бот поможет тебе накрутить лайки в соц.сетях, или заработать, просто лайкая других ";
        await _nmenu2.default.sendTextMessage(user, greeting);
        //nMenu.sendMenu(user);
    } else {
        var _greeting = "С тобой мы уже знакомы";
        await _nmenu2.default.sendTextMessage(user, _greeting);
        //nMenu.sendMenu(user);
    }
});

_TeleBot2.default.onText(/(.*)/, async function (msg, match) {
    var user = await _user2.default.getSender(msg);
    //bot.sendMessage(msg.from.id, match[1] );
    try {

        if (!user.ExistInDB) await user.saveToDB();
        user.last_message_id = msg.message_id;
        switch (user.status) {
            case 'vk_acc_addition':
                await vk_acc_addition(user, match[1]);
                break;
            case 'create_vk_photo_like_task(link)':
                user.status = 'create_vk_photo_like_task(required){' + match[1] + '})';
                await _nmenu2.default.sendTextMessage(user, "Сколько лайков хочешь получить?");

                break;
            case 'create_vk_post_like_task(link)':

                throw "Извини, функционал для этой задачи будет реализован в течение недели";
                user.status = 'create_vk_post_like_task(required){' + match[1] + '})';
                await _nmenu2.default.sendTextMessage(user, "Сколько лайков хочешь получить?");
                break;
            default:
                var query = /create_vk_photo_like_task\(required\)\{(.*)\}/;
                var queryPost = /create_vk_post_like_task\(required\)\{(.*)\}/;
                if (user.status.search(query) >= 0) {
                    var link = query.exec(user.status)[1];
                    var required = /(\d*)/g.exec(match)[1];
                    await user.createVkPhotoLikeTask(link, match[1]);
                    await _admin2.default.SendToAll("Появилось новое задание!");
                    //nMenu.sendMenu(user);

                    break;
                } else if (user.status.search(queryPost) >= 0) {
                    //throw "Извини, функционал для этой задачи будет реализован в течение недели";
                    var _link = user.status.match(queryPost)[1];
                    var _required = /(\d*)/g.exec(match)[1];
                    _required = /(\d*)/g.exec(match)[1];
                    await user.createVkPostLikeTask(_link, match[1]);
                    await _nmenu2.default.sendTextMessage(user, "Молодец, задание создано успешно!");
                    //nMenu.sendMenu(user);

                    break;
                }
                user.status = 'free';
        }
    } catch (err) {
        console.log(err.stack);
        user.status = 'free';
        await _nmenu2.default.sendTextMessage(user, err);
        //nMenu.sendMenu(user);
    }
});

_TeleBot2.default.onText(/\/menu/, async function (msg, match) {
    var user = await _user2.default.getSender(msg);
    if (!user.ExistInDB) await user.saveToDB();
    user.last_message_id = msg.message_id;
    _nmenu2.default.sendMenu(user);
});

_TeleBot2.default.onText(/\/sendtoall (.*)/, async function (msg, match) {
    var user = await _user2.default.getSender(msg);
    if (!user.ExistInDB) await user.saveToDB();
    try {
        if (user.key == 'Slava_Ukraini!') {
            await _admin2.default.SendToAll(match[1]);
            _nmenu2.default.sendTextMessage(user, 'Success');
        }
    } catch (err) {
        console.log('err');
        console.log(err.stack);
        _nmenu2.default.sendTextMessage(user, 'Error');
    }
    user.last_message_id = msg.message_id;
});

_TeleBot2.default.onText(/\/sendto (\d+) (.*)/, async function (msg, match) {
    var user = await _user2.default.getSender(msg);
    if (!user.ExistInDB) await user.saveToDB();
    try {
        if (user.key == 'Slava_Ukraini!') {
            var userDestination = await _user2.default.fromDB(Number(match[1]));
            await _admin2.default.SendTo(userDestination, match[2]);
            _nmenu2.default.sendTextMessage(user, 'Success');
        }
    } catch (err) {
        console.log('err');
        console.log(err.stack);
        _nmenu2.default.sendTextMessage(user, 'Error');
    }
    user.last_message_id = msg.message_id;
});

_TeleBot2.default.onText(/\/payto (\d+) (\d+)/, async function (msg, match) {
    var user = await _user2.default.getSender(msg);
    if (!user.ExistInDB) await user.saveToDB();
    try {
        if (user.key == 'Slava_Ukraini!') {
            var userDestination = await _user2.default.fromDB(Number(match[1]));
            await _admin2.default.PayTo(userDestination, match[2]);
            _nmenu2.default.sendTextMessage(user, 'Success');
        }
    } catch (err) {
        console.log('err');
        console.log(err.stack);
        _nmenu2.default.sendTextMessage(user, 'Error');
    }
    user.last_message_id = msg.message_id;
});

_TeleBot2.default.onText(/\/paytome (\d+)/, async function (msg, match) {
    var user = await _user2.default.getSender(msg);
    if (!user.ExistInDB) await user.saveToDB();
    try {
        if (user.key == 'Slava_Ukraini!') {
            await _admin2.default.PayTo(user, match[1]);
            _nmenu2.default.sendTextMessage(user, 'Success');
        }
    } catch (err) {
        console.log('err');
        console.log(err.stack);
        _nmenu2.default.sendTextMessage(user, 'Error');
    }
    user.last_message_id = msg.message_id;
});

_TeleBot2.default.onText(/\/checkalltasks/, async function (msg, match) {
    var user = await _user2.default.getSender(msg);
    if (!user.ExistInDB) await user.saveToDB();
    try {
        if (user.key == 'Slava_Ukraini!') {
            _admin2.default.checkAllTasks();
        }
    } catch (err) {
        console.log('err');
        console.log(err.stack);
        _nmenu2.default.sendTextMessage(user, 'Error');
    }
    user.last_message_id = msg.message_id;
    _nmenu2.default.sendMenu(user);
});

_TeleBot2.default.on('callback_query', async function (msg) {
    var user = await _user2.default.getSender(msg);
    if (!user.ExistInDB) await user.saveToDB();
    try {
        console.log(msg.data);
        switch (msg.data) {
            case '/replenishMoney':
                throw "Автоматизированная данная функция появится в течение недели. Сейчас для пополнения можете обратиться напрямую в \"Помощь\"";
                user.status = 'free';
            case '/withdrawMoney':
                throw "Вывод меньше 10р запрещен, у тебя " + user.balance + ". Извини, товарищ... Комиссии.. Потрудись еще немного и возвращайся!";
                user.status = 'free';
            case '/stats':
                _nmenu2.default.sendStats(user);
                user.status = 'free';
                break;
            case '/profiles':
                _nmenu2.default.sendAccsEditionMenu(user);
                user.status = 'free';
                break;
            case '/earn':
                _nmenu2.default.sendEarnMenu(user);
                user.status = 'free';
                break;
            case '/tasks':
                _nmenu2.default.sendTasksMenu(user);
                user.status = 'free';
                break;
            case '/createTask':
                _nmenu2.default.sendVkCreationTaskMenu(user);
                user.status = 'free';
                break;
            case '/create_vk_photo_like_task':
                if (user.vk_acc.uname) {
                    await _nmenu2.default.sendTextMessage(user, 'Пожалуйста, дай нам ссылку на фотографию');
                    user.status = 'create_vk_photo_like_task(link)';
                } else {
                    await _nmenu2.default.sendTextMessage(user, 'Привяжи ВК аккаунт, чтобы выполнять такие задания');
                    //nMenu.sendMenu(user);
                }
                break;
            case '/create_vk_post_like_task':
                throw "Извини, функционал для этой задачи будет реализован в течение недели";
                if (user.vk_acc.uname) {
                    await _nmenu2.default.sendTextMessage(user, 'Пожалуйста, дай нам ссылку на пост');
                    user.status = 'create_vk_post_like_task(link)';
                } else {
                    await _nmenu2.default.sendTextMessage(user, 'Привяжи ВК аккаунт, чтобы выполнять такие задания');
                    //nMenu.sendMenu(user);
                }
                break;
            case '/addVkAcc':
                user.status = 'vk_acc_addition';
                _nmenu2.default.sendConfitmVkAccMenu(user);
                break;
            case '/delVkAcc':
                await user.delVkAcc();
                await _nmenu2.default.sendTextMessage(user, "Аккаунт благополучно отвязан");
                user.status = 'free';
                //nMenu.sendMenu(user);
                break;
            case '/menu':
                _nmenu2.default.sendMenu(user);
                user.status = 'free';
                break;
            case '/earn_vk_photo_like_task':
                {
                    var task = await _task4.default.GetTaskForUser(user, 'vk_photo_like_task');
                    console.log(task);
                    _nmenu2.default.sendEarnVkPhotoLikeTaskMenu(user, task);
                    user.status = 'free';
                    break;
                }
            case '/earn_vk_post_like_task':
                {

                    throw "Извини, функционал для этой задачи будет реализован в течение недели";
                    var _task = await _task4.default.GetTaskForUser(user, 'vk_post_like_task');
                    console.log(_task);
                    _nmenu2.default.sendEarnVkPostLikeTaskMenu(user, _task);
                    user.status = 'free';
                    break;
                }
            case '/earn_vk_subscribers_task':
            case '/earn_tg_post_view_task':
            case '/earn_tg_subscribers_task':
                throw 'Извини, таких заданий сейчас нет';
                break;
            default:

                var taskname_query = /\/confirm\((.*)\)/g;

                if (msg.data.search(taskname_query) >= 0) {
                    var taskname = taskname_query.exec(msg.data)[1];
                    var _task2 = await user.confirmTask(taskname);
                    var text = "Ты получил " + _task2.cost + " руб. Спасибо за помощь!";

                    user.status = 'free';
                    _nmenu2.default.sendNextTaskMenu(user, _task2.type, text);
                }
                break;
                user.status = 'free';
        }
    } catch (err) {
        console.log(err.stack); ///////////////////////////НЕИЗВЕСТНАЯ ОШИБКА
        await _nmenu2.default.sendTextMessage(user, err);
        //nMenu.sendMenu(user);
    }
    _TeleBot2.default.answerCallbackQuery(msg.id, "", true);
});

async function vk_acc_addition(user, link) {
    var messageText = void 0;
    if (/vk.com\//.test(link)) {
        await user.addVkAcc(link);
        messageText = 'Аккаунт успешно привязан!';
    } else messageText = "Неправильная ссылка. Должно быть что-то типа \'vk.com/id123456789\'";

    user.status = 'free';
    await _nmenu2.default.sendTextMessage(user, messageText);
    //nMenu.sendAccsEditionMenu(user);
}
//# sourceMappingURL=interaction.js.map
let request = require('request');
let cheerio = require('cheerio');
import nMenu from './nmenu';
import bot from './TeleBot';
import User from './user';
import Task from './task';
import Admin from './admin';
import { WSAEUSERS } from 'constants';


bot.onText(/\/start/, async function (msg, match) {

    let user = await User.getSender(msg);
    if(!user.ExistInDB){
        await user.saveToDB();
        var greeting = "Привет! \n" +
       " Этот бот поможет тебе накрутить лайки на фотографии, посты в ВК, подписчиков, или заработать на этом.  \n" +
       " Также есть возможность просматривать посты, подписываться на каналы в телеграм, получая за это оплату.  \n" +
       " Стоимость одного лайка - 20 коп. \n" +
       " Каждому пользователю предоставляется при регистрации 1 руб (4 лайка).  \n" +
       " Далее, чтобы пополнять  \n" +
     "баланс, следует выполнять задания или пополнить счет через банковскую карту. \n" +
     " Чтобы выполнять задания, следует привязать аккаунт ВК. \n" +
     " ВАЖНО: \n" +
     "1) Аккаунт должен быть открыт для всех в интернете \n" +
     "2) Должна стоять аватарка \n" +
     "3) За отписки, снятие лайков после выполнения задания баланс обнуляется. \n" +
     " \n" +
     "  За АБСОЛЮТНО ЛЮБОЙ помощью можете обращаться в техподдержку (пункт \"Помощь\" главного меню). Мы - адекватные, общительные люди.";//"Привет! Этот бот поможет тебе накрутить лайки в соц.сетях, или заработать, просто лайкая других ";
        await nMenu.sendTextMessage(user, greeting);
    }
    else{
        const greeting = "С тобой мы уже знакомы";
        await nMenu.sendTextMessage(user, greeting);
    }
});

bot.onText(/(.*)/, async function (msg, match) {
    let user = await User.getSender(msg);
    try{
        
        if(!user.ExistInDB)
            await user.saveToDB();
        user.last_message_id = msg.message_id;
        switch (user.status){
            case 'vk_acc_addition':
                await vk_acc_addition(user, match[1]);
                break;
            case 'create_vk_photo_like_task(link)':
                user.status = 'create_vk_photo_like_task(required){' + match[1] + '})';
                await nMenu.sendTextMessage(user, "Сколько лайков хочешь получить?");


                break;
            case 'create_vk_post_like_task(link)':
            
                throw "Извини, функционал для этой задачи будет реализован в течение недели";
                user.status = 'create_vk_post_like_task(required){' + match[1] + '})';
                await nMenu.sendTextMessage(user, "Сколько лайков хочешь получить?");
                break;
            default:
                const query = /create_vk_photo_like_task\(required\)\{(.*)\}/;
                const queryPost = /create_vk_post_like_task\(required\)\{(.*)\}/;
                if(user.status.search(query) >= 0){
                    let link = query.exec(user.status)[1];
                    let required = ((/(\d*)/g).exec(match))[1];
                    await user.createVkPhotoLikeTask(link,match[1]);
                    await Admin.SendToAll("Появилось новое задание!");
                    break;
                }
                else if(user.status.search(queryPost) >= 0){
                    let link = user.status.match(queryPost)[1];
                    let required = ((/(\d*)/g).exec(match))[1];
                    required = ((/(\d*)/g).exec(match))[1];
                    await user.createVkPostLikeTask(link,match[1]);
                    await nMenu.sendTextMessage(user, "Молодец, задание создано успешно!");
                    break;
                }
                user.status = 'free';
            }
    }
    catch(err){
        console.log(err.stack);
        user.status = 'free';
        await nMenu.sendTextMessage(user, err);
    }

});

bot.onText(/\/menu/, async function (msg, match) {
    let user = await User.getSender(msg);
    if(!user.ExistInDB)
        await user.saveToDB();
    user.last_message_id = msg.message_id;
    nMenu.sendMenu(user);
});

bot.onText(/\/sendtoall (.*)/, async function (msg, match) {
    let user = await User.getSender(msg);
    if(!user.ExistInDB)
        await user.saveToDB();
    try{
        if(user.key == 'Slava_Ukraini!'){
            await Admin.SendToAll(match[1]);
            nMenu.sendTextMessage(user, 'Success');
        }
    }
    catch(err){
        console.log('err');
        console.log(err.stack);
        nMenu.sendTextMessage(user, 'Error');
    }
    user.last_message_id = msg.message_id;
});

bot.onText(/\/sendto (\d+) (.*)/, async function (msg, match) {
    let user = await User.getSender(msg);
    if(!user.ExistInDB)
        await user.saveToDB();
    try{
        if(user.key == 'Slava_Ukraini!'){
            let userDestination = await User.fromDB(Number(match[1]));
            await Admin.SendTo(userDestination, match[2]);
            nMenu.sendTextMessage(user, 'Success');
        }
    }
    catch(err){
        console.log('err');
        console.log(err.stack);
        nMenu.sendTextMessage(user, 'Error');
    }
    user.last_message_id = msg.message_id;
});

bot.onText(/\/payto (\d+) (\d+)/, async function (msg, match) {
    let user = await User.getSender(msg);
    if(!user.ExistInDB)
        await user.saveToDB();
    try{
        if(user.key == 'Slava_Ukraini!'){
            let userDestination = await User.fromDB(Number(match[1]));
            await Admin.PayTo(userDestination, match[2]);
            nMenu.sendTextMessage(user, 'Success');
        }
    }
    catch(err){
        console.log('err');
        console.log(err.stack);
        nMenu.sendTextMessage(user, 'Error');
    }
    user.last_message_id = msg.message_id;
});

bot.onText(/\/paytome (\d+)/, async function (msg, match) {
    let user = await User.getSender(msg);
    if(!user.ExistInDB)
        await user.saveToDB();
    try{
        if(user.key == 'Slava_Ukraini!'){
            await Admin.PayTo(user, match[1]);
            nMenu.sendTextMessage(user, 'Success');
        }
    }
    catch(err){
        console.log('err');
        console.log(err.stack);
        nMenu.sendTextMessage(user, 'Error');
    }
    user.last_message_id = msg.message_id;
});

bot.onText(/\/checkalltasks/, async function (msg, match) {
    let user = await User.getSender(msg);
    if(!user.ExistInDB)
        await user.saveToDB();
    try{
        if(user.key == 'Slava_Ukraini!'){
            Admin.checkAllTasks();
        }
    }
    catch(err){
        console.log('err');
        console.log(err.stack);
        nMenu.sendTextMessage(user, 'Error');
    }
    user.last_message_id = msg.message_id;
    nMenu.sendMenu(user);
});

bot.on('callback_query', async function (msg) {
    let user = await User.getSender(msg);
    if(!user.ExistInDB)
        await user.saveToDB();
    try{
        console.log(msg.data);
        switch (msg.data){
            case '/replenishMoney':
                throw "Автоматизированная данная функция появится в течение недели. Сейчас для пополнения можете обратиться напрямую в \"Помощь\"";
                user.status = 'free';
            case '/withdrawMoney':
                throw "Вывод меньше 10р запрещен, у тебя " + user.balance + ". Извини, товарищ... Комиссии.. Потрудись еще немного и возвращайся!";
                user.status = 'free';
            case '/stats':
                nMenu.sendStats(user);
                user.status = 'free';
                break;
            case '/profiles':
                nMenu.sendAccsEditionMenu(user);
                user.status = 'free';
                break;
            case '/earn':
                nMenu.sendEarnMenu(user);
                user.status = 'free';
                break;
            case '/tasks':
                nMenu.sendTasksMenu(user);
                user.status = 'free';
                break;
            case '/createTask':
                nMenu.sendVkCreationTaskMenu(user);
                user.status = 'free';
                break;
            case '/create_vk_photo_like_task':
                if(user.vk_acc.uname){
                    await nMenu.sendTextMessage(user, 'Пожалуйста, дай нам ссылку на фотографию');
                    user.status = 'create_vk_photo_like_task(link)';
                }
                else{
                    await nMenu.sendTextMessage(user, 'Привяжи ВК аккаунт, чтобы выполнять такие задания');
                    //nMenu.sendMenu(user);
                }
                break;
            case '/create_vk_post_like_task':
                throw "Извини, функционал для этой задачи будет реализован в течение недели";
                if(user.vk_acc.uname){
                    await nMenu.sendTextMessage(user, 'Пожалуйста, дай нам ссылку на пост');
                    user.status = 'create_vk_post_like_task(link)';
                }
                else{
                    await nMenu.sendTextMessage(user, 'Привяжи ВК аккаунт, чтобы выполнять такие задания');
                    //nMenu.sendMenu(user);
                }
                break;
            case '/addVkAcc':
                user.status = 'vk_acc_addition';
                nMenu.sendConfitmVkAccMenu(user);
                break;
            case '/delVkAcc':
                await user.delVkAcc();
                await nMenu.sendTextMessage(user,"Аккаунт благополучно отвязан");
                user.status = 'free';
                //nMenu.sendMenu(user);
                break;
            case '/menu':
                nMenu.sendMenu(user);
                user.status = 'free';
                break;
            case '/earn_vk_photo_like_task':{
                let task = await Task.GetTaskForUser(user, 'vk_photo_like_task');
                console.log(task);
                nMenu.sendEarnVkPhotoLikeTaskMenu(user, task);
                user.status = 'free';
                break;
            }
            case '/earn_vk_post_like_task':{
                
                throw "Извини, функционал для этой задачи будет реализован в течение недели";
                let task = await Task.GetTaskForUser(user, 'vk_post_like_task');
                console.log(task);
                nMenu.sendEarnVkPostLikeTaskMenu(user, task);
                user.status = 'free';
                break;
            }
            case '/earn_vk_subscribers_task':
            case '/earn_tg_post_view_task':
            case '/earn_tg_subscribers_task':
                throw('Извини, таких заданий сейчас нет');
                break;
            default:
                
                const taskname_query = /\/confirm\((.*)\)/g;


                if(msg.data.search(taskname_query) >= 0 ){
                    let taskname = taskname_query.exec(msg.data)[1];
                    let task = await user.confirmTask(taskname);
                    const text = "Ты получил " + task.cost + " руб. Спасибо за помощь!";

                    user.status = 'free';
                    nMenu.sendNextTaskMenu(user, task.type , text);
                }
                break;
                user.status = 'free';
        }
    }
    catch(err){
        console.log(err.stack);///////////////////////////НЕИЗВЕСТНАЯ ОШИБКА
        await nMenu.sendTextMessage(user, err);
        //nMenu.sendMenu(user);
    }
    bot.answerCallbackQuery(msg.id, "", true);
});

async function vk_acc_addition(user, link){
    let messageText;
    if(/vk.com\//.test(link)){
        await user.addVkAcc(link);
        messageText = 'Аккаунт успешно привязан!';
    }
    else 
    messageText = "Неправильная ссылка. Должно быть что-то типа \'vk.com/id123456789\'";

    user.status = 'free';
    await nMenu.sendTextMessage(user, messageText);
    //nMenu.sendAccsEditionMenu(user);
}



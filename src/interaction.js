let request = require('request');
let cheerio = require('cheerio');
import nMenu from './nmenu';
//let work = require('work.js');
//let task = require('task.js');
import bot from './TeleBot';
import User from './user';
import Task from './task';


////////////////////////////////////////TASK/////////////////////////////////////////////////////////
bot.onText(/\/start/, async function (msg, match) {

    let user = await User.getSender(msg);
    if(!user.ExistInDB){
        await user.saveToDB();
        var greeting = "Hello! This bot will help you easily and reliably exchange your " +
                "likes with our other users. To connect your account, click the appropriate button.";
        user.sendMessage(greeting);
    }
});

bot.onText(/\/menu/, async function (msg, match) {
    let user = await User.getSender(msg);
    nMenu.sendNewMenu(user);
});

bot.on('callback_query', async function (msg) {
    let user = await User.getSender(msg);
    let patt = /goToPhoto\((.+)\)/g;
    console.log(msg.data);
    if(patt.test(msg.data)){
        /*console.log(msg.data);
        var mat = patt.exec(msg.data);
        var taskName = mat[1];
        user.tasks.push(taskName);
        dataManage.changeUser(user);
        dataManage.setStatus(user, 'task_creation(vk_photo_like)');
        work.getVkLikeTask(user);*/
    }
    switch (msg.data){
        case '/stats':
            console.log('ssssss');
            nMenu.sendStats(user);
            break;
        case '/profiles':
            nMenu.sendProfilesEditionMenu(user);
            break;
        case '/earn':
            nMenu.sendEarnMenu(user);
            //dataManage.setStatus(user, 'earning');
            //bot.sendMessage(msg.message.chat.id, "Send me a link to the photo for a wrapping of likes");
            break;
        case '/tasks':
            nMenu.sendTasksMenu(user);
            //earn(msg);
            break;
        case '/createTask(vk_photo_like)':
            bot.sendMessage(user.id, 'send the link to the photo');
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
                parse_mode:"Markdown",
                reply_markup: {
                    "inline_keyboard": [
                        [{"text":"Open VK", "callback_data" :"/menu", "url" : "https://vk.com/id0"}]
                    ]
                }};
            bot.sendMessage(msg.message.chat.id, "Indicate in the status of your VK page this key: `" +
                key + "` (press to copy) and AFTER send me its ID", urlkey, {parse_mode:"Markdown"});
            break;
        case '/removeVkAcc':
            break;
        case '/menu':
            nMenu.sendMenu(user);
            break;

        case '/earn_vk_photo_like':
            let task = await Task.GetTaskForUser(user, 'vk_photo_like_task');
            console.log(task);
            if(task) {
                nMenu.sendEarnOperationButton(user, task);
            }
            else {
                bot.sendMessage(user.id, "There are no this type tasks for you");//////////////////////////////////////
            }
            break;
        default:
            let taskname = (/\/confirm\((.*)\)/g).exec(msg.data)[1];
            if(taskname){
                let text = "";
                let task = await user.confirmTask(taskname);
                console.log('sssssss');
                console.log(task);
                if(task){
                    text = "Success, you will get " + task._cost + " coins";
                }
                else{
                    text = "Failure";
                }
                bot.sendMessage(user.id, text);
                user.status = 'free';
            }
    }
    bot.answerCallbackQuery(msg.id, "", true);
});

bot.onText(/\/confirm\((.*)\)/, async function (msg, match) {
    let user = await User.getSender(msg);
    await user.confirmTask(match[1]);
});

bot.onText(/\/skip\((.*)\)/, async function (msg, match) {
    let user = await User.getSender(msg);
    await user.skipTask(match[1]);
});

bot.onText(/(.*)/, async function (msg, match) {
    let user = await User.getSender(msg);
    nMenu.deleteMenu(user);
    console.log(user.status);
    switch (user.status){
        case 'vk_acc_addition':
            user.addVkAcc(match[1]);
            user.status = 'free';
            break;
        case 'vk_acc_removal':
            break;
        case 'task_creation(vk_photo_like)[link]':
            user.status = 'task_creation(vk_photo_like{' + match[1] + '})[required]';
            bot.sendMessage(msg.chat.id, "How many likes do you want to wind?");
            break;
        default:
            let link = (/task_creation\(vk_photo_like\{(.*)\}\)\[required\]/g).exec(user.status)[1];
            if(link){
                let required = (/(\d*)/g).exec(match)[1];
                if(required){
                    console.log(user.balance);
                    if(Number(required) <= Number(user.balance)){
                        ///....
                        user.createVkPhotoLikeTask(link,match[1]);
                        bot.sendMessage(msg.chat.id, "ok, " + required);
                    }
                    else
                        bot.sendMessage(msg.chat.id, "Too low a balance for this operation");

                }
                user.status = 'free';
            }

    }

    //dataManage.setStatus(user, 'free');
});

bot.onText(/\/balance\((\d+)\)/, function (msg, match) {
    /*user = dataManage.getUser(msg.from.id);
    console.log(match[1]);
    dataManage.setBalance(user, match[1]);

    //dataManage.setStatus(user, 'free');*/
});

bot.onText(/\/cltask/, function (msg, match) {
    /*user = dataManage.getUser(msg.from.id);
    console.log(match[1]);
    user.tasks = new Array();
    dataManage.changeUser(user);

    //dataManage.setStatus(user, 'free');*/
});

function createKey (n){
    var s ='';
    while(s.length < n)
        s += String.fromCharCode(Math.random() *1106).replace(/[^a-zA-Z]|_/g,'');
    return s;
}


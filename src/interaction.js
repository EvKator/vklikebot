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
            break;
        case '/tasks':
            nMenu.sendTasksMenu(user);
            break;
        case '/createTask(vk_photo_like)':
            bot.sendMessage(user.id, 'send the link to the photo');
            user.status = 'task_creation(vk_photo_like)[link]';
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
        case '/vk_photo_like_task':
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
        try{
            let taskname = (/\/confirm\((.*)\)/g).exec(msg.data)[1];
            let text = "";
            let task = await user.confirmTask(taskname);
            if(task){
                text = "Success, you will get " + task._cost + " coins";
            }
            else{
                text = "Failure";
            }
            bot.sendMessage(user.id, text);
            user.status = 'free';
            nMenu.sendNextTaskMenu(task.type);
        }catch(err){

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
            let messageText = '';
            if(user.addVkAcc(match[1]))
                text = 'Addition success';
            else
                text = 'Wrong vk acc link. There must be something such as \'vk.com/id123456789\'';
            user.status = 'free';
            bot.sendMessage(user.id, text);
            nMenu.sendAccsEditionMenu(user);
            break;
        case 'vk_acc_removal':
            break;
        case 'task_creation(vk_photo_like)[link]':
            user.status = 'task_creation(vk_photo_like{' + match[1] + '})[required]';
            bot.sendMessage(msg.chat.id, "How many likes do you want to wind?");
            break;
        default:
            try{
                let link = (/task_creation\(vk_photo_like\{(.*)\}\)\[required\]/g).exec(user.status)[1];
                try{let required = (/(\d*)/g).exec(match)[1];
                    if(required){
                        let text = '';
                        console.log(user.balance);
                        if(Number(required) <= Number(user.balance)){
                            user.createVkPhotoLikeTask(link,match[1]);
                            text = "ok, " + required;
                        }
                        else
                            text = "Too low a balance for this operation";
                        bot.sendMessage(msg.chat.id, text);
                        nMenu.sendTasksMenu(user);
                    }
                }catch(err){
                    bot.sendMessage(user.id, "Wrong number!");
                }
            }
            catch(err){
                console.log('err');
                console.log(err.stack);
            }
            user.status = 'free';
            break;
        
    }

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


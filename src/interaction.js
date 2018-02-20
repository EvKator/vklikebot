let request = require('request');
let cheerio = require('cheerio');
/*let dataManage = require('dataManage.js');
let menu = require('nmenu');
let work = require('work.js');
let task = require('task.js');
*/
import bot from './TeleBot'
import User from './user';



////////////////////////////////////////TASK/////////////////////////////////////////////////////////
bot.onText(/\/start/, function (msg, match) {
    let user = User.getSender(msg);
    console.log(user);
    //user = dataManage.getUser(msg.from.id);
    //var greeting = "Hello! This bot will help you easily and reliably exchange your " +
    //    "likes with our other users. To connect your account, click the appropriate button.";
    //if(!dataManage.isUserExist(msg.from.id)){
    //    register(msg);
    //}
    ////bot.sendMessage(msg.chat.id, greeting);
    //menu.sendNewMenu(user);
});

bot.onText(/\/menu/, function (msg, match) {
    /*user = dataManage.getUser(msg.from.id);
    dataManage.setStatus(user, 'free');
    var user = dataManage.getUser(msg.from.id);
    menu.sendNewMenu(user);*/
});

bot.on('callback_query', function (msg) {
    /*var user = dataManage.getUser(msg.from.id);
    var patt = /goToPhoto\((.+)\)/g;
    if(patt.test(msg.data)){
        console.log(msg.data);
        var mat = patt.exec(msg.data);
        var taskName = mat[1];
        user.tasks.push(taskName);
        dataManage.changeUser(user);
        dataManage.setStatus(user, 'task_creation(vk_photo_like)');
        work.getVkLikeTask(user);
    }
    switch (msg.data){
        case '/stats':
            menu.sendStats(user);
            break;
        case '/profiles':
            menu.sendProfilesEditionMenu(user);
            break;
        case '/earn':
            menu.sendEarnMenu(user);
            //dataManage.setStatus(user, 'earning');
            //bot.sendMessage(msg.message.chat.id, "Send me a link to the photo for a wrapping of likes");
            break;
        case '/tasks':
            menu.sendTasksMenu(user);
            //earn(msg);
            break;
        case '/createTask':
        //dataManage.setStatus(user, 'task_creation(vk_photo_like)');
        case '/vk_photo_like':
            dataManage.setStatus(user, 'task_creation(vk_photo_like)');
            bot.sendMessage(msg.message.chat.id, "Send me a link to the photo for a wrapping of likes");
            break;
        case '/addVkAcc':
            var key = createKey(30);
            user.status = 'vk_acc_addition';
            user.key = key;
            dataManage.changeUser(user);
            var urlkey = {
                parse_mode:"Markdown",
                reply_markup: {
                    "inline_keyboard": [
                        [{"text":"Open VK", "callback_data" :"/menu", "url" : "https://vk.com/id0"}]
                    ]
                }};
            bot.sendMessage(msg.message.chat.id, "Indicate in the status of your VK page this key: `" +
                key + "` (press to copy) and AFTER send me its ID", urlkey/*, {parse_mode:"Markdown"}*//*);
            break;
        case '/removeVkAcc':
            break;
        case '/menu':
            menu.sendMenu(user);
            break;

        case '/earn_vk_photo_like':
            dataManage.setStatus(user, 'earning(vk_photo_like)');
            work.getVkLikeTask(user);
            //bot.sendMessage(msg.message.chat.id, "Send me a link to the photo for a wrapping of likes");
            break;

    }
    bot.answerCallbackQuery(msg.id, "", true);*/
});


function getSenderID(msg){
    /*if(dataManage.isUserExist(msg.from.id)){
        return msg.from.id;
    }
    else {
        return false;
    }*/
}



bot.onText(/(.*)/, function (msg, match) {
    /*user = dataManage.getUser(msg.from.id);
    console.log(user.status);
    switch (user.status){
        //case 'created':
        //dataManage.setStatus(user, 'free');
        //    break;
        case 'vk_acc_addition':
            addVkAcc(msg, match[1]);
            console.log(match[1]);
            dataManage.setStatus(user, 'free');
            break;
        case 'vk_acc_removal':
            removeVkAcc(msg, match[1]);
            dataManage.setStatus(user, 'free');
            break;
        case 'task_creation(vk_photo_like)':
            dataManage.setLastTask(user, match[1]);
            dataManage.setStatus(user, 'task_param(vk_photo_like_count)');
            bot.sendMessage(msg.chat.id, "How many likes do you want to wind?");
            break;
        case 'task_param(vk_photo_like_count)':
            var likesCount = (/(\d*)/g).exec(match)[1];
            console.log(likesCount);
            if(likesCount!==null && typeof likesCount !== 'undefined'){
                console.log(user.balance);
                if(Number(likesCount) <= Number(user.balance)){
                    ///....
                    task.addTaskPhotoLike(user, likesCount);

                    bot.sendMessage(msg.chat.id, "ok, " + likesCount);
                }
                else
                    bot.sendMessage(msg.chat.id, "Too low a balance for this operation");
            }
            dataManage.setStatus(user, 'free');
            //removeVkAcc(msg, match[1])
            break;
    }
*/
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

function addVkAcc(msg, vk_url) {
    /*var user_id = getSenderID(msg);
    if(user_id){
        var user = dataManage.getUser(user_id);
        request(vk_url, function(err, resp, html) {
            if (!err){
                $ = cheerio.load(html);
                var text = "";
                var vk_username = (/vk\.com\/([a-zA-Z0-9]*)/g).exec(vk_url)[1].toString();

                ////vk acc exist
                var exist = false;
                for(var i = 0; i < user.vk_accs.length; i++){
                    if(user.vk_accs[i].vk_username === vk_username){
                        exist = true;
                        break;
                    }
                    console.log(user.vk_accs[i].vk_username + " , " + vk_username);
                    console.log(exist);
                }
                if(exist){
                    text = "Vk acc already connected";
                }
                else
                {
                    var userStatus = $('div.pp_status').html();
                    if(user.key === userStatus) {
                        text = "Success";
                        var vk_acc = {
                            'vk_username': vk_username
                        }
                        user.vk_accs.push(vk_acc);
                        console.log(user);
                    }
                    else
                    {
                        text = "Failure, status on thee page is " + userStatus;
                    }
                }
                dataManage.setStatus(user, 'free');
                bot.sendMessage(msg.chat.id, text);
            }
        });
    }*/
}

function removeVkAcc(msg, vk_url) {
    /*var user_id = getSenderID(msg);
    if(user_id){
        var user = dataManage.getUser(user_id);
        request(vk_url, function(err, resp, html) {
            if (!err){
                $ = cheerio.load(html);
                var text = "";
                var vk_username = (/vk\.com\/([a-zA-Z0-9]*)/g).exec(vk_url)[1].toString();

                ////vk acc exist
                var exist = false;
                for(var i = 0; i < user.vk_accs.length; i++){
                    if(user.vk_accs[i].vk_username === vk_username){
                        exist = true;
                        break;
                    }
                    console.log(user.vk_accs[i].vk_username + " , " + vk_username);
                    console.log(exist);
                }
                if(exist && user.key === $('div.pp_status').html()){
                    text = "Success";
                    var vk_acc = {
                        'vk_username' : vk_username
                    }/////////////////////////доделать удаление!!!!!!!!!!!!!!!!!!//////////////////////////
                    user.vk_accs.push(vk_acc);
                    console.log(user);
                }
                else
                    text = "Failure";
                dataManage.setStatus(user, 'free');
                bot.sendMessage(msg.chat.id, text);
            }
        });
    }*/
}


function  register(msg) {
    /*var NewUser = dataManage.CreateUser(msg);
    dataManage.addUser(NewUser);*/
}

function createKey (n){
    /*var s ='';
    while(s.length < n)
        s += String.fromCharCode(Math.random() *1106).replace(/[^a-zA-Z]|_/g,'');
    return s;*/
}


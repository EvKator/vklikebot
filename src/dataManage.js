var app = require('../app.js');
var bot = app.bot;
var fs = require('fs');
const  FNAME_USERS = "users.json";

function CreateUser(msg){
    var telegUser = msg.from;
    var NewUser = {
        "id" : telegUser.id,
        "chat_id" : msg.chat.id,
        "first_name" : telegUser.first_name,
        "last_name" : telegUser.last_name,
        "username" : telegUser.username,
        "language_code" : telegUser.language_code,
        "balance" : 0,
        "status": "created",
        "key": "0",
        "vk_accs" : [],
        "lastVkPhotoLiked" : "",
        "tasks" : []
    }
    return NewUser;
}

function award(user, salary){
    user.balance = Number(user.balance) + Number(salary);
    changeUser(user);
    console.log(user.balance + ", " + salary);
    console.log(user);
}

function setStatus(user, status) {
    user.status = status;
    changeUser(user);
}

function setLastTask(user, status) {
    user.lastTask = status;
    changeUser(user);
}

function setParam(user, param, value) {
    user.param = value;
    changeUser(user);
}

function setBalance(user, value) {
    user.balance = value;
    changeUser(user);
}

function changeUser(user) {
    var userExist = isUserExist(user.id);
    if(userExist){
        var users = getUserList();
        users[user.id] = user;
        var data = JSON.stringify(users, "", 4);
        fs.writeFileSync(FNAME_USERS, data);
        return true;
    }
    else return false;
}

function  getUserList() {
    var data = fs.readFileSync(FNAME_USERS, 'utf-8');
    var users = JSON.parse(data);
    return users;
}


function  getUser(id) {
    var user = getUserList()[id];
    if (typeof user === 'undefined' || user === null) {
        user = 0;
    }
    return user;
}

function  isUserExist(id) {
    if(getUser(id)) return true;
    return false;
}

function  addUser(user) {
    var userExist = isUserExist(user.id);
    if(!userExist){
        var users = getUserList();
        users[user.id] = user;
        var data = JSON.stringify(users, "", 4);
        console.log(data);
        fs.writeFileSync(FNAME_USERS, data);
    }
}

function  removeUser(user_id) {}////////////////////////////////////////////


module.exports = {
    setLastTask : setLastTask,
    CreateUser : CreateUser,
    setBalance : setBalance,
    setParam : setParam,
    setStatus : setStatus,
    changeUser : changeUser,
    getUserList : getUserList,
    getUser : getUser,
    isUserExist : isUserExist,
    addUser : addUser,
    removeUser : removeUser,
    award : award
};

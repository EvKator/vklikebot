import VkPhotoLikeTask from "./VkPhotoLikeTask";
const  cheerio = require('cheerio');
const  request = require('request-promise');
import bot from './TeleBot';
import Task from './task.js';
import DB from './DB';
import VkAcc from './VkAcc';

export default class User{

    constructor(id, username, first_name, last_name, status, balance, key, vk_acc, menu_id, last_message_id){
        if(!status){
            status = 'new_user';
            balance = 0;
            key = createKey(30);
            vk_acc = {uname:'',id:''};
            menu_id = '';
            this._existInDB = false;
            last_message_id = 0;
        }
        else
            this._existInDB = true;
        this._id = id;
        this._username = username;
        this._first_name = first_name;
        this._last_name = last_name;
        this._status = status;
        this._balance = balance;
        this._key = key;
        this._vk_acc = vk_acc;
        this._menu_id = menu_id;
        this._last_message_id = last_message_id;
    }

    async confirmfTask(taskname){
        let task = await Task.fromDB(taskname);
        let taskDone;
        try{
            if(task.workers){
                taskDone = task.workers.some((worker) => {
                    return worker.user_id == this.id;
                });
            }
        }catch(err){
            throw('Мне кажется, ты не выполнил задание. Если это не так, напиши, пожалуйста, в техподдержу, мы поможем');
        }
        if(taskDone)
            throw 'Ты уже выполнял это задание';
        if (task) {
            let confirmed = await task.confirm(this);
            if(!confirmed)
                throw('Мне кажется, ты не выполнил задание. Если это не так, напиши, пожалуйста, в техподдержу, мы поможем');
        }

        return task;
    }

    async skipTask(taskname){
        let task = await Task.fromDB(taskname);
        task.skip(user);
    }

    async createVkPhotoLikeTask(url, required){
        required = Number(required);
        if(isNaN(required))
            throw("Странное число...Не умею работать с такими");

        let finalCost = required * VkPhotoLikeTask.cost;

        if(typeof(required)!="number"){
            throw("Странное число...Не умею работать с такими");
        }
        else if(finalCost > this.balance)
            throw("Кажется, финансы не позволяют. На счету " + this.balance + " руб, а нужно " + finalCost);
        else if(finalCost <= 0)
            throw("Мы не можем крутить отрицательные и нулевые значения, извини");

        let task = await Task.Create(url, 'vk_photo_like_task', required, this.id);//new VkPhotoLikeTask(url, required, this.id);

        try {
            await task.saveToDB();
            this._spendMoney(task.cost * required);
        }
        catch (err){
            console.log('err');
            console.log(err.stack);
            throw("Неведомая ошибка на сервере. Пожалуйста, расскажи об этом техподдержке (последний пункт в главном меню)")
        }

    }

    async createVkPostLikeTask(url, required){
        required = Number(required);
        if(isNaN(required))
            throw("Странное число...Не умею работать с такими");

        let finalCost = required * VkPhotoLikeTask.cost;

        if(typeof(required)!="number"){
            throw("Странное число...Не умею работать с такими");
        }
        else if(finalCost > this.balance)
            throw("Кажется, финансы не позволяют. На счету " + this.balance + " руб, а нужно " + finalCost);
        else if(finalCost <= 0)
            throw("Мы не можем крутить отрицательные и нулевые значения, извини");

        let task = await Task.Create(url, 'vk_post_like_task', required, this.id);//new VkPhotoLikeTask(url, required, this.id);

        await task.saveToDB();
        this._spendMoney(task.cost * required);

    }

    async update(){
        await DB.UpdateUser(this);
    }

    static async vkAccUsed(vk_uname){
        let result = true;
        let res = await DB.FindUserByVk(vk_uname)
        try {
            user = User.fromJSON(res);
            result = true;
        }
        catch (err){
            result = false;
        }
        return result;
    }

    async delVkAcc(){
        this._vk_acc.uname = '';
        this._vk_acc.id = '';
        this.update();
    }

    async addVkAcc(vk_link) {///////////////////////////////////////////////////////////////vk acc retrying
        let vk_uname = (/vk\.com\/([a-zA-Z0-9]*)/g).exec(vk_link)[1].toString();

        let used = await User.vkAccUsed(vk_uname);
        if(!used){
            vk_link = 'https://vk.com/' + vk_uname;
            let html = await request(vk_link);

            let $ = cheerio.load(html);
            let userStatus = $('div.pp_status').html();
            let vk_id;
            try{
                vk_id = /photo(\d+)_/.exec(html)[1]; ///owner_id=(\d+)/.exec($('#wall_a_s').href)[1];
            }
            catch(err){
                throw 'Страница скрыта для неавторизованых пользователей, я не могу взять нужную информацию. Я ошбиаюсь? Напиши в техподдержку, мы поможем';
            }
            if (this.key == userStatus) {
                let vkacc = new VkAcc(vk_uname, vk_id);
                this._vk_acc = vkacc.toJSON();
            }
            else if(userStatus === null){
                throw "Статус на странице скрыт или пуст. Пожалуста, поменяй настройки приватности, чтобы я (неавторизованный пользователь) смог его увидеть.";
            }
            else {
                throw "Ошибка, статус на странице сейчас " + userStatus;
            }
        }
        else throw "Ошибка, аккаунт уже привязан к другому пользователю";
    }

    async getPaid(coins){
        this._balance = Number(this._balance) + Number(coins);
        await this.update();
    }

    static async getSender(msg){
        let telegUser = msg.from;
        let user;
        try{
            user = await User.fromDB(telegUser.id);
        }
        catch(err) {
            user = new User( telegUser.id, telegUser.username, telegUser.first_name, telegUser.last_name);
        }
        return user;
    }

    async saveToDB(){
        await DB.InsertUser(this);
    }

    static async fromDB(id){
        const jsonU = await DB.FindUser(id);
        let user = User.fromJSON(res);
        return user;
    }

    async createdTasks(){
        return await Task.GetTasksOfUser(this);
    }

    static fromJSON(jsonU){
        return new User( jsonU.id, jsonU.username, jsonU.first_name, jsonU.last_name, jsonU.status,
             jsonU.balance, jsonU.key, jsonU.vk_acc, jsonU.menu_id, jsonU.last_message_id);
    }

    toJSON(){
        let jsonU = {
            id : this.id,
            username : this.username,
            first_name : this.first_name,
            last_name : this.lastname,
            status : this.status,
            balance : this.balance,
            key : this.key,
            vk_acc : {
                uname : this.vk_acc.uname,
                id: this.vk_acc.id
            },
            menu_id : this.menu_id,
            last_message_id : this.last_message_id
        };
        return jsonU;
    }

    async _spendMoney(amount){
        this._balance-=amount;
        await this.update();
    }
    /////////////////////////////////getters,setters
    set menu_id(menu_id){
        this._menu_id = menu_id;
        this.update();
    }

    get menu_id(){
        return this._menu_id;
    }
    
    set status(status){
        this._status = status;
        this.update();
    }
    
    get status(){
        return this._status;
    }
    
    get ExistInDB(){
        return this._existInDB;
    }
    
    get id(){
        return this._id;
    }
    
    get username(){
        return this._username;
    }
    
    get first_name(){
        return this._first_name;
    }
    
    get last_name(){
        return this._last_name;
    }
    
    get status(){
        return this._status;
    }
    
    get balance(){
        return this._balance;
    }
    
    set key(key){
        this._key = key;
        this.update();
    }
    
    get key(){
        return this._key;
    }
    
    get vk_acc(){
        return this._vk_acc;
    }
    
    get last_message_id(){
        return this._last_message_id;
    }
    
    set last_message_id(val){
        this._last_message_id = val;
        this.update();
    }
}

function createKey (n){
    var s ='';
    while(s.length < n)
        s += String.fromCharCode(Math.random() * 1106).replace(/[^a-zA-Z]|_/g,'');
    return s;
}

import VkPhotoLikeTask from "./VkPhotoLikeTask";

const  cheerio = require('cheerio');
const  request = require('request-promise');
const MongoClient = require('mongodb').MongoClient;
import bot from './TeleBot';
const assert = require('assert');
const db_url = 'mongodb://localhost:27017/vklikebot';
const db_name = 'vklikebot';
import Task from './task.js';
//var nmenu = require('./nmenu');

import VkAcc from './VkAcc';
export default class User{

    constructor(id, username, first_name, last_name, status, balance, key, vk_acc, menu_id, last_message_id){
        if(!status){
            status = 'new_user';
            balance = 0;
            key = '';
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

    async confirmTask(taskname){
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
            this._balance -= task.cost * required;
        }
        catch (err){
            console.log('err');
            console.log(err.stack);
            throw("Неведомая ошибка на сервере. Пожалуйста, расскажи об этом техподдержке (последний пункт в главном меню)")
        }

    }

    async update(){
        let client;
        try {
            let jsonU = this.toJSON();
            client = await MongoClient.connect(db_url);

            const db = client.db(db_name);
            db.collection('users').update({id : this.id}, this.toJSON());
        } catch (err) {
            //console.log('err');
            //console.log(err.stack);
        }

        if (client) {
            client.close();
        }
    }

    static async vkAccUsed(uname){
        let result = true;
            let client;
            let user;
            client = await MongoClient.connect(db_url);
            const db = client.db(db_name);
            const collection = db.collection('users');
            let res = await collection.findOne({'vk_acc.uname':uname});
            try {
                user = User.fromJSON(res);
                result = true;
            }
            catch (err){
                //console.log('err');
                //console.log(err);
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
            vk_link = 'https://m.vk.com/' + vk_uname;
            let html = await request(vk_link);
            let $ = cheerio.load(html);
            let userStatus = $('div.pp_status').html();
            if (this.key == userStatus) {
                let vkacc = new VkAcc(vk_uname);
                this._vk_acc = vkacc.toJSON();
            }
            else if(userStatus === null){
                throw "Статус на странице скрыт. Пожалуста, поменяй настройки приватности, чтобы я (неавторизованный пользователь) смог его увидеть.";
            }
            else {
                throw "Ошибка, статус на странице сейчас " + userStatus;
            }
        }
        else throw "Ошибка, аккаунт уже привязан к другому пользователю";
    }

    sendMessage(text){
        bot.sendMessage(this.id, text);
    }

    async Pay(coins){
        this._balance += coins;
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
        let client;
        try {
            let jsonU = this.toJSON();
            jsonU.status = 'created';

            client = await MongoClient.connect(db_url);
            const db = client.db(db_name);
            await db.collection('users').insertOne(jsonU);
        } catch (err) {
            //console.log('err');
            //console.log(err.stack);
            throw err;
        }

        if (client) {
            client.close();
        }
    }

    static async fromDB(id){
        let client;
        let user;
        try {
            client = await MongoClient.connect(db_url);
            const db = client.db(db_name);
            const collection = db.collection('users');
            let res = await collection.findOne({id: id}, { });
            user = User.fromJSON(res);
        }
        catch (err){
            //console.log('err');
            //console.log(err);
            throw err;
        }
        return user;
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

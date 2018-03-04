import VkPhotoLikeTask from "./VkPhotoLikeTask";

var MongoClient = require('mongodb').MongoClient;
import bot from './TeleBot';
import Task from './task.js';
const assert = require('assert');
const db_url = 'mongodb://localhost:27017/vklikebot';
const db_name = 'vklikebot';
//var nmenu = require('./nmenu');
export default class User{

    constructor(id, username, first_name, last_name, status, balance, key, vk_acc, vk_tasks, menu_id){
        if(!status){

            status = 'new_user';
            balance = 0;
            key = '';
            vk_acc = {id:'',link:''};
            vk_tasks = [];
            menu_id = '';
            this._existInDB = false;
        }
        this._id = id;
        this._username = username;
        this._first_name = first_name;
        this._last_name = last_name;
        this._status = status;
        this._balance = balance;
        this._key = key;
        this._vk_acc = vk_acc;
        this._tasks = vk_tasks;
        this._menu_id = menu_id;
    }

    async work(type){
        var task = Task.getTaskForUser(this, type);
        if(task) {
            nmenu.sendTasksMenu(this, task);
        }
        else{
            this.sendMessage("There are no tasks for you");//////////////////////////////////////
        }
    }

    async confirmTask(taskname){
        let task = Task.fromDB(taskname);
        if(task.confirm()){
            this.sendMessage("success");
        }
        else{
            this.sendMessage("failure");
        }
    }

    async createVkPhotoLikeTask(url, required){
        task = new VkPhotoLikeTask(url, required, this.Id);
        if(task){
            task.saveToDB();
        }
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
            console.log('err');
            console.log(err.stack);
        }

        if (client) {
            client.close();
        }
    }

    async update(){
        let client;
        try {
            let jsonU = this.toJSON();
            jsonU.status = 'new_user';

            client = await MongoClient.connect(db_url);

            const db = client.db(db_name);
            db.collection('users').update({id : this.Id}, this.toJSON());
        } catch (err) {
            console.log('err');
            console.log(err.stack);
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
            console.log('err');
            console.log(err);
        }
        console.log(user);
        return user;
    }

    sendMessage(text){
        bot.sendMessage(this._id, text);
    }

    toJSON(){
        let jsonU = {
            id : this.Id,
            username : this.Username,
            first_name : this.Firstname,
            last_name : this.Lastname,
            status : this.Status,
            balance : this.Balance,
            key : this.Key,
            vk_acc : {
                id : this.VkAcc.id,
                link: this.VkAcc.link
            },
            tasks : this.Tasks,
            menu_id : this.MenuID
        };
        return jsonU;
    }

    static fromJSON(uJSON){
        return new User( uJSON.id, uJSON.username, uJSON.first_name, uJSON.last_name, uJSON.status, uJSON.balance, uJSON.key, uJSON.vk_acc_link, uJSON.vk_acc_id, uJSON.tasks);
    }

    static async getSender(msg){
        let telegUser = msg.from;
        let user = await User.fromDB(telegUser.id);
        if(!user){
            user = new User( telegUser.id, telegUser.username, telegUser.first_name, telegUser.last_name);
        }
        return user;
    }
    Pay(coins){
        if(coins>0){
            this._budget += coins;
        }
        else {
            console.log('Error: coins < 0');
        }
    }
    set MenuId(menu_id){
        this._menu_id = menu_id;
        this.update();
    }
    set Status(status){
        this._status = status;
        this.update();
    }
    get ExistInDB(){
        return this._existInDB;
    }
    get Id(){
        return this._id;
    }
    get Username(){
        return this._username;
    }
    get Firstname(){
        return this._first_name;
    }
    get Lastname(){
        return this._last_name;
    }
    get Status(){
        return this._status;
    }
    get Balance(){
        return this._balance;
    }
    get Key(){
        return this._key;
    }
    get VkAcc(){
        return this._vk_acc;
    }
    get Tasks(){
        return this._tasks;
    }
}

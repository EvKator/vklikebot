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

    constructor(id, username, first_name, last_name, status, balance, key, vk_acc, vk_tasks, menu_id){
        if(!status){

            status = 'new_user';
            balance = 0;
            key = '';
            vk_acc = {uname:'',id:''};
            vk_tasks = [];
            menu_id = '';
            this._existInDB = false;
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
        this._tasks = vk_tasks;
        this._menu_id = menu_id;
    }

    async confirmTask(taskname){
        try {
            let task = await Task.fromDB(taskname);
            if (task) {
                await task.confirm(this);
                return task;
            }
        }
        catch(err) {
            return false;
        }
        return false;
    }

    async skipTask(taskname){
        let task = await Task.fromDB(taskname);
        this._tasks.push({taskname: taskname, status: 'skip'});
        this.sendMessage("skipping success");
    }

    async createVkPhotoLikeTask(url, required){
        let task = new VkPhotoLikeTask(url, required, this.id);
        console.log(task);
        if(task){
            try {
                await task.saveToDB();
                this._balance -= task.cost * required;
            }
            catch (err){
                throw err;
            }
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

    async addVkAcc(vk_link) {
        try {
            let vk_uname = (/vk\.com\/([a-zA-Z0-9]*)/g).exec(vk_link)[1].toString();
            let html = await request(vk_link);
            let $ = cheerio.load(html);


            let text = "Success";
            let userStatus = $('div.pp_status').html();
            if (this.key === userStatus) {
                let vkacc = new VkAcc(vk_uname);
                this._vk_acc = vkacc.toJSON();
            }
            else {
                text = "Failure, status on thee page is " + userStatus;
            }
            bot.sendMessage(user.id, text);
        }
    catch(err){
            throw err;
        }

    }

    sendMessage(text){
        bot.sendMessage(this.id, text);
    }

    async Pay(coins){
        if(coins>0){
            this._balance += coins;
            await this.update();
        }
        else {
            console.log('Error: coins < 0');
        }
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

    static fromJSON(uJSON){
        return new User( uJSON.id, uJSON.username, uJSON.first_name, uJSON.last_name, uJSON.status, uJSON.balance, uJSON.key, uJSON.vk_acc, uJSON.tasks, uJSON.menu_id);
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
            tasks : this.tasks,
            menu_id : this.menu_id
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
    get tasks(){
        return this._tasks;
    }
}

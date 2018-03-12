import VkPhotoLikeTask from "./VkPhotoLikeTask";

const MongoClient = require('mongodb').MongoClient;

const db_url = 'mongodb://localhost:27017/vklikebot';
const db_name = 'vklikebot';
const  decode = require('urldecode');
const  request = require('request');
const  cheerio = require('cheerio');

export default class Task{

    static Create(url, type, required, author_id){
        switch (type)
        {
            case 'vk_photo_like':
                return new VkPhotoLikeTask(url, type, required, author_id);
            default:
                break;
        }
    }

    constructor(taskname, type, url, required, remain, cost, author_id, status){
        this._taskname = taskname;
        this._type = type;
        this._url = url;
        this._required = required;
        this._remain = remain;
        this._cost = cost;
        this._author_id = author_id;
        if(!status)
            this._status = 'created';
        else
            this._status = status;
    }

    static async GetTaskForUser(user, type){
        let client;
        let task;
        try {
            client = await MongoClient.connect(db_url);
            const db = client.db(db_name);
            const collection = db.collection('tasks');
            let res = await collection.find();
            for(let i=0;i<user.tasks.length; i++){
                res = await res.collection.find({taskname: {$ne : user.tasks[i].taskname}, type: type, status : {$ne : 'done'}});
            }
            task = Task.fromJSON(await res.next());
            return task;
        }
        catch (err){
            console.log('err');
            console.log(err);
            return false;
        }
    }

    static async fromDB(taskname){
        let client;
        let task;
        try {
            client = await MongoClient.connect(db_url);
            const db = client.db(db_name);
            const collection = db.collection('tasks');
            let res = await collection.findOne({taskname: taskname}, { });
            if(typeof res === 'undefined')
                throw 'db is empty';

            task = Task.fromJSON(res);
            return task;
        }
        catch (err){
            console.log('err');
            console.log(err);
            return false;
        }
    }

    static fromJSON(jsonT){
        return new Task( jsonT.taskname, jsonT.type, jsonT.url, jsonT.required, jsonT.remain, jsonT.cost, jsonT.author_id, jsonT.status);
    }

    async saveToDB(){
        let client;
        try {
            let jsonT = this.toJSON();

            client = await MongoClient.connect(db_url);
            const db = client.db(db_name);
            await db.collection('tasks').insertOne(jsonT);
        } catch (err) {
            console.log('err');
            console.log(err.stack);
        }

        if (client) {
            client.close();
        }
    }

    static async check(user, url){

        console.log('1111111111111');
        return false;
    }

    async confirm(user){
        let s = await VkPhotoLikeTask.check(user, this.url);
        if(s){
            this._remain = Number(this._remain) - 1;
            if(this._remain <= this._required)
                this._status = 'done';
            this.pay(user);
            await this.update();
            return true;
        }
        else{
            return false;
        }
    }

    pay(user){
        user.Pay(this._cost);
    }

    toJSON(){
        let jsonT = {
            taskname: this._taskname,
            type: this._type,
            url: this._url,
            required: this._required,
            remain: this._remain,
            cost: this._cost,
            author_id: this._author_id,
            status: this._status
        };
        return jsonT;
    }

    async update(){
        let client;
        try {
            let jsonT = this.toJSON();
            client = await MongoClient.connect(db_url);

            const db = client.db(db_name);
            db.collection('tasks').update({taskname : this.taskname}, this.toJSON());
        } catch (err) {
            //console.log('err');
            //console.log(err.stack);
        }

        if (client) {
            client.close();
        }
    }

    get taskname(){
        return this._taskname;
    }

    get cost(){
        return this._cost;
    }

    get type(){
        return this._type;
    }

    get url(){
        return this._url;
    }

    get status(){
        return this._status;
    }
}
import VkPhotoLikeTask from "./VkPhotoLikeTask";

const MongoClient = require('mongodb').MongoClient;

const db_url = 'mongodb://evkator:isl0952214823bag@ds249355.mlab.com:49355/vklikebot';
const db_name = 'vklikebot';
const  decode = require('urldecode');
const  request = require('request');
const  cheerio = require('cheerio');

export default class Task{

    static async Create(url, type, required, author_id){
        
        let nTask;
        switch (type)
        {
            case 'vk_photo_like_task':
                nTask = new VkPhotoLikeTask(url,  required, author_id);
                break;
            default:
                break;
        }

        if(await Task.TaskExist(nTask.taskname, type))
            throw('Хмм..Кажется, задание уже существует. Я ошибаюсь? Напиши в техподдержку, мы поможем');

        return nTask;
    }

    constructor(taskname, type, url, required, remain, cost, author_id, status, workers){

        this._taskname = taskname;
        this._type = type;
        this._url = url;
        this._required = required;
        this._remain = remain;
        this._cost = cost;
        this._author_id = author_id;
        if(!status){
            this._status = 'created';
            this._workers = new Array();
        }
        else{
            this._status = status;
            this._workers = workers;
        }
    }

    static async GetTaskForUser(user, type){
        let client;
        let task;

        if(type == 'vk_photo_like_task')
            if(!user.vk_acc.uname)
                throw('Привяжи ВК аккаунт, чтобы выполнять такие задания');

        try {
            client = await MongoClient.connect(db_url);
            const db = client.db(db_name);
            const collection = db.collection('tasks');
            let res = await collection.find({workers: {$not: {$elemMatch : {user_id:user.id}}}, author_id:{$ne: user.id}, type: type, status : {$ne : 'done'}});
            task = Task.fromJSON(await res.next());
            return task;
        }
        catch (err){
            console.log('err');
            console.log(err.stack);
            throw('Извини, таких заданий сейчас нет');
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
            console.log(err.stack);
            throw('Неведомая ошибка на сервере. Пожалуйста, расскажите об этом техподдержке (последний пункт в главном меню)');
        }
    }

    static async TaskExist(taskname, tasktype){
        let client;
        let task;
        try {
            client = await MongoClient.connect(db_url);
            const db = client.db(db_name);
            const collection = db.collection('tasks');
            let res = await collection.findOne({taskname: taskname}, {task: tasktype});
            if(typeof res === 'undefined')
                throw 'db is empty';
            task = Task.fromJSON(res);
            return true;
        }
        catch (err){
            return false;
        }
    }

    static async GetTasksOfUser(user){
        let client;
        let tasks = new Array();
        try {
            client = await MongoClient.connect(db_url);
            const db = client.db(db_name);
            const collection = db.collection('tasks');
            let type = 'vk_photo_like_task';
            let res = await collection.find({author_id:user.id});
            // let task = Task.fromJSON(await res.next());
            // if(typeof res === 'undefined')
            //     throw 'db is empty';
            //let task = Task.fromJSON(res.next());
            
            while(await res.hasNext()){
                let task = Task.fromJSON(await res.next());
                tasks.push(task);
            }
            // while(res.hasNext()){
            //     res = await res.next();
            //     let task = Task.fromJSON(res);
            //     tasks.push(task);
            // }
        }
        catch (err){
            console.log('err');
            console.log(err.stack);
            throw('Неведомая ошибка на сервере. Пожалуйста, расскажите об этом техподдержке (последний пункт в главном меню)');
        }
        return tasks;
    }

    static fromJSON(jsonT){
        return new Task( jsonT.taskname, jsonT.type, jsonT.url, jsonT.required, jsonT.remain, jsonT.cost, jsonT.author_id, jsonT.status, jsonT.workers);
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

            if(this._remain <= 0)
                this._status = 'done';

            this.pay(user);
            this._workers.push({
                user_id: user.id,
                status: 'checked_once'
            });
            await this.update();
            return true;
        }
        else{
            return false;
        }
    }

    get workers(){
        return this._workers;
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
            status: this._status,
            workers: this._workers
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

    get required(){
        return this._required;
    }

    get remain(){
        return this._remain;
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

    static toString(){
        return "Неопределенное задание";
    }
}
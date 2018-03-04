import User from "./user";
const MongoClient = require('mongodb').MongoClient;

const db_url = 'mongodb://localhost:27017/vklikebot';
const db_name = 'vklikebot';
const  decode = require('urldecode');
const  request = require('request');
const  cheerio = require('cheerio');

export default class Task{

    // static Create(url, type, required, author_id){
    //     switch (type)
    //     {
    //         case 'vk_photo_like':
    //             return new VkPhotoLikeTask(url, type, required, author_id);
    //         default:
    //             break;
    //     }
    // }

    constructor(taskname, type, url, required, remain, cost, author_id){
        this._taskname = taskname;
        this._type = type;
        this._url = url;
        this._required = required;
        this._remain = remain;
        this._cost = cost;
        this._author_id = author_id;
        this._status = 'created';
    }

    static async GetTaskForUser(user, type){
        let client;
        let task;
        try {
            client = await MongoClient.connect(db_url);
            const db = client.db(db_name);
            const collection = db.collection('tasks');
            let res = await res.collection.find();
            for(i=0;i<user.tasks.length; i++){
                res = await res.collection.find({taskname: {$ne : user.tasks[i].taskname}, type: type});
            }
            task = Task.fromJSON(res[0]);
        }
        catch (err){
            console.log('err');
            console.log(err);
        }
        return task;
    }

    static async fromDB(taskname){
        let client;
        let task;
        try {
            client = await MongoClient.connect(db_url);
            const db = client.db(db_name);
            const collection = db.collection('tasks');
            let res = await collection.findOne({taskname: taskname}, { });
            task = Task.fromJSON(res);
        }
        catch (err){
            console.log('err');
            console.log(err);
        }
        return task;
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

    check(user, url){
        return false;
    }

    confirm(user){
        if(check(this._url, user)){
            this._remain--;
            pay(user);
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
            author_id: this._author_id
        };
        return jsonT;
    }

    static fromJSON(jsonT){
        return new Task( jsonT.taskname, jsonT.type, jsonT.url, jsonT.required, jsonT.remain, jsonT.cost, jsonT.author_id);
    }

    get Taskname(){
        return this._taskname;
    }

    get Type(){
        return this._type;
    }

    get Url(){
        return this._url;
    }
}



class VkPhotoLikeTask extends Task{

    constructor(url, required, author_id){
        let taskname = VkPhotoLikeTask.getUrlData(url)[1]+ '(' + type +')';
        const cost = 1;
        super(taskname, 'vk_photo_like_task', url, required, required, cost, author_id);
    }

    async check(user, url){
        let likersLink = VkPhotoLikeTask.getLikersLink(url);
        let result = false;
        try {

            let respHtml = await  request(likersLink);
            let $ = cheerio.load(respHtml);
            let likers = ($('a.inline_item')).toArray();

            result = likers.some((el)=>{
                return el.attribs.href.slice(1) === url.vk_acc.id;
            });
        }
        catch (err){
            console.log('err');
            console.log(err.stack);
        }
        return result;
    }

    static getLikersLink(url){
        urldata = Task.getUrlData(url);
        let likersUrl = "https://m.vk.com/like?act=members&object=" + urldata[1] + "&from=" + urldata[1] + "?list=" + urldata[2];
        return likersUrl;
    }

    static getUrlData(url){
        url = decode(url);
        const pattern = "((photo[^\/]+)_[^\/]+)";
        let reg = new RegExp(pattern, 'g');
        let urldata = reg.exec(url);
        return urldata;
    }

}


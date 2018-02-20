var MongoClient = require('mongoose');


export default class User{
    constructor(id, username, first_name, last_name, status = 'created', balance = 0, key = '', vk_acc_link = '', vk_acc_id = '', vk_tasks = []){
        this._id = id;
        this._username = username;
        this._first_name = first_name;
        this._last_name = last_name;
        this._status = 'created';
        this._balance = balance;
        this._key = key;
        this._vk_acc_link = vk_acc_link;
        this._vk_acc_id = vk_acc_id;
        this._tasks = vk_tasks;
    }

    saveToDB(){
/*
        this.toJSON();
        var url = 'mongodb://localhost:27017/VKlike';

        MongoClient.connect(url, function(err, db){
            var collection = db.collection('users');
            // метод insertMany используется для добавления множества обьектов
            collection.insertOne(jsonU, function(err, results){
                if(err) throw err;

                console.log('Data added!');
                console.log('********** Result **********');
                console.log(results);
                console.log('****************************');
                db.close();
            });
        });*/
    }

    static fromDB(id){
        /*var url = 'mongodb://localhost:27017/VKlike';

        MongoClient.connect(url, function(err, db){
            var collection = db.collection('users');
            // метод insertMany используется для добавления множества обьектов
            collection.findOne({id : id}).then(function (value) {
                console.log('***********************************************');
                console.log(res);
                console.log('***********************************************');
                db.close();
            });
        });*/
    }

    sendMessage(){

    }

    toJSON(){
        var jsonU = {
            id : this._id,
            username : this._username,
            first_name : this._first_name,
            last_name : this._last_name,
            status : this._status,
            balance : this._balance,
            key : this._key,
            vk_acc_link : this._vk_acc_link,
            vk_acc_id : this._vk_acc_id,
            tasks : this._tasks
        };
        return jsonU;
    }

    static fromJSON(uJSON){
        return new user( uJSON.id, uJSON.username, uJSON.first_name, uJSON.last_name, uJSON.status, uJSON.balance, uJSON.key, uJSON.vk_acc_link, uJSON.vk_acc_id, uJSON.tasks);
    }

    static getSender(msg){
        var telegUser = msg.from;
        return new user( telegUser.id, telegUser.username, telegUser.first_name, telegUser.last_name);
    }
}

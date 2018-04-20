'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MongoClient = require('mongodb').MongoClient;
var db_url = 'mongodb://evkator:isl0952214823bag@ds249355.mlab.com:49355/vklikebot'; //'mongodb://localhost:27017/vklikebot';
var db_name = 'vklikebot';

var DB = function () {
    function DB() {
        _classCallCheck(this, DB);
    }

    _createClass(DB, null, [{
        key: 'UpdateUser',
        value: async function UpdateUser(user) {
            var jsonU = user.toJSON();
            var client = await MongoClient.connect(db_url);
            var db = client.db(db_name);
            await db.collection('users').update({ id: user.id }, jsonU);
            await client.close();
        }
    }, {
        key: 'GetUsersCollection',
        value: async function GetUsersCollection() {
            var client = await MongoClient.connect(db_url);
            var db = client.db(db_name);
            return db.collection('users');
        }
    }, {
        key: 'InsertUser',
        value: async function InsertUser(user) {
            var jsonU = user.toJSON();
            var client = await MongoClient.connect(db_url);
            var db = client.db(db_name);
            await db.collection('users').insertOne(jsonU);
            await client.close();
        }
    }, {
        key: 'GetUser',
        value: async function GetUser(id) {
            var collection = await DB.GetUsersCollection();
            return res = await collection.findOne({ id: id }, {});
        }
    }, {
        key: 'FindUserByVk',
        value: async function FindUserByVk(vk_uname) {
            var collection = await DB.GetUsersCollection();
            return await collection.findOne({ 'vk_acc.uname': vk_uname });
        }

        ////////////TASK///////////////////

    }, {
        key: 'GetTasksCollection',
        value: async function GetTasksCollection() {
            var client = await MongoClient.connect(db_url);
            var db = client.db(db_name);
            var collection = db.collection('tasks');
            return collection;
        }
    }, {
        key: 'GetTask',
        value: async function GetTask(taskname, tasktype) {
            var collection = await DB.GetTasksCollection();
            if (tasktype) return await collection.findOne({ taskname: taskname }, { type: tasktype });else return await collection.findOne({ taskname: taskname }, {});
        }
    }, {
        key: 'GetTasksOfUser',
        value: async function GetTasksOfUser(user) {
            var collection = await DB.GetTasksCollection();
            return await collection.find({ author_id: user.id });
        }
    }, {
        key: 'GetTaskForUser',
        value: async function GetTaskForUser(user, type) {
            var collection = await DB.GetTasksCollection();
            var res = await collection.find({ workers: { $not: { $elemMatch: { user_id: user.id } } },
                author_id: { $ne: user.id }, type: type, status: { $ne: 'done' } });
        }
    }, {
        key: 'InsertTask',
        value: async function InsertTask(task) {
            var jsonT = task.toJSON();
            var client = await MongoClient.connect(db_url);
            var db = client.db(db_name);
            await db.collection('tasks').insertOne(jsonT);
            client.close();
        }
    }, {
        key: 'UpdateTask',
        value: async function UpdateTask(task) {
            var jsonT = task.toJSON();
            var client = await MongoClient.connect(db_url);
            var db = client.db(db_name);
            await db.collection('tasks').update({ taskname: this.taskname }, this.toJSON());
            client.close();
        }
    }]);

    return DB;
}();

exports.default = DB;
//# sourceMappingURL=DB.js.map
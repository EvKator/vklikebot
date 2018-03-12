'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _VkPhotoLikeTask = require('./VkPhotoLikeTask');

var _VkPhotoLikeTask2 = _interopRequireDefault(_VkPhotoLikeTask);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MongoClient = require('mongodb').MongoClient;

var db_url = 'mongodb://localhost:27017/vklikebot';
var db_name = 'vklikebot';
var decode = require('urldecode');
var request = require('request');
var cheerio = require('cheerio');

var Task = function () {
    _createClass(Task, null, [{
        key: 'Create',
        value: function Create(url, type, required, author_id) {
            switch (type) {
                case 'vk_photo_like':
                    return new _VkPhotoLikeTask2.default(url, type, required, author_id);
                default:
                    break;
            }
        }
    }]);

    function Task(taskname, type, url, required, remain, cost, author_id) {
        _classCallCheck(this, Task);

        this._taskname = taskname;
        this._type = type;
        this._url = url;
        this._required = required;
        this._remain = remain;
        this._cost = cost;
        this._author_id = author_id;
        this._status = 'created';
    }

    _createClass(Task, [{
        key: 'saveToDB',
        value: async function saveToDB() {
            var client = void 0;
            try {
                var jsonT = this.toJSON();

                client = await MongoClient.connect(db_url);
                var db = client.db(db_name);
                await db.collection('tasks').insertOne(jsonT);
            } catch (err) {
                console.log('err');
                console.log(err.stack);
            }

            if (client) {
                client.close();
            }
        }
    }, {
        key: 'confirm',
        value: async function confirm(user) {
            console.log('sssssss');
            var s = await _VkPhotoLikeTask2.default.check(user, this.url);
            if (s) {
                console.log(this._remain);
                this._remain = Number(this._remain) - 1;
                if (this._remain <= this._required) this._status = 'done';
                this.pay(user);
                await this.update();
            } else {
                return false;
            }
        }
    }, {
        key: 'pay',
        value: function pay(user) {
            user.Pay(this._cost);
        }
    }, {
        key: 'toJSON',
        value: function toJSON() {
            var jsonT = {
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
    }, {
        key: 'update',
        value: async function update() {
            var client = void 0;
            try {
                var jsonT = this.toJSON();
                client = await MongoClient.connect(db_url);

                var db = client.db(db_name);
                db.collection('tasks').update({ taskname: this.taskname }, this.toJSON());
            } catch (err) {
                //console.log('err');
                //console.log(err.stack);
            }

            if (client) {
                client.close();
            }
        }
    }, {
        key: 'taskname',
        get: function get() {
            return this._taskname;
        }
    }, {
        key: 'cost',
        get: function get() {
            return this._cost;
        }
    }, {
        key: 'type',
        get: function get() {
            return this._type;
        }
    }, {
        key: 'url',
        get: function get() {
            return this._url;
        }
    }], [{
        key: 'GetTaskForUser',
        value: async function GetTaskForUser(user, type) {
            var client = void 0;
            var task = void 0;
            try {
                client = await MongoClient.connect(db_url);
                var db = client.db(db_name);
                var collection = db.collection('tasks');
                var res = await collection.find();
                for (var i = 0; i < user.tasks.length; i++) {
                    res = await res.collection.find({ taskname: { $ne: user.tasks[i].taskname }, type: type, status: { $ne: 'done' } });
                }
                task = Task.fromJSON((await res.next()));
                return task;
            } catch (err) {
                console.log('err');
                console.log(err);
                return false;
            }
        }
    }, {
        key: 'fromDB',
        value: async function fromDB(taskname) {
            var client = void 0;
            var task = void 0;
            try {
                client = await MongoClient.connect(db_url);
                var db = client.db(db_name);
                var collection = db.collection('tasks');
                var res = await collection.findOne({ taskname: taskname }, {});
                if (typeof res === 'undefined') throw 'db is empty';

                task = Task.fromJSON(res);
                return task;
            } catch (err) {
                console.log('err');
                console.log(err);
                return false;
            }
        }
    }, {
        key: 'fromJSON',
        value: function fromJSON(jsonT) {
            return new Task(jsonT.taskname, jsonT.type, jsonT.url, jsonT.required, jsonT.remain, jsonT.cost, jsonT.author_id);
        }
    }, {
        key: 'check',
        value: async function check(user, url) {

            console.log('1111111111111');
            return false;
        }
    }]);

    return Task;
}();

exports.default = Task;
//# sourceMappingURL=task.js.map
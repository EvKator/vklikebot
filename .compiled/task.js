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

var db_url = 'mongodb://evkator:isl0952214823bag@ds249355.mlab.com:49355/vklikebot';
var db_name = 'vklikebot';
var decode = require('urldecode');
var request = require('request');
var cheerio = require('cheerio');

var Task = function () {
    _createClass(Task, null, [{
        key: 'Create',
        value: async function Create(url, type, required, author_id) {

            var nTask = void 0;
            switch (type) {
                case 'vk_photo_like_task':
                    nTask = new _VkPhotoLikeTask2.default(url, required, author_id);
                    break;
                default:
                    break;
            }

            if (await Task.TaskExist(nTask.taskname, type)) throw 'Хмм..Кажется, задание уже существует. Я ошибаюсь? Напиши в техподдержку, мы поможем';

            return nTask;
        }
    }]);

    function Task(taskname, type, url, required, remain, cost, author_id, status, workers) {
        _classCallCheck(this, Task);

        this._taskname = taskname;
        this._type = type;
        this._url = url;
        this._required = required;
        this._remain = remain;
        this._cost = cost;
        this._author_id = author_id;
        if (!status) {
            this._status = 'created';
            this._workers = new Array();
        } else {
            this._status = status;
            this._workers = workers;
        }
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
            var s = await _VkPhotoLikeTask2.default.check(user, this.url);
            if (s) {
                this._remain = Number(this._remain) - 1;

                if (this._remain <= 0) this._status = 'done';

                this.pay(user);
                this._workers.push({
                    user_id: user.id,
                    status: 'checked_once'
                });
                await this.update();
                return true;
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
                author_id: this._author_id,
                status: this._status,
                workers: this._workers
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
        key: 'workers',
        get: function get() {
            return this._workers;
        }
    }, {
        key: 'taskname',
        get: function get() {
            return this._taskname;
        }
    }, {
        key: 'required',
        get: function get() {
            return this._required;
        }
    }, {
        key: 'remain',
        get: function get() {
            return this._remain;
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
    }, {
        key: 'status',
        get: function get() {
            return this._status;
        }
    }], [{
        key: 'GetTaskForUser',
        value: async function GetTaskForUser(user, type) {
            var client = void 0;
            var task = void 0;

            if (type == 'vk_photo_like_task') if (!user.vk_acc.uname) throw 'Привяжи ВК аккаунт, чтобы выполнять такие задания';

            try {
                client = await MongoClient.connect(db_url);
                var db = client.db(db_name);
                var collection = db.collection('tasks');
                var res = await collection.find({ workers: { $not: { $elemMatch: { user_id: user.id } } }, author_id: { $ne: user.id }, type: type, status: { $ne: 'done' } });
                task = Task.fromJSON((await res.next()));
                return task;
            } catch (err) {
                console.log('err');
                console.log(err.stack);
                throw 'Извини, таких заданий сейчас нет';
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
                console.log(err.stack);
                throw 'Неведомая ошибка на сервере. Пожалуйста, расскажите об этом техподдержке (последний пункт в главном меню)';
            }
        }
    }, {
        key: 'TaskExist',
        value: async function TaskExist(taskname, tasktype) {
            var client = void 0;
            var task = void 0;
            try {
                client = await MongoClient.connect(db_url);
                var db = client.db(db_name);
                var collection = db.collection('tasks');
                var res = await collection.findOne({ taskname: taskname }, { task: tasktype });
                if (typeof res === 'undefined') throw 'db is empty';
                task = Task.fromJSON(res);
                return true;
            } catch (err) {
                return false;
            }
        }
    }, {
        key: 'GetTasksOfUser',
        value: async function GetTasksOfUser(user) {
            var client = void 0;
            var tasks = new Array();
            try {
                client = await MongoClient.connect(db_url);
                var db = client.db(db_name);
                var collection = db.collection('tasks');
                var type = 'vk_photo_like_task';
                var res = await collection.find({ author_id: user.id });
                // let task = Task.fromJSON(await res.next());
                // if(typeof res === 'undefined')
                //     throw 'db is empty';
                //let task = Task.fromJSON(res.next());

                while (await res.hasNext()) {
                    var task = Task.fromJSON((await res.next()));
                    tasks.push(task);
                }
                // while(res.hasNext()){
                //     res = await res.next();
                //     let task = Task.fromJSON(res);
                //     tasks.push(task);
                // }
            } catch (err) {
                console.log('err');
                console.log(err.stack);
                throw 'Неведомая ошибка на сервере. Пожалуйста, расскажите об этом техподдержке (последний пункт в главном меню)';
            }
            return tasks;
        }
    }, {
        key: 'fromJSON',
        value: function fromJSON(jsonT) {
            return new Task(jsonT.taskname, jsonT.type, jsonT.url, jsonT.required, jsonT.remain, jsonT.cost, jsonT.author_id, jsonT.status, jsonT.workers);
        }
    }, {
        key: 'check',
        value: async function check(user, url) {

            console.log('1111111111111');
            return false;
        }
    }, {
        key: 'toString',
        value: function toString() {
            return "Неопределенное задание";
        }
    }]);

    return Task;
}();

exports.default = Task;
//# sourceMappingURL=task.js.map
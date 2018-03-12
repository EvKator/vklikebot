'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _VkPhotoLikeTask = require('./VkPhotoLikeTask');

var _VkPhotoLikeTask2 = _interopRequireDefault(_VkPhotoLikeTask);

var _TeleBot = require('./TeleBot');

var _TeleBot2 = _interopRequireDefault(_TeleBot);

var _task = require('./task.js');

var _task2 = _interopRequireDefault(_task);

var _VkAcc = require('./VkAcc');

var _VkAcc2 = _interopRequireDefault(_VkAcc);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var cheerio = require('cheerio');
var request = require('request-promise');
var MongoClient = require('mongodb').MongoClient;

var assert = require('assert');
var db_url = 'mongodb://localhost:27017/vklikebot';
var db_name = 'vklikebot';
//var nmenu = require('./nmenu');

var User = function () {
    function User(id, username, first_name, last_name, status, balance, key, vk_acc, vk_tasks, menu_id) {
        _classCallCheck(this, User);

        if (!status) {

            status = 'new_user';
            balance = 0;
            key = '';
            vk_acc = { uname: '', id: '' };
            vk_tasks = [];
            menu_id = '';
            this._existInDB = false;
        } else this._existInDB = true;
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

    _createClass(User, [{
        key: 'confirmTask',
        value: async function confirmTask(taskname) {
            try {
                var task = await _task2.default.fromDB(taskname);
                if (task) {
                    await task.confirm(this);
                    return task;
                }
            } catch (err) {
                return false;
            }
            return false;
        }
    }, {
        key: 'skipTask',
        value: async function skipTask(taskname) {
            var task = await _task2.default.fromDB(taskname);
            this._tasks.push({ taskname: taskname, status: 'skip' });
            this.sendMessage("skipping success");
        }
    }, {
        key: 'createVkPhotoLikeTask',
        value: async function createVkPhotoLikeTask(url, required) {
            var task = new _VkPhotoLikeTask2.default(url, required, this.id);
            console.log(task);
            if (task) {
                try {
                    await task.saveToDB();
                    this._balance -= task.cost * required;
                } catch (err) {
                    throw err;
                }
            }
        }
    }, {
        key: 'update',
        value: async function update() {
            var client = void 0;
            try {
                var jsonU = this.toJSON();
                client = await MongoClient.connect(db_url);

                var db = client.db(db_name);
                db.collection('users').update({ id: this.id }, this.toJSON());
            } catch (err) {
                //console.log('err');
                //console.log(err.stack);
            }

            if (client) {
                client.close();
            }
        }
    }, {
        key: 'addVkAcc',
        value: async function addVkAcc(vk_link) {
            try {
                var vk_uname = /vk\.com\/([a-zA-Z0-9]*)/g.exec(vk_link)[1].toString();
                var html = await request(vk_link);
                var $ = cheerio.load(html);

                var text = "Success";
                var userStatus = $('div.pp_status').html();
                if (this.key === userStatus) {
                    var vkacc = new _VkAcc2.default(vk_uname);
                    this._vk_acc = vkacc.toJSON();
                } else {
                    text = "Failure, status on thee page is " + userStatus;
                }
                _TeleBot2.default.sendMessage(user.id, text);
            } catch (err) {
                throw err;
            }
        }
    }, {
        key: 'sendMessage',
        value: function sendMessage(text) {
            _TeleBot2.default.sendMessage(this.id, text);
        }
    }, {
        key: 'Pay',
        value: async function Pay(coins) {
            if (coins > 0) {
                this._balance += coins;
                await this.update();
            } else {
                console.log('Error: coins < 0');
            }
        }
    }, {
        key: 'saveToDB',
        value: async function saveToDB() {
            var client = void 0;
            try {
                var jsonU = this.toJSON();
                jsonU.status = 'created';

                client = await MongoClient.connect(db_url);
                var db = client.db(db_name);
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
    }, {
        key: 'toJSON',
        value: function toJSON() {
            var jsonU = {
                id: this.id,
                username: this.username,
                first_name: this.first_name,
                last_name: this.lastname,
                status: this.status,
                balance: this.balance,
                key: this.key,
                vk_acc: {
                    uname: this.vk_acc.uname,
                    id: this.vk_acc.id
                },
                tasks: this.tasks,
                menu_id: this.menu_id
            };
            return jsonU;
        }

        /////////////////////////////////getters,setters

    }, {
        key: 'menu_id',
        set: function set(menu_id) {
            this._menu_id = menu_id;
            this.update();
        },
        get: function get() {
            return this._menu_id;
        }
    }, {
        key: 'status',
        set: function set(status) {
            this._status = status;
            this.update();
        },
        get: function get() {
            return this._status;
        }
    }, {
        key: 'ExistInDB',
        get: function get() {
            return this._existInDB;
        }
    }, {
        key: 'id',
        get: function get() {
            return this._id;
        }
    }, {
        key: 'username',
        get: function get() {
            return this._username;
        }
    }, {
        key: 'first_name',
        get: function get() {
            return this._first_name;
        }
    }, {
        key: 'last_name',
        get: function get() {
            return this._last_name;
        }
    }, {
        key: 'balance',
        get: function get() {
            return this._balance;
        }
    }, {
        key: 'key',
        set: function set(key) {
            this._key = key;
            this.update();
        },
        get: function get() {
            return this._key;
        }
    }, {
        key: 'vk_acc',
        get: function get() {
            return this._vk_acc;
        }
    }, {
        key: 'tasks',
        get: function get() {
            return this._tasks;
        }
    }], [{
        key: 'getSender',
        value: async function getSender(msg) {
            var telegUser = msg.from;
            var user = void 0;
            try {
                user = await User.fromDB(telegUser.id);
            } catch (err) {
                user = new User(telegUser.id, telegUser.username, telegUser.first_name, telegUser.last_name);
            }
            return user;
        }
    }, {
        key: 'fromDB',
        value: async function fromDB(id) {
            var client = void 0;
            var user = void 0;
            try {

                client = await MongoClient.connect(db_url);
                var db = client.db(db_name);
                var collection = db.collection('users');
                var res = await collection.findOne({ id: id }, {});
                user = User.fromJSON(res);
            } catch (err) {
                //console.log('err');
                //console.log(err);
                throw err;
            }
            return user;
        }
    }, {
        key: 'fromJSON',
        value: function fromJSON(uJSON) {
            return new User(uJSON.id, uJSON.username, uJSON.first_name, uJSON.last_name, uJSON.status, uJSON.balance, uJSON.key, uJSON.vk_acc, uJSON.tasks, uJSON.menu_id);
        }
    }]);

    return User;
}();

exports.default = User;
//# sourceMappingURL=user.js.map
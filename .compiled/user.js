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

var _DB = require('./DB');

var _DB2 = _interopRequireDefault(_DB);

var _VkAcc = require('./VkAcc');

var _VkAcc2 = _interopRequireDefault(_VkAcc);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var cheerio = require('cheerio');
var request = require('request-promise');

var User = function () {
    function User(id, username, first_name, last_name, status, balance, key, vk_acc, menu_id, last_message_id) {
        _classCallCheck(this, User);

        if (!status) {
            status = 'new_user';
            balance = 0;
            key = createKey(30);
            vk_acc = { uname: '', id: '' };
            menu_id = '';
            this._existInDB = false;
            last_message_id = 0;
        } else this._existInDB = true;
        this._id = id;
        this._username = username;
        this._first_name = first_name;
        this._last_name = last_name;
        this._status = status;
        this._balance = balance;
        this._key = key;
        this._vk_acc = vk_acc;
        this._menu_id = menu_id;
        this._last_message_id = last_message_id;
    }

    _createClass(User, [{
        key: 'confirmfTask',
        value: async function confirmfTask(taskname) {
            var _this = this;

            var task = await _task2.default.fromDB(taskname);
            var taskDone = void 0;
            try {
                if (task.workers) {
                    taskDone = task.workers.some(function (worker) {
                        return worker.user_id == _this.id;
                    });
                }
            } catch (err) {
                throw 'Мне кажется, ты не выполнил задание. Если это не так, напиши, пожалуйста, в техподдержу, мы поможем';
            }
            if (taskDone) throw 'Ты уже выполнял это задание';
            if (task) {
                var confirmed = await task.confirm(this);
                if (!confirmed) throw 'Мне кажется, ты не выполнил задание. Если это не так, напиши, пожалуйста, в техподдержу, мы поможем';
            }

            return task;
        }
    }, {
        key: 'skipTask',
        value: async function skipTask(taskname) {
            var task = await _task2.default.fromDB(taskname);
            task.skip(user);
        }
    }, {
        key: 'createVkPhotoLikeTask',
        value: async function createVkPhotoLikeTask(url, required) {
            required = Number(required);
            if (isNaN(required)) throw "Странное число...Не умею работать с такими";

            var finalCost = required * _VkPhotoLikeTask2.default.cost;

            if (typeof required != "number") {
                throw "Странное число...Не умею работать с такими";
            } else if (finalCost > this.balance) throw "Кажется, финансы не позволяют. На счету " + this.balance + " руб, а нужно " + finalCost;else if (finalCost <= 0) throw "Мы не можем крутить отрицательные и нулевые значения, извини";

            var task = await _task2.default.Create(url, 'vk_photo_like_task', required, this.id); //new VkPhotoLikeTask(url, required, this.id);

            try {
                await task.saveToDB();
                this._spendMoney(task.cost * required);
            } catch (err) {
                console.log('err');
                console.log(err.stack);
                throw "Неведомая ошибка на сервере. Пожалуйста, расскажи об этом техподдержке (последний пункт в главном меню)";
            }
        }
    }, {
        key: 'createVkPostLikeTask',
        value: async function createVkPostLikeTask(url, required) {
            required = Number(required);
            if (isNaN(required)) throw "Странное число...Не умею работать с такими";

            var finalCost = required * _VkPhotoLikeTask2.default.cost;

            if (typeof required != "number") {
                throw "Странное число...Не умею работать с такими";
            } else if (finalCost > this.balance) throw "Кажется, финансы не позволяют. На счету " + this.balance + " руб, а нужно " + finalCost;else if (finalCost <= 0) throw "Мы не можем крутить отрицательные и нулевые значения, извини";

            var task = await _task2.default.Create(url, 'vk_post_like_task', required, this.id); //new VkPhotoLikeTask(url, required, this.id);

            await task.saveToDB();
            this._spendMoney(task.cost * required);
        }
    }, {
        key: 'update',
        value: async function update() {
            await _DB2.default.UpdateUser(this);
        }
    }, {
        key: 'delVkAcc',
        value: async function delVkAcc() {
            this._vk_acc.uname = '';
            this._vk_acc.id = '';
            this.update();
        }
    }, {
        key: 'addVkAcc',
        value: async function addVkAcc(vk_link) {
            ///////////////////////////////////////////////////////////////vk acc retrying
            var vk_uname = /vk\.com\/([a-zA-Z0-9]*)/g.exec(vk_link)[1].toString();

            var used = await User.vkAccUsed(vk_uname);
            if (!used) {
                vk_link = 'https://vk.com/' + vk_uname;
                var html = await request(vk_link);

                var $ = cheerio.load(html);
                var userStatus = $('div.pp_status').html();
                var vk_id = void 0;
                try {
                    vk_id = /photo(\d+)_/.exec(html)[1]; ///owner_id=(\d+)/.exec($('#wall_a_s').href)[1];
                } catch (err) {
                    throw 'Страница скрыта для неавторизованых пользователей, я не могу взять нужную информацию. Я ошбиаюсь? Напиши в техподдержку, мы поможем';
                }
                if (this.key == userStatus) {
                    var vkacc = new _VkAcc2.default(vk_uname, vk_id);
                    this._vk_acc = vkacc.toJSON();
                } else if (userStatus === null) {
                    throw "Статус на странице скрыт или пуст. Пожалуста, поменяй настройки приватности, чтобы я (неавторизованный пользователь) смог его увидеть.";
                } else {
                    throw "Ошибка, статус на странице сейчас " + userStatus;
                }
            } else throw "Ошибка, аккаунт уже привязан к другому пользователю";
        }
    }, {
        key: 'getPaid',
        value: async function getPaid(coins) {
            this._balance = Number(this._balance) + Number(coins);
            await this.update();
        }
    }, {
        key: 'saveToDB',
        value: async function saveToDB() {
            await _DB2.default.InsertUser(this);
        }
    }, {
        key: 'createdTasks',
        value: async function createdTasks() {
            return await _task2.default.GetTasksOfUser(this);
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
                menu_id: this.menu_id,
                last_message_id: this.last_message_id
            };
            return jsonU;
        }
    }, {
        key: '_spendMoney',
        value: async function _spendMoney(amount) {
            this._balance -= amount;
            await this.update();
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
        key: 'last_message_id',
        get: function get() {
            return this._last_message_id;
        },
        set: function set(val) {
            this._last_message_id = val;
            this.update();
        }
    }], [{
        key: 'vkAccUsed',
        value: async function vkAccUsed(vk_uname) {
            var result = true;
            var res = await _DB2.default.FindUserByVk(vk_uname);
            try {
                user = User.fromJSON(res);
                result = true;
            } catch (err) {
                result = false;
            }
            return result;
        }
    }, {
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
            var jsonU = await _DB2.default.FindUser(id);
            var user = User.fromJSON(res);
            return user;
        }
    }, {
        key: 'fromJSON',
        value: function fromJSON(jsonU) {
            return new User(jsonU.id, jsonU.username, jsonU.first_name, jsonU.last_name, jsonU.status, jsonU.balance, jsonU.key, jsonU.vk_acc, jsonU.menu_id, jsonU.last_message_id);
        }
    }]);

    return User;
}();

exports.default = User;


function createKey(n) {
    var s = '';
    while (s.length < n) {
        s += String.fromCharCode(Math.random() * 1106).replace(/[^a-zA-Z]|_/g, '');
    }return s;
}
//# sourceMappingURL=user.js.map
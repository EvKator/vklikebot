'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _nmenu = require('./nmenu');

var _nmenu2 = _interopRequireDefault(_nmenu);

var _user = require('./user');

var _user2 = _interopRequireDefault(_user);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MongoClient = require('mongodb').MongoClient;
var db_url = 'mongodb://localhost:27017/vklikebot';
var db_name = 'vklikebot';

var Admin = function () {
    function Admin() {
        _classCallCheck(this, Admin);
    }

    _createClass(Admin, null, [{
        key: 'SendToAll',
        value: async function SendToAll(text) {
            var parse_mode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'HTML';

            //sendTextMessage(user, text, reply_markup, parse_mode)

            var client = await MongoClient.connect(db_url);
            var db = client.db(db_name);
            var collection = db.collection('users');
            var cursor = await collection.find();
            cursor.forEach(function (doc) {
                var user = _user2.default.fromJSON(doc);
                _nmenu2.default.sendTextMessage(user, text, null, parse_mode);
            });
        }
    }, {
        key: 'PayTo',
        value: async function PayTo(user, salary) {
            user.Pay(salary);
            _nmenu2.default.sendTextMessage(user, "Вам подарок: " + salary + " руб");
        }
    }, {
        key: 'SendTo',
        value: async function SendTo(user, text) {
            var parse_mode = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'HTML';

            //sendTextMessage(user, text, reply_markup, parse_mode)

            _nmenu2.default.sendTextMessage(user, text, null, parse_mode);
        }
    }, {
        key: 'checkAllTasks',
        value: async function checkAllTasks() {}
    }]);

    return Admin;
}();

exports.default = Admin;
//# sourceMappingURL=admin.js.map
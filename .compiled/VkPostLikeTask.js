'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _task = require('./task');

var _task2 = _interopRequireDefault(_task);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var request = require('request-promise');
var cheerio = require('cheerio');
var decode = require('urldecode');

var VkPostLikeTask = function (_Task) {
    _inherits(VkPostLikeTask, _Task);

    function VkPostLikeTask(url, required, author_id) {
        _classCallCheck(this, VkPostLikeTask);

        var type = 'vk_post_like_task';
        var taskname = VkPostLikeTask.getUrlData(url)[1];
        var cost = VkPostLikeTask.cost;
        return _possibleConstructorReturn(this, (VkPostLikeTask.__proto__ || Object.getPrototypeOf(VkPostLikeTask)).call(this, taskname, type, url, required, required, cost, author_id));
    }

    _createClass(VkPostLikeTask, null, [{
        key: 'check',
        value: async function check(user, url) {
            var likersLink = VkPostLikeTask.getLikersLink(url);
            var result = false;
            try {
                var respHtml = await request(likersLink);
                var $ = cheerio.load(respHtml);
                var likers = $('a.inline_item').toArray();
                result = likers.some(function (el) {
                    console.log(el.attribs.href);
                    return el.attribs.href.slice(1) === user.vk_acc.uname;
                });
                console.log(user.vk_acc.username);
            } catch (err) {
                console.log('err');
                console.log(err.stack);
                return false;
            }
            return result;
        }
    }, {
        key: 'getLikersLink',
        value: function getLikersLink(url) {
            var urldata = VkPostLikeTask.getUrlData(url);
            var likersUrl = "https://m.vk.com/like?act=members&object=" + urldata[1];
            console.log(likersUrl);
            return likersUrl;
        }
    }, {
        key: 'getUrlData',
        value: function getUrlData(url) {

            console.log(url);
            url = decode(url);
            var pattern = /(wall\d+_\d+)/g;
            if (url.search(pattern) < 0) throw "Я не нашел по твоей ссылке пост из ВК. Пожалуйста, поверь ее или обратись в техподдержку, мы поможем";
            var urldata = pattern.exec(url);
            return urldata;
        }
    }, {
        key: 'toString',
        value: function toString(task) {
            var msg = "Задание: " + String(task.required) + " лайков на [пост](" + task.url + ") \n" + "лайкнуло: " + String(Number(task.required) - Number(task.remain)) + "\n" + "затрачено: " + String(Number(task.cost) * Number(task.required)) + " руб\n" + "---------";
            return msg;
        }
    }]);

    return VkPostLikeTask;
}(_task2.default);

VkPostLikeTask.cost = 0.2;

exports.default = VkPostLikeTask;
//# sourceMappingURL=VkPostLikeTask.js.map
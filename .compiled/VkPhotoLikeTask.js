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

var VkPhotoLikeTask = function (_Task) {
    _inherits(VkPhotoLikeTask, _Task);

    function VkPhotoLikeTask(url, required, author_id) {
        _classCallCheck(this, VkPhotoLikeTask);

        var type = 'vk_photo_like_task';
        var taskname = VkPhotoLikeTask.getUrlData(url)[1];
        var cost = VkPhotoLikeTask.cost;
        return _possibleConstructorReturn(this, (VkPhotoLikeTask.__proto__ || Object.getPrototypeOf(VkPhotoLikeTask)).call(this, taskname, type, url, required, required, cost, author_id));
    }

    _createClass(VkPhotoLikeTask, null, [{
        key: 'check',
        value: async function check(user, url) {
            var likersLink = VkPhotoLikeTask.getLikersLink(url);
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
            var urldata = VkPhotoLikeTask.getUrlData(url);
            var likersUrl = "https://m.vk.com/like?act=members&object=" + urldata[1] + "&from=" + urldata[1] + "?list=" + urldata[2];
            console.log(likersUrl);
            return likersUrl;
        }
    }, {
        key: 'getUrlData',
        value: function getUrlData(url) {
            console.log(url);
            url = decode(url);
            var pattern = /((photo[^\/]+)_[^\/]+)/g;
            if (url.search(pattern) < 0) throw "Я не нашел по твоей ссылке фотографий из ВК. Пожалуйста, поверь ее или обратись в техподдержку, мы поможем";
            var urldata = pattern.exec(url);
            return urldata;
        }
    }]);

    return VkPhotoLikeTask;
}(_task2.default);

VkPhotoLikeTask.cost = 1;

exports.default = VkPhotoLikeTask;
//# sourceMappingURL=VkPhotoLikeTask.js.map
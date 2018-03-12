'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var request = require('request-promise');
var cheerio = require('cheerio');
var decode = require('urldecode');

var Check = function () {
    function Check() {
        _classCallCheck(this, Check);
    }

    _createClass(Check, null, [{
        key: 'hasLiked',
        value: async function hasLiked(url, vk_id) {
            url = decode(url);

            var pattern1 = "((video[^\/]+)_[^\/]+)";
            var pattern = "((photo[^\/]+)_[^\/]+)";
            var reg = new RegExp(pattern, 'g');
            var u = reg.exec(url);
            var likersUrl = "https://m.vk.com/like?act=members&object=" + u[1] + "&from=" + u[1] + "?list=" + u[2];
            var result = false;
            try {
                var respHtml = await request(likersUrl);
                var $ = cheerio.load(respHtml);
                var likers = $('a.inline_item').toArray();

                result = likers.some(function (el) {
                    return el.attribs.href.slice(1) === vk_id;
                });
            } catch (err) {
                console.log('err');
                console.log(err.stack);
            }
            return result;
        }
    }]);

    return Check;
}();

exports.default = Check;
//# sourceMappingURL=Check.js.map
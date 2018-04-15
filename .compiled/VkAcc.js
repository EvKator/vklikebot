"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var VkAcc = function () {
    function VkAcc(uname, id) {
        _classCallCheck(this, VkAcc);

        this._uname = uname;
        this._id = id;
    }

    _createClass(VkAcc, [{
        key: "toJSON",
        value: function toJSON() {
            return {
                uname: this._uname,
                id: this._id
            };
        }
    }, {
        key: "uname",
        set: function set(uname) {
            this._uname = uname;
        },
        get: function get() {
            return this._uname;
        }
    }, {
        key: "id",
        set: function set(id) {
            this._id = id;
        },
        get: function get() {
            return this._id;
        }
    }]);

    return VkAcc;
}();

exports.default = VkAcc;
//# sourceMappingURL=VkAcc.js.map
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash.isequal');

var _lodash2 = _interopRequireDefault(_lodash);

var _lodash3 = require('lodash.first');

var _lodash4 = _interopRequireDefault(_lodash3);

var _lodash5 = require('lodash.last');

var _lodash6 = _interopRequireDefault(_lodash5);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Polyline = function () {
  function Polyline() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Polyline);

    this.options = options;
    this.coords = this.options.coords;
    this.color = this.options.color || '#000000BB';
    this.fill = this.options.fill;
    this.width = this.options.width || 3;
    this.simplify = this.options.simplify || false;
    this.type = (0, _lodash2.default)((0, _lodash4.default)(this.coords), (0, _lodash6.default)(this.coords)) ? 'polygon' : 'polyline';
  }

  /**
   * calculate the coordinates of the envelope / bounding box: (min_lon, min_lat, max_lon, max_lat)
   */


  _createClass(Polyline, [{
    key: 'extent',
    value: function extent() {
      return [this.coords.map(function (c) {
        return c[0];
      }).StaticMin(), this.coords.map(function (c) {
        return c[1];
      }).StaticMin(), this.coords.map(function (c) {
        return c[0];
      }).StaticMax(), this.coords.map(function (c) {
        return c[1];
      }).StaticMax()];
    }
  }]);

  return Polyline;
}();

exports.default = Polyline;
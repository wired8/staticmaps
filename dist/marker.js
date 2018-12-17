'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _class = function () {
  function _class() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, _class);

    this.options = options;

    if (!(options.width && options.height)) throw new Error('Please specify width and height of the marker image.');

    this.coord = this.options.coord;
    this.img = this.options.img;
    this.offsetX = this.options.offsetX || options.width / 2;
    this.offsetY = this.options.offsetY || options.height;
    this.offset = [this.offsetX, this.offsetY];
    this.height = this.options.height;
    this.width = this.options.width;
  }

  /**
   *  Set icon data
   */


  _createClass(_class, [{
    key: 'set',
    value: function set(img) {
      this.imgData = img;
    }
  }, {
    key: 'extentPx',
    value: function extentPx() {
      return [this.offset[0], this.height - this.offset[1], this.width - this.offset[0], this.offset[1]];
    }
  }]);

  return _class;
}();

exports.default = _class;
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _sharp = require('sharp');

var _sharp2 = _interopRequireDefault(_sharp);

var _lodash = require('lodash.last');

var _lodash2 = _interopRequireDefault(_lodash);

var _asyncQueue = require('./helper/asyncQueue');

var _asyncQueue2 = _interopRequireDefault(_asyncQueue);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Image = function () {
  function Image() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Image);

    this.options = options;
    this.width = this.options.width;
    this.height = this.options.height;
    this.quality = this.options.quality || 100;
  }

  /**
   * Prepare all tiles to fit the baselayer
   */


  _createClass(Image, [{
    key: 'prepareTileParts',
    value: function prepareTileParts(data) {
      var _this = this;

      return new Promise(function (resolve) {
        var tile = (0, _sharp2.default)(data.body);
        tile.metadata().then(function (metadata) {
          var x = data.box[0];
          var y = data.box[1];
          var sx = x < 0 ? 0 : x;
          var sy = y < 0 ? 0 : y;
          var dx = x < 0 ? -x : 0;
          var dy = y < 0 ? -y : 0;
          var extraWidth = x + (metadata.width - _this.width);
          var extraHeight = y + (metadata.width - _this.height);
          var w = metadata.width + (x < 0 ? x : 0) - (extraWidth > 0 ? extraWidth : 0);
          var h = metadata.height + (y < 0 ? y : 0) - (extraHeight > 0 ? extraHeight : 0);

          // Fixed #20 https://github.com/StephanGeorg/staticmaps/issues/20
          if (!w || !h) {
            resolve(null);
            return null;
          }

          return tile.extract({
            left: dx,
            top: dy,
            width: w,
            height: h
          }).toBuffer().then(function (part) {
            resolve({
              position: { top: Math.round(sy), left: Math.round(sx) },
              data: part
            });
          });
        });
      });
    }
  }, {
    key: 'draw',
    value: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee3(tiles) {
        var _this2 = this;

        return _regenerator2.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                return _context3.abrupt('return', new Promise(function () {
                  var _ref2 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee2(resolve) {
                    var baselayer, tempbuffer, tileParts, preparedTiles, queue;
                    return _regenerator2.default.wrap(function _callee2$(_context2) {
                      while (1) {
                        switch (_context2.prev = _context2.next) {
                          case 0:
                            // Generate baseimage
                            baselayer = (0, _sharp2.default)({
                              create: {
                                width: _this2.width,
                                height: _this2.height,
                                channels: 4,
                                background: {
                                  r: 0, g: 0, b: 0, alpha: 0
                                }
                              }
                            });
                            // Save baseimage as buffer

                            _context2.next = 3;
                            return baselayer.png().toBuffer();

                          case 3:
                            tempbuffer = _context2.sent;


                            // Prepare tiles for composing baselayer
                            tileParts = [];

                            tiles.forEach(function (tile, i) {
                              tileParts.push(_this2.prepareTileParts(tile, i));
                            });
                            _context2.next = 8;
                            return Promise.all(tileParts);

                          case 8:
                            preparedTiles = _context2.sent;


                            // Compose all prepared tiles to the baselayer
                            queue = [];

                            preparedTiles.forEach(function (preparedTile) {
                              queue.push(_asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
                                var position, data;
                                return _regenerator2.default.wrap(function _callee$(_context) {
                                  while (1) {
                                    switch (_context.prev = _context.next) {
                                      case 0:
                                        if (preparedTile) {
                                          _context.next = 2;
                                          break;
                                        }

                                        return _context.abrupt('return');

                                      case 2:
                                        position = preparedTile.position, data = preparedTile.data;

                                        position.top = Math.round(position.top);
                                        position.left = Math.round(position.left);
                                        _context.next = 7;
                                        return (0, _sharp2.default)(tempbuffer).overlayWith(data, position).toBuffer();

                                      case 7:
                                        tempbuffer = _context.sent;

                                      case 8:
                                      case 'end':
                                        return _context.stop();
                                    }
                                  }
                                }, _callee, _this2);
                              })));
                            });
                            _context2.next = 13;
                            return (0, _asyncQueue2.default)(queue);

                          case 13:
                            _this2.image = tempbuffer;

                            resolve(true);

                          case 15:
                          case 'end':
                            return _context2.stop();
                        }
                      }
                    }, _callee2, _this2);
                  }));

                  return function (_x3) {
                    return _ref2.apply(this, arguments);
                  };
                }()));

              case 1:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function draw(_x2) {
        return _ref.apply(this, arguments);
      }

      return draw;
    }()

    /**
     * Save image to file
     */

  }, {
    key: 'save',
    value: function save() {
      var _this3 = this;

      var fileName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'output.png';
      var outOpts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var format = (0, _lodash2.default)(fileName.split('.'));
      var outputOptions = outOpts;
      outputOptions.quality = outputOptions.quality || this.quality;
      return new Promise(function () {
        var _ref4 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee4(resolve, reject) {
          return _regenerator2.default.wrap(function _callee4$(_context4) {
            while (1) {
              switch (_context4.prev = _context4.next) {
                case 0:
                  _context4.prev = 0;
                  _context4.t0 = format.toLowerCase();
                  _context4.next = _context4.t0 === 'webp' ? 4 : _context4.t0 === 'jpg' ? 7 : _context4.t0 === 'jpeg' ? 7 : _context4.t0 === 'png' ? 10 : 10;
                  break;

                case 4:
                  _context4.next = 6;
                  return (0, _sharp2.default)(_this3.image).webp(outputOptions).toFile(fileName);

                case 6:
                  return _context4.abrupt('break', 13);

                case 7:
                  _context4.next = 9;
                  return (0, _sharp2.default)(_this3.image).jpeg(outputOptions).toFile(fileName);

                case 9:
                  return _context4.abrupt('break', 13);

                case 10:
                  _context4.next = 12;
                  return (0, _sharp2.default)(_this3.image).png(outputOptions).toFile(fileName);

                case 12:
                  return _context4.abrupt('break', 13);

                case 13:
                  resolve();
                  _context4.next = 19;
                  break;

                case 16:
                  _context4.prev = 16;
                  _context4.t1 = _context4['catch'](0);

                  reject(_context4.t1);

                case 19:
                case 'end':
                  return _context4.stop();
              }
            }
          }, _callee4, _this3, [[0, 16]]);
        }));

        return function (_x6, _x7) {
          return _ref4.apply(this, arguments);
        };
      }());
    }

    /**
     * Return image as buffer
     */

  }, {
    key: 'buffer',
    value: function buffer() {
      var _this4 = this;

      var mime = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'image/png';
      var outOpts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var outputOptions = outOpts;
      outputOptions.quality = outputOptions.quality || this.quality;
      return new Promise(function () {
        var _ref5 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee5(resolve) {
          var buffer;
          return _regenerator2.default.wrap(function _callee5$(_context5) {
            while (1) {
              switch (_context5.prev = _context5.next) {
                case 0:
                  buffer = void 0;
                  _context5.t0 = mime.toLowerCase();
                  _context5.next = _context5.t0 === 'image/webp' ? 4 : _context5.t0 === 'image/jpeg' ? 8 : _context5.t0 === 'image/jpg' ? 8 : _context5.t0 === 'image/png' ? 12 : 12;
                  break;

                case 4:
                  _context5.next = 6;
                  return (0, _sharp2.default)(_this4.image).webp(outputOptions).toBuffer();

                case 6:
                  buffer = _context5.sent;
                  return _context5.abrupt('break', 16);

                case 8:
                  _context5.next = 10;
                  return (0, _sharp2.default)(_this4.image).jpeg(outputOptions).toBuffer();

                case 10:
                  buffer = _context5.sent;
                  return _context5.abrupt('break', 16);

                case 12:
                  _context5.next = 14;
                  return (0, _sharp2.default)(_this4.image).png(outputOptions).toBuffer();

                case 14:
                  buffer = _context5.sent;
                  return _context5.abrupt('break', 16);

                case 16:
                  resolve(buffer);

                case 17:
                case 'end':
                  return _context5.stop();
              }
            }
          }, _callee5, _this4);
        }));

        return function (_x10) {
          return _ref5.apply(this, arguments);
        };
      }());
    }
  }]);

  return Image;
}();

exports.default = Image;


module.exports = Image;
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _requestPromise = require('request-promise');

var _requestPromise2 = _interopRequireDefault(_requestPromise);

var _sharp = require('sharp');

var _sharp2 = _interopRequireDefault(_sharp);

var _lodash = require('lodash.find');

var _lodash2 = _interopRequireDefault(_lodash);

var _lodash3 = require('lodash.uniqby');

var _lodash4 = _interopRequireDefault(_lodash3);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _image = require('./image');

var _image2 = _interopRequireDefault(_image);

var _marker = require('./marker');

var _marker2 = _interopRequireDefault(_marker);

var _polyline = require('./polyline');

var _polyline2 = _interopRequireDefault(_polyline);

var _asyncQueue = require('./helper/asyncQueue');

var _asyncQueue2 = _interopRequireDefault(_asyncQueue);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

require('./helper/helper');

/* transform longitude to tile number */
var lonToX = function lonToX(lon, zoom) {
  return (lon + 180) / 360 * Math.pow(2, zoom);
};
/* transform latitude to tile number */
var latToY = function latToY(lat, zoom) {
  return (1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom);
};

var yToLat = function yToLat(y, zoom) {
  return Math.atan(Math.sinh(Math.PI * (1 - 2 * y / Math.pow(2, zoom)))) / Math.PI * 180;
};

var xToLon = function xToLon(x, zoom) {
  return x / Math.pow(2, zoom) * 360 - 180;
};

var StaticMaps = function () {
  function StaticMaps() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, StaticMaps);

    this.options = options;

    this.width = this.options.width;
    this.height = this.options.height;
    this.paddingX = this.options.paddingX || 0;
    this.paddingY = this.options.paddingY || 0;
    this.padding = [this.paddingX, this.paddingY];
    this.tileUrl = this.options.tileUrl || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
    this.tileSize = this.options.tileSize || 256;
    this.tileRequestTimeout = this.options.tileRequestTimeout;
    this.tileRequestHeader = this.options.tileRequestHeader;
    this.reverseY = this.options.reverseY || false;

    // # features
    this.markers = [];
    this.lines = [];
    this.polygons = [];

    // # fields that get set when map is rendered
    this.center = [];
    this.centerX = 0;
    this.centerY = 0;
    this.zoom = 0;
  }

  _createClass(StaticMaps, [{
    key: 'addLine',
    value: function addLine(options) {
      this.lines.push(new _polyline2.default(options));
    }
  }, {
    key: 'addMarker',
    value: function addMarker(options) {
      this.markers.push(new _marker2.default(options));
    }
  }, {
    key: 'addPolygon',
    value: function addPolygon(options) {
      this.lines.push(new _polyline2.default(options));
    }

    /**
      * Render static map with all map features that were added to map before
      */

  }, {
    key: 'render',
    value: function render(center, zoom) {
      if (!this.lines && !this.markers && !this.polygons && !(center && zoom)) {
        throw new Error('Cannot render empty map: Add  center || lines || markers || polygons.');
      }

      this.center = center;
      this.zoom = zoom || this.calculateZoom();

      if (center && center.length === 2) {
        this.centerX = lonToX(center[0], this.zoom);
        this.centerY = latToY(center[1], this.zoom);
      } else {
        // # get extent of all lines
        var extent = this.determineExtent(this.zoom);

        // # calculate center point of map
        var centerLon = (extent[0] + extent[2]) / 2;
        var centerLat = (extent[1] + extent[3]) / 2;

        this.centerX = lonToX(centerLon, this.zoom);
        this.centerY = latToY(centerLat, this.zoom);
      }

      this.image = new _image2.default(this.options);

      return this.drawBaselayer().then(this.drawFeatures.bind(this));
    }

    /**
      * calculate common extent of all current map features
      */

  }, {
    key: 'determineExtent',
    value: function determineExtent(zoom) {
      var extents = [];

      // Add bbox to extent
      if (this.center && this.center.length >= 4) extents.push(this.center);

      // Add polylines and polygons to extent
      if (this.lines.length) {
        this.lines.forEach(function (line) {
          extents.push(line.extent());
        });
      } // extents.push(this.lines.map(function(line){ return line.extent(); }));

      // Add marker to extent
      for (var i = 0; i < this.markers.length; i++) {
        var marker = this.markers[i];
        var e = [marker.coord[0], marker.coord[1]];

        if (!zoom) {
          extents.push([marker.coord[0], marker.coord[1], marker.coord[0], marker.coord[1]]);
          continue;
        }

        // # consider dimension of marker
        var ePx = marker.extentPx();
        var x = lonToX(e[0], zoom);
        var y = latToY(e[1], zoom);

        extents.push([xToLon(x - parseFloat(ePx[0]) / this.tileSize, zoom), yToLat(y + parseFloat(ePx[1]) / this.tileSize, zoom), xToLon(x + parseFloat(ePx[2]) / this.tileSize, zoom), yToLat(y - parseFloat(ePx[3]) / this.tileSize, zoom)]);
      }

      return [extents.map(function (e) {
        return e[0];
      }).min(), extents.map(function (e) {
        return e[1];
      }).min(), extents.map(function (e) {
        return e[2];
      }).max(), extents.map(function (e) {
        return e[3];
      }).max()];
    }

    /**
      * calculate the best zoom level for given extent
      */

  }, {
    key: 'calculateZoom',
    value: function calculateZoom() {
      for (var z = 17; z > 0; z--) {
        var extent = this.determineExtent(z);
        var width = (lonToX(extent[2], z) - lonToX(extent[0], z)) * this.tileSize;
        if (width > this.width - this.padding[0] * 2) continue;

        var height = (latToY(extent[1], z) - latToY(extent[3], z)) * this.tileSize;
        if (height > this.height - this.padding[1] * 2) continue;

        return z;
      }
      return null;
    }

    /**
      * transform tile number to pixel on image canvas
      */

  }, {
    key: 'xToPx',
    value: function xToPx(x) {
      var px = (x - this.centerX) * this.tileSize + this.width / 2;
      return Number(Math.round(px));
    }

    /**
      * transform tile number to pixel on image canvas
      */

  }, {
    key: 'yToPx',
    value: function yToPx(y) {
      var px = (y - this.centerY) * this.tileSize + this.height / 2;
      return Number(Math.round(px));
    }
  }, {
    key: 'drawBaselayer',
    value: function drawBaselayer() {
      var _this = this;

      var xMin = Math.floor(this.centerX - 0.5 * this.width / this.tileSize);
      var yMin = Math.floor(this.centerY - 0.5 * this.height / this.tileSize);
      var xMax = Math.ceil(this.centerX + 0.5 * this.width / this.tileSize);
      var yMax = Math.ceil(this.centerY + 0.5 * this.height / this.tileSize);

      var result = [];

      for (var x = xMin; x < xMax; x++) {
        for (var y = yMin; y < yMax; y++) {
          // # x and y may have crossed the date line
          var maxTile = Math.pow(2, this.zoom);
          var tileX = (x + maxTile) % maxTile;
          var tileY = (y + maxTile) % maxTile;
          if (this.reverseY) tileY = (1 << this.zoom) - tileY - 1;

          result.push({
            url: this.tileUrl.replace('{z}', this.zoom).replace('{x}', tileX).replace('{y}', tileY),
            box: [this.xToPx(x), this.yToPx(y), this.xToPx(x + 1), this.yToPx(y + 1)]
          });
        }
      }

      var tilePromises = [];
      result.forEach(function (r) {
        tilePromises.push(_this.getTile(r));
      });

      return new Promise(function (resolve, reject) {
        Promise.all(tilePromises).then(function (tiles) {
          return _this.image.draw(tiles);
        }).then(resolve).catch(reject);
      });
    }
  }, {
    key: 'drawFeatures',
    value: function drawFeatures() {
      return this.drawLines().then(this.loadMarker.bind(this)).then(this.drawMarker.bind(this));
    }
  }, {
    key: 'drawLines',
    value: function drawLines() {
      var _this2 = this;

      return new Promise(function () {
        var _ref = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee2(resolve) {
          var queue;
          return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  if (!_this2.lines.length) resolve(true);

                  queue = [];

                  _this2.lines.forEach(function (line) {
                    queue.push(_asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
                      return _regenerator2.default.wrap(function _callee$(_context) {
                        while (1) {
                          switch (_context.prev = _context.next) {
                            case 0:
                              _context.next = 2;
                              return _this2.draw(line);

                            case 2:
                            case 'end':
                              return _context.stop();
                          }
                        }
                      }, _callee, _this2);
                    })));
                  });
                  _context2.next = 5;
                  return (0, _asyncQueue2.default)(queue);

                case 5:
                  resolve(true);

                case 6:
                case 'end':
                  return _context2.stop();
              }
            }
          }, _callee2, _this2);
        }));

        return function (_x2) {
          return _ref.apply(this, arguments);
        };
      }());
    }

    /**
     * Draw a polyline/polygon on a baseimage
     */

  }, {
    key: 'draw',
    value: function () {
      var _ref3 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee3(line) {
        var _this3 = this;

        var type, baseImage;
        return _regenerator2.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                type = line.type;
                baseImage = (0, _sharp2.default)(this.image.image);
                return _context3.abrupt('return', new Promise(function (resolve, reject) {
                  var points = line.coords.map(function (coord) {
                    return [_this3.xToPx(lonToX(coord[0], _this3.zoom)), _this3.yToPx(latToY(coord[1], _this3.zoom))];
                  });

                  baseImage.metadata().then(function (imageMetadata) {
                    var svgPath = '\n            <svg\n              width="' + imageMetadata.width + 'px"\n              height="' + imageMetadata.height + '"\n              version="1.1"\n              xmlns="http://www.w3.org/2000/svg">\n              <' + (type === 'polyline' ? 'polyline' : 'polygon') + '\n                style="fill-rule: inherit;"\n                points="' + points.join(' ') + '"\n                stroke="' + line.color + '"\n                fill="' + (line.fill ? line.fill : 'none') + '"\n                stroke-width="' + line.width + '"/>\n            </svg>';

                    baseImage.overlayWith(Buffer.from(svgPath), { top: 0, left: 0 }).toBuffer().then(function (buffer) {
                      _this3.image.image = buffer;
                      resolve(buffer);
                    }).catch(reject);
                  }).catch(reject);
                }));

              case 3:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function draw(_x3) {
        return _ref3.apply(this, arguments);
      }

      return draw;
    }()
  }, {
    key: 'drawMarker',
    value: function drawMarker() {
      var _this4 = this;

      return new Promise(function () {
        var _ref4 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee5(resolve) {
          var queue;
          return _regenerator2.default.wrap(function _callee5$(_context5) {
            while (1) {
              switch (_context5.prev = _context5.next) {
                case 0:
                  queue = [];

                  _this4.markers.forEach(function (marker) {
                    queue.push(_asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {
                      return _regenerator2.default.wrap(function _callee4$(_context4) {
                        while (1) {
                          switch (_context4.prev = _context4.next) {
                            case 0:
                              _context4.next = 2;
                              return (0, _sharp2.default)(_this4.image.image).overlayWith(marker.imgData, {
                                top: Math.round(marker.position[1]),
                                left: Math.round(marker.position[0])
                              }).toBuffer();

                            case 2:
                              _this4.image.image = _context4.sent;

                            case 3:
                            case 'end':
                              return _context4.stop();
                          }
                        }
                      }, _callee4, _this4);
                    })));
                  });
                  _context5.next = 4;
                  return (0, _asyncQueue2.default)(queue);

                case 4:
                  resolve(true);

                case 5:
                case 'end':
                  return _context5.stop();
              }
            }
          }, _callee5, _this4);
        }));

        return function (_x4) {
          return _ref4.apply(this, arguments);
        };
      }());
    }

    /**
      *   Preloading the icon image
      */

  }, {
    key: 'loadMarker',
    value: function loadMarker() {
      var _this5 = this;

      return new Promise(function (resolve, reject) {
        if (!_this5.markers.length) resolve(true);
        var icons = (0, _lodash4.default)(_this5.markers.map(function (m) {
          return { file: m.img };
        }), 'file');

        var count = 1;
        icons.forEach(function () {
          var _ref6 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee6(ico) {
            var icon, isUrl, img;
            return _regenerator2.default.wrap(function _callee6$(_context6) {
              while (1) {
                switch (_context6.prev = _context6.next) {
                  case 0:
                    icon = ico;
                    isUrl = !!_url2.default.parse(icon.file).hostname;
                    _context6.prev = 2;

                    if (!isUrl) {
                      _context6.next = 12;
                      break;
                    }

                    _context6.next = 6;
                    return _requestPromise2.default.get({
                      rejectUnauthorized: false,
                      url: icon.file,
                      encoding: null
                    });

                  case 6:
                    img = _context6.sent;
                    _context6.next = 9;
                    return (0, _sharp2.default)(img).toBuffer();

                  case 9:
                    icon.data = _context6.sent;
                    _context6.next = 15;
                    break;

                  case 12:
                    _context6.next = 14;
                    return (0, _sharp2.default)(icon.file).toBuffer();

                  case 14:
                    icon.data = _context6.sent;

                  case 15:
                    _context6.next = 20;
                    break;

                  case 17:
                    _context6.prev = 17;
                    _context6.t0 = _context6['catch'](2);

                    reject(_context6.t0);

                  case 20:

                    if (count++ === icons.length) {
                      // Pre loaded all icons
                      _this5.markers.forEach(function (mark) {
                        var marker = mark;
                        marker.position = [_this5.xToPx(lonToX(marker.coord[0], _this5.zoom)) - marker.offset[0], _this5.yToPx(latToY(marker.coord[1], _this5.zoom)) - marker.offset[1]];
                        var imgData = (0, _lodash2.default)(icons, { file: marker.img });
                        marker.set(imgData.data);
                      });

                      resolve(true);
                    }

                  case 21:
                  case 'end':
                    return _context6.stop();
                }
              }
            }, _callee6, _this5, [[2, 17]]);
          }));

          return function (_x5) {
            return _ref6.apply(this, arguments);
          };
        }());
      });
    }

    /**
     *  Fetching tiles from endpoint
     */

  }, {
    key: 'getTile',
    value: function getTile(data) {
      var _this6 = this;

      return new Promise(function (resolve, reject) {
        var options = {
          url: data.url,
          encoding: null,
          resolveWithFullResponse: true
        };

        if (_this6.tileRequestTimeout) options.timeout = _this6.tileRequestTimeout;
        if (_this6.tileRequestHeader) options.headers = _this6.tileRequestHeader;

        _requestPromise2.default.get(options).then(function (res) {
          resolve({
            url: data.url,
            box: data.box,
            body: res.body
          });
        }).catch(reject);
      });
    }
  }]);

  return StaticMaps;
}();

exports.default = StaticMaps;

module.exports = StaticMaps;
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var workOnQueue = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee(queue) {
    var index = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (queue[index]) {
              _context.next = 2;
              break;
            }

            return _context.abrupt("return", true);

          case 2:
            _context.next = 4;
            return queue[index]();

          case 4:
            _context.next = 6;
            return workOnQueue(queue, index + 1);

          case 6:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function workOnQueue(_x2) {
    return _ref.apply(this, arguments);
  };
}();

exports.default = workOnQueue;
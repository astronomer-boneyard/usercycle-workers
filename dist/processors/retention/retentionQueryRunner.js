'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _import = require('lodash');

var _import2 = _interopRequireWildcard(_import);

var _stampit = require('stampit');

var _stampit2 = _interopRequireWildcard(_stampit);

var retentionQueryRunner = _stampit2['default']().enclose(function () {

  this.process = regeneratorRuntime.mark(function callee$1$0(job, done) {
    return regeneratorRuntime.wrap(function callee$1$0$(context$2$0) {
      while (1) switch (context$2$0.prev = context$2$0.next) {
        case 0:
          console.log('QueryRUNNER!!!!!!!!!!!!');
          done();

        case 2:
        case 'end':
          return context$2$0.stop();
      }
    }, callee$1$0, this);
  });
});

exports['default'] = _stampit2['default'].compose(retentionQueryRunner);
module.exports = exports['default'];
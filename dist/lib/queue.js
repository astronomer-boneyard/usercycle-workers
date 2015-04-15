'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _kue = require('kue');

var _kue2 = _interopRequireWildcard(_kue);

// Setup kue
var queue = _kue2['default'].createQueue();

// Start GUI server
var server = _kue2['default'].app.listen(8080);

exports['default'] = queue;
module.exports = exports['default'];
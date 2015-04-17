'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _stampit = require('stampit');

var _stampit2 = _interopRequireWildcard(_stampit);

var _queue = require('../../lib/queue');

var _queue2 = _interopRequireWildcard(_queue);

exports['default'] = _stampit2['default']().enclose(function () {

  this.createJob = function (jobType, data) {
    var job = _queue2['default'].create(jobType, data).removeOnComplete(true).save();
  };
});
module.exports = exports['default'];
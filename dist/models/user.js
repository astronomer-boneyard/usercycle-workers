'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireWildcard(_mongoose);

var schema = new _mongoose2['default'].Schema({
  _id: String,
  createdAt: Date,
  emails: [],
  profile: {}
});

schema.statics.findDemoEmailsForIntervals = function (intervals) {
  return this.find({ 'profile.demoEmail': { $in: intervals } }).exec();
};

exports['default'] = _mongoose2['default'].model('User', schema, 'users');
module.exports = exports['default'];
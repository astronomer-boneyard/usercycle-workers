'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireWildcard(_mongoose);

var schema = new _mongoose2['default'].Schema({
  _id: String,
  viewId: String,
  cohortInterval: String,
  cohortDate: Date,
  cohortSize: Number,
  measurementDate: Date,
  measurementValue: Number
});

exports['default'] = _mongoose2['default'].model('Retention', schema, 'retention');
module.exports = exports['default'];
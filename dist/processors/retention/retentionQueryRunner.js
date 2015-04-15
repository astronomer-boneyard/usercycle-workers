'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _import = require('lodash');

var _import2 = _interopRequireWildcard(_import);

var _stampit = require('stampit');

var _stampit2 = _interopRequireWildcard(_stampit);

var _funnelQueryRunner = require('../lib/funnelQueryRunner');

var _funnelQueryRunner2 = _interopRequireWildcard(_funnelQueryRunner);

var retentionQueryRunner = _stampit2['default']().enclose(function () {});

exports['default'] = _stampit2['default'].compose(_funnelQueryRunner2['default'], retentionQueryRunner);
module.exports = exports['default'];
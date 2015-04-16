'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _import = require('lodash');

var _import2 = _interopRequireWildcard(_import);

var _stampit = require('stampit');

var _stampit2 = _interopRequireWildcard(_stampit);

var _Retention = require('../../models/retention');

var _Retention2 = _interopRequireWildcard(_Retention);

var _funnelQueryRunner = require('../lib/funnelQueryRunner');

var _funnelQueryRunner2 = _interopRequireWildcard(_funnelQueryRunner);

var retentionQueryRunner = _stampit2['default']().enclose(function () {
  this.handleResponse = regeneratorRuntime.mark(function callee$1$0(response) {
    var steps, result, viewId, cohortInterval, cohortDate, cohortSize, measurementDate, measurementValue, selector, modifier;
    return regeneratorRuntime.wrap(function callee$1$0$(context$2$0) {
      while (1) switch (context$2$0.prev = context$2$0.next) {
        case 0:
          steps = response.steps;
          result = response.result;
          viewId = this.job.data.viewId, cohortInterval = this.job.data.cohortInterval, cohortDate = new Date(steps[0].timeframe.start), cohortSize = result[0], measurementDate = new Date(steps[1].timeframe.start), measurementValue = result[0] - result[result.length - 1];
          selector = { viewId: viewId, cohortInterval: cohortInterval, cohortDate: cohortDate, measurementDate: measurementDate };
          modifier = { $set: { cohortSize: cohortSize, measurementValue: measurementValue } };
          context$2$0.next = 7;
          return _Retention2['default'].update(selector, modifier, { upsert: true });

        case 7:
          console.log(selector);

        case 8:
        case 'end':
          return context$2$0.stop();
      }
    }, callee$1$0, this);
  });
});

exports['default'] = _stampit2['default'].compose(_funnelQueryRunner2['default'], retentionQueryRunner);
module.exports = exports['default'];
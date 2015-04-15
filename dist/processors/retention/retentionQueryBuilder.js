'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _import = require('lodash');

var _import2 = _interopRequireWildcard(_import);

var _stampit = require('stampit');

var _stampit2 = _interopRequireWildcard(_stampit);

var _util = require('../../lib/util');

var _util2 = _interopRequireWildcard(_util);

var _queue = require('../../lib/queue');

var _queue2 = _interopRequireWildcard(_queue);

var _funnelQueryBuilder = require('../lib/funnelQueryBuilder');

var _funnelQueryBuilder2 = _interopRequireWildcard(_funnelQueryBuilder);

var retentionQueryBuilder = _stampit2['default']().enclose(function () {

  this.pushQuery = function (view, cohortStart, cohortEnd, queryStart, queryEnd) {
    var steps = [];

    steps.push({
      event_collection: view.start.event,
      actor_property: view.start.actor,
      timeframe: { start: cohortStart, end: cohortEnd },
      filters: _util2['default'].processFilters(view.start.filters)
    });

    _import2['default'].each(view.end.events, function (ev) {
      steps.push({
        event_collection: ev.event,
        actor_property: ev.actor,
        timeframe: { start: queryStart, end: queryEnd },
        inverted: true,
        filters: _util2['default'].processFilters(view.end.filters)
      });
    });

    _queue2['default'].create('retentionQueryRunner', {
      viewId: 'j74dvzrWjf5qm3tSH',
      cohortInterval: 'day',
      query: steps
    }).removeOnComplete(true).save();
  };
});

exports['default'] = _stampit2['default'].compose(_funnelQueryBuilder2['default'], retentionQueryBuilder);
module.exports = exports['default'];
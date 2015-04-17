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

var _progressJobCreator = require('../lib/progressJobCreator');

var _progressJobCreator2 = _interopRequireWildcard(_progressJobCreator);

var _funnelQueryBuilder = require('../lib/funnelQueryBuilder');

var _funnelQueryBuilder2 = _interopRequireWildcard(_funnelQueryBuilder);

var retentionQueryBuilder = _stampit2['default']().enclose(function (job, done) {

  this.pushQuery = function (view, cohortInterval, cohortStart, cohortEnd, queryStart, queryEnd) {
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

    this.createJob('retentionQueryRunner', {
      title: 'Retention query - ' + view.project.name + ': ' + view.name,
      viewId: view._id,
      cohortInterval: cohortInterval,
      steps: steps
    });
  };
});

exports['default'] = _stampit2['default'].compose(_progressJobCreator2['default'], _funnelQueryBuilder2['default'], retentionQueryBuilder);
module.exports = exports['default'];
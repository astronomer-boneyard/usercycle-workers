'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _import = require('lodash');

var _import2 = _interopRequireWildcard(_import);

var _stampit = require('stampit');

var _stampit2 = _interopRequireWildcard(_stampit);

var _moment = require('moment');

var _moment2 = _interopRequireWildcard(_moment);

var _util = require('../../lib/util');

var _util2 = _interopRequireWildcard(_util);

var _View = require('../../models/view');

var _View2 = _interopRequireWildcard(_View);

var _Project = require('../../models/project');

var _Project2 = _interopRequireWildcard(_Project);

exports['default'] = _stampit2['default']().enclose(function () {

  this.pushQuery = function (view, cohortStart, cohortEnd, queryStart, queryEnd) {
    throw new Error('pushQuery not implemented!');
  };

  this.generateQueries = function (view, cohortInterval, intervalCount, cohortStart, cohortEnd) {
    // Default to total intervals (full load).  Override getIntervalCount to change.
    var intervals = this.getIntervalCount ? this.getIntervalCount() : intervalCount;

    for (var i = intervals; i >= 0; i--) {
      var queryDay = _moment2['default'].utc().subtract(i, '' + cohortInterval + 's');
      var queryStart = queryDay.startOf(cohortInterval).format();
      var queryEnd = queryDay.endOf(cohortInterval).format();
      this.pushQuery(view, cohortStart, cohortEnd, queryStart, queryEnd);
    }
  };

  this.process = regeneratorRuntime.mark(function callee$1$0(job, done) {
    var _job$data, viewId, cohortInterval, view, project, firstStartEvent, totalIntervalsSinceSignup, minTotalIntervalsSinceSignup, firstEndEvent, totalIntervalsSinceRetention, minTotalPeriodsSinceRetention, i, cohortDay, cohortStart, cohortEnd, periodsToQuery, cohortEndDay;

    return regeneratorRuntime.wrap(function callee$1$0$(context$2$0) {
      while (1) switch (context$2$0.prev = context$2$0.next) {
        case 0:
          _job$data = job.data;
          viewId = _job$data.viewId;
          cohortInterval = _job$data.cohortInterval;
          context$2$0.next = 5;
          return _View2['default'].findOne({ _id: viewId }).exec();

        case 5:
          view = context$2$0.sent;

          if (view) {
            context$2$0.next = 8;
            break;
          }

          return context$2$0.abrupt('return');

        case 8:
          context$2$0.next = 10;
          return view.project();

        case 10:
          project = context$2$0.sent;

          if (project) {
            context$2$0.next = 13;
            break;
          }

          return context$2$0.abrupt('return');

        case 13:

          console.log('Building ' + cohortInterval + ' queries for ' + project.name);

          context$2$0.next = 16;
          return view.firstStartEventForInterval(cohortInterval);

        case 16:
          firstStartEvent = context$2$0.sent;
          totalIntervalsSinceSignup = _moment2['default'].utc().diff(firstStartEvent, '' + cohortInterval + 's');
          minTotalIntervalsSinceSignup = Math.min(totalIntervalsSinceSignup, _util2['default'].MAX_COHORTS_PER_INTERVAL);
          context$2$0.next = 21;
          return view.firstEndEventForInterval(cohortInterval);

        case 21:
          firstEndEvent = context$2$0.sent;
          totalIntervalsSinceRetention = _moment2['default'].utc().diff(firstEndEvent, '' + cohortInterval + 's');
          minTotalPeriodsSinceRetention = Math.min(totalIntervalsSinceRetention, _util2['default'].MAX_COHORTS_PER_INTERVAL);

          for (i = minTotalIntervalsSinceSignup; i >= 0; i--) {
            cohortDay = _moment2['default'].utc().subtract(i, '' + cohortInterval + 's');
            cohortStart = cohortDay.startOf(cohortInterval).format();
            cohortEnd = cohortDay.endOf(cohortInterval).format();
            periodsToQuery = Math.min(i, minTotalPeriodsSinceRetention);

            this.generateQueries(view, cohortInterval, periodsToQuery, cohortStart, cohortEnd);
          }

          if (totalIntervalsSinceSignup > _util2['default'].MAX_COHORTS_PER_INTERVAL) {
            cohortStart = firstStartEvent.startOf(cohortInterval).format();
            cohortEndDay = _moment2['default'].utc().subtract(minTotalIntervalsSinceSignup, '' + cohortInterval + 's');
            cohortEnd = cohortEndDay.endOf(cohortInterval).format();

            this.generateQueries(view, cohortInterval, totalIntervalsSinceRetention, cohortStart, cohortEnd);
          }

          done();

        case 27:
        case 'end':
          return context$2$0.stop();
      }
    }, callee$1$0, this);
  });
});
module.exports = exports['default'];
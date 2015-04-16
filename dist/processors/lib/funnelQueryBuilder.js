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

//
// Main funnel query processor
// Overridable: {Required} pushQuery()
//              {Optional} getIntervalCount()
//
exports['default'] = _stampit2['default']().enclose(function () {

  this.process = regeneratorRuntime.mark(function callee$1$0() {
    var _job$data, viewId, cohortInterval, view;

    return regeneratorRuntime.wrap(function callee$1$0$(context$2$0) {
      var _this = this;

      while (1) switch (context$2$0.prev = context$2$0.next) {
        case 0:
          _job$data = this.job.data;
          viewId = _job$data.viewId;
          cohortInterval = _job$data.cohortInterval;
          context$2$0.next = 5;
          return _View2['default'].findOne({ _id: viewId }).populate({ path: 'project' }).exec();

        case 5:
          view = context$2$0.sent;

          if (!view) this.done(new Error('View does not exist'));

          context$2$0.next = 9;
          return _import2['default'].map(_util2['default'].INTERVALS, function (cohortInterval) {
            return _this.generateForInterval(view, cohortInterval);
          });

        case 9:

          this.done();

        case 10:
        case 'end':
          return context$2$0.stop();
      }
    }, callee$1$0, this);
  });

  this.generateForInterval = regeneratorRuntime.mark(function callee$1$1(view, cohortInterval) {
    var firstStartEvent, totalIntervalsSinceSignup, minTotalIntervalsSinceSignup, firstEndEvent, totalIntervalsSinceRetention, minTotalPeriodsSinceRetention, i, cohortDay, cohortStart, cohortEnd, intervalsToQuery, cohortEndDay;
    return regeneratorRuntime.wrap(function callee$1$1$(context$2$0) {
      while (1) switch (context$2$0.prev = context$2$0.next) {
        case 0:
          console.log('Building ' + cohortInterval + ' queries for ' + view.project.name);

          context$2$0.next = 3;
          return view.firstStartEventForInterval(cohortInterval);

        case 3:
          firstStartEvent = context$2$0.sent;
          totalIntervalsSinceSignup = _moment2['default'].utc().diff(firstStartEvent, '' + cohortInterval + 's');
          minTotalIntervalsSinceSignup = Math.min(totalIntervalsSinceSignup, _util2['default'].MAX_COHORTS_PER_INTERVAL);
          context$2$0.next = 8;
          return view.firstEndEventForInterval(cohortInterval);

        case 8:
          firstEndEvent = context$2$0.sent;
          totalIntervalsSinceRetention = _moment2['default'].utc().diff(firstEndEvent, '' + cohortInterval + 's');
          minTotalPeriodsSinceRetention = Math.min(totalIntervalsSinceRetention, _util2['default'].MAX_COHORTS_PER_INTERVAL);

          for (i = minTotalIntervalsSinceSignup; i >= 0; i--) {
            cohortDay = _moment2['default'].utc().subtract(i, '' + cohortInterval + 's');
            cohortStart = cohortDay.startOf(cohortInterval).format();
            cohortEnd = cohortDay.endOf(cohortInterval).format();
            intervalsToQuery = Math.min(i, minTotalPeriodsSinceRetention);

            this.generateForCohort(view, cohortInterval, intervalsToQuery, cohortStart, cohortEnd);
          }

          if (totalIntervalsSinceSignup > _util2['default'].MAX_COHORTS_PER_INTERVAL) {
            cohortStart = firstStartEvent.startOf(cohortInterval).format();
            cohortEndDay = _moment2['default'].utc().subtract(minTotalIntervalsSinceSignup, '' + cohortInterval + 's');
            cohortEnd = cohortEndDay.endOf(cohortInterval).format();

            this.generateForCohort(view, cohortInterval, totalIntervalsSinceRetention, cohortStart, cohortEnd);
          }

        case 13:
        case 'end':
          return context$2$0.stop();
      }
    }, callee$1$1, this);
  });

  this.generateForCohort = function (view, cohortInterval, intervalsToQuery, cohortStart, cohortEnd) {
    // Default to total intervals (full load).  Override getIntervalCount to change.
    var intervals = this.getIntervalCount ? this.getIntervalCount() : intervalsToQuery;

    for (var i = intervals; i >= 0; i--) {
      var queryDay = _moment2['default'].utc().subtract(i, '' + cohortInterval + 's');
      var queryStart = queryDay.startOf(cohortInterval).format();
      var queryEnd = queryDay.endOf(cohortInterval).format();
      this.pushQuery(view, cohortInterval, cohortStart, cohortEnd, queryStart, queryEnd);
    }
  };

  this.pushQuery = function (view, cohortInterval, cohortStart, cohortEnd, queryStart, queryEnd) {
    throw new Error('pushQuery not implemented!');
  };
});
module.exports = exports['default'];
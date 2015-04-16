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

var _emails = require('../../lib/emails');

var _emails2 = _interopRequireWildcard(_emails);

var _View = require('../../models/view');

var _View2 = _interopRequireWildcard(_View);

var _Project = require('../../models/project');

var _Project2 = _interopRequireWildcard(_Project);

var _Retention = require('../../models/retention');

var _Retention2 = _interopRequireWildcard(_Retention);

var _User = require('../../models/user');

var _User2 = _interopRequireWildcard(_User);

exports['default'] = _stampit2['default']().enclose(function () {

  var generateDataForInterval = regeneratorRuntime.mark(function generateDataForInterval(view, interval) {
    var isOver, first, totalCohortCount, cohortCount, startInterval, recentCohorts, i, cohortDate, userStats, retentionStats, mostRecentPeriod, allNewUsers, allActiveUsers, allRetainedUsers, newUsers, activeUsers, previousPeriodRetention;
    return regeneratorRuntime.wrap(function generateDataForInterval$(context$2$0) {
      while (1) switch (context$2$0.prev = context$2$0.next) {
        case 0:
          isOver = isStartOf(interval);
          context$2$0.next = 3;
          return view.firstStartEventForInterval(interval);

        case 3:
          first = context$2$0.sent;
          totalCohortCount = _moment2['default'].utc().diff(first, '' + interval + 's');
          cohortCount = Math.min(totalCohortCount, _util2['default'].MAX_COHORTS_PER_INTERVAL);

          if (!(cohortCount === 0)) {
            context$2$0.next = 8;
            break;
          }

          return context$2$0.abrupt('return');

        case 8:
          startInterval = isOver ? 1 : 0;
          recentCohorts = [];
          i = startInterval;

        case 11:
          if (!(i <= cohortCount)) {
            context$2$0.next = 23;
            break;
          }

          cohortDate = _moment2['default'].utc().subtract(i, '' + interval + 's').startOf(interval);
          context$2$0.next = 15;
          return fetchUserStats(view, cohortDate, interval);

        case 15:
          userStats = context$2$0.sent;
          context$2$0.next = 18;
          return fetchRetentionStats(view, cohortDate, interval);

        case 18:
          retentionStats = context$2$0.sent;

          recentCohorts.push(_import2['default'].extend(userStats, retentionStats));

        case 20:
          i++;
          context$2$0.next = 11;
          break;

        case 23:
          mostRecentPeriod = recentCohorts[0];
          allNewUsers = _import2['default'].pluck(recentCohorts, 'newUserCount');
          allActiveUsers = _import2['default'].pluck(recentCohorts, 'activeUserCount');
          allRetainedUsers = _import2['default'].pluck(recentCohorts, 'retainedUserPercentage');
          newUsers = {
            count: mostRecentPeriod.newUserCount,
            pct: calcPercentage(allNewUsers.slice(1), allNewUsers[0])
          };
          activeUsers = {
            count: mostRecentPeriod.activeUserCount,
            pct: calcPercentage(allActiveUsers.slice(1), allActiveUsers[0])
          };
          previousPeriodRetention = {
            percentage: mostRecentPeriod.retainedUserPercentage,
            pct: calcPercentage(allRetainedUsers.slice(1), allRetainedUsers[0])
          };

          if (isOver) {
            newUsers.grade = calcGrade(allNewUsers.slice(0), allNewUsers[0]);
            newUsers.best = calcBest(allNewUsers.slice(1), allNewUsers[0]);
            activeUsers.grade = calcGrade(allActiveUsers.slice(0), allActiveUsers[0]);
            activeUsers.best = calcBest(allActiveUsers.slice(1), allActiveUsers[0]);
            previousPeriodRetention.grade = calcGrade(allRetainedUsers.slice(0), allRetainedUsers[0]);
            previousPeriodRetention.best = calcBest(allRetainedUsers.slice(1), allRetainedUsers[0]);
          }

          return context$2$0.abrupt('return', { isOver: isOver, newUsers: newUsers, activeUsers: activeUsers, previousPeriodRetention: previousPeriodRetention });

        case 32:
        case 'end':
          return context$2$0.stop();
      }
    }, generateDataForInterval, this);
  });

  var fetchUserStats = regeneratorRuntime.mark(function fetchUserStats(view, date, interval) {
    var retention, newUsers, newUserCount, activeUserCount;
    return regeneratorRuntime.wrap(function fetchUserStats$(context$2$0) {
      while (1) switch (context$2$0.prev = context$2$0.next) {
        case 0:
          context$2$0.next = 2;
          return _Retention2['default'].find({
            viewId: view._id,
            measurementDate: date.toDate(),
            cohortInterval: interval
          }).exec();

        case 2:
          retention = context$2$0.sent;
          newUsers = _import2['default'].find(retention, function (r) {
            return _moment2['default'](r.cohortDate).isSame(date);
          });
          newUserCount = (newUsers || {}).measurementValue || 0;
          activeUserCount = _import2['default'].sum(_import2['default'].pluck(retention, 'measurementValue'));
          return context$2$0.abrupt('return', { newUserCount: newUserCount, activeUserCount: activeUserCount });

        case 7:
        case 'end':
          return context$2$0.stop();
      }
    }, fetchUserStats, this);
  });

  var fetchRetentionStats = regeneratorRuntime.mark(function fetchRetentionStats(view, date, interval) {
    var measurementDate, cohortDate, retained, retainedUserCount, retainedUserPercentage;
    return regeneratorRuntime.wrap(function fetchRetentionStats$(context$2$0) {
      while (1) switch (context$2$0.prev = context$2$0.next) {
        case 0:
          measurementDate = _moment2['default'].utc(date);
          cohortDate = date.subtract(1, '' + interval + 's').startOf(interval);
          context$2$0.next = 4;
          return _Retention2['default'].findOne({
            viewId: view._id,
            cohortInterval: interval,
            cohortDate: cohortDate.toDate(),
            measurementDate: measurementDate.toDate()
          }).exec();

        case 4:
          retained = context$2$0.sent;

          retained = retained || {};

          retainedUserCount = retained.measurementValue || 0;
          retainedUserPercentage = retained.cohortSize > 0 ? Math.round(retained.measurementValue / retained.cohortSize * 100) : 0;
          return context$2$0.abrupt('return', { retainedUserCount: retainedUserCount, retainedUserPercentage: retainedUserPercentage });

        case 9:
        case 'end':
          return context$2$0.stop();
      }
    }, fetchRetentionStats, this);
  });

  var isStartOf = function isStartOf(interval) {
    var today = _moment2['default'].utc().startOf('day');
    var startOfInterval = _moment2['default'].utc().startOf(interval);
    return today.isSame(startOfInterval);
  };

  var calcPercentage = function calcPercentage(values, actual) {
    var mean = calcMean(values);
    var val = Math.round(actual / mean * 100) - 100;
    if (mean === 0) {
      return '-';
    } else if (val < 0) {
      return '-' + Math.abs(val) + '%';
    } else {
      return '+' + val + '%';
    }
  };

  var calcMean = function calcMean(values) {
    return _import2['default'].sum(values) / values.length;
  };

  var calcMedian = function calcMedian(values) {
    var sortedValues = values.sort(function (a, b) {
      return a - b;
    });
    var half = Math.floor(sortedValues.length / 2);
    if (sortedValues.length % 2) {
      return sortedValues[half];
    } else {
      return Math.round((sortedValues[half - 1] + sortedValues[half]) / 2);
    }
  };

  var calcStdDev = function calcStdDev(values) {
    var median = calcMedian(values);
    var diffs = _import2['default'].map(values, function (val) {
      return Math.pow(val - median, 2);
    });
    return Math.sqrt(calcMean(diffs));
  };

  var calcGrade = function calcGrade(values, actual) {
    var median = calcMedian(values);
    var stdDev = calcStdDev(values);
    var diff = actual - median;
    var grade = diff / stdDev;
    if (grade > 1) {
      return 'A';
    } else if (grade > 0.2) {
      return 'B';
    } else if (grade > -0.4) {
      return 'C';
    } else if (grade > -1.3) {
      return 'D';
    } else {
      return 'F';
    }
  };

  var calcBest = function calcBest(values, actual) {
    var max = _import2['default'].max(values);
    return actual > max;
  };

  var mapEmails = function mapEmails(users) {
    return _import2['default'].map(users, function (u) {
      return u.emails[0].address;
    });
  };

  var sendEmails = regeneratorRuntime.mark(function sendEmails(view, bundle) {
    var intervals, userIds, users, addresses, demoUsers, demoEmails;
    return regeneratorRuntime.wrap(function sendEmails$(context$2$0) {
      while (1) switch (context$2$0.prev = context$2$0.next) {
        case 0:
          intervals = _import2['default'].filter(_util2['default'].INTERVALS, function (i) {
            return isStartOf(i);
          });
          userIds = _import2['default'].flattenDeep(_import2['default'].map(intervals, function (i) {
            return _import2['default'].pluck(view.emails, i);
          }));
          context$2$0.next = 4;
          return _User2['default'].find({ _id: { $in: userIds } }).select('emails.address').exec();

        case 4:
          users = context$2$0.sent;
          addresses = mapEmails(users);

          if (!view.project.isUsercycle) {
            context$2$0.next = 12;
            break;
          }

          context$2$0.next = 9;
          return _User2['default'].find({ 'profile.demoEmail': { $in: intervals } }).exec();

        case 9:
          demoUsers = context$2$0.sent;
          demoEmails = mapEmails(demoUsers);

          addresses = addresses.concat(demoEmails);

        case 12:

          _emails2['default'].send(addresses, 'daily', bundle);
          console.log('Summary emails sent for ' + view.project.name);

        case 14:
        case 'end':
          return context$2$0.stop();
      }
    }, sendEmails, this);
  });

  this.process = regeneratorRuntime.mark(function callee$1$0() {
    var viewId, view, bundle;
    return regeneratorRuntime.wrap(function callee$1$0$(context$2$0) {
      while (1) switch (context$2$0.prev = context$2$0.next) {
        case 0:
          viewId = this.job.data.viewId;
          context$2$0.next = 3;
          return _View2['default'].findOne({ _id: viewId }).populate({ path: 'project' }).exec();

        case 3:
          view = context$2$0.sent;

          if (!view) this.done(new Error('View does not exist'));

          console.log('Creating summary email for ' + view.project.name);

          bundle = { projectName: view.project.name };

          _util2['default'].INTERVALS.forEach(function (interval) {
            bundle[interval] = generateDataForInterval(view, interval);
          });

          context$2$0.next = 10;
          return bundle;

        case 10:
          context$2$0.t4 = context$2$0.sent;
          context$2$0.next = 13;
          return sendEmails(view, context$2$0.t4);

        case 13:

          this.done();

        case 14:
        case 'end':
          return context$2$0.stop();
      }
    }, callee$1$0, this);
  });
});
module.exports = exports['default'];
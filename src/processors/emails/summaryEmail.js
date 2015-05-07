import _ from 'lodash';
import stampit from 'stampit';
import moment from 'moment';
import util from '../../lib/util';
import emails from '../../lib/emails';
import View from '../../models/view';
import Project from '../../models/project';
import Retention from '../../models/retention';
import User from '../../models/user';

export default stampit().enclose(function(){

  let generateDataForInterval = function* (view, interval) {
    let isOver = isStartOf(interval);
    let first = yield view.firstStartEventForInterval(interval);
    let totalCohortCount = moment.utc().diff(first, `${interval}s`);
    let cohortCount = Math.min(totalCohortCount, util.MAX_COHORTS_PER_INTERVAL);

    if (cohortCount === 0) return;

    let startInterval = isOver ? 1 : 0;

    let recentCohorts = [];
    for (let i = startInterval; i <= cohortCount; i++) {
      let cohortDate = moment.utc().subtract(i, `${interval}s`).startOf(interval);
      let userStats = yield fetchUserStats(view, cohortDate, interval);
      let retentionStats = yield fetchRetentionStats(view, cohortDate, interval);
      recentCohorts.push(_.extend(userStats, retentionStats));
    }

    let mostRecentPeriod = recentCohorts[0];
    let allNewUsers = _.pluck(recentCohorts, 'newUserCount');
    let allActiveUsers = _.pluck(recentCohorts, 'activeUserCount');
    let allRetainedUsers = _.pluck(recentCohorts, 'retainedUserPercentage');

    let newUsers = {
      count: mostRecentPeriod.newUserCount,
      pct: calcPercentage(allNewUsers.slice(1), allNewUsers[0])
    };

    let activeUsers = {
      count: mostRecentPeriod.activeUserCount,
      pct: calcPercentage(allActiveUsers.slice(1), allActiveUsers[0])
    };

    let previousPeriodRetention = {
      percentage: mostRecentPeriod.retainedUserPercentage,
      pct: calcPercentage(allRetainedUsers.slice(1), allRetainedUsers[0])
    };

    if (isOver) {
      newUsers['grade'] = calcGrade(allNewUsers.slice(0), allNewUsers[0]);
      newUsers['best'] = calcBest(allNewUsers.slice(1), allNewUsers[0]);
      activeUsers['grade'] = calcGrade(allActiveUsers.slice(0), allActiveUsers[0]);
      activeUsers['best'] = calcBest(allActiveUsers.slice(1), allActiveUsers[0]);
      previousPeriodRetention['grade'] = calcGrade(allRetainedUsers.slice(0), allRetainedUsers[0]);
      previousPeriodRetention['best'] = calcBest(allRetainedUsers.slice(1), allRetainedUsers[0]);
    }

    return { isOver, newUsers, activeUsers, previousPeriodRetention };
  };


  let fetchUserStats = function* (view, date, interval) {
    let retention = yield Retention.find({
      viewId: view._id,
      measurementDate: date.toDate(),
      cohortInterval: interval
    }).exec();

    let newUsers = _.find(retention, (r) => {
      return moment(r.cohortDate).isSame(date);
    });

    let newUserCount = (newUsers || {}).measurementValue || 0;
    let activeUserCount = _.sum(_.pluck(retention, 'measurementValue'));

    return { newUserCount, activeUserCount };
  };


  let fetchRetentionStats = function* (view, date, interval) {
    let measurementDate = moment.utc(date);
    let cohortDate = date.subtract(1, `${interval}s`).startOf(interval);
    let retained = yield Retention.findOne({
      viewId: view._id,
      cohortInterval: interval,
      cohortDate: cohortDate.toDate(),
      measurementDate: measurementDate.toDate()
    }).exec();

    retained = retained || {};

    let retainedUserCount = retained.measurementValue || 0;
    let retainedUserPercentage = retained.cohortSize > 0
      ? Math.round(retained.measurementValue / retained.cohortSize * 100)
      : 0;

    return { retainedUserCount, retainedUserPercentage };
  };


  let isStartOf = function (interval) {
    let today = moment.utc().startOf('day');
    let startOfInterval = moment.utc().startOf(interval);
    return today.isSame(startOfInterval);
  };


  let calcPercentage = function(values, actual) {
    let mean = calcMean(values);
    let val = (Math.round(actual / mean * 100)) - 100
    if (mean === 0){
      return '-'
    } else if (val < 0) {
      return `-${Math.abs(val)}%`;
    } else {
      return `+${val}%`
    }
  };


  let calcMean = function(values) {
    return _.sum(values) / values.length;
  };


  let calcMedian = function(values) {
    let sortedValues = values.sort((a, b) => { return a - b; });
    let half = Math.floor(sortedValues.length / 2);
    if (sortedValues.length % 2) {
      return sortedValues[half]
    } else {
      return Math.round((sortedValues[half-1] + sortedValues[half]) / 2);
    }
  };


  let calcStdDev = function(values) {
    let median = calcMedian(values);
    let diffs = _.map(values, (val) => { return Math.pow(val - median, 2); });
    return Math.sqrt(calcMean(diffs));
  };


  let calcGrade = function(values, actual) {
    let median = calcMedian(values);
    let stdDev = calcStdDev(values);
    let diff = actual - median;
    let grade = diff / stdDev;
    if (grade > 1.0) return 'A'
    else if (grade > 0.2) return 'B'
    else if (grade > -0.4) return 'C'
    else if (grade > -1.3) return 'D'
    else return 'F'
  };


  let calcBest = function(values, actual) {
    let max = _.max(values);
    return actual > max;
  };


  let mapEmails = function(users) {
    return _.map(users, (u) => { return u.emails[0].address });
  };


  let sendEmails = function* (view, bundle) {
    let intervals = _.filter(util.INTERVALS, (i) => {
      return isStartOf(i);
    });

    let userIds = _.flattenDeep(_.map(intervals, (i) => {
      return _.pluck(view.emails, i);
    }));

    let users = yield User.find({ _id: { $in: userIds } }).select('emails.address').exec();
    let addresses = mapEmails(users);

    if (view.project.isUsercycle) {
      let demoUsers = yield User.find({ 'profile.demoEmail': { $in: intervals } }).exec();
      let demoEmails = mapEmails(demoUsers);
      addresses = addresses.concat(demoEmails);
    }

    emails.send(addresses, 'daily', bundle);
    // console.log(`Summary emails sent for ${view.project.name} - ${view.name}`);
  };


  this.process = function* () {
    let {viewId} = this.job.data;

    let view = yield View.findOne({_id: viewId}).populate({path: 'project'}).exec();
    if (!view) throw new Error(`View ${viewId} does not exist`);

    // console.log(`Creating summary email for ${view.project.name} - ${view.name}`);

    let bundle = { projectName: view.project.name };

    util.INTERVALS.forEach((interval) => {
      bundle[interval] = generateDataForInterval(view, interval);
    });

    yield sendEmails(view, yield bundle);
  };

});

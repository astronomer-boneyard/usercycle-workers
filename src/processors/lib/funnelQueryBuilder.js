import _ from 'lodash';
import stampit from 'stampit';
import moment from 'moment';
import util from '../../lib/util';
import View from '../../models/view';
import Project from '../../models/project';

export default stampit().enclose(function() {

  this.pushQuery = function(view, cohortStart, cohortEnd, queryStart, queryEnd) {
    throw new Error('pushQuery not implemented!');
  }


  this.generateQueries = function(view, cohortInterval, intervalCount, cohortStart, cohortEnd) {
    // Default to total intervals (full load).  Override getIntervalCount to change.
    let intervals = this.getIntervalCount ? this.getIntervalCount() : intervalCount;

    for (let i = intervals; i >= 0; i--) {
      let queryDay = moment.utc().subtract(i, `${cohortInterval}s`);
      let queryStart = queryDay.startOf(cohortInterval).format();
      let queryEnd = queryDay.endOf(cohortInterval).format();
      this.pushQuery(view, cohortStart, cohortEnd, queryStart, queryEnd);
    }
  };


  this.process = function* (job, done) {
    let {viewId, cohortInterval} = job.data;

    let view = yield View.findOne({_id: viewId}).exec();
    if (!view) done(new Error('View does not exist'));

    let project = yield view.project();
    if (!project) done(new Error('Project does not exist'));

    console.log(`Building ${cohortInterval} queries for ${project.name}`);

    let firstStartEvent = yield view.firstStartEventForInterval(cohortInterval);
    let totalIntervalsSinceSignup = moment.utc().diff(firstStartEvent, `${cohortInterval}s`);
    let minTotalIntervalsSinceSignup = Math.min(totalIntervalsSinceSignup, util.MAX_COHORTS_PER_INTERVAL);

    let firstEndEvent = yield view.firstEndEventForInterval(cohortInterval);
    let totalIntervalsSinceRetention = moment.utc().diff(firstEndEvent, `${cohortInterval}s`);
    let minTotalPeriodsSinceRetention = Math.min(totalIntervalsSinceRetention, util.MAX_COHORTS_PER_INTERVAL);

    for (let i = minTotalIntervalsSinceSignup; i >= 0; i--) {
      let cohortDay = moment.utc().subtract(i, `${cohortInterval}s`);
      let cohortStart = cohortDay.startOf(cohortInterval).format();
      let cohortEnd = cohortDay.endOf(cohortInterval).format();
      let periodsToQuery = Math.min(i, minTotalPeriodsSinceRetention);
      this.generateQueries(view, cohortInterval, periodsToQuery, cohortStart, cohortEnd);
    }

    if (totalIntervalsSinceSignup > util.MAX_COHORTS_PER_INTERVAL) {
      let cohortStart = firstStartEvent.startOf(cohortInterval).format();
      let cohortEndDay = moment.utc().subtract(minTotalIntervalsSinceSignup, `${cohortInterval}s`);
      let cohortEnd = cohortEndDay.endOf(cohortInterval).format();
      this.generateQueries(view, cohortInterval, totalIntervalsSinceRetention, cohortStart, cohortEnd);
    }

    done();
  }
});

import _ from 'lodash';
import stampit from 'stampit';
import moment from 'moment';
import util from '../../lib/util';
import View from '../../models/view';
import Project from '../../models/project';
import delayableJob from './delayableJob';
import viewErrorHandler from './viewErrorHandler';
import delayableJobProducer from './delayableJobProducer';


//
// Main funnel query builder
// Overridable: {Required} pushQuery()
//
let funnelBuilder = stampit().enclose(function() {

  this.process = function* () {
    let {viewId} = this.job.data;

    let view = yield View.findOne({_id: viewId}).populate({path: 'project'}).exec();
    if (!view) return this.done(new Error('View does not exist'));

    yield view.ensureZeroProgress();

    yield _.map(util.INTERVALS, (cohortInterval) => {
      return this.generateForInterval(view, cohortInterval);
    });

    this.done();
  };

  // Generate queries for a given interval
  this.generateForInterval = function* (view, cohortInterval) {
    // console.log(`Building ${cohortInterval} queries for ${view.project.name}`);

    let firstStartEvent = yield view.firstStartEventForInterval(cohortInterval);
    let totalIntervalsSinceSignup = moment.utc().diff(firstStartEvent, `${cohortInterval}s`);
    let minTotalIntervalsSinceSignup = Math.min(totalIntervalsSinceSignup, util.MAX_COHORTS_PER_INTERVAL);

    let firstEndEvent = yield view.firstEndEventForInterval(cohortInterval);
    let totalIntervalsSinceRetention = moment.utc().diff(firstEndEvent, `${cohortInterval}s`);
    let minTotalPeriodsSinceRetention = Math.min(totalIntervalsSinceRetention, util.MAX_COHORTS_PER_INTERVAL);

    // Generate queries for the most recent {util.MAX_COHORTS_PER_INTERVAL} intervals
    for (let i = minTotalIntervalsSinceSignup; i >= 0; i--) {
      let cohortDay = moment.utc().subtract(i, `${cohortInterval}s`);
      let cohortStart = cohortDay.startOf(cohortInterval).format();
      let cohortEnd = cohortDay.endOf(cohortInterval).format();
      let queryableIntervalsLimit = Math.min(i, minTotalPeriodsSinceRetention);
      this.generateForCohort(view, cohortInterval, queryableIntervalsLimit, cohortStart, cohortEnd);
    }

    // Generate queries for the all time cohort
    if (totalIntervalsSinceSignup > util.MAX_COHORTS_PER_INTERVAL) {
      let cohortStart = firstStartEvent.startOf(cohortInterval).format();
      let cohortEndDay = moment.utc().subtract(minTotalIntervalsSinceSignup, `${cohortInterval}s`);
      let cohortEnd = cohortEndDay.endOf(cohortInterval).format();
      this.generateForCohort(view, cohortInterval, totalIntervalsSinceRetention, cohortStart, cohortEnd);
    }
  };


  // Generate queries for a given cohort
  this.generateForCohort = function(view, cohortInterval, queryableIntervalsLimit, cohortStart, cohortEnd) {
    // Default to total intervals (full load).  Override getIntervalCount to change.
    let intervals = this.getIntervalCount(view, queryableIntervalsLimit, cohortInterval)

    for (let i = intervals; i >= 0; i--) {
      let queryDay = moment.utc().subtract(i, `${cohortInterval}s`);
      let queryStart = queryDay.startOf(cohortInterval).format();
      let queryEnd = queryDay.endOf(cohortInterval).format();
      this.pushQuery(view, cohortInterval, cohortStart, cohortEnd, queryStart, queryEnd);
    }
  };


  this.getIntervalCount = function(view, queryableIntervalsLimit, cohortInterval) {
    let lastModified = view.lastModified;
    if (this.job.data.refresh && lastModified) {
      lastModified = moment.utc(lastModified).startOf(cohortInterval);
      return moment.utc().diff(lastModified, `${cohortInterval}s`);
    } else {
      return queryableIntervalsLimit;
    }
  };


  // Push a single query job onto the queue to be executed later
  this.pushQuery = function(view, cohortInterval, cohortStart, cohortEnd, queryStart, queryEnd) {
    throw new Error('pushQuery not implemented!');
  };
});


export default stampit.compose(
  funnelBuilder,
  viewErrorHandler,
  delayableJob,
  delayableJobProducer
);

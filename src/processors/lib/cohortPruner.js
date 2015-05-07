import _ from 'lodash';
import stampit from 'stampit';
import moment from 'moment';
import util from '../../lib/util';
import View from '../../models/view';
import viewErrorHandler from './viewErrorHandler';
import delayableJob from './delayableJob';

let cohortPruner = stampit().enclose(function() {

  this.pruneData = function* () {
    throw new Error('pruneData not implemented');
  };

  this.pruneForInterval = function* (view, cohortInterval) {
    let first = yield view.firstEndEventForInterval(cohortInterval);
    let totalCohortCount = moment.utc().diff(first, `${cohortInterval}s`);

    if (totalCohortCount > util.MAX_COHORTS_PER_INTERVAL) {
      let end = moment.utc().startOf(cohortInterval);
      end = end.subtract(util.MAX_COHORTS_PER_INTERVAL, `${cohortInterval}s`)

      let dateQuery = { $gt: first.toDate(), $lt: end.toDate() };
      yield this.pruneData(view, cohortInterval, dateQuery);
    }
  };

  this.process = function* () {
    let { viewId } = this.job.data;

    let view = yield View.findOne({_id: viewId}).populate({path: 'project'}).exec();
    if (!view) throw new Error(`View ${viewId} does not exist`);

    yield _.map(util.INTERVALS, (cohortInterval) => {
      return this.pruneForInterval(view, cohortInterval);
    });
  };
});


export default stampit.compose(cohortPruner, viewErrorHandler, delayableJob);

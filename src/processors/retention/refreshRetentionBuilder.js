import _ from 'lodash';
import stampit from 'stampit';
import moment from 'moment';
import jobCreator from '../lib/jobCreator';
import funnelBuilder from '../lib/funnelBuilder';
import retentionBuilder from './retentionBuilder';
import delayableJob from '../lib/delayableJob';

let refreshRetentionBuilder = stampit().enclose(function() {

  // Query the amount of intervals that have past since last updated
  this.getIntervalCount = function(view, queryableIntervalsLimit, cohortInterval) {
    let lastModified = view.lastModified;
    if (lastModified) {
      lastModified = moment.utc(lastModified).startOf(cohortInterval);
      return moment.utc().diff(lastModified, `${cohortInterval}s`);
    } else {
      return queryableIntervalsLimit;
    }
  };

});

export default stampit.compose(delayableJob, jobCreator, funnelBuilder, retentionBuilder, refreshRetentionBuilder);

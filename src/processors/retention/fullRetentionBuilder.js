import _ from 'lodash';
import stampit from 'stampit';
import progressJobCreator from '../lib/progressJobCreator';
import funnelBuilder from '../lib/funnelBuilder';
import retentionBuilder from './retentionBuilder';
import delayableJob from '../lib/delayableJob';

let fullRetentionBuilder = stampit().enclose(function() {

  // Query the maximum allowable intervals
  this.getIntervalCount = function(view, queryableIntervalsLimit, cohortInterval) {
    return queryableIntervalsLimit;
  };

});

export default stampit.compose(delayableJob, progressJobCreator, funnelBuilder, retentionBuilder, fullRetentionBuilder);

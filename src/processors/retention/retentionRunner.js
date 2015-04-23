import _ from 'lodash';
import stampit from 'stampit';
import Retention from '../../models/retention';
import funnelRunner from '../lib/funnelRunner';
import progressJob from '../lib/progressJob';
import delayableJob from '../lib/delayableJob';
import updateViewLastModified from '../lib/updateViewLastModified';

let retentionRunner = stampit().enclose(function() {

  this.handleResponse = function* (view, response) {
    let {steps, result} = response;
    let viewId = this.job.data.viewId,
        cohortInterval = this.job.data.cohortInterval,
        cohortDate = new Date(steps[0].timeframe.start),
        cohortSize = result[0],
        measurementDate = new Date(steps[1].timeframe.start),
        measurementValue = result[0] - result[result.length-1];

    let selector = { viewId, cohortInterval, cohortDate, measurementDate };
    let modifier = { $set: {cohortSize, measurementValue} };

    yield Retention.update(selector, modifier, {upsert: true});
  };
});

export default stampit.compose(delayableJob, progressJob, funnelRunner, retentionRunner, updateViewLastModified);

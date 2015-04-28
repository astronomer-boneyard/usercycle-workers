import _ from 'lodash';
import stampit from 'stampit';
import Retention from '../../models/retention';
import funnelRunner from '../lib/funnelRunner';

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

    yield Retention.update(selector, modifier, {upsert: true}).exec();
  };
});

export default stampit.compose(funnelRunner, retentionRunner);

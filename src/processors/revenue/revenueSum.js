import _ from 'lodash';
import stampit from 'stampit';
import Keen from '../../datasources/keen';
import View from '../../models/view';
import Revenue from '../../models/revenue';
import progressibleJob from '../lib/progressibleJob';


let revenueSum = stampit().enclose(function() {
  this.process = function* () {
    let {viewId, cohortInterval, cohortDate, measurementDate, query} = this.job.data;

    let view = yield View.findOne({_id: viewId}).populate({path: 'project'}).exec();
    if (!view) throw new Error(`View ${viewId} does not exist`);

    // console.log(`Running ${cohortInterval} revenue sum for ${view.project.name}`);

    let sum = new Keen.Query('sum', query);
    let response = yield Keen.run(view.project, sum);

    let selector = {viewId, cohortInterval, cohortDate, measurementDate};
    let modifier = {$inc: {measurementValue: response.result}};
    yield Revenue.update(selector, modifier, {upsert: true});
  };
});

export default stampit.compose(revenueSum, progressibleJob);

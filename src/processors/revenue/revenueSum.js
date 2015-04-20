import _ from 'lodash';
import stampit from 'stampit';
import {QueryRunner, Keen} from '../../datasources/keen';
import View from '../../models/view';
import Revenue from '../../models/revenue';
import progressJob from '../lib/progressJob';


let revenueSum = stampit().enclose(function() {

  this.process = function* () {
    let {viewId, cohortInterval, cohortDate, measurementDate, query} = this.job.data;

    let view = yield View.findOne({_id: viewId}).populate({path: 'project'}).exec();
    if (!view) this.done(new Error('View does not exist'));

    console.log(`Running ${cohortInterval} revenue sum for ${view.project.name}`);

    let sum = new Keen.Query('sum', query);
    let response = yield QueryRunner.run(view.project, sum);

    let selector = {viewId, cohortInterval, cohortDate, measurementDate};
    let modifier = {$inc: {measurementValue: response.result}};
    yield Revenue.update(selector, modifier, {upsert: true});

    this.done();
  };
});

export default stampit.compose(progressJob, revenueSum);

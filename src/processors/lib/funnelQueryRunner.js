import _ from 'lodash';
import stampit from 'stampit';
import {QueryRunner, Keen} from '../../datasources/keen';
import View from '../../models/view';
import Project from '../../models/project';

export default stampit().enclose(function() {

  this.handleResponse = function(response) {
    throw new Error('handleResponse not implemented!');
  }

  this.process = function* () {
    let {viewId, cohortInterval, steps} = this.job.data;

    let view = yield View.findOne({_id: viewId}).populate({path: 'project'}).exec();
    if (!view) this.done(new Error('View does not exist'));

    console.log(`Running ${cohortInterval} queries for ${view.project.name}`);

    let query = new Keen.Query('funnel', {steps});
    let response = yield QueryRunner.run(view.project, query);
    yield this.handleResponse(response);
    this.done();
  }
});

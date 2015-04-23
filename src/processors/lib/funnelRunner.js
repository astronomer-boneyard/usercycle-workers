import _ from 'lodash';
import stampit from 'stampit';
import {QueryRunner, Keen} from '../../datasources/keen';
import View from '../../models/view';
import Project from '../../models/project';
import viewErrorHandler from './viewErrorHandler';


let funnelRunner = stampit().enclose(function() {

  // Handle a single response, typically transformation and persisting to our db
  this.handleResponse = function(response) {
    throw new Error('handleResponse not implemented!');
  }

  // Run the previously created query
  this.process = function* () {
    let {viewId, cohortInterval, steps} = this.job.data;

    let view = yield View.findOne({_id: viewId}).populate({path: 'project'}).exec();
    if (!view) return this.done(new Error('View does not exist'));

    // console.log(`Running ${cohortInterval} query for ${view.project.name}`);

    let query = new Keen.Query('funnel', {steps});
    let response = yield QueryRunner.run(view.project, query);
    yield this.handleResponse(view, response);
    this.done();
  }
});

export default stampit.compose(funnelRunner, viewErrorHandler);

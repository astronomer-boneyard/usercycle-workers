import _ from 'lodash';
import stampit from 'stampit';
import Keen from '../../datasources/keen';
import View from '../../models/view';
import Project from '../../models/project';
import viewErrorHandler from './viewErrorHandler';
import delayableJob from './delayableJob';
import progressibleJob from './progressibleJob';
import updateLastModifiedDateJob from './updateLastModifiedDateJob';


let funnelRunner = stampit().enclose(function() {
  // Handle a single response, typically transformation and persisting to our db
  this.handleResponse = function(response) {
    throw new Error('handleResponse not implemented!');
  }

  // Run the previously created query
  this.process = function* () {
    let {viewId, cohortInterval, steps} = this.job.data;

    let view = yield View.findOne({_id: viewId}).populate({path: 'project'}).exec();
    if (!view) throw new Error(`View ${viewId} does not exist`);

    // console.log(`Running ${cohortInterval} query for ${view.project.name}`);

    let query = new Keen.Query('funnel', {steps});
    let response = yield Keen.run(view.project, query);
    yield this.handleResponse(view, response);
  }
});

export default stampit.compose(
  funnelRunner,
  viewErrorHandler,
  delayableJob,
  progressibleJob,
  updateLastModifiedDateJob
);

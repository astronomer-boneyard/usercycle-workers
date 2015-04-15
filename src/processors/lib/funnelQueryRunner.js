import _ from 'lodash';
import stampit from 'stampit';
import {QueryRunner, Keen} from '../../datasources/keen';
import View from '../../models/view';
import Project from '../../models/project';

export default stampit().enclose(function() {

  this.process = function* (job, done) {
    let {viewId, cohortInterval, steps} = job.data;

    let view = yield View.findOne({_id: viewId}).exec();
    if (!view) done(new Error('View does not exist'));

    let project = yield view.project();
    if (!project) done(new Error('Project does not exist'));

    console.log(`Running ${cohortInterval} queries for ${project.name}`);

    let query = new Keen.Query('funnel', {steps});
    console.log(query.params);
    done();
  }
});

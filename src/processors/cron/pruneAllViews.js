import _ from 'lodash';
import stampit from 'stampit';
import queue from '../../lib/queue';
import View from '../../models/view';
import delayableJobProducer from '../lib/delayableJobProducer';

let pruneAllViews = stampit().enclose(function() {

  this.createDelayablePruneJob = function(jobType, throttleKey, viewId) {
    let title = `Prune view - ${jobType}`;
    this.createDelayableJob(jobType, throttleKey, {viewId, title});
  };

  this.process = function* () {
    // Find all views
    // If a view is locked at some point, this allows for their data to
    // naturally decay away if nothing is changed

    // Pruning for retention and revenue are per view
    // XXX: SPECIFY UC HERE TO TEST
    let retention = yield View.find({ type: 'retention' }).populate({path: 'project'}).exec();
    retention.forEach((view) => {
      this.createDelayablePruneJob('retentionPruner', view.project.organizationId, view._id);
    });

    // let revenue = yield View.find({ type: 'revenue' }).populate({path: 'project'}).exec();
    // revenue.forEach((view) => {
    //   this.createDelayablePruneJob('revenuePruner', view.project.organizationId, view._id);
    // });
    //
    // // Behavior Flow does is not per view
    // this.createDelayablePruneJob('behaviorFlowPruner');

    this.done();
  };
});

export default stampit.compose(pruneAllViews, delayableJobProducer);

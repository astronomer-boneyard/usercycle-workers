import _ from 'lodash';
import stampit from 'stampit';
import queue from '../../lib/queue';
import View from '../../models/view';

export default stampit().enclose(function() {
  let createPruneJob = function(jobType, viewId) {
    let title = `Prune view - ${jobType}`;
    queue.create(jobType, {viewId, title})
      .removeOnComplete(true)
      .attempts(5)
      .backoff({delay: 60*1000, type:'exponential'})
      .save();
  };

  this.process = function* () {
    // Find all views
    // If a view is locked at some point, this allows for their data to
    // naturally decay away if nothing is changed

    // Pruning for retention and revenue are per view
    // XXX: SPECIFY UC HERE TO TEST
    let retention = yield View.find({ type: 'retention' }).exec();
    retention.forEach((view) => {
      createPruneJob('retentionPruner', view._id);
    });

    // let revenue = yield View.find({ type: 'revenue' }).exec();
    // revenue.forEach((view) => {
    //   createPruneJob('revenuePruner', view._id);
    // });
    //
    // // Behavior Flow does is not per view
    // createPruneJob('behaviorFlowPruner');

    this.done();
  };
});

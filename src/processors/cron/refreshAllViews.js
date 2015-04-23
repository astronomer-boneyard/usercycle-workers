import _ from 'lodash';
import stampit from 'stampit';
import queue from '../../lib/queue';
import View from '../../models/view';

export default stampit().enclose(function() {

  let createRefreshBuilderJob = function(jobType, viewId) {
    let title = `Refresh view - ${jobType}`;
    queue.create(jobType, {viewId, title})
      .removeOnComplete(true)
      .attempts(5)
      .backoff({delay: 60*1000, type:'exponential'})
      .save();
  };

  this.process = function* () {
    let type = this.job.data.type;

    // Find views for this type that are not locked out
    let views = yield View.find({type: type, locked: { $ne: true}}).exec();
    views.forEach((view) => {
      if (type === 'retention') {
        createRefreshBuilderJob('refreshRetentionBuilder', view._id);
      } else if (type === 'revenue') {
        createRefreshBuilderJob('refreshRevenueBuilder', view._id);
      } else if (type === 'behaviorFlow') {
        createRefreshBuilderJob('refreshBehaviorFlowBuilder', view._id);
      }
    });

    this.done();
  };
});

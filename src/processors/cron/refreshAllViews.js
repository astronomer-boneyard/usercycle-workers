import _ from 'lodash';
import stampit from 'stampit';
import queue from '../../lib/queue';
import View from '../../models/view';
import delayableJobProducer from '../lib/delayableJobProducer';

let refreshAllViews = stampit().enclose(function() {

  this.createRefreshBuilderJob = function(jobType, throttleKey, viewId) {
    let title = `Refresh view - ${jobType}`;
    this.createDelayableJob(jobType, throttleKey, {viewId, title, refresh: true});
  };

  this.process = function* () {
    let type = this.job.data.type;

    // Find views for this type that are not locked out
    let views = yield View.find({type: type, locked: { $ne: true}}).populate({path: 'project'}).exec();
    views.forEach((view) => {
      if (type === 'retention') {
        this.createRefreshBuilderJob('retentionBuilder', view.project.organizationId, view._id);
      } else if (type === 'revenue') {
        this.createRefreshBuilderJob('revenueBuilder', view.project.organizationId, view._id);
      } else if (type === 'behaviorFlow') {
        this.createRefreshBuilderJob('behaviorFlowBuilder', view.project.organizationId, view._id);
      }
    });
  };
});

export default stampit.compose(refreshAllViews, delayableJobProducer);

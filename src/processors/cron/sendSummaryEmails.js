import _ from 'lodash';
import stampit from 'stampit';
import queue from '../../lib/queue';
import View from '../../models/view';
import delayableJobProducer from '../lib/delayableJobProducer';

let sendSummaryEmails = stampit().enclose(function() {

  this.createSummaryEmailJob = function(throttleKey, viewId) {
    let title = 'Send summary email';
    this.createDelayableJob('summaryEmail', throttleKey, {viewId, title});
  };

  this.process = function* () {
    // Find retention views that are not locked out
    let views = yield View.find({type: 'retention', locked: { $ne: true } }).populate({path: 'project'}).exec();
    views.forEach((view) => {
      this.createSummaryEmailJob(view.project.organizationId, view._id);
    });
  };
});

export default stampit.compose(sendSummaryEmails, delayableJobProducer);

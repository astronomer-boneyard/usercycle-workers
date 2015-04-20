import _ from 'lodash';
import stampit from 'stampit';
import queue from '../../lib/queue';
import View from '../../models/view';

//
// Mixin for controlling progress on views
//
export default stampit().enclose(function() {

  let count = 0;

  this.createJob = function(jobType, data) {
    count++;

    // Add progress flag
    data.showProgress = true;

    // Save the job
    let job = queue.create(jobType, data)
      .removeOnComplete(true)
      .delay(count * 1000)
      .attempts(5)
      .backoff({delay: 60*1000, type:'exponential'})
      .save();

    // Increment total progress
    View.incTotalProgress(data.viewId);
  };
});

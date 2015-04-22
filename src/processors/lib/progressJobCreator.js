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

    // Save the job
    let job = queue.create(jobType, data)
      .removeOnComplete(true)
      .delay(count * 500)
      .attempts(10)
      .backoff({delay: 2*60*1000, type:'exponential'})
      .save();

    // Increment total progress
    View.incTotalProgress(data.viewId);
  };
});

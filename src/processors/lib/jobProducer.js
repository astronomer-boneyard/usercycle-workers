import _ from 'lodash';
import stampit from 'stampit';
import queue from '../../lib/queue';
import redis from '../../lib/redis';
import View from '../../models/view';


//
// Mixin for controlling progress on views
//
export default stampit().enclose(function() {
  this.createJob = function (jobType, data) {
    let key = `delay:${data.viewId}`;
    let cmd = redis.multi().incrby(key, 1000).expire(key, 120);

    // Increment delay in redis, and use the returned value for this jobs delay
    cmd.exec((err, response) => {
      let delay = response[0];

      // Save the job
      let job = queue.create(jobType, data)
        .removeOnComplete(true)
        .delay(delay)
        .attempts(5)
        .backoff({delay: 60*1000, type:'exponential'})
        .save((error) => {
          // Increment total progress if its not a refresh
          if (!this.job.data.refresh) {
            View.incTotalProgress(this.job.data.viewId);
          }
        });
    });
  };
});

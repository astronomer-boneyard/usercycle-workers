import _ from 'lodash';
import stampit from 'stampit';
import queue from '../../lib/queue';
import redis from '../../lib/redis';
import View from '../../models/view';


//
// Mixin for producing jobs
//
export default stampit().enclose(function() {

  this.createDelayableJob = function (jobType, throttleKey, data) {

    // Add throttleKey to the job data, for usage by the `delayableJob`
    data._throttleKey = throttleKey;

    // Create redis key for staggering delays
    let key = `delay:${throttleKey}`;

    // Command to increment the delay for the current throttleKey -- expires
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

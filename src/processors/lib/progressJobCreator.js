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

    cmd.exec((err, response) => {
      let delay = response[0];

      // Save the job
      let job = queue.create(jobType, data)
        .removeOnComplete(true)
        .delay(delay)
        .attempts(5)
        .backoff({delay: 60*1000, type:'exponential'})
        .save();

      // Increment total progress
      View.incTotalProgress(data.viewId);
    });

  };
});

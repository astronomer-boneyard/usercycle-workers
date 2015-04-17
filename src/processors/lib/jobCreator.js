import stampit from 'stampit';
import queue from '../../lib/queue';

export default stampit().enclose(function() {

  this.createJob = function(jobType, data) {
    let job = queue.create(jobType, data).removeOnComplete(true).save();
  }
});

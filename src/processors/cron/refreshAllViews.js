import _ from 'lodash';
import stampit from 'stampit';
import View from '../../models/view';

export default stampit().enclose(function() {
  this.process = function* () {
    let type = this.job.data.type;
    let views = yield View.find({type: type}).exec();
    views.forEach((view) => {
      // let job = queue.create(jobType, data)
      //   .removeOnComplete(true)
      //   .delay(delay)
      //   .attempts(5)
      //   .backoff({delay: 60*1000, type:'exponential'})
      //   .save();
    });

    this.done();
  };

});

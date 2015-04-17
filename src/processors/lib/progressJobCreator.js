import _ from 'lodash';
import stampit from 'stampit';
import queue from '../../lib/queue';
import View from '../../models/view';

//
// Mixin for controlling progress on views
//
export default stampit().enclose(function() {

  this.createJob = function(jobType, data) {
    let job = queue.create(jobType, data)
      .removeOnComplete(true)
      .attempts(5)
      .backoff({delay: 60*1000, type:'exponential'})
      .save();

    job.on('enqueue', (param) => {
      let selector = {_id: data.viewId},
          modifier = { $inc: {'progress.total': 1} };

      View.update(selector, modifier, _.noop);
    });

    job.on('complete', (result) => {
      let selector = {_id: data.viewId},
          modifier = { $inc: {'progress.complete': 1} },
          options = { new: true};

      View.findOneAndUpdate(selector, modifier, options, (error, view) => {
        if (view.progress.complete === view.progress.total) {
          view.ensureZeroProgress();
        }
      });
    });

  };

});

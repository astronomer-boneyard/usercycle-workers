import _ from 'lodash';
import stampit from 'stampit';
import queue from '../../lib/queue';
import View from '../../models/view';

//
// Mixin for controlling progress on views
//
export default stampit().enclose(function() {
  this.onError(function(error, job) {
    if (error.code === 'ResourceNotFoundError') {
      console.log('Handling ResourceNotFoundError...');
      job.remove();
      View.update({_id: this.job.data.viewId}, { $set: { locked: true} }, _.noop);
    }
  });
});

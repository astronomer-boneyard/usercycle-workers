import stampit from 'stampit';
import View from '../../models/view';

//
// Mixin for controlling progress on views
//
export default stampit().enclose(function() {
  this.onComplete(function() {
    if (!this.job.data.refresh) {
      View.incCompleteProgress(this.job.data.viewId);
    }
  });
});

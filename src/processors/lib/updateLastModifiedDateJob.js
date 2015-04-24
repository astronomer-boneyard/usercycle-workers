import _ from 'lodash';
import stampit from 'stampit';
import View from '../../models/view';

//
// Mixin for controlling progress on views
//
export default stampit().enclose(function() {
  this.onComplete(function() {
    View.update({_id: this.job.data.viewId}, { $set: { lastModified: new Date} }, _.noop);
  });
});

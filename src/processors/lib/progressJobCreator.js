import _ from 'lodash';
import stampit from 'stampit';
import jobCreator from './jobCreator';
import View from '../../models/view';


//
// Mixin for controlling progress on views
//
let progressJobCreator = stampit().enclose(function() {

  this.createJob = function (jobType, data) {
    // Call to internal jobCreator method to actually create job
    this._createJob(jobType, data, (err) => {
      if (!err) {
        // Increment total progress
        View.incTotalProgress(data.viewId);
      }
    });
  };
});

export default stampit.compose(jobCreator, progressJobCreator);

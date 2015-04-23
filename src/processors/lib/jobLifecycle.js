import _ from 'lodash';
import stampit from 'stampit';

export default stampit().enclose(function() {
  let onBefore = [], onAfter = [], onComplete = [], onError = [];

  return stampit.mixIn(this, {
    onBefore: function(fn) {
      onBefore.push(_.bind(fn, this));
    },

    onAfter: function(fn) {
      onAfter.push(_.bind(fn, this));
    },

    onComplete: function(fn) {
      onComplete.push(_.bind(fn, this));
    },

    onError: function(fn) {
      onError.push(_.bind(fn, this));
    },

    runOnBefore: function* () {
      let results = yield _.map(onBefore, (fn) => { return fn(); });
      return _.all(results, (cancel) => { return !!cancel === false });
    },

    runOnAfter: function() {
      _.map(onAfter, (fn) => { return fn(); });
    },

    runOnComplete: function() {
      _.map(onComplete, (fn) => { return fn(); });
    },

    runOnError: function(error, job) {
      _.map(onError, (fn) => { return fn(error, job); });
    }
  });
});

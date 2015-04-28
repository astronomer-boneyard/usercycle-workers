import _ from 'lodash';
import mongoose from 'mongoose';
import {QueryRunner, Keen} from '../datasources/keen';
import moment from 'moment';
import co from 'co';

let schema = new mongoose.Schema({
  _id: String,
  name: String,
  project: {type: String, ref: 'Project'},
  start: {},
  end: {},
  emails: [],
  progress: {},
  locked: Boolean,
  lastModified: Date,
  tree: {}
});

schema.statics.incTotalProgress = function(viewId, count = 1) {
  let selector = {_id: viewId},
      modifier = { $inc: {'progress.total': 1} };
  this.update(selector, modifier, _.noop);
};

schema.statics.incCompleteProgress = function(viewId, count = 1) {
  let selector = {_id: viewId},
      modifier = {$inc: {'progress.complete': 1}},
      options = {new: true};

  this.findOneAndUpdate(selector, modifier, options, (error, view) => {
    if (view.progress.complete === view.progress.total) {
      view.ensureZeroProgress();
    }
  });
}

let instanceMethods = {
  ensureZeroProgress: function* () {
    this.progress = {total: 0, complete: 0}
    return yield this.save();
  },

  firstTimestamp: function* (collection) {
    // XXX: This on demand dosn't seem to be working?
    if (!this.populated('project')) {
      yield this.populate('project').execPopulate();
    }

    let min = new Keen.Query('minimum', {
      event_collection: collection,
      target_property: 'keen.timestamp'
    });

    let response = yield QueryRunner.run(this.project, min);
    return response.result;
  },

  firstStartEvent: function* () {
    let ts = yield this.firstTimestamp(this.start.event);
    let max = moment.max(moment.utc(ts), moment.utc('2000-01-01'));
    return max.format();
  },

  firstEndEvent: function* () {
    let queries = _.map(this.end.events, (ev) => { return this.firstTimestamp(ev.event); });
    let min = moment.min(_.map(yield queries, (ts) => { return moment.utc(ts); }));
    return min.format();
  },

  firstStartEventForInterval: function* (interval) {
    return moment.utc(yield this.firstStartEvent()).startOf(interval);
  },

  firstEndEventForInterval: function* (interval) {
    return moment.utc(yield this.firstEndEvent()).startOf(interval);
  }
};

// Babel complains if you inline a co.wrap with an anon func,
// so we have to loop through and assign to schema methods for now.
_.each(instanceMethods, function(fn, key) {
  schema.methods[key] = co.wrap(fn);
});

export default mongoose.model('View', schema, 'views');

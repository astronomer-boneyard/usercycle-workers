import mongoose from 'mongoose';
import {QueryRunner, Keen} from '../datasources/keen';
import promisify from 'promisify-node';
import moment from 'moment';
import co from 'co';
import _ from 'lodash';

let schema = new mongoose.Schema({
  _id: String,
  name: String,
  projectId: String,
  start: {},
  end: {},
  emails: []
});

let instanceMethods = {
  project: function* () {
    return this.model('Project').findOne({_id: this.projectId}).exec();
  },

  firstTimestamp: function* (collection) {
    let project = yield this.project();
    let min = new Keen.Query('minimum', {
      event_collection: collection,
      target_property: 'keen.timestamp'
    });
    let response = yield QueryRunner.run(project, min);
    return response.result;
  },

  firstStartEvent: function* () {
    let ts = yield this.firstTimestamp(this.start.event);
    let max = moment.max(moment.utc(ts), moment.utc('2000-01-01'));
    return max.format();
  },

  firstEndEvent: function* () {
    let min = moment.min(_.map(this.end.events, (ev) => {
      let ts = this.firstTimestamp(ev.event);
      return moment.utc(ts);
    }));
    return min.format();
  },

  firstStartEventForInterval: function* (interval) {
    let ts = yield this.firstTimestamp(this.start.event);
    return moment.utc(ts).startOf(interval);
  }
};

// Babel complains if you inline a co.wrap with an anon func,
// so we have to loop through and assign to schema methods for now.
_.each(instanceMethods, function(fn, key) {
  schema.methods[key] = co.wrap(fn);
});

export default mongoose.model('View', schema, 'views');

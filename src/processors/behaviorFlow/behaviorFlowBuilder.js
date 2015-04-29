import _ from 'lodash';
import stampit from 'stampit';
import moment from 'moment';
import Random from 'meteor-random';
import TreeModel from 'tree-model';
import util from '../../lib/util';
import View from '../../models/view';
import BehaviorFlow from '../../models/behaviorFlow';
import viewErrorHandler from '../lib/viewErrorHandler';
import delayableJobProducer from '../lib/delayableJobProducer';


//
// Behavior Flow query builder
//
let behaviorFlowBuilder = stampit().enclose(function() {
  this.onBefore(function* () {
    yield BehaviorFlow.remove({ viewId: this.job.data.viewId }).exec();
  });

  this.process = function* () {
    let {viewId, date} = this.job.data;

    let view = yield View.findOne({_id: viewId}).populate({path: 'project'}).exec();
    if (!view) return this.done(new Error('View does not exist'));

    yield view.ensureZeroProgress();

    let tree = new TreeModel();
    let root = tree.parse(view.tree);

    // Find leaves
    let leaves = root.all((node) => {
      return !node.hasChildren();
    });

    let dates = [];
    if (!!this.job.data.refresh) {
      dates.push(moment.utc().startOf('day').toDate());
    } else {
      for(let i = 0; i < 7; i++) {
        dates.push(moment.utc().subtract(i, 'days').startOf('day').toDate());
      }
    }

    yield _.map(dates, (date) => {
      return this.generateForDate(view, leaves, date);
    });

    this.done();
  };


  this.generateForDate = function* (view, leaves, date) {
    // Map a list of unique paths through the tree
    _.each(leaves, (leaf, leafIndex) => {
      let steps = _.map(leaf.getPath(), (node) => {
        return {
          event_collection: node.model.name,
          actor_property: 'user.userId',
          timeframe: { end: moment.utc(date).format() }
        };
      });

      this.createDelayableJob('behaviorFlowRunner', view.project.organizationId, {
        title: `Behavior flow query - ${view.project.name}: ${view.name}`,
        refresh: !!this.job.data.refresh,
        viewId: view._id,
        date,
        leafIndex,
        steps
      });
    });

    let selector = {
      viewId: view._id,
      date: moment.utc(date).toDate()
    };

    let modifier = { $set: { tree: { model: view.tree, version: Random.id() } } };
    yield BehaviorFlow.update(selector, modifier, { upsert: true }).exec();
  };
});


export default stampit.compose(
  behaviorFlowBuilder,
  viewErrorHandler,
  delayableJobProducer
);

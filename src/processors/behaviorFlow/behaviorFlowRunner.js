import _ from 'lodash';
import stampit from 'stampit';
import moment from 'moment';
import Random from 'meteor-random';
import TreeModel from 'tree-model';
import BehaviorFlow from '../../models/behaviorFlow';
import funnelRunner from '../lib/funnelRunner';
import delayableJobProducer from '../lib/delayableJobProducer';


//
// Behavior Flow query runner
//
let behaviorFlowFunnelRunner = stampit().enclose(function() {
  this.handleResponse = function* (view, response) {
    let {viewId, date, leafIndex} = this.job.data;

    let bf = yield BehaviorFlow.findOne({viewId, date}).exec();
    if (!bf) return this.done(new Error('BehaviorFlow does not exist'));

    let tree = new TreeModel();
    let root = tree.parse(bf.tree.model);

    // Find leaves
    let leaves = root.all((node) => {
      return !node.hasChildren();
    });

    // Add size attribute to the tree's model (in memory)
    _.each(leaves[leafIndex].getPath(), (node, i) => {
      node.model.size = response.result[i];
    });

    let selector = {
      viewId,
      date,
      'tree.version': bf.tree.version
    };

    let modifier = {
      $set: { tree: { model: root.model, version: Random.id() } }
    };

    let updated = yield BehaviorFlow.update(selector, modifier).exec();
    if (updated.nModified === 0) {
      throw new Error('Behavior Flow tree modified during processing (OK)');
    }

    let funnelsComplete = _.every(leaves, (leaf) => {
      return _.isNumber(leaf.model.size);
    });

    if (funnelsComplete) {
      this.createJob('behaviorFlowDropoffs', {
        title: `Behavior flow dropoff - ${view.project.name}: ${view.name}`,
        refresh: !!this.job.data.refresh,
        viewId,
        date
      });
    }
  };
});


export default stampit.compose(funnelRunner, behaviorFlowFunnelRunner, delayableJobProducer);

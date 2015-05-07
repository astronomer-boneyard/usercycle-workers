import _ from 'lodash';
import stampit from 'stampit';
import TreeModel from 'tree-model';
import BehaviorFlow from '../../models/behaviorFlow';
import viewErrorHandler from '../lib/viewErrorHandler';
import delayableJob from '../lib/delayableJob';
import progressibleJob from '../lib/progressibleJob';
import updateLastModifiedDateJob from '../lib/updateLastModifiedDateJob';


let behaviorFlowDropoffs = stampit().enclose(function() {

  // Run the previously created query
  this.process = function* () {
    let {viewId, date} = this.job.data;

    let bf = yield BehaviorFlow.findOne({viewId, date}).exec();
    if (!bf) throw new Error('BehaviorFlow does not exist');

    let tree = new TreeModel();
    let root = tree.parse(bf.tree.model);

    // Walk the tree and calculate dropoff sizes
    root.walk((node) => {
      let parent = node.parent;
      if (parent) {
        let hasDropOff = _.some(parent.children, (child) => {
          return child.model.name === 'dropoff';
        });
        if (!hasDropOff) {
          let sum = _.sum(parent.children, (child) => {
            return child.model.size;
          });
          let diff = parent.model.size - sum;
          let dropOff = (diff < 0) ? 0 : diff;
          let child = tree.parse({
            name: "dropoff",
            size: dropOff
          });
          parent.addChild(child);
        }
      }
    });

    let selector = { viewId, date };
    let modifier = { $set: { 'tree.model': root.model } };
    yield BehaviorFlow.update(selector, modifier).exec();
  }
});

export default stampit.compose(
  behaviorFlowDropoffs,
  viewErrorHandler,
  progressibleJob,
  updateLastModifiedDateJob
);

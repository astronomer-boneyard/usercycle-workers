import _ from 'lodash';
import stampit from 'stampit';
import Revenue from '../../models/revenue';
import cohortPruner from '../lib/cohortPruner';

let retentionPruner = stampit().enclose(function() {
  this.pruneData = function* (view, cohortInterval, dateQuery) {
    yield Revenue.remove({
      viewId: view._id,
      cohortInterval: cohortInterval,
      cohortDate: dateQuery
    }).exec();
  };
});

export default stampit.compose(cohortPruner, retentionPruner);

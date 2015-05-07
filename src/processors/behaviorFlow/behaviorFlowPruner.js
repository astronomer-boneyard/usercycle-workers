import _ from 'lodash';
import stampit from 'stampit';
import moment from 'moment';
import BehaviorFlow from '../../models/behaviorFlow';

export default stampit().enclose(function() {
  this.process = function* () {
    let cutOff = moment.utc().subtract(7, 'days');
    yield BehaviorFlow.remove({ date: { $lt: cutOff.toDate() } }).exec();
  };
});

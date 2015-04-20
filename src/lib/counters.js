import _ from 'lodash';
import stampit from 'stampit';
import redis from './redis';

let stamp = stampit().enclose(function() {
  return stampit.mixIn(this, {
    get(id) {
      return redis.hget('counters', id);
    },
    increment(id, amt = 1) {
      return redis.hincrby('counters', id, amt);
    },
    decrement(id, amt = 1) {
      return redis.hincrby('counters', id, -amt);
    }
  });
});

export default stamp.create();

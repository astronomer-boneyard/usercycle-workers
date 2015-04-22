import _ from 'lodash';
import stampit from 'stampit';
import redis from '../../lib/redis';

//
// Mixin for rate limiting a job
//
export default stampit().enclose(function() {

  let key = `count:${this.job.data.viewId}`;
  let expire = 120;

  this.onBefore(function*() {
    let response = yield redis.multi().incr(key).expire(key, expire).exec();
    return response[0] > 5;
  });

  this.onAfter(function() {
    redis.multi().decr(key).expire(key, expire).exec();
  });
});

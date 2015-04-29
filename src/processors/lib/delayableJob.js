import _ from 'lodash';
import stampit from 'stampit';
import luaManager from '../../lib/luaManager';
import redis from '../../lib/redis';


//
// Mixin for rate limiting a job
//
export default stampit().enclose(function() {

  let throttleKey = this.job.data._throttleKey;
  if (!throttleKey) {
    throw new Error('Attempt to use delayable job with no throttleKey');
  }

  let key = `count:${throttleKey}`;
  let allowed = false;

  this.onBefore(function*() {
    let response = yield luaManager.run('inc', [key], []);
    allowed = !!response;
    return !allowed;
  });

  this.onAfter(function() {
    if (allowed) {
      redis.decr(key).exec();
    }
  });
});

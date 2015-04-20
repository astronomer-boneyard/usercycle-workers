import _ from 'lodash';
import stampit from 'stampit';
import {RateLimit} from 'ratelimit.js';
import redis from '../../lib/redis';

let rules = [
  {interval: 1, limit: 3},
  {interval: 60, limit: 1000}
];
var limiter = new RateLimit(redis.getClient(), rules);


var showRateLimited = function(err, isRateLimited) {
  if (err) {
    return console.log("Error: " + err);
  }

  console.log("Is rate limited? " + isRateLimited);
};

// Exceed rate limit.
for(var i = 0; i < 10; i++) {
  limiter.incr('127.0.0.1', showRateLimited);
}


//
// Mixin for rate limiting
//
export default stampit().enclose(function() {

});

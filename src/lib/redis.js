import redis from 'redis';
import wrapper from 'co-redis';
import config from 'config';

let client = redis.createClient(config.get('redis.port'), config.get('redis.host'), {
  auth_pass: config.get('redis.password')
});

export default wrapper(client);

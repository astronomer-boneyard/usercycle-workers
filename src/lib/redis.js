import redis from 'redis';
import wrapper from 'co-redis';
import config from 'config';

let client = redis.createClient(config.get('REDIS_PORT'), config.get('REDIS_HOST'));
export default wrapper(client);

import kue from 'kue';
import config from 'config';

// Setup kue
let queueConfig = { redis: { host: config.get('REDIS_HOST'), port: config.get('REDIS_PORT') } }
let queue = kue.createQueue(queueConfig);

export default queue;

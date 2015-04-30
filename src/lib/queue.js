import kue from 'kue';
import config from 'config';

// Setup kue
let queueConfig = {
  redis: {
    host: config.get('redis.host'),
    port: config.get('redis.port'),
    auth: config.get('redis.password')
  }
};

let queue = kue.createQueue(queueConfig);

export default queue;

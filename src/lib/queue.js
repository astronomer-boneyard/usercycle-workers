import kue from 'kue';
import config from 'config';

// Setup kue
let queueConfig = {
  jobEvents: false,
  redis: {
    host: config.get('redis.host'),
    port: config.get('redis.port'),
    auth: config.get('redis.password')
  }
};

let queue = kue.createQueue(queueConfig);

queue.on('error', function(e) {
  console.log('Queue Error: ', e);
});

export default queue;

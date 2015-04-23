import kue from 'kue';
import config from 'config';

// Setup kue
let queue = kue.createQueue({
  redis: {
    host: config.get('REDIS_HOST'),
    port: config.get('REDIS_PORT')
  }
});

process.once('SIGTERM', function(sig) {
  queue.shutdown(function(err) {
    console.log('Kue is shut down.', err||'');
    process.exit(0);
  }, 5000 );
});

export default queue;

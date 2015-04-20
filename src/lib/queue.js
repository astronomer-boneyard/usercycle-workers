import kue from 'kue';
import config from 'config';

// Setup kue
let queue = kue.createQueue({
  redis: {
    host: config.get('REDIS_HOST'),
    port: config.get('REDIS_PORT')
  }
});

queue.promote(2500, 200);

// Graceful shutdown
process.once( 'SIGTERM', function (sig) {
  queue.shutdown(function(err) {
    console.log('Kue is shut down.', err||'');
    process.exit(0);
  }, 5000 );
});

// Start GUI server
let server = kue.app.listen(8080);

export default queue;

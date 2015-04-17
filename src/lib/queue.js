import kue from 'kue';

// Setup kue
let queue = kue.createQueue();
queue.promote(5000, 5);

// Requeue (stuck) active jobs
// queue.active( function( err, ids ) {
//   ids.forEach( function( id ) {
//     kue.Job.get( id, function( err, job ) {
//       job.inactive();
//     });
//   });
// });

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

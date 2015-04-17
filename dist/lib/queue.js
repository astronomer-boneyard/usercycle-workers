'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _kue = require('kue');

var _kue2 = _interopRequireWildcard(_kue);

// Setup kue
var queue = _kue2['default'].createQueue();
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
process.once('SIGTERM', function (sig) {
  queue.shutdown(function (err) {
    console.log('Kue is shut down.', err || '');
    process.exit(0);
  }, 5000);
});

// Start GUI server
var server = _kue2['default'].app.listen(8080);

exports['default'] = queue;
module.exports = exports['default'];
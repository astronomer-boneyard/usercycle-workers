// XXX: RUNTIME POLYFILL: Required for generators and others
require('babel/polyfill');

import kue from 'kue';
import * as processors from './processors/index';

// Setup kue
let queue = kue.createQueue();
let server = kue.app.listen(8080);

process.once('SIGTERM', function(sig) {
  server.close();
  queue.shutdown(function(err) {
    console.log('Kue is shut down.', err || '');
    process.exit(0);
  }, 5000);
});

// Setup our job processors
processors.start(queue);





// TESTING -----------------------------------------------------
let job = queue.create('summaryEmail', {
  viewId: 'S2GKhPr6g2muCatGw'
}).removeOnComplete(true).save();

//
// APPLICATION ENTRY POINT
//

// XXX: RUNTIME POLYFILL: Required for generators and others
import 'babel/polyfill';

// XXX: RUNTIME POLYFILL: Required for promise finally support
import 'promise.prototype.finally';

import os from 'os';
import cluster from 'cluster';
import config from 'config';
import mongoose from 'mongoose';
import kue from 'kue';
import queue from './lib/queue';
import * as processors from './processors/index';


// TESTING ---------------------------------------------------------------------
function runtest() {
  // console.log('Pushing test jobs...');

  // queue.create('retentionQueryBuilder', {
  //   viewId: 'fzGirKkNGLKpaBmZT'
  // }).removeOnComplete(true).save();
  //
  // queue.create('retentionQueryBuilder', {
  //   viewId: 'kYjBZRX8myih4fJCb'
  // }).removeOnComplete(true).save();

  // ['kYjBZRX8myih4fJCb',
  // 'fzGirKkNGLKpaBmZT',
  // 'carMscSqEZ7XupbL8'].forEach((id) => {
  //   queue.create('retentionQueryBuilder', {
  //     viewId: id
  //   }).removeOnComplete(true).save();
  // });
}



if (cluster.isMaster) {
  runtest();

  // MASTER --------------------------------------------------
  // Start GUI server
  let server = kue.app.listen(8080);

  // XXX: Deprecated soon, but required on master for now
  queue.promote(1000, 1000);

  // Start worker processes
  for (let i = 0; i < os.cpus().length; i++) {
    cluster.fork();
  }
} else {

  // WORKER --------------------------------------------------
  // Connect to mongo then start processing jobs
  mongoose.connect(config.get('MONGO_URL'));

  let connection = mongoose.connection
  connection.once('open', () => {
    console.log('Successfully connected to mongo, starting processors.');
    processors.start();
  });

  process.once('SIGTERM', function(sig) {
    connection.close();
  });
}

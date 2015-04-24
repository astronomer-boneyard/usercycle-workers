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
import cleanup from './lib/cleanup';
import * as processors from './processors/index';


// TESTING ---------------------------------------------------------------------
function runtest() {
  // console.log('Pushing test jobs...');

  // queue.create('retentionBuilder', {
  //   viewId: 'fzGirKkNGLKpaBmZT'
  // }).removeOnComplete(true).save();
  //
  // queue.create('retentionBuilder', {
  //   refresh: true,
  //   viewId: 'kYjBZRX8myih4fJCb'
  //   // viewId: '5ZZsnBe8yPGH7gZxs',
  // }).removeOnComplete(true).save();

  // queue.create('revenueBuilder', {
  //   refresh: true,
  //   viewId: 'E223mSWXtWd9Yyir2'
  // }).removeOnComplete(true).save();

  // ['kYjBZRX8myih4fJCb',
  // 'fzGirKkNGLKpaBmZT',
  // 'carMscSqEZ7XupbL8'].forEach((id) => {
  //   queue.create('retentionQueryBuilder', {
  //     viewId: id
  //   }).removeOnComplete(true).save();
  // });
}

let server;
let connection;

cleanup(function() {
  if (server) {
    server.close();
  }
  if (connection) {
    connection.close();
  }
  queue.shutdown();
});


if (cluster.isMaster) {
  runtest();

  // MASTER --------------------------------------------------
  // Start GUI server
  server = kue.app.listen(8080);

  // XXX: Deprecated soon, but required on master for now
  queue.promote(1000, 1000);

  queue.watchStuckJobs();

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
    console.log(`PID ${process.pid} successfully connected to mongo, starting processors.`);
    processors.start();
  });
}

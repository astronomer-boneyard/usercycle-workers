//
// APPLICATION ENTRY POINT
//

// XXX: RUNTIME POLYFILL: Required for generators and others
import 'babel/polyfill';

// XXX: RUNTIME POLYFILL: Required for promise finally support
import 'promise.prototype.finally';

import os from 'os';
import express from 'express';
import bodyParser from 'body-parser';
import cluster from 'cluster';
import config from 'config';
import mongoose from 'mongoose';
import kue from 'kue';
import queue from './lib/queue';
import luaManager from './lib/luaManager';
import * as processors from './processors/index';


function listen() {
  // Start GUI uiServer
  kue.app.listen(process.env.PORT || 8080);

  // Start modulus event listener server
  let modServer = express();
  modServer.use(bodyParser.urlencoded({ extended: true }));
  modServer.post('/', function(req, res) {
    console.log('Shutdown signal recieved from modulus.');
    queue.shutdown(function(err) {
      console.log('Kue shutdown: ', err||'OK');
    }, 5000);
  });
  modServer.listen(63002);
}


function cleanup() {
  if (process.env.NODE_ENV === 'development') {
    luaManager.run('del', ['count:*']).then((count) => {
      console.log(`Reset ${count} counts`);
    });

    queue.active(function(err, ids) {
      console.log(`Requeuing ${ids.length} jobs`)
      ids.forEach(function(id) {
        kue.Job.get(id, function(err, job) {
          job.inactive();
        });
      });
    });
  }
}


// STARTUP
if (cluster.isMaster) {
  cleanup();
  listen();

  // XXX: Deprecated soon, but required on master for now
  queue.promote(1000, 1000);

  // Start worker processes
  for (let i = 0; i < os.cpus().length; i++) {
    cluster.fork();
  }
} else {

  // Connect to mongo then start processing jobs
  mongoose.connect(config.get('mongo_url'));

  let connection = mongoose.connection
  connection.once('open', () => {
    console.log(`PID ${process.pid} successfully connected to mongo, starting processors.`);
    processors.start();
  });
  connection.once('error', () => {
    console.error("Could not connect to mongo.  Is it running?")
  });
}

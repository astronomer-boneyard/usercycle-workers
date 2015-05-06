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


function resetCounts() {
  luaManager.run('del', ['count:*']).then((count) => {
    console.log(`Reset ${count} counts`);
  });
};

function listen() {
  // Start modulus event listener server
  let modServer = express();
  modServer.use(bodyParser.urlencoded({ extended: true }));
  modServer.post('/', function(req, res) {
    console.log('Shutdown signal recieved from modulus.');
    resetCounts();
    queue.shutdown(function(err) {
      console.log('Kue shutdown: ', err||'OK');
    }, 5000);
  });
  modServer.listen(63002);
}

function cleanup() {
  // if (process.env.NODE_ENV === 'development') {
  resetCounts();

  let delay = function(ids) {
    ids.forEach(function(id) {
      kue.Job.get(id, function(err, job) {
        job.delayed();
      });
    });
    console.log(`Requeued ${ids.length} jobs`);
  };

  let remove = function(ids) {
    ids.forEach(function(id) {
      kue.Job.get(id, function(err, job) {
        job.remove();
      });
    });
    console.log(`Removed ${ids.length} failed jobs`);
  };

  queue.active((err, ids) => { delay(ids) });
  queue.inactive((err, ids) => { delay(ids) });
  queue.failed((err, ids) => { remove(ids) });
  // }
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

  process.once('uncaughtException', function(err) {
    console.error('Something bad happened: ', err);
    queue.shutdown(1000, function(err2) {
      console.error('Kue shutdown result: ', err || 'OK' );
      process.exit(0);
    });
  });
}

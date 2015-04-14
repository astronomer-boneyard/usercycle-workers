// XXX: RUNTIME POLYFILL: Required for generators and others
import 'babel/polyfill';

import dotenv from 'dotenv';
import kue from 'kue';
import mongoose from 'mongoose';
import * as processors from './processors/index';

// Load environment variables into process.env from .env file
dotenv.load();


// Setup kue
let queue = kue.createQueue();
let server = kue.app.listen(8080);


// Connect to mongo then start processing jobs
mongoose.connect(process.env.MONGO_URL);
let db = mongoose.connection;
db.on('error', () => {
  console.error('Mongo connection error.');
});
db.once('open', () => {
  console.log('Successfully connected to mongo, starting processors.');
  processors.start(queue);
});


// Cleanup just in case
process.once('SIGTERM', function(sig) {
  db.close();
  server.close();
});


// TESTING -----------------------------------------------------
let job = queue.create('summaryEmail', {
  viewId: 'j74dvzrWjf5qm3tSH'
}).removeOnComplete(true).save();

//
// APPLICATION ENTRY POINT
//

// XXX: RUNTIME POLYFILL: Required for generators and others
import 'babel/polyfill';

import config from 'config';
import mongoose from 'mongoose';
import * as processors from './processors/index';

// Connect to mongo then start processing jobs
mongoose.connect(config.get('MONGO_URL'));
let db = mongoose.connection;
db.on('error', () => {
  console.error('Mongo connection error.');
});
db.once('open', () => {
  console.log('Successfully connected to mongo, starting processors.');
  processors.start();
});

// Cleanup just in case
process.once('SIGTERM', function(sig) {
  db.close();
  server.close();
});

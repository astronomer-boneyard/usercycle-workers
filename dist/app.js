'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

//
// APPLICATION ENTRY POINT
//

// XXX: RUNTIME POLYFILL: Required for generators and others

require('babel/polyfill');

var _dotenv = require('dotenv');

var _dotenv2 = _interopRequireWildcard(_dotenv);

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireWildcard(_mongoose);

var _import = require('./processors/index');

var processors = _interopRequireWildcard(_import);

// Load environment variables into process.env from .env file
_dotenv2['default'].load();

// Connect to mongo then start processing jobs
_mongoose2['default'].connect(process.env.MONGO_URL);
var db = _mongoose2['default'].connection;
db.on('error', function () {
  console.error('Mongo connection error.');
});
db.once('open', function () {
  console.log('Successfully connected to mongo, starting processors.');
  processors.start();
});

// Cleanup just in case
process.once('SIGTERM', function (sig) {
  db.close();
  server.close();
});
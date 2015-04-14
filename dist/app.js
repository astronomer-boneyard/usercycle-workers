'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

// XXX: RUNTIME POLYFILL: Required for generators and others

require('babel/polyfill');

var _dotenv = require('dotenv');

var _dotenv2 = _interopRequireWildcard(_dotenv);

var _kue = require('kue');

var _kue2 = _interopRequireWildcard(_kue);

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireWildcard(_mongoose);

var _import = require('./processors/index');

var processors = _interopRequireWildcard(_import);

// Load environment variables into process.env from .env file
_dotenv2['default'].load();

// Setup kue
var queue = _kue2['default'].createQueue();
var server = _kue2['default'].app.listen(8080);

// Connect to mongo then start processing jobs
_mongoose2['default'].connect(process.env.MONGO_URL);
var db = _mongoose2['default'].connection;
db.on('error', function () {
  console.error('Mongo connection error.');
});
db.once('open', function () {
  console.log('Successfully connected to mongo, starting processors.');
  processors.start(queue);
});

// Cleanup just in case
process.once('SIGTERM', function (sig) {
  db.close();
  server.close();
});

// TESTING -----------------------------------------------------
var job = queue.create('summaryEmail', {
  viewId: 'j74dvzrWjf5qm3tSH'
}).removeOnComplete(true).save();
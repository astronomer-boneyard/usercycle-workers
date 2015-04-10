'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

var _kue = require('kue');

var _kue2 = _interopRequireWildcard(_kue);

var _import = require('./processors/index');

var processors = _interopRequireWildcard(_import);

// XXX: RUNTIME POLYFILL: Required for generators and others
require('babel/polyfill');

// Setup kue
var queue = _kue2['default'].createQueue();
var server = _kue2['default'].app.listen(8080);

process.once('SIGTERM', function (sig) {
  server.close();
  queue.shutdown(function (err) {
    console.log('Kue is shut down.', err || '');
    process.exit(0);
  }, 5000);
});

// Setup our job processors
processors.start(queue);

// TESTING -----------------------------------------------------
var job = queue.create('summaryEmail', {
  viewId: 'S2GKhPr6g2muCatGw'
}).removeOnComplete(true).save();
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.start = start;

var _import = require('lodash');

var _import2 = _interopRequireWildcard(_import);

var _co = require('co');

var _co2 = _interopRequireWildcard(_co);

var _queue = require('../lib/queue');

var _queue2 = _interopRequireWildcard(_queue);

var _summaryEmail = require('./emails/summaryEmail');

var _summaryEmail2 = _interopRequireWildcard(_summaryEmail);

var _retentionQueryBuilder = require('./retention/retentionQueryBuilder');

var _retentionQueryBuilder2 = _interopRequireWildcard(_retentionQueryBuilder);

var _retentionQueryRunner = require('./retention/retentionQueryRunner');

var _retentionQueryRunner2 = _interopRequireWildcard(_retentionQueryRunner);

function createHandler(factory) {
  // This function serves as a generic handler
  // It is in charge of creating a new handler and passing the job
  return function (job, done) {
    // Produce a new instance from factory
    var processor = factory.create({ job: job, done: done });

    // Turn handlers generator process function into a regular
    // function that returns a promise
    var wrapped = _co2['default'].wrap(processor.process);

    // Rebind the process function to the processor object,
    // since co.wrap binds `this` to global.
    var bound = _import2['default'].bind(wrapped, processor);

    // Call our wrapped and bound function and return a promise
    bound()['catch'](function (error) {
      console.error('An error occured processing a job:\n', error);
      done(new Error('' + error.name + ' - ' + error.message));
    });
  };
}

function startProcessing(type, handler) {
  _queue2['default'].process(type, 5, handler);
}

function start(queue) {
  // Setup kue processors
  startProcessing('summaryEmail', createHandler(_summaryEmail2['default']));
  startProcessing('retentionQueryBuilder', createHandler(_retentionQueryBuilder2['default']));
  startProcessing('retentionQueryRunner', createHandler(_retentionQueryRunner2['default']));
}

// TESTING ---------------------------------------------------------------------
console.log('Pushing test jobs...');

// let job = queue.create('summaryEmail', {
//   viewId: 'j74dvzrWjf5qm3tSH'
// }).removeOnComplete(true).save();
//
var job = _queue2['default'].create('retentionQueryBuilder', {
  viewId: 'fzGirKkNGLKpaBmZT'
}).removeOnComplete(true).save();
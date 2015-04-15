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
    var processor = factory.create();

    // Turn handlers generator process function into a regular
    // function that returns a promise
    var wrapped = _co2['default'].wrap(processor.process);

    // Rebind the process function to the processor object,
    // since co.wrap binds `this` to global.
    var bound = _import2['default'].bind(wrapped, processor);

    // Call our wrapped and bound function and return a promise
    bound(job, done)['catch'](function (error) {
      console.error('An error occured processing a job:\n', error.stack);
    });
  };
}

function start(queue) {
  // Setup kue processors
  queue.process('summaryEmail', createHandler(_summaryEmail2['default']));
  queue.process('retentionQueryBuilder', createHandler(_retentionQueryBuilder2['default']));
  queue.process('retentionQueryRunner', createHandler(_retentionQueryRunner2['default']));
}
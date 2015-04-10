'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.start = start;

var _co = require('co');

var _co2 = _interopRequireWildcard(_co);

var _summaryEmailFactory = require('./summaryEmail');

var _summaryEmailFactory2 = _interopRequireWildcard(_summaryEmailFactory);

function createHandler(processor) {
  return function () {
    _co2['default'](processor.process)['catch'](function (error) {
      console.error('An error occured in a job processor:\n', error.stack);
    });
  };
}

function start(queue) {
  // Setup kue processors
  var summaryEmail = _summaryEmailFactory2['default'].create();
  queue.process('summaryEmail', createHandler(summaryEmail));
}
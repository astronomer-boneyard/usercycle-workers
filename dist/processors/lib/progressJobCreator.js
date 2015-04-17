'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _import = require('lodash');

var _import2 = _interopRequireWildcard(_import);

var _stampit = require('stampit');

var _stampit2 = _interopRequireWildcard(_stampit);

var _queue = require('../../lib/queue');

var _queue2 = _interopRequireWildcard(_queue);

var _View = require('../../models/view');

var _View2 = _interopRequireWildcard(_View);

//
// Mixin for controlling progress on views
//
exports['default'] = _stampit2['default']().enclose(function () {

  this.createJob = function (jobType, data) {
    var job = _queue2['default'].create(jobType, data).removeOnComplete(true).attempts(5).backoff({ delay: 60 * 1000, type: 'exponential' }).save();

    job.on('enqueue', function (param) {
      var selector = { _id: data.viewId },
          modifier = { $inc: { 'progress.total': 1 } };

      _View2['default'].update(selector, modifier, _import2['default'].noop);
    });

    job.on('complete', function (result) {
      var selector = { _id: data.viewId },
          modifier = { $inc: { 'progress.complete': 1 } },
          options = { 'new': true };

      _View2['default'].findOneAndUpdate(selector, modifier, options, function (error, view) {
        if (view.progress.complete === view.progress.total) {
          view.ensureZeroProgress();
        }
      });
    });
  };
});
module.exports = exports['default'];
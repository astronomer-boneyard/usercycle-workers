'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _import = require('lodash');

var _import2 = _interopRequireWildcard(_import);

var _stampit = require('stampit');

var _stampit2 = _interopRequireWildcard(_stampit);

var _QueryRunner$Keen = require('../../datasources/keen');

var _View = require('../../models/view');

var _View2 = _interopRequireWildcard(_View);

var _Project = require('../../models/project');

var _Project2 = _interopRequireWildcard(_Project);

exports['default'] = _stampit2['default']().enclose(function () {

  this.handleResponse = function (response) {
    throw new Error('handleResponse not implemented!');
  };

  this.process = regeneratorRuntime.mark(function callee$1$0() {
    var _job$data, viewId, cohortInterval, steps, view, query, response;

    return regeneratorRuntime.wrap(function callee$1$0$(context$2$0) {
      while (1) switch (context$2$0.prev = context$2$0.next) {
        case 0:
          _job$data = this.job.data;
          viewId = _job$data.viewId;
          cohortInterval = _job$data.cohortInterval;
          steps = _job$data.steps;
          context$2$0.next = 6;
          return _View2['default'].findOne({ _id: viewId }).populate({ path: 'project' }).exec();

        case 6:
          view = context$2$0.sent;

          if (!view) this.done(new Error('View does not exist'));

          console.log('Running ' + cohortInterval + ' queries for ' + view.project.name);

          query = new _QueryRunner$Keen.Keen.Query('funnel', { steps: steps });
          context$2$0.next = 12;
          return _QueryRunner$Keen.QueryRunner.run(view.project, query);

        case 12:
          response = context$2$0.sent;
          context$2$0.next = 15;
          return this.handleResponse(response);

        case 15:
          this.done();

        case 16:
        case 'end':
          return context$2$0.stop();
      }
    }, callee$1$0, this);
  });
});
module.exports = exports['default'];
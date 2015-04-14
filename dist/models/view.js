'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireWildcard(_mongoose);

var _QueryRunner$Keen = require('../datasources/keen');

var _promisify = require('promisify-node');

var _promisify2 = _interopRequireWildcard(_promisify);

var _moment = require('moment');

var _moment2 = _interopRequireWildcard(_moment);

var _co = require('co');

var _co2 = _interopRequireWildcard(_co);

var _import = require('lodash');

var _import2 = _interopRequireWildcard(_import);

var schema = new _mongoose2['default'].Schema({
  _id: String,
  name: String,
  projectId: String,
  start: {},
  end: {},
  emails: []
});

var instanceMethods = {
  project: regeneratorRuntime.mark(function project() {
    return regeneratorRuntime.wrap(function project$(context$1$0) {
      while (1) switch (context$1$0.prev = context$1$0.next) {
        case 0:
          return context$1$0.abrupt('return', this.model('Project').findOne({ _id: this.projectId }).exec());

        case 1:
        case 'end':
          return context$1$0.stop();
      }
    }, project, this);
  }),

  firstTimestamp: regeneratorRuntime.mark(function firstTimestamp(collection) {
    var project, min, response;
    return regeneratorRuntime.wrap(function firstTimestamp$(context$1$0) {
      while (1) switch (context$1$0.prev = context$1$0.next) {
        case 0:
          context$1$0.next = 2;
          return this.project();

        case 2:
          project = context$1$0.sent;
          min = new _QueryRunner$Keen.Keen.Query('minimum', {
            event_collection: collection,
            target_property: 'keen.timestamp'
          });
          context$1$0.next = 6;
          return _QueryRunner$Keen.QueryRunner.run(project, min);

        case 6:
          response = context$1$0.sent;
          return context$1$0.abrupt('return', response.result);

        case 8:
        case 'end':
          return context$1$0.stop();
      }
    }, firstTimestamp, this);
  }),

  firstStartEvent: regeneratorRuntime.mark(function firstStartEvent() {
    var ts, max;
    return regeneratorRuntime.wrap(function firstStartEvent$(context$1$0) {
      while (1) switch (context$1$0.prev = context$1$0.next) {
        case 0:
          context$1$0.next = 2;
          return this.firstTimestamp(this.start.event);

        case 2:
          ts = context$1$0.sent;
          max = _moment2['default'].max(_moment2['default'].utc(ts), _moment2['default'].utc('2000-01-01'));
          return context$1$0.abrupt('return', max.format());

        case 5:
        case 'end':
          return context$1$0.stop();
      }
    }, firstStartEvent, this);
  }),

  firstEndEvent: regeneratorRuntime.mark(function firstEndEvent() {
    var min;
    return regeneratorRuntime.wrap(function firstEndEvent$(context$1$0) {
      var _this = this;

      while (1) switch (context$1$0.prev = context$1$0.next) {
        case 0:
          min = _moment2['default'].min(_import2['default'].map(this.end.events, function (ev) {
            var ts = _this.firstTimestamp(ev.event);
            return _moment2['default'].utc(ts);
          }));
          return context$1$0.abrupt('return', min.format());

        case 2:
        case 'end':
          return context$1$0.stop();
      }
    }, firstEndEvent, this);
  }),

  firstStartEventForInterval: regeneratorRuntime.mark(function firstStartEventForInterval(interval) {
    var ts;
    return regeneratorRuntime.wrap(function firstStartEventForInterval$(context$1$0) {
      while (1) switch (context$1$0.prev = context$1$0.next) {
        case 0:
          context$1$0.next = 2;
          return this.firstTimestamp(this.start.event);

        case 2:
          ts = context$1$0.sent;
          return context$1$0.abrupt('return', _moment2['default'].utc(ts).startOf(interval));

        case 4:
        case 'end':
          return context$1$0.stop();
      }
    }, firstStartEventForInterval, this);
  })
};

// Babel complains if you inline a co.wrap with an anon func,
// so we have to loop through and assign to schema methods for now.
_import2['default'].each(instanceMethods, function (fn, key) {
  schema.methods[key] = _co2['default'].wrap(fn);
});

exports['default'] = _mongoose2['default'].model('View', schema, 'views');
module.exports = exports['default'];
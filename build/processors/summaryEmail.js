'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _db = require('../db');

var _db2 = _interopRequireWildcard(_db);

var _util = require('../util');

var _util2 = _interopRequireWildcard(_util);

var _stampit = require('stampit');

var _stampit2 = _interopRequireWildcard(_stampit);

var factory = _stampit2['default']().enclose(function () {

  this.process = regeneratorRuntime.mark(function callee$1$0(job, done) {
    var view, project;
    return regeneratorRuntime.wrap(function callee$1$0$(context$2$0) {
      while (1) switch (context$2$0.prev = context$2$0.next) {
        case 0:
          context$2$0.next = 2;
          return _db2['default'].views.findOne({ _id: 'S2GKhPr6g2muCatGw' });

        case 2:
          view = context$2$0.sent;
          context$2$0.next = 5;
          return _db2['default'].projects.findOne({ _id: view.projectId });

        case 5:
          project = context$2$0.sent;

          console.log({ view: view, project: project });

        case 7:
        case 'end':
          return context$2$0.stop();
      }
    }, callee$1$0, this);
  });
});

exports['default'] = factory;
module.exports = exports['default'];
// this.generateData = () => {
//   let pack = projectName:
//   return util.INTERVALS.forEach((i) => {
//
//   });
// }
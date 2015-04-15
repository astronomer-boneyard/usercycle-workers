'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _import = require('lodash');

var _import2 = _interopRequireWildcard(_import);

var _stampit = require('stampit');

var _stampit2 = _interopRequireWildcard(_stampit);

var _keen = require('keen.io');

var _keen2 = _interopRequireWildcard(_keen);

var _promisify = require('promisify-node');

var _promisify2 = _interopRequireWildcard(_promisify);

var stamp = _stampit2['default']().enclose(function () {

  function getClient(project) {
    var client = _keen2['default'].configure({
      projectId: project.keen.projectId,
      readKey: project.keen.readKey
    });
    _promisify2['default'](client);
    return client;
  }

  this.run = function (project, queries) {
    var client = getClient(project);
    var arr = _import2['default'].flatten([queries]);
    return client.run(arr);
  };
});

var Keen = _keen2['default'];
exports.Keen = Keen;
var QueryRunner = stamp.create();
exports.QueryRunner = QueryRunner;
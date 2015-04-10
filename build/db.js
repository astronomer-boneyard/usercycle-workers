'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _Monk = require('monk');

var _Monk2 = _interopRequireWildcard(_Monk);

var _wrap = require('co-monk');

var _wrap2 = _interopRequireWildcard(_wrap);

var _random = require('meteor-random');

var _random2 = _interopRequireWildcard(_random);

// XXX: Override monk's id casting function to return meteor style id's
_Monk2['default'].Collection.prototype.id = function (str) {
  return !str ? _random2['default'].id() : str;
};

// Setup database and collections
var url = 'mongodb://localhost:3001/meteor';

// Connect to the database
var db = _Monk2['default'](url);

// Export should be cached, so subsequent imports will not re-run
exports['default'] = {
  views: _wrap2['default'](db.get('views')),
  projects: _wrap2['default'](db.get('projects')),
  users: _wrap2['default'](db.get('users'))
};
module.exports = exports['default'];
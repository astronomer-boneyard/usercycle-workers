'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _apostle = require('apostle.io');

var _apostle2 = _interopRequireWildcard(_apostle);

var _import = require('lodash');

var _import2 = _interopRequireWildcard(_import);

exports['default'] = {
  send: function send(emails, template, params) {
    _apostle2['default'].domainKey = process.env.APOSTLE_DOMAINKEY;
    emails = _import2['default'].flattenDeep([emails]);

    var queue = _apostle2['default'].createQueue();
    _import2['default'].each(emails, function (email) {
      params.email = email;
      queue.push(template, params);
    });

    queue.deliver();
  }
};
module.exports = exports['default'];
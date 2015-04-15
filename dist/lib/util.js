'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _import = require('lodash');

var _import2 = _interopRequireWildcard(_import);

exports['default'] = {
  MAX_COHORTS_PER_INTERVAL: 30,

  INTERVALS: ['day', 'week', 'month'],

  convertvalue: function convertvalue(val, fn) {
    val = _import2['default'].isArray(val) ? _import2['default'].map(val, function (v) {
      _import2['default'].trim(v);
    }) : _import2['default'].trim(val);
    return _import2['default'].isArray(val) ? _import2['default'].map(val, fn) : fn(val);
  },

  processFilters: function processFilters(filters) {
    var _this = this;

    return _import2['default'].map(filters, function (filter) {

      // Initalize our new filter object
      var f = {
        property_name: filter.property_name,
        operator: filter.operator
      };

      // First, set value to an array if using IN
      if (filter.operator === 'in') {
        f.property_value = filter.property_value.split(',');
      } else {
        f.property_value = filter.property_value;
      }

      // Then convert value(s) to appropriate type if needed
      if (filter.property_type === 'boolean') {
        f.property_value = _this.convertValue(f.property_value, function (val) {
          return String(val) === 'true';
        });
      } else if (filter.property_type === 'number') {
        f.property_value = _this.convertValue(f.property_value, function (val) {
          return Number(val);
        });
      } else {
        f.property_value = _this.convertValue(f.property_value, function (val) {
          return val;
        });
      }

      return f;
    });
  }
};
module.exports = exports['default'];
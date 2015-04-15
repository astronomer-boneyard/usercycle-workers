import _ from 'lodash';

export default {
  MAX_COHORTS_PER_INTERVAL: 30,

  INTERVALS: ['day', 'week', 'month'],

  convertvalue: function(val, fn) {
    val = _.isArray(val) ? _.map(val, (v) => { _.trim(v) }) : _.trim(val);
    return _.isArray(val) ? _.map(val, fn) : fn(val);
  },

  processFilters: function(filters) {
    return _.map(filters, (filter) => {

      // Initalize our new filter object
      let f = {
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
        f.property_value = this.convertValue(f.property_value, (val) => {
          return String(val) === 'true'
        });
      } else if (filter.property_type === 'number') {
        f.property_value = this.convertValue(f.property_value, (val) => {
          return Number(val);
        });
      } else {
        f.property_value = this.convertValue(f.property_value, (val) => {
          return val;
        });
      }

      return f;
    });
  }
}

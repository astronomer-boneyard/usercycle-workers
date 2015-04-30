import _ from 'lodash';
import config from 'config';
import apostle from 'apostle.io';

export default {
  send: function(emails, template, params) {
    apostle.domainKey = config.get('apostle_domainkey');
    emails = _.compact(_.flattenDeep([emails]));

    let queue = apostle.createQueue();
    _.each(emails, (email) => {
      params.email = email;
      queue.push(template, params);
    });

    queue.deliver();
  }
};

import _ from 'lodash';
import apostle from 'apostle.io';

export default {
  send: function(emails, template, params) {
    apostle.domainKey = process.env.APOSTLE_DOMAINKEY;
    emails = _.compact(_.flattenDeep([emails]));

    let queue = apostle.createQueue();
    _.each(emails, (email) => {
      params.email = email;
      queue.push(template, params);
    });

    queue.deliver();
  }
};

import apostle from 'apostle.io';
import _ from 'lodash';

export default {
  send: function(emails, template, params) {
    apostle.domainKey = process.env.APOSTLE_DOMAINKEY;
    emails = _.flattenDeep([emails]);

    let queue = apostle.createQueue();
    _.each(emails, (email) => {
      params.email = email;
      queue.push(template, params);
    });

    queue.deliver();
  }
}

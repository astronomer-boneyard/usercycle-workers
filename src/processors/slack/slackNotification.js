import _ from 'lodash';
import stampit from 'stampit';
import config from 'config';
import request from 'request-promise';

export default stampit().enclose(function() {

  this.process = function* () {
    let uri = config.get('slack.urls')[this.job.data.channel];
    yield request({
      method: 'POST',
      uri: uri,
      json: true,
      body: {
        channel: this.job.data.channel,
        username: 'The App',
        text: this.job.data.text,
        icon_url: 'https://usercycle.com/img/icon.png',
        link_names: 1
      }
    });
  };
});

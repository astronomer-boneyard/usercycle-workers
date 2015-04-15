import _ from 'lodash';
import stampit from 'stampit';

let retentionQueryRunner = stampit().enclose(function() {

  this.process = function* (job, done) {
    console.log('QueryRUNNER!!!!!!!!!!!!');
    done();
  }
});

export default stampit.compose(retentionQueryRunner);

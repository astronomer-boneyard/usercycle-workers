import _ from 'lodash';
import stampit from 'stampit';
import funnelQueryRunner from '../lib/funnelQueryRunner';

let retentionQueryRunner = stampit().enclose(function() {



});

export default stampit.compose(funnelQueryRunner, retentionQueryRunner);

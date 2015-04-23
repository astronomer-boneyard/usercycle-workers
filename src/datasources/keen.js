import _ from 'lodash';
import stampit from 'stampit';
import keen from 'keen.io';
import thenifyAll from 'thenify-all';

let stamp = stampit().enclose(function() {

  function getClient(project) {
    return thenifyAll(keen.configure({
      projectId: project.keen.projectId,
      readKey: project.keen.readKey
    }));
  }

  this.run = function(project, queries) {
    let client = getClient(project);
    let arr = _.flatten([queries]);
    return client.run(arr);
  };

});

export var Keen = keen;
export var QueryRunner = stamp.create();

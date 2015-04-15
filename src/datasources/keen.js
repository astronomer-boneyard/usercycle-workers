import _ from 'lodash';
import stampit from 'stampit';
import keen from 'keen.io';
import promisify from 'promisify-node';

let stamp = stampit().enclose(function() {

  function getClient(project) {
    let client = keen.configure({
      projectId: project.keen.projectId,
      readKey: project.keen.readKey
    });
    promisify(client);
    return client;
  }

  this.run = function(project, queries) {
    let client = getClient(project);
    let arr = _.flatten([queries]);
    return client.run(arr);
  }

});

export var Keen = keen;
export var QueryRunner = stamp.create();

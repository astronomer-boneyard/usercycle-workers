import _ from 'lodash';
import Keen from 'keen-js';
import thenify from 'thenify';

Keen.run = function(project, queries) {
  let client = new Keen({
    projectId: project.keen.projectId,
    readKey: project.keen.readKey
  });

  client.run = thenify(client.run);
  let arr = _.flatten([queries]);
  return client.run(arr);
};


export default Keen;

import _ from 'lodash';
import co from 'co';
import summaryEmail from './emails/summaryEmail';
import retentionQueryBuilder from './retention/retentionQueryBuilder';
import retentionQueryRunner from './retention/retentionQueryRunner';

function createHandler(factory) {
  // This function serves as a generic handler
  // It is in charge of creating a new handler and passing the job
  return function(job, done) {
    // Produce a new instance from factory
    let processor = factory.create();

    // Turn handlers generator process function into a regular
    // function that returns a promise
    let wrapped = co.wrap(processor.process);

    // Rebind the process function to the processor object,
    // since co.wrap binds `this` to global.
    let bound = _.bind(wrapped, processor);

    // Call our wrapped and bound function and return a promise
    bound(job, done).catch(function(error) {
      console.error("An error occured processing a job:\n", error.stack);
    });
  }
}

export function start(queue) {
  // Setup kue processors
  queue.process('summaryEmail', createHandler(summaryEmail));
  queue.process('retentionQueryBuilder', createHandler(retentionQueryBuilder));
  queue.process('retentionQueryRunner', createHandler(retentionQueryRunner));
}

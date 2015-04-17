import _ from 'lodash';
import co from 'co';
import queue from '../lib/queue';
import summaryEmail from './emails/summaryEmail';
import retentionQueryBuilder from './retention/retentionQueryBuilder';
import retentionQueryRunner from './retention/retentionQueryRunner';

function createHandler(factory) {
  // This function serves as a generic handler
  // It is in charge of creating a new handler and passing the job
  return function(job, done) {
    // Produce a new instance from factory
    let processor = factory.create({job, done});

    // Turn handlers generator process function into a regular
    // function that returns a promise
    let wrapped = co.wrap(processor.process);

    // Rebind the process function to the processor object,
    // since co.wrap binds `this` to global.
    let bound = _.bind(wrapped, processor);

    // Call our wrapped and bound function and return a promise
    bound().catch(function(error) {
      console.error('An error occured processing a job:\n', error);
      done(new Error(`${error.name} - ${error.message}`));
    });
  }
}

function startProcessing(type, handler) {
  queue.process(type, 5, handler);
}

export function start(queue) {
  // Setup kue processors
  startProcessing('summaryEmail', createHandler(summaryEmail));
  startProcessing('retentionQueryBuilder', createHandler(retentionQueryBuilder));
  startProcessing('retentionQueryRunner', createHandler(retentionQueryRunner));
}



// TESTING ---------------------------------------------------------------------
console.log('Pushing test jobs...');

// let job = queue.create('summaryEmail', {
//   viewId: 'j74dvzrWjf5qm3tSH'
// }).removeOnComplete(true).save();
//
let job = queue.create('retentionQueryBuilder', {
  viewId: 'fzGirKkNGLKpaBmZT'
}).removeOnComplete(true).save();

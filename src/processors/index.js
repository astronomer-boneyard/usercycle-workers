import _ from 'lodash';
import co from 'co';
import stampit from 'stampit';
import queue from '../lib/queue';
import counters from '../lib/counters';
import View from '../models/view';
import jobLifecycle from './lib/jobLifecycle';
import summaryEmail from './emails/summaryEmail';
import retentionQueryBuilder from './retention/retentionQueryBuilder';
import retentionQueryRunner from './retention/retentionQueryRunner';
import revenueQueryBuilder from './revenue/revenueQueryBuilder';
import revenueQueryRunner from './revenue/revenueQueryRunner';
import revenueSum from './revenue/revenueSum';


function createHandler(factory) {
  // Reassign factory - mixin lifecycle management
  factory = stampit.compose(jobLifecycle, factory);

  // This function serves as a generic handler
  // It is in charge of creating a new handler and passing the job
  return function(job, done, ctx) {

    // Produce a new instance from factory
    let processor = factory.create({job, done});

    // Handle errors when running a job
    let onError = function(error) {
      console.error('An error occured processing a job:\n', error);
      done(new Error(`${error.name} - ${error.message}`));
    };

    co(function*() {
      // Determine if we can continue (ie. no query locks)
      if (yield processor.runOnBefore()) {
        // Run main process function
        yield processor.process();
        // Upon successful completion of process, run any onComplete functions
        processor.runOnComplete();
      } else {
        // We cannot process this job, kill it and enqueue a duplicate
        done();
        queue.create(job.type, job.data)
          .delay(5000)
          .removeOnComplete(job._removeOnComplete)
          .attempts(job._max_attempts)
          .backoff(job._backoff)
          .priority(job._priority)
          .save();
      }
    }).catch(onError)
      .finally(processor.runOnAfter);
  }
}

function startProcessing(type, handler) {
  queue.process(type, 50, handler);
}

export function start(queue) {
  // Setup kue processors
  startProcessing('summaryEmail', createHandler(summaryEmail));
  startProcessing('retentionQueryBuilder', createHandler(retentionQueryBuilder));
  startProcessing('retentionQueryRunner', createHandler(retentionQueryRunner));
  startProcessing('revenueQueryBuilder', createHandler(revenueQueryBuilder));
  startProcessing('revenueQueryRunner', createHandler(revenueQueryRunner));
  startProcessing('revenueSum', createHandler(revenueSum));
}



// TESTING ---------------------------------------------------------------------
console.log('Pushing test jobs...');

// let job = queue.create('summaryEmail', {
//   viewId: 'j74dvzrWjf5qm3tSH'
// }).removeOnComplete(true).save();

queue.create('retentionQueryBuilder', {
  viewId: 'fzGirKkNGLKpaBmZT'
}).removeOnComplete(true).save();

// queue.create('retentionQueryBuilder', {
//   viewId: 'kYjBZRX8myih4fJCb'
// }).removeOnComplete(true).save();


// ['kYjBZRX8myih4fJCb',
// 'fzGirKkNGLKpaBmZT',
// 'carMscSqEZ7XupbL8'].forEach((id) => {
//   queue.create('retentionQueryBuilder', {
//     viewId: id
//   }).removeOnComplete(true).save();
// });


// let job = queue.create('revenueQueryBuilder', {
//   viewId: 'QhByiDFWxmvFywRiZ'
// }).removeOnComplete(true).save();

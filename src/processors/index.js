import _ from 'lodash';
import co from 'co';
import stampit from 'stampit';
import queue from '../lib/queue';
import View from '../models/view';
import jobLifecycle from './lib/jobLifecycle';
import summaryEmail from './emails/summaryEmail';
import retentionBuilder from './retention/retentionBuilder';
import retentionRunner from './retention/retentionRunner';
import revenueBuilder from './revenue/revenueBuilder';
import revenueRunner from './revenue/revenueRunner';
import revenueSum from './revenue/revenueSum';
import refreshAllViews from './cron/refreshAllViews';


// Start kue processors, with the function returned by `createHandler`
export function start(queue) {
  startProcessing('summaryEmail', createHandler(summaryEmail));
  startProcessing('retentionBuilder', createHandler(retentionBuilder));
  startProcessing('retentionRunner', createHandler(retentionRunner));
  startProcessing('revenueBuilder', createHandler(revenueBuilder));
  startProcessing('revenueRunner', createHandler(revenueRunner));
  startProcessing('revenueSum', createHandler(revenueSum));
  startProcessing('refreshAllViews', createHandler(refreshAllViews));
}


function startProcessing(type, handler) {
  queue.process(type, 50, handler);
}


function createHandler(factory) {

  // Reassign factory - mixin lifecycle management
  factory = stampit.compose(jobLifecycle, factory);

  // This function serves as a generic handler
  // It is in charge of creating a new handler and passing the job
  return function(job, done) {
    // Produce a new instance from factory
    let processor = factory.create({job, done});

    // Handle errors when running a job
    let onError = function(error) {
      console.error('\n', `An error occured processing job #${job.id} - ${job.type}\n`, error);
      done(new Error(`${error.name} - ${error.message}`));
      processor.runOnError(error, job);
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
          .delay(Math.floor((Math.random() * 30) + 5) * 1000) // Random 5 - 30 sec
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

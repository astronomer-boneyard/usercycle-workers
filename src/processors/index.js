import _ from 'lodash';
import co from 'co';
import queue from '../lib/queue';
import counters from '../lib/counters';
import View from '../models/view';
import summaryEmail from './emails/summaryEmail';
import retentionQueryBuilder from './retention/retentionQueryBuilder';
import retentionQueryRunner from './retention/retentionQueryRunner';
import revenueQueryBuilder from './revenue/revenueQueryBuilder';
import revenueQueryRunner from './revenue/revenueQueryRunner';
import revenueSum from './revenue/revenueSum';

function createHandler(factory) {
  // This function serves as a generic handler
  // It is in charge of creating a new handler and passing the job
  return function(job, done) {
    // Produce a new instance from factory
    let processor = factory.create({job, done});

    // Handle errors when running a job
    let onError = function(error) {
      console.error('An error occured processing a job:\n', error);
      done(new Error(`${error.name} - ${error.message}`));
      counters.decrement(job.data.viewId);
    };

    let onComplete = function() {
      counters.decrement(job.data.viewId);
    };

    co(function* () {
      let count = yield counters.increment(job.data.viewId);
      if (count < 10) {
        yield processor.process();
        processor.onComplete && processor.onComplete();
      } else {
        job.delay(10000).delayed();
      }
    }).then(onComplete).catch(onError);
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
//

// let job = queue.create('retentionQueryBuilder', {
//   viewId: 'fzGirKkNGLKpaBmZT'
// }).removeOnComplete(true).save();

let job = queue.create('revenueQueryBuilder', {
  viewId: 'QhByiDFWxmvFywRiZ'
}).removeOnComplete(true).save();

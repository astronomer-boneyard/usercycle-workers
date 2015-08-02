import _ from 'lodash';
import co from 'co';
import moment from 'moment';
import stampit from 'stampit';
import queue from '../lib/queue';
import redis from '../lib/redis';
import View from '../models/view';
import jobLifecycle from './lib/jobLifecycle';
import summaryEmail from './emails/summaryEmail';
import retentionBuilder from './retention/retentionBuilder';
import retentionRunner from './retention/retentionRunner';
import retentionPruner from './retention/retentionPruner';
import revenueBuilder from './revenue/revenueBuilder';
import revenueRunner from './revenue/revenueRunner';
import revenueSum from './revenue/revenueSum';
import revenuePruner from './revenue/revenuePruner';
import behaviorFlowBuilder from './behaviorFlow/behaviorFlowBuilder';
import behaviorFlowRunner from './behaviorFlow/behaviorFlowRunner';
import behaviorFlowDropoffs from './behaviorFlow/behaviorFlowDropoffs';
import behaviorFlowPruner from './behaviorFlow/behaviorFlowPruner';
import refreshAllViews from './cron/refreshAllViews';
import pruneAllViews from './cron/pruneAllViews';
import sendSummaryEmails from './cron/sendSummaryEmails';
import slackNotification from './slack/slackNotification';

// Start kue processors, with the function returned by `createHandler`
export function start(queue) {
  // Emails
  startProcessing('summaryEmail', createHandler(summaryEmail));
  // Retention
  startProcessing('retentionBuilder', createHandler(retentionBuilder));
  startProcessing('retentionRunner', createHandler(retentionRunner));
  startProcessing('retentionPruner', createHandler(retentionPruner));
  // Revenue
  startProcessing('revenueBuilder', createHandler(revenueBuilder));
  startProcessing('revenueRunner', createHandler(revenueRunner));
  startProcessing('revenueSum', createHandler(revenueSum));
  startProcessing('revenuePruner', createHandler(revenuePruner));
  // Behavior Flow
  // *** Behavior Flow is Disabled ***
  //startProcessing('behaviorFlowBuilder', createHandler(behaviorFlowBuilder));
  //startProcessing('behaviorFlowRunner', createHandler(behaviorFlowRunner));
  //startProcessing('behaviorFlowDropoffs', createHandler(behaviorFlowDropoffs));
  //startProcessing('behaviorFlowPruner', createHandler(behaviorFlowPruner));
  // Cron
  startProcessing('refreshAllViews', createHandler(refreshAllViews));
  startProcessing('pruneAllViews', createHandler(pruneAllViews));
  startProcessing('sendSummaryEmails', createHandler(sendSummaryEmails));
  // Slack
  startProcessing('slackNotification', createHandler(slackNotification));
}


function startProcessing(type, handler) {
  queue.process(type, 20, handler);
}


function requeueJob(job) {
  queue.create(job.type, job.data)
    .delay(Math.floor((Math.random() * 45) + 10) * 1000) // Random 10 - 45 sec
    .removeOnComplete(job._removeOnComplete)
    .attempts(job._max_attempts)
    .backoff(job._backoff)
    .priority(job._priority)
    .ttl(job._ttl)
    .save();
}


function createHandler(factory) {
  // Reassign factory - mixin lifecycle management
  factory = stampit.compose(jobLifecycle, factory);

  // This function serves as a generic handler
  // It is in charge of creating a new processor and passing the job
  return function(job, ctx, done) {
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
        // We cannot process this job, kill it and schedule a duplicate
        requeueJob(job);
      }
    }).then(done)
      .catch(onError)
      .finally(processor.runOnAfter);
  }
}

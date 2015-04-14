import co from 'co';
import summaryEmailFactory from './summaryEmail';

function createHandler(processor) {
  return function(job, done) {
    co.wrap(processor.process)(job, done).catch(function(error){
      console.error("An error occured processing a job:\n", error.stack);
    });
  }
}

export function start(queue) {
  // Setup kue processors
  let summaryEmail = summaryEmailFactory.create();
  queue.process('summaryEmail', createHandler(summaryEmail));
}

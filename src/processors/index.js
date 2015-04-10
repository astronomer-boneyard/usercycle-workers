import co from 'co';
import summaryEmailFactory from './summaryEmail';

function createHandler(processor) {
  return function() {
    co(processor.process).catch(function(error){
      console.error("An error occured in a job processor:\n", error.stack);
    });
  }
}

export function start(queue) {
  // Setup kue processors
  let summaryEmail = summaryEmailFactory.create();
  queue.process('summaryEmail', createHandler(summaryEmail));
}

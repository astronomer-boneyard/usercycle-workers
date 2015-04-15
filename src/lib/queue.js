import kue from 'kue';

// Setup kue
let queue = kue.createQueue();

// Start GUI server
let server = kue.app.listen(8080);

export default queue;

const path = require('path');
const dotenv = require('dotenv');
const Queue = require('bullmq').Queue;

dotenv.config({ path: '../.env' });

class NotificationClient {
  constructor(type, opts) {
    this.queue = new Queue(type, opts);
  }

  async enqueue(jobName, job, retry = undefined) {
    await this.queue.add(jobName, job);
    console.log(`Enqueued ${jobName} notification to ${job.to}`);
  }

  close() {
    return this.queue.close();
  }
}

module.exports = new NotificationClient('notification', {
  connection: { host: process.env.REDIS_HOST, port: process.env.REDIS_PORT },
});

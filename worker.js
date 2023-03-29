const dotenv = require('dotenv');
const { Worker } = require('bullmq');
const SendMail = require('./emailProcessor');
const PhoneMail = require('./phoneProcessor');

dotenv.config({ path: '.env' });

const worker = new Worker(
  'notification',
  async (job) => {
    switch (job.name) {
      case 'email-message': {
        await SendMail(job);
        break;
      }
      case 'phone-message': {
        await PhoneMail(job);
        break;
      }
    }
  },
  {
    connection: { host: process.env.REDIS_HOST, port: process.env.REDIS_PORT },
    concurrency: parseInt(process.env.CONCURRENCY, 10),
    removeOnComplete: { count: 0 },
    removeOnFail: { count: 0 },
  }
);
console.log(process.env.REDIS_HOST);
console.info('Worker listening for mail jobs');

module.exports = worker;

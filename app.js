const express = require('express');
const { Queue } = require('bullmq');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');
const maskedCardNumber = require('./helpers/maskedCardNumber');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

const queue = new Queue('notification', {
  connection: { host: process.env.REDIS_HOST, port: process.env.REDIS_PORT },
});

const app = express();

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/api/v1/notifications', async (req, res) => {
  const source = fs.readFileSync(
    path.join(__dirname, 'helpers/templates/notification.handlebars'),
    'utf8'
  );
  const compiledTemplate = handlebars.compile(source);
  const payload = { ...req.body };
  payload.firstName = payload.card_name.split(' ')[0];
  payload.card_number = maskedCardNumber(payload.card_number);

  const job = {
    from: 'Nairalink <support@cloudmendy.tech>',
    subject: 'Card creation',
    to: req.body.email,
    html: compiledTemplate(payload),
  };
  await queue.add('email-message', job);
  console.info(`Enqueued an email sending to ${job.to}`);

  return res
    .status(200)
    .json({ message: 'Received and processing email notification' });
});

app.listen(port = process.env.PORT, () => {
  console.log(`Notification listening on port ${process.env.PORT}`);
});

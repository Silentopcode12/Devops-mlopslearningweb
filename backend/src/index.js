const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const client = require('prom-client');

const { port, mongoUri, frontendOrigin } = require('./config/env');
const articlesRouter = require('./routes/articles');
const contactRouter = require('./routes/contact');

const app = express();

app.use(helmet());
app.use(cors({ origin: frontendOrigin }));
app.use(express.json());
app.use(morgan('dev'));

client.collectDefaultMetrics();

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'cloud-native-ops-backend' });
});

app.use('/api/articles', articlesRouter);
app.use('/api/contact', contactRouter);

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

async function startServer() {
  try {
    await mongoose.connect(mongoUri);
    app.listen(port, () => {
      console.log(`Backend running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start backend:', error.message);
    process.exit(1);
  }
}

startServer();

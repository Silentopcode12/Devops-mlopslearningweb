const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 8081;
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/hrms_auth';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, default: 'employee' }
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'auth-service' }));

app.post('/api/auth/register', async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: 'Unable to register user', details: error.message });
  }
});

app.get('/api/auth/users', async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json(users);
});

async function start() {
  await mongoose.connect(mongoUri);
  app.listen(port, () => console.log(`Auth service running on ${port}`));
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});

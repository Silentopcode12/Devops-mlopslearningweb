const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 8083;
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/hrms_leave';

const leaveSchema = new mongoose.Schema(
  {
    employeeId: { type: String, required: true },
    reason: { type: String, required: true },
    fromDate: { type: String, required: true },
    toDate: { type: String, required: true },
    status: { type: String, default: 'PENDING' }
  },
  { timestamps: true }
);

const Leave = mongoose.model('Leave', leaveSchema);

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'leave-service' }));

app.get('/api/leave', async (req, res) => {
  const leaves = await Leave.find().sort({ createdAt: -1 });
  res.json(leaves);
});

app.post('/api/leave', async (req, res) => {
  try {
    const leave = await Leave.create(req.body);
    res.status(201).json(leave);
  } catch (error) {
    res.status(400).json({ error: 'Unable to create leave request', details: error.message });
  }
});

app.patch('/api/leave/:id/approve', async (req, res) => {
  const leave = await Leave.findByIdAndUpdate(req.params.id, { status: 'APPROVED' }, { new: true });
  if (!leave) {
    return res.status(404).json({ error: 'Leave request not found' });
  }
  return res.json(leave);
});

async function start() {
  await mongoose.connect(mongoUri);
  app.listen(port, () => console.log(`Leave service running on ${port}`));
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 8082;
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/hrms_employee';

const employeeSchema = new mongoose.Schema(
  {
    employeeId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    department: { type: String, required: true },
    title: { type: String, required: true },
    salary: { type: Number, required: true }
  },
  { timestamps: true }
);

const Employee = mongoose.model('Employee', employeeSchema);

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'employee-service' }));

app.get('/api/employees', async (req, res) => {
  const data = await Employee.find().sort({ createdAt: -1 });
  res.json(data);
});

app.post('/api/employees', async (req, res) => {
  try {
    const employee = await Employee.create(req.body);
    res.status(201).json(employee);
  } catch (error) {
    res.status(400).json({ error: 'Unable to create employee', details: error.message });
  }
});

async function start() {
  await mongoose.connect(mongoUri);
  app.listen(port, () => console.log(`Employee service running on ${port}`));
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});

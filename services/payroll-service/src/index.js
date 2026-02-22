const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 8084;
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/hrms_payroll';

const payrollSchema = new mongoose.Schema(
  {
    employeeId: { type: String, required: true },
    month: { type: String, required: true },
    baseSalary: { type: Number, required: true },
    bonus: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 },
    netPay: { type: Number, required: true }
  },
  { timestamps: true }
);

const Payroll = mongoose.model('Payroll', payrollSchema);

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'payroll-service' }));

app.get('/api/payroll', async (req, res) => {
  const payrolls = await Payroll.find().sort({ createdAt: -1 });
  res.json(payrolls);
});

app.post('/api/payroll', async (req, res) => {
  try {
    const { employeeId, month, baseSalary, bonus = 0, deductions = 0 } = req.body;
    const netPay = Number(baseSalary) + Number(bonus) - Number(deductions);
    const payroll = await Payroll.create({ employeeId, month, baseSalary, bonus, deductions, netPay });
    res.status(201).json(payroll);
  } catch (error) {
    res.status(400).json({ error: 'Unable to generate payroll', details: error.message });
  }
});

async function start() {
  await mongoose.connect(mongoUri);
  app.listen(port, () => console.log(`Payroll service running on ${port}`));
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});

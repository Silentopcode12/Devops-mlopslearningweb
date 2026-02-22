const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');
const { port } = require('./config/env');
const { query } = require('./config/db');

const authRoutes = require('./modules/auth/routes');
const employeeRoutes = require('./modules/employees/routes');
const attendanceRoutes = require('./modules/attendance/routes');
const auditRoutes = require('./modules/audit/routes');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const openApiPath = path.resolve(__dirname, '../../../docs/api/openapi.yaml');
const openApiDoc = YAML.load(openApiPath);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDoc));

app.get('/health', async (req, res) => {
  try {
    await query('SELECT 1');
    return res.json({ status: 'ok', service: 'hrms-api', db: 'ok' });
  } catch (error) {
    return res.status(500).json({ status: 'error', db: error.message });
  }
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/employees', employeeRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/audit-logs', auditRoutes);

app.listen(port, () => {
  console.log(`HRMS API listening on ${port}`);
});

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const port = process.env.PORT || 8080;

const routes = [
  { path: '/api/auth', target: process.env.AUTH_SERVICE_URL || 'http://auth-service:8081' },
  { path: '/api/employees', target: process.env.EMPLOYEE_SERVICE_URL || 'http://employee-service:8082' },
  { path: '/api/leave', target: process.env.LEAVE_SERVICE_URL || 'http://leave-service:8083' },
  { path: '/api/payroll', target: process.env.PAYROLL_SERVICE_URL || 'http://payroll-service:8084' }
];

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'gateway' });
});

routes.forEach((route) => {
  app.use(
    route.path,
    createProxyMiddleware({
      target: route.target,
      changeOrigin: true,
      onError: (err, req, res) => {
        res.status(502).json({ error: `Upstream error for ${route.path}`, details: err.message });
      }
    })
  );
});

app.listen(port, () => {
  console.log(`Gateway running on port ${port}`);
});

const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  port: process.env.PORT || 8080,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/cloud_native_ops',
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173'
};

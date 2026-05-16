const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Basic Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: { message: "Too many requests from this IP, please try again after 15 minutes" }
});

// Apply rate limiter to all requests
app.use(limiter);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'API Gateway' });
});

// Proxy Routes
// These will point to the services defined in the docker-compose setup
const services = [
  { path: '/api/auth', target: process.env.AUTH_SERVICE_URL || 'http://localhost:8001' },
  { path: '/api/records', target: process.env.RECORDS_SERVICE_URL || 'http://localhost:8002' },
  { path: '/api/appointments', target: process.env.APPOINTMENT_SERVICE_URL || 'http://localhost:8003' },
  { path: '/api/billing', target: process.env.BILLING_SERVICE_URL || 'http://localhost:8005' },
];

services.forEach(service => {
  app.use(service.path, createProxyMiddleware({
    target: service.target,
    changeOrigin: true,
    pathRewrite: {
      [`^${service.path}`]: '', // Remove base path when forwarding
    },
  }));
});

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});

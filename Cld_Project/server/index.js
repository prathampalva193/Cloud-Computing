import express from 'express';
import cors from 'cors';
import apiRouter from './routes/api.js';

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', apiRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Cloud Carbon Compass API', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`🌍 Cloud Carbon Compass Backend Server Running`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`📊 API Endpoints: http://localhost:${PORT}/api/summary`);
  console.log(`==================================================\n`);
});

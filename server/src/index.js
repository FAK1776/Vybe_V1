import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { router } from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { validateEnv } from './utils/validateEnv.js';

dotenv.config();
validateEnv();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'development' ? true : process.env.CORS_ORIGIN,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Root route handler
app.get('/', (req, res) => {
  res.json({ message: 'Interview Prep API Server' });
});

// Handle favicon requests
app.get('/favicon.ico', (req, res) => {
  res.status(204).end(); // No content response for favicon
});

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS),
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb', parameterLimit: 100000 }));

// Increase header limits
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Headers', '*');
  next();
});

// Routes
app.use('/api', router);

// Error handling
app.use(errorHandler);

// Handle unmatched routes
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
  process.exit(1);
}); 
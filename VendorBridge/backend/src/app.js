import express from 'express';
import { corsMiddleware } from './middleware/corsMiddleware.js';
import { requestLogger } from './middleware/loggerMiddleware.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import routes from './routes/index.js';

const app = express();

// ============== MIDDLEWARE ==============

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(requestLogger);
}

// CORS
app.use(corsMiddleware);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ============== ROUTES ==============

// Base routes
app.use('/api', routes);

// ============== ERROR HANDLING ==============

// 404 handler
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

export default app;

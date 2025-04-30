import express from 'express';
import http from 'http';
import { json } from 'body-parser';
import config from './config';
import logger from './utils/logger';
import authRouter from './controllers/authController';
import manifestRouter from './controllers/manifestController';
import validationRouter from './controllers/validationController';
import simulationRouter from './controllers/simulationController';
import publishRouter from './controllers/publishController';
import authMiddleware from './middleware/authMiddleware';
import errorHandler from './middleware/errorHandler';
import { startMcpServer } from './utils/mcpServer';

/**
 * Entry point for the ContextMesh backend server.
 * Initializes HTTP API and MCP JSON-RPC server.
 */
async function main() {
  const app = express();

  // Parse incoming JSON bodies
  app.use(json());

  // Public routes (no auth required)
  app.use('/api/auth', authRouter);

  // Protected routes (JWT or wallet auth required)
  app.use('/api', authMiddleware);
  app.use('/api/manifests', manifestRouter);
  app.use('/api/validate', validationRouter);
  app.use('/api/simulate', simulationRouter);
  app.use('/api/publish', publishRouter);

  // Healthcheck endpoint
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  // Global error handler
  app.use(errorHandler);

  // Create HTTP server
  const server = http.createServer(app);

  // Start listening for API requests
  server.listen(config.httpPort, () => {
    logger.info(`HTTP server listening on port ${config.httpPort}`);
  });

  // Initialize MCP (JSON-RPC) server on the same HTTP server
  await startMcpServer(server, config.mcpPath);
  logger.info('MCP JSON-RPC server started');
}

// Bootstrap and handle startup errors
main().catch(err => {
  logger.error('Failed to start ContextMesh server', err);
  process.exit(1);
});

// src/middleware/errorHandler.ts

import { Request, Response, NextFunction } from 'express';

/**
 * Global error handler for Express.
 */
export default function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error(err);
  const status = err.status || 500;
  const message =
    err.message || 'An unexpected error occurred on the server';
  res.status(status).json({ error: message });
}

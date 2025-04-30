// src/middleware/authMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../auth/jwt';
import { verifyWalletSignature } from '../auth/walletAuth';

export interface AuthRequest extends Request {
  user?: JwtPayload | { wallet: string };
}

export default function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  const publicKey = req.headers['x-wallet-publickey'] as string | undefined;
  const signature = req.headers['x-wallet-signature'] as string | undefined;
  const message = req.headers['x-wallet-message'] as string | undefined;

  // 1. JWT Bearer token
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    try {
      const payload = verifyToken(token);
      req.user = payload;
      return next();
    } catch (err: any) {
      return res.status(401).json({ error: 'Invalid or expired JWT' });
    }
  }

  // 2. Wallet-based auth
  if (publicKey && signature && message) {
    const valid = verifyWalletSignature(publicKey, message, signature);
    if (valid) {
      req.user = { wallet: publicKey };
      return next();
    } else {
      return res.status(401).json({ error: 'Invalid wallet signature' });
    }
  }

  // 3. No auth provided
  res.status(401).json({ error: 'Authentication required' });
}

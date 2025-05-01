// src/controllers/authController.ts

import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { verifyWalletSignature } from '../auth/walletAuth';
import { generateToken } from '../auth/jwt';

const router = Router();

// In-memory store for nonces per wallet address
const nonceStore = new Map<string, string>();

/**
 * GET /api/auth/nonce/:walletAddress
 * Generate and return a one-time nonce and message to sign.
 */
router.get('/nonce/:walletAddress', (req: Request, res: Response) => {
  const { walletAddress } = req.params;
  if (!walletAddress) {
    return res.status(400).json({ error: 'walletAddress is required' });
  }
  const nonce = uuidv4();
  nonceStore.set(walletAddress, nonce);
  res.json({
    walletAddress,
    nonce,
    message: `Sign this message to authenticate: ${nonce}`,
  });
});

/**
 * POST /api/auth/wallet/login
 * Body: { walletAddress: string, signature: string }
 * Verify wallet signature over the nonce, issue JWT on success.
 */
router.post('/wallet/login', (req: Request, res: Response) => {
  const { walletAddress, signature } = req.body;
  if (typeof walletAddress !== 'string' || typeof signature !== 'string') {
    return res
      .status(400)
      .json({ error: 'Request body must contain walletAddress and signature' });
  }

  const nonce = nonceStore.get(walletAddress);
  if (!nonce) {
    return res
      .status(400)
      .json({ error: 'No nonce found for this wallet address' });
  }

  const valid = verifyWalletSignature(walletAddress, nonce, signature);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid wallet signature' });
  }

  // Consume the nonce to prevent replay
  nonceStore.delete(walletAddress);

  // Issue JWT using the walletAddress as subject
  const token = generateToken({ sub: walletAddress });
  res.json({ token });
});

/**
 * POST /api/auth/login
 * Body: { username: string, password: string }
 * Placeholder for traditional login (not implemented).
 */
router.post('/login', (_req: Request, res: Response) => {
  res.status(501).json({ error: 'Username/password login not implemented' });
});

export default router;

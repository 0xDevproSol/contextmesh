// src/controllers/publishController.ts

import { Router, Request, Response, NextFunction } from 'express';
import marketplaceService from '../services/marketplaceService';

const router = Router();

/**
 * POST /api/publish
 * Body: { manifest: object }
 * Response: { listingId: string, txHash: string }
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const manifest = req.body.manifest;
    const author = (req.user as any).sub || (req.user as any).wallet;
    const { listingId, txHash } = await marketplaceService.publishManifest(
      manifest,
      author
    );
    res.status(201).json({ listingId, txHash });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/publish/:listingId
 * Response: { manifest: object, metadata: any }
 */
router.get('/:listingId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const listingId = req.params.listingId;
    const result = await marketplaceService.fetchPublishedManifest(listingId);
    if (!result) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;

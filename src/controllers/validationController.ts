// src/controllers/validationController.ts

import { Router, Request, Response, NextFunction } from 'express';
import validationService from '../services/validationService';

const router = Router();

/**
 * POST /api/validate
 * Body: { manifest: object }
 * Response: { results: ValidationResult[], passed: number, failed: number }
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const manifest = req.body.manifest;
    const results = await validationService.validateManifest(manifest);
    const passed = results.filter(r => r.passed).length;
    const failed = results.length - passed;
    res.json({ results, passed, failed });
  } catch (err) {
    next(err);
  }
});

export default router;

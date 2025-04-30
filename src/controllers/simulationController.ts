// src/controllers/simulationController.ts

import { Router, Request, Response, NextFunction } from 'express';
import simulationService from '../services/simulationService';

const router = Router();

/**
 * POST /api/simulate
 * Body: { manifest: object, stubs?: Record<string,string> }
 * Response: { simulationLog: SimulationLogEntry[], outputs: any }
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { manifest, stubs } = req.body;
    const { simulationLog, outputs } = await simulationService.runStubSimulation(
      manifest,
      stubs
    );
    res.json({ simulationLog, outputs });
  } catch (err) {
    next(err);
  }
});

export default router;

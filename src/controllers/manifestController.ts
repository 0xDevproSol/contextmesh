// src/controllers/manifestController.ts

import { Router, Request, Response, NextFunction } from 'express';
import manifestService from '../services/manifestService';

const router = Router();

// Create a new manifest
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const manifest = await manifestService.createManifest(req.body, req.user);
    res.status(201).json(manifest);
  } catch (err) {
    next(err);
  }
});

// List all manifests (optionally filter by author)
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const author = (req.query.author as string) || undefined;
    const manifests = await manifestService.listManifests(author);
    res.json(manifests);
  } catch (err) {
    next(err);
  }
});

// Get one manifest by ID
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const manifest = await manifestService.getManifestById(req.params.id);
    if (!manifest) {
      return res.status(404).json({ error: 'Manifest not found' });
    }
    res.json(manifest);
  } catch (err) {
    next(err);
  }
});

// Update a manifest
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updated = await manifestService.updateManifest(
      req.params.id,
      req.body,
      req.user
    );
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// Delete a manifest
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await manifestService.deleteManifest(req.params.id, req.user);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;

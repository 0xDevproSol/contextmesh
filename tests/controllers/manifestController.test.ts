// tests/controllers/manifestController.test.ts

import express from 'express';
import bodyParser from 'body-parser';
import request from 'supertest';
import manifestRouter from '../../src/controllers/manifestController';
import manifestService from '../../src/services/manifestService';

// Mock manifestService methods
jest.mock('../../src/services/manifestService');

const mockManifest = {
  _id: '123',
  metadata: { manifestName: 'Test', version: '1.0.0', author: 'alice' },
  nodes: [],
  connectors: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('manifestController', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(bodyParser.json());
    // stub authMiddleware
    app.use((req, res, next) => {
      req.user = { sub: 'alice' };
      next();
    });
    app.use('/api/manifests', manifestRouter);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  it('POST /api/manifests ➞ 201 + created manifest', async () => {
    (manifestService.createManifest as jest.Mock).mockResolvedValue(mockManifest);
    const res = await request(app)
      .post('/api/manifests')
      .send({ metadata: mockManifest.metadata });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject(mockManifest);
    expect(manifestService.createManifest).toHaveBeenCalledWith(
      { metadata: mockManifest.metadata },
      { sub: 'alice' }
    );
  });

  it('GET /api/manifests ➞ 200 + list of manifests', async () => {
    (manifestService.listManifests as jest.Mock).mockResolvedValue([mockManifest]);
    const res = await request(app).get('/api/manifests');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([mockManifest]);
    expect(manifestService.listManifests).toHaveBeenCalledWith(undefined);
  });

  it('GET /api/manifests?author=alice ➞ 200 + filtered list', async () => {
    (manifestService.listManifests as jest.Mock).mockResolvedValue([mockManifest]);
    const res = await request(app).get('/api/manifests?author=alice');
    expect(res.status).toBe(200);
    expect(manifestService.listManifests).toHaveBeenCalledWith('alice');
  });

  it('GET /api/manifests/:id ➞ 200 + manifest', async () => {
    (manifestService.getManifestById as jest.Mock).mockResolvedValue(mockManifest);
    const res = await request(app).get('/api/manifests/123');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject(mockManifest);
    expect(manifestService.getManifestById).toHaveBeenCalledWith('123');
  });

  it('GET /api/manifests/:id ➞ 404 when not found', async () => {
    (manifestService.getManifestById as jest.Mock).mockResolvedValue(null);
    const res = await request(app).get('/api/manifests/999');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Manifest not found' });
  });

  it('PUT /api/manifests/:id ➞ 200 + updated manifest', async () => {
    const updated = { ...mockManifest, metadata: { ...mockManifest.metadata, version: '1.0.1' } };
    (manifestService.updateManifest as jest.Mock).mockResolvedValue(updated);
    const res = await request(app)
      .put('/api/manifests/123')
      .send({ metadata: updated.metadata });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject(updated);
    expect(manifestService.updateManifest).toHaveBeenCalledWith(
      '123',
      { metadata: updated.metadata },
      { sub: 'alice' }
    );
  });

  it('DELETE /api/manifests/:id ➞ 204 on success', async () => {
    (manifestService.deleteManifest as jest.Mock).mockResolvedValue(undefined);
    const res = await request(app).delete('/api/manifests/123');
    expect(res.status).toBe(204);
    expect(manifestService.deleteManifest).toHaveBeenCalledWith('123', { sub: 'alice' });
  });
});

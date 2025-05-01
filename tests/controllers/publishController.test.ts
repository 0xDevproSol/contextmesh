// tests/controllers/publishController.test.ts

import express from 'express';
import bodyParser from 'body-parser';
import request from 'supertest';
import publishRouter from '../../src/controllers/publishController';
import marketplaceService from '../../src/services/marketplaceService';

jest.mock('../../src/services/marketplaceService');

describe('publishController', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(bodyParser.json());
    // Stub authentication
    app.use((req, _res, next) => {
      (req as any).user = { sub: 'alice' };
      next();
    });
    app.use('/api/publish', publishRouter);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  it('POST /api/publish → 201 with listingId and txHash', async () => {
    (marketplaceService.publishManifest as jest.Mock).mockResolvedValue({
      listingId: 'id1',
      txHash: 'hash1',
    });

    const res = await request(app).post('/api/publish').send({ manifest: {} });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ listingId: 'id1', txHash: 'hash1' });
    expect(marketplaceService.publishManifest).toHaveBeenCalledWith({}, 'alice');
  });

  it('POST /api/publish → 500 on service error', async () => {
    (marketplaceService.publishManifest as jest.Mock).mockRejectedValue(new Error('oops'));

    const res = await request(app).post('/api/publish').send({ manifest: {} });

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error', 'oops');
  });

  it('GET /api/publish/:listingId → 200 with manifest and metadata', async () => {
    const result = { manifest: {}, metadata: { author: 'alice', createdAt: new Date() } };
    (marketplaceService.fetchPublishedManifest as jest.Mock).mockResolvedValue(result);

    const res = await request(app).get('/api/publish/id1');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(result);
    expect(marketplaceService.fetchPublishedManifest).toHaveBeenCalledWith('id1');
  });

  it('GET /api/publish/:listingId → 404 when not found', async () => {
    (marketplaceService.fetchPublishedManifest as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get('/api/publish/id2');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Listing not found' });
  });
});

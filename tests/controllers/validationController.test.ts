// tests/controllers/validationController.test.ts

import express from 'express';
import bodyParser from 'body-parser';
import request from 'supertest';
import validationRouter from '../../src/controllers/validationController';
import validationService, { ValidationResult } from '../../src/services/validationService';

// Mock validationService
jest.mock('../../src/services/validationService');

describe('validationController', () => {
  const mockResults: ValidationResult[] = [
    { step: 1, name: 'Valid JSON', passed: true },
    { step: 2, name: 'Metadata block', passed: false, detail: 'Missing metadata' },
  ];

  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(bodyParser.json());
    // stub authMiddleware
    app.use((req, res, next) => {
      req.user = { sub: 'alice' };
      next();
    });
    app.use('/api/validate', validationRouter);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  it('POST /api/validate ➞ 200 with results, passed/failed counts', async () => {
    (validationService.validateManifest as jest.Mock).mockResolvedValue(mockResults);
    const manifest = { metadata: {} };
    const res = await request(app).post('/api/validate').send({ manifest });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      results: mockResults,
      passed: 1,
      failed: 1,
    });
    expect(validationService.validateManifest).toHaveBeenCalledWith(manifest);
  });

  it('POST /api/validate ➞ 500 on service error', async () => {
    (validationService.validateManifest as jest.Mock).mockRejectedValue(new Error('oops'));
    const res = await request(app).post('/api/validate').send({ manifest: {} });
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error', 'oops');
  });
});

// tests/controllers/simulationController.test.ts

import express from 'express';
import bodyParser from 'body-parser';
import request from 'supertest';
import simulationRouter from '../../src/controllers/simulationController';
import simulationService from '../../src/services/simulationService';

jest.mock('../../src/services/simulationService');

describe('simulationController', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(bodyParser.json());
    // Stub authentication
    app.use((req, _res, next) => {
      (req as any).user = { sub: 'alice' };
      next();
    });
    app.use('/api/simulate', simulationRouter);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  it('POST /api/simulate → 200 with simulationLog and outputs', async () => {
    const mockLog = [{ step: 1, nodeId: 'n1', type: 'prompt', success: true }];
    const mockOutputs = { n1: { response: 'ok' } };
    (simulationService.runStubSimulation as jest.Mock).mockResolvedValue({
      simulationLog: mockLog,
      outputs: mockOutputs,
    });

    const res = await request(app)
      .post('/api/simulate')
      .send({ manifest: {}, stubs: {} });

    expect(res.status).toBe(200);
    expect(res.body.simulationLog).toEqual(mockLog);
    expect(res.body.outputs).toEqual(mockOutputs);
    expect(simulationService.runStubSimulation).toHaveBeenCalledWith({}, {});
  });

  it('POST /api/simulate → 500 on service error', async () => {
    (simulationService.runStubSimulation as jest.Mock).mockRejectedValue(new Error('fail'));

    const res = await request(app).post('/api/simulate').send({ manifest: {} });

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error', 'fail');
  });
});

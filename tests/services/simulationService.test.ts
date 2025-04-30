// tests/services/simulationService.test.ts

import simulationService, { SimulationLogEntry } from '../../src/services/simulationService';
import config from '../../src/config';

describe('simulationService', () => {
  const manifest = {
    nodes: [
      { id: 'res1', type: 'resource', name: 'R1', url: 'https://api', method: 'GET', timeoutMs: 1, retries: 0 },
      { id: 'tool1', type: 'tool', name: 'T1', command: 'echo', inputSchema: '{"type":"object"}', timeoutMs: 1 },
      { id: 'prompt1', type: 'prompt', name: 'P1', template: 'Hi', language: 'en' },
      { id: 'sampling1', type: 'sampling', name: 'S1', promptTemplate: 'Hi', model: 'gpt-4o', maxTokens: 5, temperature: 0.2, stopSequences: ['\n'] }
    ],
    connectors: [
      {
        from: 'res1',
        to: 'tool1',
        transport: 'http',
        dataMapping: { url: 'cmd' },
        onError: { action: 'fail', maxRetries: 0 }
      }
    ]
  };

  it('should simulate stub for resource and tool, prompt and sampling defaults', async () => {
    const { simulationLog, outputs } = await simulationService.runStubSimulation(manifest, {
      res1: 'stub-res1',
      tool1: 'stub-tool1'
    });

    // There should be one log entry per node (4) plus one per connector (1)
    expect(simulationLog.length).toBe(5);

    // Check resource stub output
    expect(outputs.res1).toEqual({ stub: 'stub-res1' });
    // Check tool stub output
    expect(outputs.tool1).toEqual({ stub: 'stub-tool1' });
    // Prompt yields template
    expect(outputs.prompt1).toEqual({ prompt: 'Hi' });
    // Sampling yields simulated response
    expect(outputs.sampling1).toEqual({ response: 'simulated response' });

    // Connector mapping: maps url field on res1 output to cmd field on tool1 output
    const connOutput = outputs.tool1 || {};
    expect(connOutput.cmd).toBe(outputs.res1.url || undefined);
  });

  it('should log failures if connector mapping throws', async () => {
    // Provide a bad dataMapping to force failure
    const badManifest = {
      ...manifest,
      connectors: [
        { ...manifest.connectors[0], dataMapping: null }
      ]
    };

    const { simulationLog } = await simulationService.runStubSimulation(badManifest);
    const connectorEntry = simulationLog.find(e => e.type === 'connector');
    expect(connectorEntry).toBeDefined();
    expect(connectorEntry?.success).toBe(false);
    expect(connectorEntry?.detail).toBeDefined();
  });
});

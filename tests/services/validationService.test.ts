// tests/services/validationService.test.ts

import validationService, { ValidationResult } from '../../src/services/validationService';

describe('validationService', () => {
  const baseManifest = {
    metadata: {
      manifestName: 'Test',
      version: '1.2.3',
      author: 'alice'
    },
    nodes: [
      { id: 'p1', type: 'prompt', name: 'Prompt1', template: 'Hello', language: 'en' },
      { id: 's1', type: 'sampling', name: 'Sample1', promptTemplate: 'Hello', model: 'gpt-4o', maxTokens: 10, temperature: 0.5, stopSequences: ['\n'] }
    ],
    connectors: [
      {
        from: 'p1',
        to: 's1',
        transport: 'SSE',
        dataMapping: { template: 'promptTemplate' },
        onError: { action: 'retry', maxRetries: 1 }
      }
    ]
  };

  it('should pass all checks for a valid minimal manifest', async () => {
    const results = await validationService.validateManifest(baseManifest);
    expect(results).toHaveLength(10);
    results.forEach(r => expect(r.passed).toBe(true));
  });

  it('should fail when metadata is missing', async () => {
    const manifest = { ...baseManifest, metadata: undefined };
    const results = await validationService.validateManifest(manifest);
    const mdResult = results.find(r => r.name === 'Metadata block');
    expect(mdResult).toBeDefined();
    expect(mdResult?.passed).toBe(false);
    expect(mdResult?.detail).toMatch(/Missing metadata/);
  });

  it('should detect duplicate IDs and names', async () => {
    const dupManifest = {
      ...baseManifest,
      nodes: [
        ...baseManifest.nodes,
        { id: 'p1', type: 'prompt', name: 'Prompt1', template: 'Again', language: 'en' }
      ]
    };
    const results = await validationService.validateManifest(dupManifest);
    const uniqueResult = results.find(r => r.name === 'Unique IDs & names');
    expect(uniqueResult?.passed).toBe(false);
    expect(uniqueResult?.detail).toMatch(/Duplicate node id/);
  });

  it('should fail resource constraints when invalid', async () => {
    const badResource = {
      id: 'r1', type: 'resource', name: 'Res1',
      url: 'ftp://bad.url', method: 'FETCH',
      timeoutMs: -1, retries: -2
    };
    const manifest = { ...baseManifest, nodes: [...baseManifest.nodes, badResource] };
    const results = await validationService.validateManifest(manifest);
    const resourceResult = results.find(r => r.name === 'Resource node constraints');
    expect(resourceResult?.passed).toBe(false);
    expect(resourceResult?.detail).toMatch(/Invalid resource nodes: r1/);
  });
});

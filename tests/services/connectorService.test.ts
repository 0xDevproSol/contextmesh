// tests/services/connectorService.test.ts

import connectorService from '../../src/services/connectorService';

describe('connectorService', () => {
  beforeEach(() => {
    // Clear any previously registered handlers
    (connectorService as any).handlers.clear();
  });

  it('should register and invoke a connector handler', async () => {
    const handler = jest.fn(async (input: any) => ({ result: input.value * 2 }));
    connectorService.registerConnector('test', handler);

    const output = await connectorService.invokeConnector('test', { value: 5 });
    expect(output).toEqual({ result: 10 });
    expect(handler).toHaveBeenCalledWith({ value: 5 });
  });

  it('should throw an error if connector not found', async () => {
    await expect(connectorService.invokeConnector('missing', {})).rejects.toThrow(
      'Connector handler not found: missing'
    );
  });
});

// src/services/connectorService.ts

export type ConnectorHandler = (input: any) => Promise<any>;

class ConnectorService {
  private handlers: Map<string, ConnectorHandler> = new Map();

  /**
   * Register a new connector handler by ID.
   */
  registerConnector(id: string, handler: ConnectorHandler): void {
    this.handlers.set(id, handler);
  }

  /**
   * Invoke a registered connector, passing input data.
   */
  async invokeConnector(id: string, input: any): Promise<any> {
    const handler = this.handlers.get(id);
    if (!handler) {
      throw new Error(`Connector handler not found: ${id}`);
    }
    return handler(input);
  }
}

export default new ConnectorService();

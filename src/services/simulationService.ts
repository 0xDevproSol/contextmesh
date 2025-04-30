// src/services/simulationService.ts

import config from '../config';
import { ValidationResult } from './validationService';

export interface SimulationLogEntry {
  step: number;
  nodeId: string;
  type: string;
  success: boolean;
  detail?: string;
}

export default {
  async runStubSimulation(
    manifest: any,
    stubs: Record<string, string> = {}
  ): Promise<{ simulationLog: SimulationLogEntry[]; outputs: any }> {
    const log: SimulationLogEntry[] = [];
    const outputs: Record<string, any> = {};
    let step = 1;

    // Simulate each node
    for (const node of manifest.nodes || []) {
      let result: any;
      try {
        switch (node.type) {
          case 'resource':
          case 'tool':
            // Use stub handler name or default namespace
            const stubName =
              stubs[node.id] || `${config.simulation.stubNamespace}:${node.id}`;
            result = { stub: stubName };
            break;
          case 'prompt':
            result = { prompt: node.template };
            break;
          case 'sampling':
            result = { response: 'simulated response' };
            break;
          default:
            result = { info: 'unsupported node type' };
        }
        outputs[node.id] = result;
        log.push({
          step: step++,
          nodeId: node.id,
          type: node.type,
          success: true,
        });
      } catch (err: any) {
        log.push({
          step: step++,
          nodeId: node.id,
          type: node.type,
          success: false,
          detail: err.message,
        });
      }
    }

    // Simulate connectors
    for (const conn of manifest.connectors || []) {
      try {
        const src = outputs[conn.from] || {};
        const mapped: Record<string, any> = {};
        for (const [k, v] of Object.entries(conn.dataMapping || {})) {
          mapped[v] = (src as any)[k];
        }
        outputs[conn.to] = mapped;
        log.push({
          step: step++,
          nodeId: `${conn.from}->${conn.to}`,
          type: 'connector',
          success: true,
        });
      } catch (err: any) {
        log.push({
          step: step++,
          nodeId: `${conn.from}->${conn.to}`,
          type: 'connector',
          success: false,
          detail: err.message,
        });
      }
    }

    return { simulationLog: log, outputs };
  },
};

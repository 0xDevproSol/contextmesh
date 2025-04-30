// src/services/validationService.ts

import semver from 'semver';

export interface ValidationResult {
  step: number;
  name: string;
  passed: boolean;
  detail?: string;
}

export default {
  async validateManifest(manifest: any): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];
    let step = 1;

    // 1. Valid JSON (manifest is already an object)
    results.push({
      step: step++,
      name: 'Valid JSON',
      passed: typeof manifest === 'object' && manifest !== null,
      detail:
        typeof manifest !== 'object'
          ? 'Manifest is not a JSON object'
          : undefined,
    });

    // 2. Metadata block
    const md = manifest.metadata;
    const metadataValid =
      md &&
      typeof md.manifestName === 'string' &&
      md.manifestName.trim() !== '' &&
      typeof md.author === 'string' &&
      md.author.trim() !== '' &&
      semver.valid(md.version);
    results.push({
      step: step++,
      name: 'Metadata block',
      passed: metadataValid,
      detail: !md
        ? 'Missing metadata object'
        : !semver.valid(md.version)
        ? `Version "${md.version}" is not semver`
        : 'Invalid or missing manifestName/author',
    });

    // 3. Unique IDs & names
    const nodes = Array.isArray(manifest.nodes) ? manifest.nodes : [];
    const ids = nodes.map((n: any) => n.id);
    const names = nodes.map((n: any) => n.name);
    const uniqueIds = new Set(ids).size === ids.length;
    const uniqueNames = new Set(names).size === names.length;
    const allNonEmpty =
      ids.every((x: string) => typeof x === 'string' && x.trim()) &&
      names.every((x: string) => typeof x === 'string' && x.trim());
    results.push({
      step: step++,
      name: 'Unique IDs & names',
      passed: uniqueIds && uniqueNames && allNonEmpty,
      detail: !uniqueIds
        ? 'Duplicate node id found'
        : !uniqueNames
        ? 'Duplicate node name found'
        : !allNonEmpty
        ? 'Empty id or name found'
        : undefined,
    });

    // 4. Sampling node presence
    const hasSampling = nodes.some((n: any) => n.type === 'sampling');
    results.push({
      step: step++,
      name: 'Sampling node presence',
      passed: hasSampling,
      detail: 'No sampling node defined',
    });

    // 5. Resource node constraints
    const resourceIssues: string[] = [];
    nodes
      .filter((n: any) => n.type === 'resource')
      .forEach((n: any) => {
        if (
          !/^https?:\/\//.test(n.url) ||
          !['GET', 'POST', 'PUT', 'DELETE'].includes(n.method) ||
          !Number.isInteger(n.timeoutMs) ||
          n.timeoutMs <= 0 ||
          !Number.isInteger(n.retries) ||
          n.retries < 0
        ) {
          resourceIssues.push(n.id);
        }
      });
    results.push({
      step: step++,
      name: 'Resource node constraints',
      passed: resourceIssues.length === 0,
      detail:
        resourceIssues.length > 0
          ? `Invalid resource nodes: ${resourceIssues.join(', ')}`
          : undefined,
    });

    // 6. Prompt node constraints
    const promptIssues: string[] = [];
    nodes
      .filter((n: any) => n.type === 'prompt')
      .forEach((n: any) => {
        if (
          typeof n.template !== 'string' ||
          n.template.trim() === '' ||
          typeof n.language !== 'string' ||
          !/^[a-z]{2}$/i.test(n.language)
        ) {
          promptIssues.push(n.id);
        }
      });
    results.push({
      step: step++,
      name: 'Prompt node constraints',
      passed: promptIssues.length === 0,
      detail:
        promptIssues.length > 0
          ? `Invalid prompt nodes: ${promptIssues.join(', ')}`
          : undefined,
    });

    // 7. Tool node constraints
    const toolIssues: string[] = [];
    nodes
      .filter((n: any) => n.type === 'tool')
      .forEach((n: any) => {
        try {
          const schema = JSON.parse(n.inputSchema);
          if (
            typeof n.command !== 'string' ||
            n.command.trim() === '' ||
            schema.type !== 'object' ||
            !Number.isInteger(n.timeoutMs) ||
            n.timeoutMs <= 0
          ) {
            toolIssues.push(n.id);
          }
        } catch {
          toolIssues.push(n.id);
        }
      });
    results.push({
      step: step++,
      name: 'Tool node constraints',
      passed: toolIssues.length === 0,
      detail:
        toolIssues.length > 0
          ? `Invalid tool nodes: ${toolIssues.join(', ')}`
          : undefined,
    });

    // 8. Sampling node constraints
    const sampIssues: string[] = [];
    nodes
      .filter((n: any) => n.type === 'sampling')
      .forEach((n: any) => {
        if (
          typeof n.model !== 'string' ||
          n.model.trim() === '' ||
          !Number.isInteger(n.maxTokens) ||
          n.maxTokens <= 0 ||
          typeof n.temperature !== 'number' ||
          n.temperature < 0 ||
          n.temperature > 1 ||
          !Array.isArray(n.stopSequences) ||
          n.stopSequences.some((s: any) => typeof s !== 'string' || s === '')
        ) {
          sampIssues.push(n.id);
        }
      });
    results.push({
      step: step++,
      name: 'Sampling node constraints',
      passed: sampIssues.length === 0,
      detail:
        sampIssues.length > 0
          ? `Invalid sampling nodes: ${sampIssues.join(', ')}`
          : undefined,
    });

    // 9. Connector edge constraints
    const connIssues: string[] = [];
    const conns = Array.isArray(manifest.connectors)
      ? manifest.connectors
      : [];
    conns.forEach((c: any) => {
      const validTransport = ['SSE', 'stdio', 'http'].includes(c.transport);
      const validMapping =
        c.dataMapping &&
        typeof c.dataMapping === 'object' &&
        Object.entries(c.dataMapping).every(
          ([k, v]) => typeof k === 'string' && k && typeof v === 'string' && v
        );
      if (
        typeof c.from !== 'string' ||
        typeof c.to !== 'string' ||
        !validTransport ||
        !validMapping ||
        !Number.isInteger(c.onError?.maxRetries) ||
        c.onError?.maxRetries < 0 ||
        !['retry', 'fail'].includes(c.onError?.action)
      ) {
        connIssues.push(`${c.from}->${c.to}`);
      }
    });
    results.push({
      step: step++,
      name: 'Connector edge constraints',
      passed: connIssues.length === 0,
      detail:
        connIssues.length > 0
          ? `Invalid connectors: ${connIssues.join(', ')}`
          : undefined,
    });

    // 10. No extra fields
    const allowedNodeFields = new Set([
      'id',
      'type',
      'name',
      'url',
      'method',
      'headers',
      'timeoutMs',
      'retries',
      'template',
      'language',
      'command',
      'inputSchema',
      'env',
      'promptTemplate',
      'model',
      'maxTokens',
      'temperature',
      'stopSequences',
    ]);
    let extraFound = false;
    nodes.forEach((n: any) => {
      Object.keys(n).forEach((k) => {
        if (!allowedNodeFields.has(k) && !['type', 'id', 'name', 'position'].includes(k)) {
          extraFound = true;
        }
      });
    });
    results.push({
      step: step++,
      name: 'No extra fields',
      passed: !extraFound,
      detail: extraFound ? 'Unknown property found in nodes/connectors' : undefined,
    });

    return results;
  },
};

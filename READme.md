# ContextMesh – Visual AI Workflow Platform

Build, Validate, and Publish Composable AI Workflows with On-Chain Security

---

## Features

- **Drag-and-Drop Workflow Builder**  
  Intuitive Manifest Studio for assembling MCP nodes without writing JSON.

- **Real-Time JSON Preview & Validation**  
  Live manifest serialization with ten built-in constraint checks and a step-by-step log.

- **Stub Simulation & Debugger**  
  Run end-to-end “fake” executions, inspect logs, set breakpoints, and replay timelines.

- **Decentralized Marketplace**  
  One-click publish, versioning, and discovery of workflows via Phantom-wallet authorization.

- **Solana-Native Connectors**  
  Secure on-chain data feeds with cryptographically verifiable zero-knowledge proofs—no API keys.

- **Multi-Model & Tool Agnostic**  
  Support any LLM (OpenAI, Claude, local models) and custom tool executions via MCP.

- **Role-Based Access Control**  
  Wallet-based auth and JWTs enforce least-privilege permissions for authors, reviewers, and consumers.

---

## Introduction

ContextMesh is a low-code platform for building AI workflows on the Web3 stack. By leveraging the Model Context Protocol (MCP), you visually compose nodes—resources, prompts, tools, sampling settings, and connectors—into a manifest that can be validated, simulated, and published on-chain. No JSON or API keys required, just drag, configure, and run.

---

## Technical Architecture

ContextMesh consists of three core layers:

1. **Manifest Studio (UI Layer)**  
   - Drag-and-drop canvas, block palette, properties panel, validation log, and live JSON preview.  
   - Runs in browser; communicates with backend via REST and MCP JSON-RPC.

2. **Backend Services (Control Layer)**  
   - **Express API**: Manifests CRUD, validation, simulation, publish/import endpoints.  
   - **MCP JSON-RPC Server**: Exposes resources, prompts, tools, and sampling APIs to any MCP client.  
   - **Services**: ManifestService, ValidationService, SimulationService, MarketplaceService, ConnectorService.  
   - **Database**: MongoDB stores manifests, users, roles, and versions.

3. **On-Chain & Connectors (Data Layer)**  
   - **Marketplace Registry**: Smart contract on Solana for secure listings and versioning.  
   - **Connectors**: Solana RPC, HTTP/SSE connectors, and ZK-proof helpers for verifiable data feeds.  
   - **Wallet Auth**: Phantom-wallet signature verification and JWT bridging for API access.

---

## Quick Start

**Prerequisites**  
- Node.js ≥18  
- MongoDB server  
- Phantom Wallet (for publishing)  
- Solana credentials (optional for marketplace)

**Getting Started**
```bash
git clone https://github.com/your-org/contextmesh-backend.git
cd contextmesh-backend
cp .env.example .env       # fill in your values
npm install
npm run dev                # start in development mode
# or build & run
npm run build
npm start
```

Browse the Manifest Studio UI at `http://localhost:3000` and use the REST API on port `3000`.

---

## Project Structure

```
contextmesh/
├── src/
│   ├── controllers/      # Express route handlers
│   ├── services/         # Business logic (validation, simulation, marketplace)
│   ├── models/           # Mongoose schemas (Manifest, User)
│   ├── middleware/       # Auth and error handling
│   ├── utils/            # DB init, MCP server, Solana, logger
│   ├── config/           # Default and environment configuration
│   └── index.ts          # Entry point
├── tests/                # Jest unit and integration tests
├── .env.example
├── .gitignore
├── .eslintrc.js
├── .prettierrc
├── package.json
├── tsconfig.json
└── README.md
```

---

## API Overview

### Authentication

- **POST /api/auth/login**  
  Request wallet signature or JWT exchange  
- **GET  /api/auth/nonce/:walletAddress**  
  Request a nonce message to sign

### Manifests

- **POST   /api/manifests**    Create a new manifest  
- **GET    /api/manifests**    List all manifests (filter by `author`)  
- **GET    /api/manifests/:id**  Retrieve a manifest  
- **PUT    /api/manifests/:id**  Update a manifest  
- **DELETE /api/manifests/:id**  Delete a manifest

### Validation & Simulation

- **POST /api/validate**  
  Body: `{ manifest }` → returns validation steps & pass/fail  
- **POST /api/simulate**  
  Body: `{ manifest, stubs? }` → returns simulation log & outputs

### Marketplace

- **POST /api/publish**  
  Body: `{ manifest }` → on-chain listing  
- **GET  /api/publish/:listingId**  
  Retrieve published manifest & metadata

---

## Use Cases

- **DeFi Workflow Automation**  
  Fetch on-chain balances, analyze via LLM, and generate trading signals.

- **Customer Support Chatbot**  
  Combine ticket database resource nodes with LLM prompts for real-time resolutions.

- **Content Generation Pipelines**  
  Ingest RSS feeds, summarize with LLM, and post updates to a CMS.

- **Compliance & Audit Reporting**  
  Pull transaction logs, structure prompts for anomaly detection, and produce reports.

---

## Deployment

### Docker

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --production
COPY dist ./dist
CMD ["node", "dist/index.js"]
```

```bash
docker build -t contextmesh-backend .
docker run -p 3000:3000 --env-file .env contextmesh-backend
```

---

## Developer Guide

### Custom Connectors

```ts
import connectorService from './services/connectorService';

connectorService.registerConnector('my-http', async input => {
  // fetch external API
  return await fetch(input.url).then(res => res.json());
});
```

### Custom Tools

Create new MCP tool nodes by extending the MCP server handlers in `src/utils/mcpServer.ts`.

---

## Monitoring & Logging

- **Structured Logs** via Pino (console & file)  
- **Metrics Endpoint** for Prometheus at `/metrics`  
- **Alerts** configured in Grafana for error rate and latency thresholds  

---

## Future Plans

- **Multi-Chain Runtime**: support Ethereum, BNB Chain, and more.  
- **Agent Graphs**: visual multi-agent orchestration in Manifest Studio.  
- **Tokenized Monetization**: royalty streams for published workflows.  
- **Federated Simulation**: cross-instance stub networks and collaborative testing.  
- **Enterprise SaaS**: hosted ContextMesh Cloud with SSO and audit trails.

---

## Contributions

We welcome your feedback and pull requests! Please see our [CONTRIBUTING.md](./CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) for guidelines.

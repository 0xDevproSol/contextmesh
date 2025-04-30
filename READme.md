# ContextMesh Backend

Backend server for ContextMesh MCP platform.  
Provides REST API for manifests, validation, simulation, and publishing,  
plus an MCP JSON-RPC server.

## Prerequisites

- Node.js >= 18
- MongoDB server
- Solana credentials (optional for marketplace)

## Setup

1. Clone the repo  
2. Copy `.env.example` to `.env` and fill required vars  
3. Install dependencies  
   ```bash
   npm install

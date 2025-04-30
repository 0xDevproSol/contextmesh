// src/config/index.ts

import { config as loadEnv } from 'dotenv';
import defaultConfig from './default';

// Load .env file into process.env
loadEnv();

const config = {
  server: {
    httpPort: parseInt(process.env.HTTP_PORT || '', 10) || defaultConfig.server.httpPort,
    mcpPort: parseInt(process.env.MCP_PORT || '', 10) || defaultConfig.server.mcpPort,
  },

  database: {
    uri: process.env.DB_URI || defaultConfig.database.uri,
  },

  jwt: {
    secret: process.env.JWT_SECRET || defaultConfig.jwt.secret,
    expiresIn: process.env.JWT_EXPIRES_IN || defaultConfig.jwt.expiresIn,
  },

  solana: {
    rpcUrl: process.env.SOLANA_RPC_URL || defaultConfig.solana.rpcUrl,
    network: process.env.SOLANA_NETWORK || defaultConfig.solana.network,
  },

  marketplace: {
    contractAddress:
      process.env.MARKETPLACE_CONTRACT_ADDRESS || defaultConfig.marketplace.contractAddress,
  },

  simulation: {
    stubNamespace:
      process.env.SIMULATION_STUB_NAMESPACE || defaultConfig.simulation.stubNamespace,
  },
};

export default config;

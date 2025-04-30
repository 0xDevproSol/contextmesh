// src/config/default.ts

export default {
  server: {
    // Port for the HTTP REST API
    httpPort: 3000,
    // Port for the MCP JSON-RPC server
    mcpPort: 4001,
  },

  database: {
    // MongoDB connection URI
    uri: 'mongodb://localhost:27017/contextmesh',
  },

  jwt: {
    // Secret used to sign JWTs (override in production via env)
    secret: 'contextmesh-secret',
    // Token expiration (e.g. '1h', '30m')
    expiresIn: '1h',
  },

  solana: {
    // RPC endpoint for Solana cluster
    rpcUrl: 'https://api.mainnet-beta.solana.com',
    // Network identifier (e.g. 'mainnet-beta', 'devnet')
    network: 'mainnet-beta',
  },

  marketplace: {
    // On-chain smart contract address for the ContextMesh marketplace registry
    contractAddress: '',
  },

  simulation: {
    // Namespace prefix for stub handlers
    stubNamespace: 'default',
  },
};

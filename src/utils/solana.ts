// src/utils/solana.ts

import { Connection, PublicKey, Transaction, Signer } from '@solana/web3.js';
import config from '../config';
// If using snarkjs for ZK-proofs, install it as a dependency
import { groth16 } from 'snarkjs';

const connection = new Connection(config.solana.rpcUrl, 'confirmed');

/**
 * Fetch raw account info from Solana.
 */
export async function getAccountInfo(publicKeyString: string) {
  const publicKey = new PublicKey(publicKeyString);
  const accountInfo = await connection.getAccountInfo(publicKey);
  if (!accountInfo) throw new Error(`Account not found: ${publicKeyString}`);
  return accountInfo;
}

/**
 * Send a transaction to Solana and wait for confirmation.
 */
export async function sendSolTransaction(
  transaction: Transaction,
  signers: Signer[]
) {
  const txid = await connection.sendTransaction(transaction, signers, {
    skipPreflight: false,
    preflightCommitment: 'confirmed',
  });
  await connection.confirmTransaction(txid, 'confirmed');
  return txid;
}

/**
 * Generate a ZK-proof using a WASM and zkey.
 */
export async function generateZkProof(
  witness: Record<string, any>,
  wasmFilePath: string,
  zkeyFilePath: string
): Promise<{ proof: any; publicSignals: any }> {
  const { proof, publicSignals } = await groth16.fullProve(
    witness,
    wasmFilePath,
    zkeyFilePath
  );
  return { proof, publicSignals };
}

/**
 * Verify a ZK-proof against a verification key.
 */
export async function verifyZkProof(
  vkey: any,
  publicSignals: any,
  proof: any
): Promise<boolean> {
  return groth16.verify(vkey, publicSignals, proof);
}

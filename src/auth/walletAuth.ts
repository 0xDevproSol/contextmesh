// src/auth/walletAuth.ts

import { PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';

/**
 * Verify a Solana wallet signature.
 *
 * @param publicKeyString - The wallet's public key as a base58 string.
 * @param message - The original message that was signed.
 * @param signatureString - The base58‐encoded signature.
 * @returns true if the signature is valid for the given message and publicKey.
 */
export function verifyWalletSignature(
  publicKeyString: string,
  message: string,
  signatureString: string
): boolean {
  try {
    const publicKey = new PublicKey(publicKeyString);
    const signature = bs58.decode(signatureString);
    const messageBuffer = Buffer.from(message, 'utf8');
    return publicKey.verify(messageBuffer, signature);
  } catch (err) {
    console.error('Wallet signature verification failed:', err);
    return false;
  }
}

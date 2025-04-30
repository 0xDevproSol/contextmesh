// src/services/marketplaceService.ts

import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

interface Listing {
  manifest: any;
  metadata: { author: string; createdAt: Date };
}

const listings: Map<string, Listing> = new Map();

export default {
  /**
   * Publish a manifest to the marketplace.
   */
  async publishManifest(
    manifest: any,
    author: string
  ): Promise<{ listingId: string; txHash: string }> {
    const listingId = uuidv4();
    const txHash = crypto.randomBytes(32).toString('hex');
    listings.set(listingId, {
      manifest,
      metadata: { author, createdAt: new Date() },
    });
    return { listingId, txHash };
  },

  /**
   * Fetch a published manifest by listing ID.
   */
  async fetchPublishedManifest(listingId: string): Promise<{
    manifest: any;
    metadata: any;
  } | null> {
    const entry = listings.get(listingId);
    if (!entry) return null;
    return { manifest: entry.manifest, metadata: entry.metadata };
  },
};

// tests/services/marketplaceService.test.ts

import marketplaceService from '../../src/services/marketplaceService';

describe('marketplaceService', () => {
  it('should publish and fetch a manifest', async () => {
    const manifest = { foo: 'bar' };
    const author = 'alice';
    const { listingId, txHash } = await marketplaceService.publishManifest(manifest, author);

    // Listing ID is a UUID v4
    expect(typeof listingId).toBe('string');
    expect(listingId).toHaveLength(36);

    // TX hash is a 64-char hex string
    expect(typeof txHash).toBe('string');
    expect(txHash).toHaveLength(64);

    // Fetching returns the same manifest and metadata
    const fetched = await marketplaceService.fetchPublishedManifest(listingId);
    expect(fetched).not.toBeNull();
    expect(fetched!.manifest).toEqual(manifest);
    expect(fetched!.metadata.author).toBe(author);
    expect(fetched!.metadata.createdAt).toBeInstanceOf(Date);
  });

  it('should return null for a missing listing', async () => {
    const fetched = await marketplaceService.fetchPublishedManifest('nonexistent');
    expect(fetched).toBeNull();
  });
});

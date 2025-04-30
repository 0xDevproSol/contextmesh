// src/services/manifestService.ts

import { Types } from 'mongoose';
import ManifestModel, { ManifestDocument } from '../models/Manifest';
import { JwtPayload } from '../auth/jwt';

class ManifestService {
  /**
   * Create a new manifest.
   */
  async createManifest(
    data: Partial<ManifestDocument>,
    user: JwtPayload | { wallet: string }
  ): Promise<ManifestDocument> {
    const author =
      'sub' in user ? user.sub : (user as { wallet: string }).wallet;
    const manifest = await ManifestModel.create({
      ...data,
      author,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return manifest;
  }

  /**
   * List manifests, optionally filtered by author.
   */
  async listManifests(author?: string): Promise<ManifestDocument[]> {
    const filter = author ? { author } : {};
    return ManifestModel.find(filter).sort({ createdAt: -1 }).exec();
  }

  /**
   * Get a single manifest by its ID.
   */
  async getManifestById(id: string): Promise<ManifestDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return ManifestModel.findById(id).exec();
  }

  /**
   * Update an existing manifest. Only the author may update.
   */
  async updateManifest(
    id: string,
    data: Partial<ManifestDocument>,
    user: JwtPayload | { wallet: string }
  ): Promise<ManifestDocument | null> {
    const manifest = await this.getManifestById(id);
    if (!manifest) throw { status: 404, message: 'Manifest not found' };

    const requester =
      'sub' in user ? user.sub : (user as { wallet: string }).wallet;
    if (manifest.author !== requester) {
      throw { status: 403, message: 'Not authorized to update this manifest' };
    }

    manifest.set({ ...data, updatedAt: new Date() });
    return manifest.save();
  }

  /**
   * Delete a manifest. Only the author may delete.
   */
  async deleteManifest(
    id: string,
    user: JwtPayload | { wallet: string }
  ): Promise<void> {
    const manifest = await this.getManifestById(id);
    if (!manifest) throw { status: 404, message: 'Manifest not found' };

    const requester =
      'sub' in user ? user.sub : (user as { wallet: string }).wallet;
    if (manifest.author !== requester) {
      throw { status: 403, message: 'Not authorized to delete this manifest' };
    }

    await ManifestModel.findByIdAndDelete(id).exec();
  }
}

export default new ManifestService();

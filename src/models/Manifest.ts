// src/models/Manifest.ts

import mongoose, { Document, Schema } from 'mongoose';

export interface ManifestMetadata {
  manifestName: string;
  version: string;
  description?: string;
  author: string;
  tags?: string[];
}

export interface ManifestDocument extends Document {
  metadata: ManifestMetadata;
  nodes: any[];
  connectors: any[];
  createdAt: Date;
  updatedAt: Date;
}

const ManifestSchema = new Schema<ManifestDocument>(
  {
    metadata: {
      manifestName: { type: String, required: true, trim: true },
      version: { type: String, required: true, trim: true },
      description: { type: String, default: '' },
      author: { type: String, required: true, trim: true },
      tags: { type: [String], default: [] },
    },
    nodes: { type: [Schema.Types.Mixed], default: [] },
    connectors: { type: [Schema.Types.Mixed], default: [] },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ManifestDocument>('Manifest', ManifestSchema);

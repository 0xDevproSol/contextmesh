// src/models/User.ts

import mongoose, { Document, Schema } from 'mongoose';

export type UserRole = 'author' | 'reviewer' | 'consumer' | 'admin';

export interface UserDocument extends Document {
  wallet: string;
  roles: UserRole[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<UserDocument>(
  {
    wallet: { type: String, required: true, unique: true, trim: true },
    roles: {
      type: [String],
      enum: ['author', 'reviewer', 'consumer', 'admin'],
      default: ['consumer'],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<UserDocument>('User', UserSchema);

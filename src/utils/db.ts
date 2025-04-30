// src/utils/db.ts

import mongoose from 'mongoose';
import config from '../config';

export async function initDb() {
  await mongoose.connect(config.database.uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log('MongoDB connected');
}

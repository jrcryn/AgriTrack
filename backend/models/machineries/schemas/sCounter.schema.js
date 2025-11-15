import mongoose from 'mongoose';

export const sCounterSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // e.g., SC-YYYYMMDD
  seq: { type: Number, default: 0 }
}, { versionKey: false });

import mongoose from 'mongoose';
// para sa ticket requests, maging unique yung num id
export const trCounterSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 }
  }, { versionKey: false });

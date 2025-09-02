import mongoose from 'mongoose';
// para sa unique reference number ng registered documents
export const CounterSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 }
  }, { versionKey: false });

import mongoose from "mongoose";

export const GranularLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.Mixed }, // Accept ObjectId, null, or String
  userType: { type: String, enum: ['EmployeeAccount', 'SystemAdmin'] },
  action: { type: String, required: true }, // Removed enum restriction
  module: { type: String, required: true }, // e.g. 'machinery', 'documents', 'users'
  description: { type: String, required: true }, 
  status: { type: String, required: true }, // Removed enum restriction
  ip: { type: String, default: 'Unknown' },
  userAgent: { type: String, default: 'Unknown' }, //what browser/device was used
  createdAt: { type: Date, default: Date.now, required: true },
  logExpiry: { type: Date, default: () => new Date(Date.now() + 1095*24*60*60*1000), required: true }, // 3 years expiration
});

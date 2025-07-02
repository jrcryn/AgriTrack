import mongoose from 'mongoose';

export const MachineriesStaffSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true },
    phone: { type: String, unique: true },

    password: { type: String, required: true },
    lastLogin: { type: Date, default: Date.now },
    is2FAEnabled: {type: Boolean, default: false},

    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    twoFASecret: String,

    isActive: { type: Boolean, default: true }

}, { versionKey: false, timestamps: true });
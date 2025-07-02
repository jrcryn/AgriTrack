import mongoose from 'mongoose';

export const HVCManagerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true },
    phone: { type: String, unique: true },

    password: { type: String, required: true },
    lastLogin: { type: Date, default: Date.now },
    is2FAEnabled: {type: Boolean, default: false},
    twoFASecret: String,

    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,


    isActive: { type: Boolean, default: true }
    
}, { versionKey: false, timestamps: true });
import mongoose from 'mongoose';

export const HVCManagerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true },
    phone: { type: String, unique: true },

    password: { type: String, required: true },
    lastLogin: { type: Date, default: Date.now },
    isVerified: {type: Boolean, default: false},

    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    verificationToken: String,
    verificationTokenExpiresAt: Date,

    isActive: { type: Boolean, default: true }
    
}, { versionKey: false, timestamps: true });
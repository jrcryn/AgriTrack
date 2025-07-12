import mongoose from 'mongoose';

export const HVCStaffSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },

    password: { type: String, required: true },
    lastLogin: { type: Date, default: Date.now },
    is2FAEnabled: {type: Boolean, default: false},
    twoFASecret: String,
    twoFAQRCode: String,

    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    
    failedLoginAttempts:  {
        count: { type: Number, default: 0 },
        lastAttempt: { type: Date, default: Date.now }
    },
    
    failedOTPVerifications:  {
        count: { type: Number, default: 0 },
        lastAttempt: { type: Date, default: Date.now }
    },
    
    isLocked: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    
}, { versionKey: false, timestamps: false });
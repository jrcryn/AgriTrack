import mongoose from 'mongoose';

export const DocTrackStaffSchema = new mongoose.Schema({
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    middle_name: { type: String, required: false },
    suffix: { type: String, required: false },

    role: {
        type: String,
        enum: ['staff'],
        default: 'staff',
        required: true
    },
    office_position: { type: String, required: true },
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
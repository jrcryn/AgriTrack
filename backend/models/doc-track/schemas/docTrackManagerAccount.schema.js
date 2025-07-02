import mongoose from 'mongoose';

export const DocTrackManagerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    role: { 
        type: String,
        enum: ['manager'], 
        default: 'manager',
        required: true
    },
    email: { type: String, unique: true },
    phone: { type: String, unique: true },
    
    password: { type: String, required: true },
    lastLogin: { type: Date, default: Date.now },
    is2FAEnabled: {type: Boolean, default: false},

    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,


    isActive: { type: Boolean, default: true }
    
}, { versionKey: false, timestamps: true });
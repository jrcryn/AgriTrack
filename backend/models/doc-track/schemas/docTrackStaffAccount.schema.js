import mongoose from 'mongoose';

export const DocTrackStaffSchema = new mongoose.Schema({
    name: { type: String, required: true },

    role: {
        type: String,
        enum: ['doc-trackStaff'],
        default: 'doc-trackStaff',
        required: true
    },
    office_position: { type: String, required: true },
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
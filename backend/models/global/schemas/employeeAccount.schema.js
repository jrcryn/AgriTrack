import mongoose from 'mongoose';

export const EmployeeAccountSchema = new mongoose.Schema({
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    middle_name: { type: String, required: false },
    suffix: { type: String, required: false },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },

    
    office_position: { type: String, enum: ['CFS', 'LPMS', 'ANMS', 'RTSS'] }, // pag gagawa lang ng staff account for doc-track sya applicable 
    roles: [String],
    isOperatorDisabled: { type: Boolean, default: false },

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
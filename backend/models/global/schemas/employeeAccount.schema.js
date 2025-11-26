import mongoose from 'mongoose';

// Operator License sub-schema
const OperatorLicenseSchema = new mongoose.Schema({
    licenseNumber: { type: String, required: true },
    licenseType: { type: String, required: true }, // e.g., "4 Wheel Tractor", "Rotovator", etc.
    issuedDate: { type: Date, required: true },
    expiryDate: { type: Date, required: true },
    allowedMachineryTypes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Machine_Type',
        required: true
    }], // Array of machinery type IDs this license allows
    isActive: { type: Boolean, default: true },
    issuedBy: { type: String }, // Issuing authority
    notes: { type: String }
}, { _id: true, versionKey: false });

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
    
    // Operator licenses - only applicable for operators (MIS role)
    operatorLicenses: [OperatorLicenseSchema],

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
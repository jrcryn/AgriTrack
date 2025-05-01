import mongoose from 'mongoose';

export const StaffSchema = new mongoose.Schema({
    name: { type: String, required: true },
    role: { 
        type: String,
        enum: ['Staff'], // Only allows this single value
        default: 'Staff', // Sets this as the default
        required: true
    },
    office_position: { type: String, required: true },
    email: { type: String, unique: true },
    phone: { type: String, unique: true },
    isActive: { type: Boolean, default: true }
}, { versionKey: false, timestamps: true });
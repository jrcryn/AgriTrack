import mongoose from 'mongoose';

export const StaffSchema = new mongoose.Schema({
    name: { type: String, required: true },
    dept_position: { 
        type: String,
        enum: ['doc-trackStaff'], // Only allows this single value
        default: 'doc-trackStaff', // Sets this as the default
        required: true
    },
    email: { type: String, unique: true },
    phone: { type: Number, unique: true },
    isActive: { type: Boolean, default: true }
}, { versionKey: false, timestamps: true });
import mongoose from 'mongoose';

export const ManagerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    role: { 
        type: String,
        enum: ['sdmin'], // Only allows this single value
        default: 'sdmin', // Sets this as the default
        required: true
    },
    email: { type: String, unique: true },
    phone: { type: String, unique: true },
    isActive: { type: Boolean, default: true }
}, { versionKey: false, timestamps: true });
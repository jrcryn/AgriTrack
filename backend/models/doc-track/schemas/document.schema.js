import mongoose from 'mongoose';

export const DocumentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    type: { type: String, required: true },
    source: { type: String, required: true },
    status: { type: String, default: 'Pending' },

    // document details such as; location, staff etc will come from documentDetail

    // itong currentHandler is para malaman kung sino and current na may hawak ng document
    currentHandler: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        role: {
            type: String,
            enum: ['Staff', 'Admin'],
            required: true,
        }
    },

    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Urgent'],
        default: 'Medium'
    },
    isCompleted: { type: Boolean, default: false }
}, { timestamps: true, versionKey: false });
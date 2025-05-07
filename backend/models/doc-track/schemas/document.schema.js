import mongoose from 'mongoose';

export const DocumentSchema = new mongoose.Schema({
    title: { type: String, required: true },  // name ng document 
    type: { type: String, required: true }, // IN or OUT
    description: { type: String }, // more details or san nangaling for example
    status: { type: String, default: 'Pending' },

    // document details such as; location, staff etc will come from documentDetail
    
    action: {type: String, required: true}, // action taken on the document

    // itong currentHandler is para malaman kung sino and current na may hawak ng document
    currentHandler: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
    },

    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Urgent'],
        default: 'Medium'
    },
    isCompleted: { type: Boolean, default: false },

    createdAt: {
        type: Date,
        default: Date.now
    },

    updatedAt: {
        type: Date
    }

}, { versionKey: false });
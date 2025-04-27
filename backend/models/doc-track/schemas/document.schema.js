import mongoose from 'mongoose';

export const DocumentSchema = new mongoose.Schema({
    farmer_input_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'A_farmer_inputs', 
        required: true 
    },
    document_name: { type: String, required: true, trim: true },
    document_type: { type: String, required: true, trim: true },
    document_url: { type: String, required: true, trim: true },
}, { versionKey: false });
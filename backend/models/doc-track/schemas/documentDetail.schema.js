import mongoose from 'mongoose';

export const DocumentDetailSchema = new mongoose.Schema({
    document_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
        required: true,
    },
    action: { type: String, required: true },
    location: { type: String, required: true },
    remarks: {type:String, required: true}
})
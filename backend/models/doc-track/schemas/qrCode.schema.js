import mongoose from 'mongoose';

export const QrCodeSchema = new mongoose.Schema({
    document_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
        required: true,
    },
    qr_data: {
        type: String,
        required: true,
    },
    generatedAt: {
        type: Date,
        default: Date.now,
    },
    
    // additional fields
    version: {
        type: Number,
        default: 1
    },
    errorCorrectionLevel: {
        type: String, 
        enum: ['L', 'M', 'Q', 'H'],
        default: 'M'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { versionKey: false });
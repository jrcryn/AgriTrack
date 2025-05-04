import mongoose from 'mongoose';

export const DocumentDetailSchema = new mongoose.Schema({
    document_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
        required: true,
    },


    action: {type: String, required: true}, 
    

    handleBy: { 
       id: {
         type: mongoose.Schema.Types.ObjectId,
         required: true,
       },
       name: { type: String, required: true },
       role: {
           type: String,
           enum: ['Staff', 'Admin'],
           required: true,
       },
       office_position: { type: String, required: true },
       email: { type: String, required: true },
       phone: { type: String, required: true },
    },


    remarks: {type: String}, 

    createdAt: {
        type: Date,
        default: Date.now,
    }
    
}, { versionKey: false});

// Existing indexes are good

// Create indexes for efficient querying
DocumentDetailSchema.index({ document_id: 1 });
DocumentDetailSchema.index({ staff_id: 1 });
DocumentDetailSchema.index({ timestamp: 1 });
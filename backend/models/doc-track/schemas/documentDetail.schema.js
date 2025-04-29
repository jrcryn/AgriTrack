import mongoose from 'mongoose';

export const DocumentDetailSchema = new mongoose.Schema({
    document_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
        required: true,
    },
    action: { type: String, required: true },
    
    // yung location and staff_id is for historical information about who handled the document throughout its lifecycle.
    location: { type: String, required: true },

    /* note that staff department or location can be changed afterwards, 
    pag nagkaroon ng rotation or something like that sa office nila, 
    so sa pagkuha ng last location or location history ng docu, 
    is dapat sa location entry kukuhanin hindi sa location/department ng staff*/
    staff_id: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff', 
        required: true
    },
    remarks: {type: String},
    timestamp: {
        type: Date,
        default: Date.now
    }
}, { versionKey: false});

// Existing indexes are good

// Create indexes for efficient querying
DocumentDetailSchema.index({ document_id: 1 });
DocumentDetailSchema.index({ staff_id: 1 });
DocumentDetailSchema.index({ timestamp: 1 });
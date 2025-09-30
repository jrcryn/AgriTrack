import mongoose from 'mongoose';

import { lifeCycleIterationsSchema } from './documentLifeCycle.schema.js';

export const ReleasedDocumentsSchema = new mongoose.Schema({
    documentId: {type: mongoose.Schema.Types.ObjectId, ref: 'Document'},
    documentName: {type: String},
    documentCode: {type: String},

    documentNameText: {type: String, trim: true},
    originatingOffice: {type: String, trim: true},

    priority: {type: String, enum: ['Urgent', 'Medium', 'Low'], required: true},
    refNumber: {type: String, required: true},
    docQRData: {type: String, required: true},
    details: String,

    lifeCycle: [lifeCycleIterationsSchema],
}, {versionKey: false});
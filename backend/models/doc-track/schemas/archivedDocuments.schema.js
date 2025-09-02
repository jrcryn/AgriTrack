import mongoose from 'mongoose';

import { lifeCycleIterationsSchema } from './documentLifeCycle.schema.js';

export const ArchivedDocumentsSchema = new mongoose.Schema({
    documentId: {type: mongoose.Schema.Types.ObjectId, ref: 'Document'},
    documentName: {type: String, required: true},
    documentCode: {type: String, required: true},

    priority: {type: String, enum: ['Urgent', 'Medium', 'Low'], required: true},
    refNumber: {type: String, required: true},
    docQRData: {type: String, required: true},

    lifeCycle: [lifeCycleIterationsSchema],
}, {versionKey: false});
import mongoose from 'mongoose';

export const DocumentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    type: { type: String, required: true },
    source: { type: String, required: true },
}, { versionKey: false }, {timestamps: true});
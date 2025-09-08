/*dito na nakalagay yung mismong document types, and yung archiving rules nila, dito pwedeng gumaawa ng bagong document types para
mapagpilian and ma-edit yung existing document types*/
import mongoose from 'mongoose';

export const DocumentSchema = new mongoose.Schema({
    documentName: {type: String, required: true},
    documentCode: {type: String, required: true},
    disposalMethod: {type: String},
    retentionPeriod: {type: Number}, //saved in months, e.g, 5 years = 60 months
}, {versionKey: false});
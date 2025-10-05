import mongoose from 'mongoose';

export const MachineriesUnitSchema = new mongoose.Schema({
    machineryTypeId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Machine_Type',
        required: true
    },
    plateNumber: {type: String, required: true},
    engineBrand: {type: String, required: true},
    engineHorsepower: {type: Number, required: true},
    modeOfAcquisition: {type: String, required: true},
    costOfAcquisition: {type: Number, required: true},
    yearAcquired: { type: Date, required: true},
    condition: { type: String, required: true, enum: ['Functional', 'Non-Functional'], default: 'Functional' },
    location: { type: String, required: true, default: 'Office/The Plaza'},
    remarks: { type: String },
    status: { type: String, required: true, enum: ['Available', 'In Use', 'Under Repair', 'Not for Use']}, 
    
}, { versionKey: false, timestamps: true });
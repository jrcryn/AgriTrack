import mongoose from 'mongoose';

export const MachineriesTypeSchema = new mongoose.Schema({
    ownerName: { type: String, required: true },
    ownerType: { type: String, required: true},
    equipmentType: { type: String, required: true}, // e.g 4 wheel tractor with rotovator, 1 trailer, 1 cage roller and 1 disc pillow
    ratedCapacity: { type: String, required: true},
    
}, { versionKey: false }, { timestamps: true });
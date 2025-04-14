import mongoose from 'mongoose';

export const MachineriesUnitSchema = new mongoose.Schema({
    unit_name: { type: String, required: true, trim: true },
    remarks: { type: String, trim: true },
    barangay_allocations: [
        {
            barangay: {type: String, required: true, trim: true },
            total_units: { type: Number, required: true },
            functional_units: { type: Number, required: true },
            non_functional_units: { type: Number, required: true },
        }
    ],
});
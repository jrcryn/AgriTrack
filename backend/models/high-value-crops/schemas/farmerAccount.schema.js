import mongoose from 'mongoose';

export const FarmerAccountSchema = new mongoose.Schema({
    farmerId: { type: String, required: true, unique: true },
    surname: { type: String, required: true, trim: true },
    first_name: { type: String, required: true, trim: true },
    middle_name: { type: String, trim: true },
    suffix: { type: String, trim: true },
    farmer_barangay: { type: String, required: true, trim: true },
    mobile_number: { type: String,  trim: true },
    facebook: { type: String, trim: true },
    birthdate: { type: Date },
}, { versionKey: false });


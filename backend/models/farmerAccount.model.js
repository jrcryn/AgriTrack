import mongoose, { version } from 'mongoose';

const FarmerAccountSchema = new mongoose.Schema({
    surname: { type: String, required: true, trim: true },
    first_name: { type: String, required: true, trim: true },
    middle_name: { type: String, trim: true },
    suffix: { type: String, trim: true },
    farm_location: { type: String, required: true, trim: true },
    mobile_number: { type: String,  trim: true },
    facebook: { type: String, trim: true },
}, { versionKey: false });

export const FarmerAccount = mongoose.model('Farmer_Account', FarmerAccountSchema);
import mongoose from 'mongoose';

const AFarmerInputsSchema = new mongoose.Schema({
  surname: { type: String, required: true, trim: true },
  first_name: { type: String, required: true, trim: true },
  middle_name: { type: String, trim: true },
  suffix: { type: String, trim: true },
  farm_location: { type: String, required: true, trim: true }
}, { versionKey: false });

export const A_farmer_inputs = mongoose.model('A_farmer_inputs', AFarmerInputsSchema);


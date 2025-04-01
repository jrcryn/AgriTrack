import mongoose from 'mongoose';

const formatProperCase = (name) => {
  return name
  .toLowerCase()
  .replace(/\b\w/g, (char) => char.toUpperCase());
};

const AFarmerInputsSchema = new mongoose.Schema({
  surname: { type: String, required: true, trim: true, set: formatProperCase },
  first_name: { type: String, required: true, trim: true, set: formatProperCase },
  middle_name: { type: String, trim: true, set: formatProperCase },
  suffix: { type: String, trim: true },
  farm_location: { type: String, required: true, trim: true },
  isValidated: { type: Boolean, default: false },
}, { versionKey: false }, { timestamps: true });

export const A_farmer_inputs = mongoose.model('A_farmer_inputs', AFarmerInputsSchema);


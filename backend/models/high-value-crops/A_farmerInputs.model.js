import mongoose from 'mongoose';

const formatProperCase = (name) => {
  return name
  .toLowerCase()
  .replace(/\b\w/g, (char) => char.toUpperCase());
};

const AFarmerInputsSchema = new mongoose.Schema({
  farmer_account_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer_Account',
    required: true,
  },
  farm_location: { type: String, required: true, trim: true },
  isValidated: { type: Boolean, default: false },
}, { versionKey: false }, { timestamps: true });

export const A_farmer_inputs = mongoose.model('A_farmer_inputs', AFarmerInputsSchema);


import mongoose from 'mongoose';

/* tinangal na, since farmer details will come from farmer accounts schama, pero should not be removed
if gusto ng client mag roll-back sa dating gawi, since ayon ang napag kasuduan*/

// const formatProperCase = (name) => {
//   return name
//   .toLowerCase()
//   .replace(/\b\w/g, (char) => char.toUpperCase());
// };

export const AFarmerInputsSchema = new mongoose.Schema({
  farmer_account_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer_Account',
    required: true,
  },
  farm_location: { type: String, required: true, trim: true },
  isValidated: { type: Boolean, default: false },
}, { versionKey: false }, { timestamps: true });


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
  farmerId: { type: String, required: true }, // unique farmer ID
  farm_location: { type: String, required: true, trim: true },
  isValidated: { type: Boolean, default: false },
  isForReview: { type: Boolean, default: false },
  isArchived: { type: Boolean, default: false },

  editConsent: {
    status: { type: String, enum: ['Pending', 'Granted', 'Denied', 'Completed'] },
    editRequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Edit_Request'},
    grantedAt: { type: Date },
    deniedAt: { type: Date },
    reason: { type:String, trim:true }
  },

  requiredValidationVisit: { type: Boolean, default: false },

  validationVisitDetails: {
    status: { type: String, enum: ['Pending', 'Completed'] },
    scheduledAt: { type: Date },
    completedAt: { type: Date },
    validatorEmployee: { type: mongoose.Schema.Types.ObjectId, ref: 'User_Account' },
    remarks: { type: String, trim: true },
  }

}, { versionKey: false, timestamps: true });


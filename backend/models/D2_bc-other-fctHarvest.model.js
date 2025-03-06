import mongoose from 'mongoose';

const D2BcOtherFctHarvestSchema = new mongoose.Schema({
  record_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'C2_crop_records_others', 
    required: true 
  },
  harvest_date: { type: Date, required: true },
  trees_harvested: { type: Number, required: true },
  total_weight: { type: Number, required: true },
  destination: { type: String, required: true },
  mode_of_payment: { type: String, required: true },
  mode_of_delivery: { type: String, required: true }
}, { versionKey: false });

export const D2_bc_other_fct_harvest = mongoose.model('D2_bc_other_fct_harvest', D2BcOtherFctHarvestSchema);

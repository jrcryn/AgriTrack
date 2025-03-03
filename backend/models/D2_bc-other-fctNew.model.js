import mongoose from 'mongoose';

const D2BcOtherFctNewSchema = new mongoose.Schema({
  record_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'C_crop_records_others', 
    required: true 
  },
  harvest_month_year: { type: Date, required: true },
  total_trees: { type: Number, required: true }
}, { versionKey: false });

export const D2_bc_other_fct_new = mongoose.model('D2_bc_other_fct_new', D2BcOtherFctNewSchema);

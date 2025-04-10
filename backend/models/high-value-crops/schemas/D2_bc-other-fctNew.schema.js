import mongoose from 'mongoose';

export const D2BcOtherFctNewSchema = new mongoose.Schema({
  record_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'C2_crop_records_others', 
    required: true 
  },

    //plantation date
    plantation_start_date: { type: Date, required: true },
    plantation_end_date: { type: Date, required: true },

  harvest_month_year: { type: Date, required: true },
  total_trees: { type: Number, required: true }
}, { versionKey: false });


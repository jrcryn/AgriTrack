import mongoose from 'mongoose';

const D1CropIndusNewSchema = new mongoose.Schema({
  record_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'C1_crop_records_indus', 
    required: true 
  },
  
    //plantation date
    plantation_start_date: { type: Date, required: true },
    plantation_end_date: { type: Date, required: true },

  harvest_month_year: { type: Date, required: true },
  total_area_planted: { type: Number, required: true }
}, { versionKey: false });

export const D1_crop_indus_new = mongoose.model('D1_crop_indus_new', D1CropIndusNewSchema);

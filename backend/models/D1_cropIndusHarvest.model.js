import mongoose from 'mongoose';

const D1CropIndusHarvestSchema = new mongoose.Schema({
  record_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'C_crop_records_indus', 
    required: true 
  },
  harvest_date: { type: Date, required: true },
  total_area_harvested: { type: Number, required: true },
  total_volume_production: { type: Number, required: true },
  mode_of_payment: { type: String, required: true },
  mode_of_delivery: { type: String, required: true }
}, { versionKey: false });

export const D1_crop_indus_harvest = mongoose.model('D1_crop_indus_harvest', D1CropIndusHarvestSchema);

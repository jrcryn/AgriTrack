import mongoose from 'mongoose';

export const D2BcOtherFctHarvestSchema = new mongoose.Schema({
  record_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'C2_crop_records_others', 
    required: true 
  },
  farmerId: { type: String, required: true }, // unique farmer ID

    //harvest date
    harvest_start_date: { type: Date, required: true },
    harvest_end_date: { type: Date, required: true },

  trees_harvested: { type: Number, required: true},
  total_weight: { type: Number, required: true },
  crop_purpose: { type: String, enum: ['PANG BENTA', 'PANG SARILI LAMANG'], required: true },
  destination: { type: String, set: (value) => value.toUpperCase() },
  mode_of_payment: { type: String, set: (value) => value.toUpperCase() },
  mode_of_delivery: { type: String, set: (value) => value.toUpperCase() }
}, { versionKey: false, timestamps: true });


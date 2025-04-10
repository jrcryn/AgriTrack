import mongoose from 'mongoose';

// Reuse the same schema definition
export const UnifiedFarmerRecordSchema = new mongoose.Schema({
  // Farmer details (required fields)
  farmer_account_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer_Account',
    required: true,
  },
  farm_location: { type: String, required: true, trim: true },
  isValidated: { type: Boolean, default: true },
  
  // Crop information (requireded fields)
  crop_type: { type: String, required: true },
  commodity: { type: String, required: true },
  crop_stage: { 
    type: String, 
    enum: ['NEWLY PLANTED', 'HARVESTING']
  },
  
  // Fields for "NEWLY PLANTED" records
  plantation_start_date: { type: Date },
  plantation_end_date: { type: Date },
  harvest_month_year: { type: Date },
  total_area_planted: { type: Number },
  total_area_trees_planted: { type: Number },
  
  // Fields for "HARVESTING" records
  harvest_start_date: { type: Date },
  harvest_end_date: { type: Date },
  total_weight: { type: Number },
  crop_purpose: { 
    type: String, 
    enum: ['PANG BENTA', 'PANG SARILI LAMANG']
  },
  destination: { type: String },
  mode_of_payment: { type: String },
  mode_of_delivery: { type: String },
  
  total_area_harvested: { type: Number },
  total_area_trees_harvested: { type: Number },
}, { 
  timestamps: true,
  versionKey: false 
});
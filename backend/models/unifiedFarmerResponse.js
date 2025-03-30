import mongoose from 'mongoose';

const UnifiedFarmerRecordSchema = new mongoose.Schema({
  // Farmer details (required fields)
  surname: { type: String, required: true, trim: true },
  first_name: { type: String, required: true, trim: true },
  middle_name: { type: String, trim: true },
  suffix: { type: String, trim: true },
  farm_location: { type: String, required: true, trim: true },
  isValidated: { type: Boolean, default: true },
  
  // Crop information (crop_type is required)
  crop_type: { type: String, required: true },
  crop_variety: { type: String, trim: true },
  crop_stage: { 
    type: String, 
    enum: ['NEWLY PLANTED', 'HARVESTING']
  },
  
  // Fields for "NEWLY PLANTED" records
  // For both industrial crops and other crops
  plantation_start_date: { type: Date },
  plantation_end_date: { type: Date },
  harvest_month_year: { type: Date },
  
  // For industrial crops specifically
  total_area_planted: { type: Number },
  
  // For other crops (like fruit trees) specifically
  total_trees: { type: Number },
  
  // Fields for "HARVESTING" records
  // For both types of crops
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
  
  // For industrial crops specifically
  total_area_harvested: { type: Number },
  
  // For other crops specifically
  trees_harvested: { type: Number },
}, 
{ 
  timestamps: true,
  versionKey: false 
});

export const UnifiedFarmerRecord = mongoose.model('UnifiedFarmerRecord', UnifiedFarmerRecordSchema);
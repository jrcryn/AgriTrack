import mongoose from 'mongoose';

const BCropTypesSchema = new mongoose.Schema({
  farmer_input_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'A_farmer_inputs', 
    required: true 
  },
  crop_type: { 
    type: String,
    required: true,
  }
}, { versionKey: false });

export const B_crop_types = mongoose.model('B_crop_types', BCropTypesSchema);

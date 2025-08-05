import mongoose from 'mongoose';

export const BCropTypesSchema = new mongoose.Schema({
  farmer_input_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'A_farmer_inputs', 
    required: true 
  },
  farmerId: { type: String, required: true }, // unique farmer ID
  crop_type: { 
    type: String,
    required: true,
  }
}, { versionKey: false, timestamps: true });


import mongoose from 'mongoose';

export const C2CropRecordsOthersSchema = new mongoose.Schema({
  farmer_input_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'A_farmer_inputs', 
    required: true 
  },
  farmerId: { type: String, required: true }, // unique farmer ID
  crop_type_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'B_crop_types', 
    required: true 
  },
  crop_variety: { type: String, required: true, trim: true }, //uri ng tanim
  crop_stage: {  //yugto ng tanim
    type: String, 
    enum: ['NEWLY PLANTED', 'HARVESTING'], 
    required: true 
  }
}, { versionKey: false, timestamps: true });


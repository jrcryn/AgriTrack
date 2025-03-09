import mongoose from 'mongoose';

const C1CropRecordsIndusSchema = new mongoose.Schema({
  farmer_input_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'A_farmer_inputs', 
    required: true 
  },
  crop_type_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'B_crop_types', 
    required: true 
  },
  crop_type: { type: String, required: true }, //uri ng tanim
  crop_variety: { type: String, trim: true }, //variety ng tanim 
  crop_stage: { //yugto ng tanim
    type: String, 
    enum: ['NEWLY PLANTED', 'HARVESTING'], 
    required: true 
  }
}, { versionKey: false });

export const C_crop_records_indus = mongoose.model('C1_crop_records_indus', C1CropRecordsIndusSchema);
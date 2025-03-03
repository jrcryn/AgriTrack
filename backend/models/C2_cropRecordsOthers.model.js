import mongoose from 'mongoose';

const C2CropRecordsOthersSchema = new mongoose.Schema({
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
  crop_variety: { type: String, required: true, trim: true }, //uri ng tanim
  crop_stage: {  //yugto ng tanim
    type: String, 
    enum: ['Newly Planted', 'Harvesting'], 
    required: true 
  }
}, { versionKey: false });

export const C_crop_records_others = mongoose.model('C2_crop_records_others', C2CropRecordsOthersSchema);

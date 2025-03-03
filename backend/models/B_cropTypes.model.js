import mongoose from 'mongoose';

const BCropTypesSchema = new mongoose.Schema({
  crop_type: { 
    type: String,
    enum: [
      'VEGETABLES, ROOT CROPS AND OTHER INDUSTRIAL CROPS', 
      'BANANA', 
      'COFFEE', 
      'OTHER FRUIT CROPS/TREES'
    ],
    required: true,
  }
}, { versionKey: false });

export const B_crop_types = mongoose.model('B_crop_types', BCropTypesSchema);

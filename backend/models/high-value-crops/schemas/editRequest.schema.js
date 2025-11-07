import mongoose from 'mongoose';

export const EditRequestSchema = new mongoose.Schema({
  // linkage/meta
  farmer_input_id: { type: mongoose.Schema.Types.ObjectId, required: true },

  // newly planted - industrial crops
  total_area_planted: Number,
  // newly planted - banana, coffee, and other fruit, crops, and trees
  total_trees: Number,

  // harvesting - industrial crops
  total_area_harvested: Number,
  // harvesting - banana, coffee, and other fruit, crops, and trees
  trees_harvested: Number,

  // for both indus and other harvesting
  total_weight: Number,
}, { versionKey: false, timestamps: true });

EditRequestSchema.index({ farmer_input_id: 1, crop_stage: 1, status: 1 });
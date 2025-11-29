import mongoose from 'mongoose';

export const FormStatus = new mongoose.Schema({
   formStatus: { type: Boolean }
  }, {collection: 'formStatus'});


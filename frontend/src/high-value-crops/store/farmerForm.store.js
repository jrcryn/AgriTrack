import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const useFarmerFormStore = create((set, get) => ({
  // Store the form data temporarily using Zustand
  formData: {
    privacyConsent: '',
    farmerInput: {
      farmerId: '',
      surname: '',
      first_name: '',
      middle_name: '',
      suffix: '',
      farm_location: '',
    },
    cropType: '',
    cropRecordIndus: null,
    cropRecordOther: null,
    cropIndusHarvest: null,
    cropIndusNew: null,
    cropOtherHarvest: null,
    cropOtherNew: null,
  },
  
  formattedFarmerId: '',
  isLoading: false,
  error: null,
  success: false,
  

  updatePrivacyConsent: (consent) => set((state) => ({
    formData: { ...state.formData, privacyConsent: consent }
  })),

  // Setter methods for updating form data
  updateFarmerInput: (data) => set((state) => ({
    formData: { ...state.formData, farmerInput: data }
  })),
  
  updateCropType: (data) => set((state) => ({
    formData: { ...state.formData, cropType: data }
  })),
  
  updateCropRecordIndus: (data) => set((state) => ({
    formData: { ...state.formData, cropRecordIndus: data }
  })),
  
  updateCropRecordOther: (data) => set((state) => ({
    formData: { ...state.formData, cropRecordOther: data }
  })),
  
  updateCropIndusHarvest: (data) => set((state) => ({
    formData: { ...state.formData, cropIndusHarvest: data }
  })),
  
  updateCropIndusNew: (data) => set((state) => ({
    formData: { ...state.formData, cropIndusNew: data }
  })),
  
  updateCropOtherHarvest: (data) => set((state) => ({
    formData: { ...state.formData, cropOtherHarvest: data }
  })),
  
  updateCropOtherNew: (data) => set((state) => ({
    formData: { ...state.formData, cropOtherNew: data }
  })),
  
  // Final submission function
  submitFarmerForm: async () => {
    const state = get();
    const { formData } = state;
    set({ isLoading: true, error: null });
    
    try {
      // Step 1: Create the farmer input record
      const farmerResponse = await axios.post(`${API_URL}/farmerForm-a`, formData.farmerInput);
      const farmerId = farmerResponse.data._id;
      
      // Step 2: Create the crop type record, na naka reference kay farmer input id
      const cropTypeResponse = await axios.post(`${API_URL}/farmerForm-b`, {
        farmer_input_id: farmerId, //farmer input id
        crop_type: formData.cropType
      });
      const cropTypeId = cropTypeResponse.data._id; //record id ng crop record (crop type na 4)
      
      // Step 3A: If industrial crops form was filled
      let recordId; //initialized para gagamitin pang reference sa ibang documents, naka let dahil nag i-iba ang value kada condition
      if (formData.cropRecordIndus) {
        const cropRecordData = {
          ...formData.cropRecordIndus,
          farmer_input_id: farmerId,
          crop_type_id: cropTypeId
        };
        
        const cropRecordResponse = await axios.post(`${API_URL}/farmerForm-c1-cri`, cropRecordData);
        recordId = cropRecordResponse.data._id; //record id ng crop record industrial (uri ng tanim, variety and crop stage)
        
        // Step 4A: Based on the crop stage, submit either harvesting or new planting data
        if (formData.cropRecordIndus.crop_stage === 'HARVESTING' && formData.cropIndusHarvest) {
          await axios.post(`${API_URL}/farmerForm-d1-cih`, {
            ...formData.cropIndusHarvest,
            record_id: recordId
          });
        } else if (formData.cropRecordIndus.crop_stage === 'NEWLY PLANTED' && formData.cropIndusNew) {
          await axios.post(`${API_URL}/farmerForm-d1-cin`, {
            ...formData.cropIndusNew,
            record_id: recordId
          });
        }
      }
      // Step 3B: If other crop types form was filled
      else if (formData.cropRecordOther) {
        const cropRecordData = {
          ...formData.cropRecordOther,
          farmer_input_id: farmerId,
          crop_type_id: cropTypeId
        };
        
        const cropRecordResponse = await axios.post(`${API_URL}/farmerForm-c2-cro`, cropRecordData);
        recordId = cropRecordResponse.data._id; //record id ng crop record other (variety and crop stage)
        
        // Step 4B: Based on the crop stage, submit either harvesting or new planting data
        if (formData.cropRecordOther.crop_stage === 'HARVESTING' && formData.cropOtherHarvest) {
          await axios.post(`${API_URL}/farmerForm-d2-bc-ofh`, {
            ...formData.cropOtherHarvest,
            record_id: recordId
          });
        } else if (formData.cropRecordOther.crop_stage === 'NEWLY PLANTED' && formData.cropOtherNew) {
          await axios.post(`${API_URL}/farmerForm-d2-bc-ofn`, {
            ...formData.cropOtherNew,
            record_id: recordId
          });
        }
      }
      
      set({ isLoading: false, success: true });
      return true;
    } catch (error) {
      console.error('Form submission error:', error);
      set({ 
        isLoading: false, 
        error: error.response?.data?.message || 'Error submitting form data'
      });
      return false;
    }
  },
  
  // Reset the form
  resetForm: () => set({
    formData: {
      farmerInput: {
        surname: '',
        first_name: '',
        middle_name: '',
        suffix: '',
        farm_location: '',
      },
      cropType: '',
      cropRecordIndus: null,
      cropRecordOther: null,
      cropIndusHarvest: null,
      cropIndusNew: null,
      cropOtherHarvest: null,
      cropOtherNew: null,
    },
    isLoading: false,
    error: null,
    success: false
  })
}));
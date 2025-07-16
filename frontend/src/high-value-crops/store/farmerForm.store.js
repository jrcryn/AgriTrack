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
      
      await axios.post(`${API_URL}/api/hvc/farmer-form-submission`, formData);
      
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
    isLoading: false,
    error: null,
    success: false
  })
}));

export const usePublicFormStore = create((set) => ({
  error: null,
  
  getFarmerAccountById: async (farmerId) => {
    try {
      const response = await axios.post(`${API_URL}/api/hvc/get-farmer-account-by-id`, farmerId);
      return response.data;
    } catch (error) {
      set({ error: error.message || 'Failed to fetch farmer account by ID' });
      throw error;
    }
  },
  
  clearError: () => set({ error: null }),
}));
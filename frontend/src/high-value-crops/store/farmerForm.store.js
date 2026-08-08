import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const useFarmerFormStore = create((set, get) => ({
  // Store the form data temporarily using Zustand
  formData: {
    privacyConsent: '',
    farmerInput: {
      _id: '',
      farmerId: '', // unique farmer ID
      surname: '',
      first_name: '',
      middle_name: '',
      suffix: '',
      farm_location: '',
      farmer_location: '', 
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
  isContinueAnswering: false,
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
  
  // Submit multiple forms in a single request
  submitMultipleFarmerForms: async (formsArray) => {
    set({ isLoading: true, error: null, success: false });
    
    try {
      const response = await axios.post(`${API_URL}/api/hvc/farmer-forms-bulk-submission`, {
        forms: formsArray
      });
      
      if (response.status === 200 || response.status === 201) {
        set({ isLoading: false, success: true, error: null });
        
        // Reset success flag after a short delay
        setTimeout(() => {
          set({ success: false });
        }, 100);
        
        return {
          success: true,
          count: response.data.count,
          results: response.data.results
        };
      } else {
        throw new Error('Unexpected response from server');
      }
    } catch (error) {

      const errorMessage = error.response?.data?.message || error.message || 'Error submitting forms';
      set({ 
        isLoading: false, 
        error: errorMessage,
        success: false
      });
      return {
        success: false,
        error: errorMessage
      };
    }
  },
  
  // Reset the form
  resetForm: () => set({
    formData: {
      privacyConsent: '',
      farmerInput: {
        _id: '',
        farmerId: '', // unique farmer ID
        surname: '',
        first_name: '',
        middle_name: '',
        suffix: '',
        farm_location: '',
        farmer_location: '', 
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
  }),

  continueAnswering: () => set((state) => ({
    formData: {
      ...state.formData,
      farmerInput: {
        ...state.formData.farmerInput,
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
    success: false,
    isContinueAnswering: true,
  })),
}));

export const useFormStatusCheck = create((set, get) => ({
  isFormOpen: false,
  isCheckingFormStatus: false,
  
  checkFormStatus: async () => {
    set({ isCheckingFormStatus: true });
    try {
      const response = await axios.get(`${API_URL}/api/hvc/check-form-status`);
      set({ isFormOpen: Boolean(response.data.open), isCheckingFormStatus: false });
    } catch (error) {
      set({ isFormOpen: false, isCheckingFormStatus: false });
    }
  }
}));
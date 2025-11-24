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
  
  // Array to store individual accordion form data
  accordionForms: [], // Array of { accordionId, formData }
  
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
  
  // Methods to manage accordion forms array
  addAccordionForm: (accordionId) => set((state) => {
    const existingForm = state.accordionForms.find(form => form.accordionId === accordionId);
    if (existingForm) {
      return state; // Already exists
    }
    return {
      accordionForms: [
        ...state.accordionForms,
        {
          accordionId,
          formData: {
            farm_location: '',
            cropType: '',
            cropRecordIndus: null,
            cropRecordOther: null,
            cropIndusHarvest: null,
            cropIndusNew: null,
            cropOtherHarvest: null,
            cropOtherNew: null,
          }
        }
      ]
    };
  }),
  
  updateAccordionForm: (accordionId, formData) => set((state) => {
    const accordionIndex = state.accordionForms.findIndex(form => form.accordionId === accordionId);
    if (accordionIndex === -1) {
      // If accordion doesn't exist, add it
      return {
        accordionForms: [
          ...state.accordionForms,
          { accordionId, formData }
        ]
      };
    }
    // Update existing accordion
    const updatedForms = [...state.accordionForms];
    updatedForms[accordionIndex] = {
      ...updatedForms[accordionIndex],
      formData: { ...updatedForms[accordionIndex].formData, ...formData }
    };
    return { accordionForms: updatedForms };
  }),
  
  getAccordionForm: (accordionId) => {
    const state = get();
    return state.accordionForms.find(form => form.accordionId === accordionId);
  },
  
  removeAccordionForm: (accordionId) => set((state) => ({
    accordionForms: state.accordionForms.filter(form => form.accordionId !== accordionId)
  })),
  
  clearAccordionForms: () => set({ accordionForms: [] }),
  
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
  
  // Submit with custom form data (for multiple accordions)
  submitFarmerFormWithData: async (customFormData) => {
    set({ isLoading: true, error: null });
    
    try {
      await axios.post(`${API_URL}/api/hvc/farmer-form-submission`, customFormData);
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
    accordionForms: [],
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
    accordionForms: [], // Clear accordion forms when continuing
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
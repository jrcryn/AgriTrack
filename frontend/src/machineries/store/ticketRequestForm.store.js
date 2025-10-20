import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Define the initial state so we can reference it in the resetForm function
const initialFormState = {
    privacyConsent: '',
    farmerInput: {
        _id: '',
        farmerId: '',
        surname: '',
        first_name: '',
        middle_name: '',
        suffix: '',
        farmer_location: '',
        farm_location: '',
        estimated_area: '',
        machine_type: '',
    }
};

export const useTicketRequestFormStore = create((set, get) => ({
    // store form data temporarily using Zustand
    formData: { ...initialFormState },

    // Available machine types state
    availableMachineTypes: [],
    availableMachineTypesLoading: false,
    availableMachineTypesError: null,

    updatePrivacyConsent: (consent) => set((state) => ({
        formData: { ...state.formData, privacyConsent: consent }
    })),

    // farmer input
    updateFarmerInput: (data) => set((state) => ({
        formData: { 
            ...state.formData, 
            farmerInput: { 
                ...state.formData.farmerInput, 
                ...data 
            } 
        }
    })),

    // ticket request info
    updateTicketRequest: (data) => set((state) => ({
        formData: { ...state.formData, ticketRequest: data }
    })),

    // Fetch available machine types
    fetchAvailableMachineTypes: async () => {
        set({ availableMachineTypesLoading: true, availableMachineTypesError: null });
        try {
            const res = await axios.get(`${API_URL}/api/machineries/get-available-machinery-types`);
            set({
                availableMachineTypes: res?.data?.data || [],
                availableMachineTypesLoading: false
            });
            return true;
        } catch (error) {
            set({
                availableMachineTypesLoading: false,
                availableMachineTypesError: error?.response?.data?.message || 'Error fetching available machinery types'
            });
            return false;
        }
    },

    // Request state
    isLoading: false,
    success: false,
    error: null,

    submitFarmerForm: async () => {
        const state = get();
        const { formData } = state;
        set({ isLoading: true, error: null, success: false });

        try {
            await axios.post(`${API_URL}/api/machineries/submit-ticket-request`, {
                requestorFarmer: formData.farmerInput._id,
                requestedMachineType: formData.farmerInput.machine_type,
                estimatedArea: formData.farmerInput.estimated_area,
                barangay: formData.farmerInput.farm_location
            });

            set({ isLoading: false, success: true });
            return true;
        } catch (error) {
            console.error('Form submission error:', error);
            set({
                isLoading: false,
                success: false,
                error: error.response?.data?.message || 'Error submitting form data'
            });
            return false;
        }
    },

    resetForm: () => set({
        formData: { ...initialFormState },
        availableMachineTypes: [],
        availableMachineTypesLoading: false,
        availableMachineTypesError: null,
        isLoading: false,
        success: false,
        error: null
    }),

}));
import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const useTicketRequestFormStore = create((set, get) => ({
    // store form data temporarily using Zustand
    formData: {
        privacyConsent: '',
        farmerInput: {
        _id: '',
        farmerId: '', // unique farmer ID
        surname: '',
        first_name: '',
        middle_name: '',
        suffix: '',
        farmer_location: '', 

        farm_location: '',
        estimated_area: '',
        machine_type: '',
        }
    },

    updatePrivacyConsent: (consent) => set((state) => ({
        formData: { ...state.formData, privacyConsent: consent }
    })),

    // farmer input
    updateFarmerInput: (data) => set((state) => ({
        formData: { ...state.formData, farmerInput: data }
    })),

    // ticket request info
    updateTicketRequest: (data) => set((state) => ({
        formData: { ...state.formData, ticketRequest: data }
    })),

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
        ticketRequest: null,
    },
    }),

}));
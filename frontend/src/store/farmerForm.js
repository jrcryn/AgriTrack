import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const useFarmerFormStore = create((set) => ({
    farmerInput: {},
    cropType: '',
    cropRecord: {},
    d1Data: {},
    d2Data: {},
    isLoading: false,
    error: null,

    setFarmerInput: (data) => set({ farmerInput: data }),
    setCropType: (data) => set({ cropType: data }),
    setCRIndus: (data) => set({ cr1Indus: data }),
    setCROther: (data) => set({ cr2Other: data }),
    setD1IndusHarv: (data) => set({ d1IndusHarv: data }),
    setD1IndusNew: (data) => set({ d1IndusNew: data }),
    setD2OtherHarv: (data) => set({ d2OtherHarv: data }),
    setD2OtherNew: (data) => set({ d2OtherNew: data }),

    FarmerInput: async (data) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/farmerForm-a`, data);
            set({ farmerInput: response.data, isLoading: false });
        } catch (error) {
            set({ error: 'Error submitting farmer input', isLoading: false });
        }
    },

    CropType: async (data) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/farmerForm-b`, data);
            set({ cropType: response.data, isLoading: false });
        } catch (error) {
            set({ error: 'Error submitting crop type', isLoading: false });
        }
    },

    CropRecordIndus: async (data) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/farmerForm-c1-cri`, data);
            set({ cr1Indus: response.data, isLoading: false });
        } catch (error) {
            set({ error: 'Error submitting crop record', isLoading: false });
        }
    },

    CropRecordOther: async (data) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/farmerForm-c1-cro`, data);
            set({ cr2Other: response.data, isLoading: false });
        } catch (error) {
            set({ error: 'Error submitting crop record', isLoading: false });
        }
    },

    D1IndusHarv: async (data) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/farmerForm-d1-cih`, data);
            set({ d1IndusHarv: response.data, isLoading: false });
        } catch (error) {
            set({ error: 'Error submitting D1IndusHarv data', isLoading: false });
        }
    },

    D1IndusNew: async (data) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/farmerForm-d1-cin`, data);
            set({ d1IndusNew: response.data, isLoading: false });
        } catch (error) {
            set({ error: 'Error submitting D1IndusNew data', isLoading: false });
        }
    },

    D2OtherHarv: async (data) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/farmerForm-d2-bc-ofh`, data);
            set({ d2OtherHarv: response.data, isLoading: false });
        } catch (error) {
            set({ error: 'Error submitting D2OtherHarv data', isLoading: false });
        }
    },

    D2OtherNew: async (data) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/farmerForm-d2-bc-ofn`, data);
            set({ d2OtherNew: response.data, isLoading: false });
        } catch (error) {
            set({ error: 'Error submitting D2OtherNew data', isLoading: false });
        }
    },
}));
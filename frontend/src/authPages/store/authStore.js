import { create } from 'zustand';
import axios from 'axios';
import verify2FA from '../verify2FA';

const API_URL = import.meta.env.VITE_API_URL;

axios.defaults.withCredentials = true; // Ensure cookies are sent with requests

export const useAuthStore = create((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    isCheckingAuth: false,


    login: async ({ email, password }) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/api/auth/login`, { email, password });
            set({ isLoading: false });
            return response.data; 
        } catch (error) {
            set({ error: error.response?.data?.message, isLoading: false });
            throw error; // Re-throw the error to be caught in the component
        }
    },

    generate2FASecret: async ({ userId }) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/api/auth/2fa/generate-2fa-secret`, { userId });
            set({ isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response?.data?.message, isLoading: false });
            throw error;
        }
    },

    verify2FA: async ({ userId, token }) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/api/auth/2fa/verify-2fa`, { userId, token });
            set({ isLoading: false });
            return response.data; 
        } catch (error) {
            set({ error: error.response?.data?.message, isLoading: false });
            throw error; // Re-throw the error to be caught in the component
        }
    },

}));
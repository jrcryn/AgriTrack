import { create } from 'zustand';
import axios from 'axios';

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
            set({ isLoading: false, isAuthenticated: true, user: response.data.user });
            return response.data;
        } catch (error) {
            set({ error: error.response?.data?.message, isLoading: false });
            throw error;
        }
    },

    forgotPassword: async ({ email }) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/api/auth/forgot-password`, { email });
            set({ isLoading: false });
            return response.data; 
        } catch (error) {
            set({ error: error.response?.data?.message, isLoading: false });
            throw error;
        }
    },

    resetPassword: async ({ token, newPassword }) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/api/auth/reset-password/${token}`, { newPassword });
            set({ isLoading: false });
            return response.data; 
        } catch (error) {
            set({ error: error.response?.data?.message, isLoading: false });
            throw error;
        }
    },

    checkAuth: async () => {
        set({ isCheckingAuth: true, error: null });
        try {
            const response = await axios.get(`${API_URL}/api/auth/check-auth`);
            set({ user: response.data.user, isAuthenticated: true, isCheckingAuth: false });
            return response.data;
        } catch (error) {
            set({ error: null, isAuthenticated: false, isCheckingAuth: false });
            throw error;
        }
    },

}));
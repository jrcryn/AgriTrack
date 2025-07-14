import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

axios.defaults.withCredentials = true;

export const useUserSettingsStore = create((set) => ({
    error: null,
    isChangingPassword: false,
    isFetching2FASecret: false,

    changeUserPassword: async ({currentPassword, newPassword}) => {
        set({ isChangingPassword: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/api/user-settings/change-user-password`, { currentPassword, newPassword });
            set({ isChangingPassword: false });
            return response.data;
        } catch (error) {
            set({ error: error.response?.data?.message, isChangingPassword: false });
            throw error;
        }
    },

    fetch2FASecret: async ({password}) => {
        set({ isFetching2FASecret: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/api/user-settings/fetch-2fa-secret`, {password});
            set({ isFetching2FASecret: false });
            return response.data;
        } catch (error) {
            set({ error: error.response?.data?.message, isFetching2FASecret: false });
            throw error;
        }
    }
}));
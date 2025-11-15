import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const usePublicFormStore = create((set) => ({
  error: null,
  
  getFarmerAccountByName: async (farmerSurname, farmerName, farmerMiddleName, farmerSuffix, farmerLocation) => { //need location
    try {
      const response = await axios.post(`${API_URL}/api/global/get-farmer-account-by-name`, {
        surname: farmerSurname,
        first_name: farmerName,
        middle_name: farmerMiddleName,
        suffix: farmerSuffix,
        farmer_barangay: farmerLocation
      });
      return response.data;
    } catch (error) {
      set({ error: error.message || 'Failed to fetch farmer account by name.' });
      throw error;
    }
  },
  
  clearError: () => set({ error: null }),
}));


//gawin muna frontend ng machine ticket request form, nailipat kona lahat ng need gawin na global gaya ng farmer name search, kasi hvc at machineries na ang gagamit.
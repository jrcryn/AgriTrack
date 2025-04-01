import axios from 'axios';
import { create } from 'zustand';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_URL = import.meta.env.VITE_API_URL;

// React Query hooks for data fetching
export const useUnvalidatedInputsQuery = () => 
  useQuery({
    queryKey: ['unvalidatedInputs'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/get-unvalidated-inputs`);
      return response.data;
    },
  });

export const useValidatedInputsQuery = () => 
  useQuery({
    queryKey: ['validatedInputs'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/get-validated-inputs`);
      return response.data;
    }
  });

export const useUpdateFarmerInputMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ farmerId, updateData }) => {
      const response = await axios.post(`${API_URL}/update-farmer-input`, {
        farmerId,
        updateData
      });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['unvalidatedInputs'] });
      queryClient.invalidateQueries({ queryKey: ['validatedInputs'] });
    }
  });
};

export const useFarmerAccountsQuery = () => 
  useQuery({
    queryKey: ['farmerAccounts'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/get-farmer-accounts`);
      return response.data;
    }
  });


// Zustand store for UI state management
export const useAdminDashboardStore = create((set) => ({
  error: null,
  
  // Error handling
  setError: (error) => set({ error }),
  clearError: () => set({ error: null })
}));

// Composite hook that combines React Query and Zustand
export const useAdminDashboard = () => {
  const { error, setError, clearError } = useAdminDashboardStore();
  const { data: unvalidatedInputs = [], isLoading: isLoadingUnvalidated, error: unvalidatedError } = useUnvalidatedInputsQuery();
  const { data: validatedInputs = [], isLoading: isLoadingValidated, error: validatedError } = useValidatedInputsQuery();
  const { mutate: updateFarmerInput, isPending: isUpdating, error: updateError } = useUpdateFarmerInputMutation();
  const { data: farmerAccounts = [], isLoading: isLoadingAccounts, error: accountsError } = useFarmerAccountsQuery();

  const createFarmerAccount = async (farmerData) => {
    try {
      await axios.post(`${API_URL}/create-farmer-account`, farmerData);
      return farmerData;
    } catch (error) {
      setError(error.message || 'Failed to create farmer account');
    }
  };

  const createUnifiedFarmerResponse = async (responseData) => {
    try {
      await axios.post(`${API_URL}/create-unified-farmer-response`, responseData);
      return responseData;
    } catch (error) {
      setError(error.message || 'Failed to create unified farmer response');
    }
  };

  // Combine errors from different sources
  if (unvalidatedError) setError(unvalidatedError.message || 'Failed to fetch unvalidated inputs');
  if (validatedError) setError(validatedError.message || 'Failed to fetch validated inputs');
  if (updateError) setError(updateError.message || 'Failed to update farmer input');
  if (accountsError) setError(accountsError.message || 'Failed to fetch farmer accounts');

  return {
    // Data
    unvalidatedInputs,
    validatedInputs,
    farmerAccounts,
    
    // Loading states
    isLoading: isLoadingUnvalidated || isLoadingValidated || isLoadingAccounts,
    isUpdating,
    
    // Error state
    error,
    
    // Actions
    updateFarmerInput,
    clearError,
    createFarmerAccount,
    createUnifiedFarmerResponse
  };
};
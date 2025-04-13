import axios from 'axios';
import { create } from 'zustand';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

// React Query hooks for data fetching
export const useUnvalidatedInputsQuery = () => 
  useQuery({
    queryKey: ['unvalidatedInputs'],
    queryFn: async () => {

      const response = await axios.get(`${API_URL}/get-unvalidated-inputs`);
      return response.data;
    },
    staleTime: 0, // Data is always fresh
    refetchInterval: 1000 // Refetch every second
  });

export const useValidatedInputsQuery = () => 
  useQuery({
    queryKey: ['validatedInputs'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/get-validated-inputs`);
      return response.data;
    },
    staleTime: 0, // Data is always fresh
    refetchInterval: 1000 // Refetch every second
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
    },
    staleTime: 0, // Data is always fresh
    refetchInterval: 1000 // Refetch every second
  });

export const useUnifiedFarmerResponseYearQuery = () =>
  useQuery({
    queryKey: ['availableYears'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/metrics/available-years`);
      return response.data;
    },
    staleTime: 0, // Data is always fresh
    refetchInterval: 1000 // Refetch every second
  });

export const useUnifiedFarmerResponseMonthsQuery = (year) => 
  useQuery({
    queryKey: ['availableMonths', year],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/metrics/available-months/${year}`);
      return response.data;
    },
    enabled: !!year, // Only run the query if year is provided
    staleTime: 0, // Data is always fresh
    refetchInterval: 1000 // Refetch every second
  });

export const useMetricsForYearMonthQuery = (year, month) => 
  useQuery({
    queryKey: ['metricsData', year, month],
    queryFn: async () => {
      if (!year || !month) return null;
      const response = await axios.get(`${API_URL}/metrics/data/${year}/${month}`);
      return response.data;
    },
    enabled: !!(year && month), // Only run if both year and month are provided
    staleTime: 0, // Data is always fresh
    refetchInterval: 1000 // Refetch every second
  });

//for report generation, date ranges
export const useDateRangesQuery = (year, month) => 
  useQuery({
    queryKey: ['dateRanges', year, month],
    queryFn: async () => {
      if (!year || !month) return [];

      const response = await axios.get(`${API_URL}/report-date-ranges/${year}/${month}`);
      return response.data;
    },
    enabled: !!(year && month), // Only run if both year and month are provided
    staleTime: 0, // Data is always fresh
    refetchInterval: 1000 // Refetch every second
  });



// Composite hook that combines React Query and Zustand
export const useAdminDashboard = () => {

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(null);

  const { data: unvalidatedInputs = [], isLoading: isLoadingUnvalidated, error: unvalidatedError } = useUnvalidatedInputsQuery();
  const { data: validatedInputs = [], isLoading: isLoadingValidated, error: validatedError } = useValidatedInputsQuery();
  const { mutate: updateFarmerInput, isPending: isUpdating, error: updateError } = useUpdateFarmerInputMutation();
  const { data: farmerAccounts = [], isLoading: isLoadingAccounts, error: accountsError } = useFarmerAccountsQuery();

  const { data: availableYears = [], isLoading: isLoadingUFRY } = useUnifiedFarmerResponseYearQuery();
  const { data: availableMonths = [], isLoading: isLoadingUFRM } = useUnifiedFarmerResponseMonthsQuery(selectedYear);
  const { data: metricsData, isLoading: isLoadingMetrics } = useMetricsForYearMonthQuery(selectedYear, selectedMonth);

  const { data: dateRanges = [], isLoading: isLoadingDateRanges, error: dateRangesError } = useDateRangesQuery(selectedYear, selectedMonth);

  const [isCreatingUnifiedResponse, setIsCreatingUnifiedResponse] = useState(false);
  const [isCreatingFarmerAccount, setIsCreatingFarmerAccount] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isUpdatingFarmerAccount, setIsUpdatingFarmerAccount] = useState(false);


  useEffect(() => {
    if (availableMonths && availableMonths.length > 0 && !selectedMonth) {
      setSelectedMonth(availableMonths[0]);
    }
  }, [availableMonths, selectedMonth]);

  useEffect(() => {
    if (availableYears && availableYears.length > 0) {
      setSelectedYear(availableYears[0]);
    }
  }, [availableYears]);


  const createFarmerAccount = async (farmerData) => {
    setIsCreatingFarmerAccount(true);
    try {
      const response =  await axios.post(`${API_URL}/create-farmer-account`, farmerData);
      return response.data;
    } catch (error) {
      setError(error.message || 'Failed to create farmer account');
      throw error;
    } finally {
      setIsCreatingFarmerAccount(false);
    }
  };

  const createUnifiedFarmerResponse = async (responseData) => {
    setIsCreatingUnifiedResponse(true);
    try {
      const response = await axios.post(`${API_URL}/create-unified-farmer-response`, responseData);
      return response.data; 
    } catch (error) {
      setError(error.message || 'Failed to create unified farmer response');
      throw error; 
    } finally {
      setIsCreatingUnifiedResponse(false); 
    }
  };

  const getFarmerAccountById = async (farmerId) => {
    try {
      const response = await axios.post(`${API_URL}/get-farmer-account`, farmerId);
      return response.data;
    } catch (error) {
      setError(error.message || 'Failed to fetch farmer account by ID');
      throw error;
    }
  };

  const generateExcelReport = async (startDate, endDate) => {
    setIsGeneratingReport(true);
    try {
      const response = await axios.post(
        `${API_URL}/generate-excel-report`, 
        { 
          startDate, 
          endDate
        },
        { responseType: 'blob' } // Important for file download
      );
      return response.data;
    } catch (error) {
      setError(error.message || 'Failed to generate Excel report');
      throw error;
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const updateFarmerAccount = async (farmerId, updateData) => {
    setIsUpdatingFarmerAccount(true);
    try {
      const response = await axios.put(`${API_URL}/farmer-accounts/update`, { 
        farmerId,
        ...updateData
      });
      return response.data;
    } catch (error) {
      setError(error.message || 'Failed to update farmer account');
      throw error;
    }
    finally {
      setIsUpdatingFarmerAccount(false);
    }
  };


  // Combine errors from different sources
  if (unvalidatedError) setError(unvalidatedError.message || 'Failed to fetch unvalidated inputs');
  if (validatedError) setError(validatedError.message || 'Failed to fetch validated inputs');
  if (updateError) setError(updateError.message || 'Failed to update farmer input');
  if (accountsError) setError(accountsError.message || 'Failed to fetch farmer accounts');
  if (dateRangesError) setError(dateRangesError.message || 'Failed to fetch date ranges');

  return {
    // Data
    unvalidatedInputs,
    validatedInputs,
    farmerAccounts,
    getFarmerAccountById,
    availableYears,
    availableMonths,
    metricsData,
    selectedYear,
    selectedMonth,
    setSelectedYear,
    setSelectedMonth,
    dateRanges,
    
    // Loading states
    isLoading: isLoadingUnvalidated || isLoadingValidated || isLoadingAccounts || isLoadingMetrics || isLoadingUFRY || isLoadingUFRM || isLoadingDateRanges,
    isUpdating,
    isCreatingUnifiedResponse,
    isCreatingFarmerAccount,
    isGeneratingReport,
    isUpdatingFarmerAccount,
    
    // Error state
    error: unvalidatedError || validatedError || updateError || accountsError || dateRangesError,
    clearError: () => setError(null),

    // Actions
    updateFarmerInput,
    createFarmerAccount,
    createUnifiedFarmerResponse,
    generateExcelReport,
    updateFarmerAccount
  };
};
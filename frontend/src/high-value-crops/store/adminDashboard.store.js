import axios from 'axios';
import { create } from 'zustand';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

// React Query hooks for data fetching
export const useUnvalidatedNewlyPlantedQuery = (page = 1, isPaused = false) => 
  useQuery({
    queryKey: ['unvalidatedNewlyPlanted', page],
    queryFn: async () => {
      const params = new URLSearchParams({ page, limit: 5, crop_stage: 'NEWLY PLANTED' });
      const response = await axios.get(`${API_URL}/api/hvc/get-unvalidated-inputs`, { params });
      return response.data;
    },
    staleTime: 0,
    refetchInterval: isPaused ? false : 1000, // Refetch every second unless paused
  });

export const useUnvalidatedHarvestingQuery = (page = 1, isPaused = false) => 
  useQuery({
    queryKey: ['unvalidatedHarvesting', page],
    queryFn: async () => {
      const params = new URLSearchParams({ page, limit: 5, crop_stage: 'HARVESTING' });
      const response = await axios.get(`${API_URL}/api/hvc/get-unvalidated-inputs`, { params });
      return response.data;
    },
    staleTime: 0,
    refetchInterval: isPaused ? false : 1000, // Refetch every second unless paused
  });

// export const useValidatedInputsQuery = () => 
//   useQuery({
//     queryKey: ['validatedInputs'],
//     queryFn: async () => {
//       const response = await axios.get(`${API_URL}/api/hvc/get-validated-inputs`);
//       return response.data;
//     },
//     staleTime: 0, // Data is always fresh
//     refetchInterval: 1000 // Refetch every second unless paused
//   });

// export const useUpdateFarmerInputMutation = () => {
//   const queryClient = useQueryClient();
  
//   return useMutation({
//     mutationFn: async ({ farmerId, updateData }) => {
//       const response = await axios.post(`${API_URL}/update-farmer-input`, {
//         farmerId,
//         updateData
//       });
//       return response.data;
//     },
//     onSuccess: () => {
//       // Invalidate queries to refetch data
//       queryClient.invalidateQueries({ queryKey: ['unvalidatedInputs'] });
//       queryClient.invalidateQueries({ queryKey: ['validatedInputs'] });
//     }
//   });
// };


export const useFarmerAccountsQuery = (searchParams = {}) => {
 
  return useQuery({
   queryKey: ['farmerAccounts', searchParams],
    queryFn: async () => {
      //await new Promise(resolve => setTimeout(resolve, 5000));
      const params = new URLSearchParams();

      if (searchParams.farmerName) {
        params.append('farmerName', searchParams.farmerName);
      };

      if (searchParams.page) {
        params.append('page', searchParams.page);
      }
      params.append('limit', 10); // Set items per page


      const response = await axios.get(`${API_URL}/api/hvc/get-farmer-accounts`, { params });
      return response.data;
    },
    staleTime: 0, // Data is always fresh
    keepPreviousData: true, // Keep previous data while loading new data
  });
};

export const useUnifiedFarmerResponseYearQuery = () =>
  useQuery({
    queryKey: ['availableYears'],
    queryFn: async () => {
      //await new Promise(resolve => setTimeout(resolve, 5000));

      const response = await axios.get(`${API_URL}/api/hvc/metrics/available-years`);
      return response.data;
    },
    staleTime: 0, // Data is always fresh
    refetchInterval: 1000 // Refetch every second
  });

export const useUnifiedFarmerResponseMonthsQuery = (year) =>
  useQuery({
    queryKey: ['availableMonths', year],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/api/hvc/metrics/available-months/${year}`);
      return response.data;
    },
    enabled: !!year, // Only run the query if year is provided
    staleTime: 0, // Data is always fresh
  });

  export const useMetricsForYearMonthQuery = (year, month, barangay, commodity) =>
    useQuery({
      // Use 0 in the query key to represent "All Months" when month is null
      queryKey: ['metricsData', year, month ?? 0, barangay, commodity],
      queryFn: async () => {
        // We need a year, but month can be null (represented as 0)
        if (!year) return null;

        // Use 0 if month is null/undefined
        const monthParam = month ?? 0;
        let url = `${API_URL}/api/hvc/metrics/data/${year}/${monthParam}`;
        const params = new URLSearchParams();

        if (barangay) {
          params.append('farm_location', barangay);
        }

        if (commodity) {
          params.append('commodity', commodity);
        }

        // Append query params if any exist
        if (params.toString()) {
          url += `?${params.toString()}`;
        }

        const response = await axios.get(url);
        return response.data;
      },
      // Enable the query as long as a year is selected
      enabled: !!year,
      staleTime: 0,
    });

//for report generation, date ranges
export const useDateRangesQuery = (year, month) => 
  useQuery({
    queryKey: ['dateRanges', year, month],
    queryFn: async () => {
      if (!year || !month) return [];

      const response = await axios.get(`${API_URL}/api/hvc/report-date-ranges/${year}/${month}`);
      return response.data;
    },
    enabled: !!(year && month), // Only run if both year and month are provided
    staleTime: 0, // Data is always fresh
  });



// Composite hook that combines React Query and Zustand
export const useAdminDashboard = (searchParams = {}) => {

  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedBarangay, setSelectedBarangay] = useState('');
  const [selectedCommodity, setSelectedCommodity] = useState('');
  const [error, setError] = useState(null);
  const [newlyPlantedPage, setNewlyPlantedPage] = useState(1);
  const [harvestingPage, setHarvestingPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: newlyPlantedInputs = { results: [], totalPages: 1, totalCount: 0 }, isLoading: isLoadingNewlyPlanted, error: newlyPlantedError } = useUnvalidatedNewlyPlantedQuery(newlyPlantedPage, isModalOpen);
  const { data: harvestingInputs = { results: [], totalPages: 1, totalCount: 0 }, isLoading: isLoadingHarvesting, error: harvestingError } = useUnvalidatedHarvestingQuery(harvestingPage, isModalOpen);
  //const { data: validatedInputs = [], isLoading: isLoadingValidated, error: validatedError } = useValidatedInputsQuery();
  //const { mutate: updateFarmerInput, isPending: isUpdating, error: updateError } = useUpdateFarmerInputMutation();
  const { data: farmerAccounts = [], isLoading: isLoadingAccounts, error: farmerAccountsError } = useFarmerAccountsQuery(searchParams);

  const { data: availableYears = [], isLoading: isLoadingUFRY, error: ufrYearsError } = useUnifiedFarmerResponseYearQuery();
  const { data: availableMonths = [], isLoading: isLoadingUFRM, error: ufrMonthsError } = useUnifiedFarmerResponseMonthsQuery(selectedYear);
  const { data: metricsData, isLoading: isLoadingMetrics, error: metricsError } = useMetricsForYearMonthQuery(
    selectedYear, 
    selectedMonth,
    selectedBarangay || null,  // Pass as null if empty string
    selectedCommodity || null,  // Pass as null if empty string
  );
  const { data: dateRanges = [], isLoading: isLoadingDateRanges, error: dateRangesError } = useDateRangesQuery(selectedYear, selectedMonth);

  const [isCreatingUnifiedResponse, setIsCreatingUnifiedResponse] = useState(false);
  const [isDeletingFarmerAccount, setIsDeletingFarmerAccount] = useState(false);
  const [isCreatingFarmerAccount, setIsCreatingFarmerAccount] = useState(false);
  const [isFindingFarmerAccount, setIsFindingFarmerAccount] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isUpdatingFarmerAccount, setIsUpdatingFarmerAccount] = useState(false);
  const [isUpdatingFormStatus, setIsUpdatingFormStatus] = useState(false);


  useEffect(() => {
    if (!selectedYear && availableYears && availableYears.length > 0) {
      setSelectedYear(availableYears[0]); // Select the first available year by default
    }
  }, [availableYears, selectedYear]);


  // useEffect(() => {
  //   if (availableMonths && availableMonths.length > 0 && !selectedMonth) {
  //     setSelectedMonth(availableMonths[0]);
  //   }
  // }, [availableMonths, selectedMonth]);

  // Reset month when year changes


  useEffect(() => {
    setSelectedMonth(null); // Reset to "All Months" when year changes
  }, [selectedYear]);

  const createFarmerAccount = async (farmerData) => {
    setIsCreatingFarmerAccount(true);
    try {
      const response =  await axios.post(`${API_URL}/api/hvc/create-farmer-account`, farmerData);
      return response.data;
    } catch (error) {
      throw error;
    } finally {
      setIsCreatingFarmerAccount(false);
    }
  };

  const getFarmerAccountByNameUser = async (farmerData) => {
    setIsFindingFarmerAccount(true);
    try {
      const response =  await axios.post(`${API_URL}/api/hvc/get-farmer-account-by-name-user`, farmerData);
      return response.data;
    } catch (error) {
      throw error;
    } finally {
      setIsFindingFarmerAccount(false);
    }
  };////////////////////////////////////////////////////////////////////////////

  const deleteFarmerAccount = async (farmerId) => {
    setIsDeletingFarmerAccount(true);
    try {
      const response = await axios.post(`${API_URL}/api/hvc/delete-farmer-account`, farmerId );
      return response.data;
    } catch (error) {
      throw error;
    } finally {
      setIsDeletingFarmerAccount(false);
    }
  };

  const createUnifiedFarmerResponse = async (responseData) => {
    setIsCreatingUnifiedResponse(true);
    try {
      const response = await axios.post(`${API_URL}/api/hvc/create-unified-farmer-response`, responseData);
      return response.data; 
    } catch (error) {
      throw error; 
    } finally {
      setIsCreatingUnifiedResponse(false); 
    }
  };

  const flagResponseForReview = async (farmerId) => {
    try {
      const response = await axios.post(`${API_URL}/api/hvc/flag-response-for-review/${farmerId}`);
      return response.data; 
    } catch (error) {
      throw error; 
    } 
  };

  const unflagResponseForReview = async (farmerId) => {
    try {
      const response = await axios.post(`${API_URL}/api/hvc/unflag-response-for-review/${farmerId}`);
      return response.data; 
    } catch (error) {
      throw error; 
    } 
  };

  const getFarmerAccountById = async (farmerId) => {
    try {
      const response = await axios.post(`${API_URL}/api/hvc/get-farmer-account`, farmerId);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const generateExcelReport = async (startDate, endDate) => {
    setIsGeneratingReport(true);
    try {
      const response = await axios.post(
        `${API_URL}/api/hvc/generate-excel-report`, 
        { 
          startDate, 
          endDate
        },
        { responseType: 'blob' } // Important for file download
      );
      return response.data;
    } catch (error) {
      throw error;
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const updateFarmerAccount = async (farmerId, updateData) => {
    setIsUpdatingFarmerAccount(true);
    try {
      const response = await axios.put(`${API_URL}/api/hvc/farmer-accounts/update`, { 
        farmerId,
        ...updateData
      });
      return response.data;
    } catch (error) {
      throw error;
    }
    finally {
      setIsUpdatingFarmerAccount(false);
    }
  };

  // Add updateFarmerResponseFields for flagged responses (partial update)
  const updateFarmerResponseFields = async ({ farmerId, crop_stage, updates }) => {
    try {
      const response = await axios.post(`${API_URL}/api/hvc/update-farmer-response-fields`, {
        farmerId,
        crop_stage,
        updates
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const deleteFarmerResponse = async (farmerId) => {
    try {
      const response = await axios.post(`${API_URL}/api/hvc/delete-farmer-response`, { farmerId });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const FormStatusEnable = async () => {
    setIsUpdatingFormStatus(true);
    try {
      await axios.post(`${API_URL}/api/hvc/form-status-enable`);
    } catch (error) {
      throw error;
    } finally {
      setIsUpdatingFormStatus(false);
    }
  };

  const FormStatusDisable = async () => {
    setIsUpdatingFormStatus(true);
    try {
      await axios.post(`${API_URL}/api/hvc/form-status-disable`);
    } catch (error) {
      throw error;
    } finally {
      setIsUpdatingFormStatus(false);
    }
  };

  // Combine errors from different sources
  // if (unvalidatedError) setError(unvalidatedError.message || 'Failed to fetch unvalidated inputs');
  // if (validatedError) setError(validatedError.message || 'Failed to fetch validated inputs');
  // // if (updateError) setError(updateError.message || 'Failed to update farmer input');
  // if (accountsError) setError(accountsError.message || 'Failed to fetch farmer accounts');
  // if (dateRangesError) setError(dateRangesError.message || 'Failed to fetch date ranges');

  return {
    // Data
    newlyPlantedInputs,
    harvestingInputs,
    farmerAccounts,
    getFarmerAccountById,
    availableYears,
    availableMonths,
    metricsData,
    selectedYear,
    selectedMonth,
    setSelectedYear,
    setSelectedMonth,
    selectedBarangay,
    setSelectedBarangay,
    selectedCommodity,
    setSelectedCommodity,
    dateRanges,
    newlyPlantedPage,
    setNewlyPlantedPage,
    harvestingPage,
    setHarvestingPage,
    
    // Loading states
    isLoading: isLoadingAccounts || isLoadingMetrics || isLoadingDateRanges,
    isLoadingNewlyPlanted,
    isLoadingHarvesting,
    isLoadingUFRY,
    isLoadingUFRM,
    //isUpdating,
    isCreatingUnifiedResponse,
    isCreatingFarmerAccount,
    isDeletingFarmerAccount,
    isGeneratingReport,
    isUpdatingFarmerAccount,
    isUpdatingFormStatus,

    // Error states
    newlyPlantedError, 
    harvestingError, 
    //validatedError, //not in use
    farmerAccountsError, 
    ufrYearsError, 
    ufrMonthsError, 
    metricsError, 
    dateRangesError, 
    
    // Actions
    //updateFarmerInput,
    createFarmerAccount,
    getFarmerAccountByNameUser,
    deleteFarmerAccount,
    createUnifiedFarmerResponse,
    flagResponseForReview,
    unflagResponseForReview,
    generateExcelReport,
    updateFarmerAccount,
    updateFarmerResponseFields,
    setIsModalOpen,
    deleteFarmerResponse,
    FormStatusEnable,
    FormStatusDisable
  };
};
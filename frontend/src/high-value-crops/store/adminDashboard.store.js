import axios from 'axios';
import { useQuery, useMutation } from '@tanstack/react-query';

const API_URL = import.meta.env.VITE_API_URL;

// ======================= QUERIES =======================

export const useUnvalidatedNewlyPlantedQuery = (page = 1, isPaused = false, role) => 
  useQuery({
    queryKey: ['unvalidatedNewlyPlanted', page],
    queryFn: async () => {
      const params = new URLSearchParams({ page, limit: 5, crop_stage: 'NEWLY PLANTED' });
      const response = await axios.get(`${API_URL}/api/hvc/get-unvalidated-inputs`, { params });
      return response.data;
    },
    staleTime: 0,
    refetchInterval: isPaused ? false : 30000, // Refetch every 30 seconds unless paused
    enabled: role === 'HVCM' || role === 'HVCS' 
  });

export const useUnvalidatedHarvestingQuery = (page = 1, isPaused = false, role) => 
  useQuery({
    queryKey: ['unvalidatedHarvesting', page],
    queryFn: async () => {
      const params = new URLSearchParams({ page, limit: 5, crop_stage: 'HARVESTING' });
      const response = await axios.get(`${API_URL}/api/hvc/get-unvalidated-inputs`, { params });
      return response.data;
    },
    staleTime: 0,
    refetchInterval: isPaused ? false : 30000, // Refetch every 30 seconds unless paused
    enabled: role === 'HVCM' || role === 'HVCS' 
  });

export const useUnvalidatedNewlyPlantedArchivedQuery = (page = 1, isPaused = false, role) => 
  useQuery({
    queryKey: ['unvalidatedNewlyPlantedArchived', page],
    queryFn: async () => {
      const params = new URLSearchParams({ page, limit: 5, crop_stage: 'NEWLY PLANTED' });
      const response = await axios.get(`${API_URL}/api/hvc/get-unvalidated-archived-inputs`, { params });
      return response.data;
    },
    staleTime: 0,
    refetchInterval: isPaused ? false : 30000, // Refetch every 30 seconds unless paused
    enabled: role === 'HVCM' || role === 'HVCS' 
  });

export const useUnvalidatedHarvestingArchivedQuery = (page = 1, isPaused = false, role) => 
  useQuery({
    queryKey: ['unvalidatedHarvestingArchived', page],
    queryFn: async () => {
      const params = new URLSearchParams({ page, limit: 5, crop_stage: 'HARVESTING' });
      const response = await axios.get(`${API_URL}/api/hvc/get-unvalidated-archived-inputs`, { params });
      return response.data;
    },
    staleTime: 0,
    refetchInterval: isPaused ? false : 30000, // Refetch every 30 seconds unless paused
    enabled: role === 'HVCM' || role === 'HVCS' 
  });

export const useFarmerAccountsQuery = (searchParams = {}, role) => {
 
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
    enabled: role === 'HVCM' || role === 'HVCS' 
  });
};

export const useArchivedFarmerAccountsQuery = (searchParams = {}, role) => {
  return useQuery({
   queryKey: ['archivedFarmerAccounts', searchParams],
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


      const response = await axios.get(`${API_URL}/api/hvc/get-archived-farmer-accounts`, { params });
      return response.data;
    },
    staleTime: 0, // Data is always fresh
    keepPreviousData: true, // Keep previous data while loading new data
    enabled: role === 'HVCM' || role === 'HVCS' 
  });
};

export const useUnifiedFarmerResponseYearQuery = (role) =>
  useQuery({
    queryKey: ['availableYears'],
    queryFn: async () => {
      //await new Promise(resolve => setTimeout(resolve, 5000));

      const response = await axios.get(`${API_URL}/api/hvc/metrics/available-years`);
      return response.data;
    },
    staleTime: 0, // Data is always fresh
    refetchInterval: 60000, // Refetch every minute
    enabled: role === 'HVCM' || role === 'HVCS' 
  });

export const useUnifiedFarmerResponseMonthsQuery = (year, role) =>
  useQuery({
    queryKey: ['availableMonths', year],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/api/hvc/metrics/available-months/${year}`);
      return response.data;
    },
    enabled: !!year && (role === 'HVCM' || role === 'HVCS'), // Only run the query if year is provided
    staleTime: 0, // Data is always fresh
  });

  export const useMetricsForYearMonthQuery = (year, month, barangay, commodity, role) =>
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
      enabled: !!year && (role === 'HVCM' || role === 'HVCS'),
      staleTime: 0,
    });

//for report generation, date ranges
export const useDateRangesQuery = (year, month, role) => 
  useQuery({
    queryKey: ['dateRanges', year, month],
    queryFn: async () => {
      if (!year || !month) return [];

      const response = await axios.get(`${API_URL}/api/hvc/report-date-ranges/${year}/${month}`);
      return response.data;
    },
    enabled: !!(year && month) && (role === 'HVCM' || role === 'HVCS'), // Only run if both year and month are provided
    staleTime: 0, // Data is always fresh
  });

export const useAvailableBarangaysQuery = (year, month, role) => 
  useQuery({
    queryKey: ['barangays', year, month],
    queryFn: async () => {
      if (!year || !month) return [];

      const response = await axios.get(`${API_URL}/api/hvc/available-barangays/${year}/${month}`);
      return response.data;
    },
    enabled: !!(year && month) && (role === 'HVCM' || role === 'HVCS'), // Only run if both year and month are provided
    staleTime: 0, // Data is always fresh
  });

export const getFarmerAccountById = async (farmerId) => {
  const response = await axios.post(`${API_URL}/api/hvc/get-farmer-account`, farmerId);
  return response.data;
};

export const getEditRequestDetailsRaw = async (editRequestId) => {
  const response = await axios.get(`${API_URL}/api/hvc/get-edit-request-details-for-farmer-view/${editRequestId}`);
  return response.data;
};

export const getFarmerAccountByNameUser = async (farmerData) => {
  const response = await axios.post(`${API_URL}/api/hvc/get-farmer-account-by-name-user`, farmerData);
  return response.data;
};

// ======================= MUTATIONS =======================

export const useCreateFarmerAccountMutation = () => useMutation({
  mutationFn: async (farmerData) => {
    const response = await axios.post(`${API_URL}/api/hvc/create-farmer-account`, farmerData);
    return response.data;
  }
});

export const useArchiveFarmerAccountMutation = () => useMutation({
  mutationFn: async (farmerId) => {
    const response = await axios.post(`${API_URL}/api/hvc/archive-farmer-account`, farmerId);
    return response.data;
  }
});

export const useUnarchiveFarmerAccountMutation = () => useMutation({
  mutationFn: async (farmerId) => {
    const response = await axios.post(`${API_URL}/api/hvc/unarchive-farmer-account`, farmerId);
    return response.data;
  }
});

export const useCreateUnifiedFarmerResponseMutation = () => useMutation({
  mutationFn: async (responseData) => {
    const response = await axios.post(`${API_URL}/api/hvc/create-unified-farmer-response`, responseData);
    return response.data;
  }
});

export const useFlagResponseForReviewMutation = () => useMutation({
  mutationFn: async (farmerId) => {
    const response = await axios.post(`${API_URL}/api/hvc/flag-response-for-review/${farmerId}`);
    return response.data;
  }
});

export const useUnflagResponseForReviewMutation = () => useMutation({
  mutationFn: async (farmerId) => {
    const response = await axios.post(`${API_URL}/api/hvc/unflag-response-for-review/${farmerId}`);
    return response.data;
  }
});

export const useGenerateHVCSaMPRMutation = () => useMutation({
  mutationFn: async ({ startDate, endDate, barangays, employeeId }) => {
    const response = await axios.post(
      `${API_URL}/api/hvc/generate-hvc-sampr`, 
      { startDate, endDate, barangays, employeeId },
      { responseType: 'blob' }
    );
    return response.data;
  }
});

export const useGenerateHVCPRMutation = () => useMutation({
  mutationFn: async ({ year, month, barangays, employeeId }) => {
    const response = await axios.post(
      `${API_URL}/api/hvc/generate-hvc-pr`, 
      { year, month, barangays, employeeId }, 
      { responseType: 'blob' }
    );
    return response.data;
  }
});

export const useUpdateFarmerAccountMutation = () => useMutation({
  mutationFn: async ({ farmerId, updateData }) => {
    const response = await axios.put(`${API_URL}/api/hvc/farmer-accounts/update`, { farmerId, ...updateData });
    return response.data;
  }
});

export const useUpdateFarmerResponseFieldsMutation = () => useMutation({
  mutationFn: async ({ farmerId }) => {
    const response = await axios.post(`${API_URL}/api/hvc/update-farmer-response-fields/${farmerId}`);
    return response.data;
  }
});

export const useRequestEditMutation = () => useMutation({
  mutationFn: async ({ farmerId, crop_stage, updates, reason }) => {
    const response = await axios.post(`${API_URL}/api/hvc/request-edit`, { farmerId, crop_stage, updates, reason });
    return response.data;
  }
});

export const useHandleConsentForEditRequestMutation = () => useMutation({
  mutationFn: async ({ editRequestId, consent }) => {
    const response = await axios.post(`${API_URL}/api/hvc/handle-consent-for-edit-request`, { editRequestId, consent });
    return response.data;
  }
});

export const useDeleteFarmerResponseMutation = () => useMutation({
  mutationFn: async (farmerId) => {
    const response = await axios.post(`${API_URL}/api/hvc/delete-farmer-response`, { farmerId });
    return response.data;
  }
});

export const useFormStatusEnableMutation = () => useMutation({
  mutationFn: async () => {
    const response = await axios.post(`${API_URL}/api/hvc/form-status-enable`);
    return response.data;
  }
});

export const useFormStatusDisableMutation = () => useMutation({
  mutationFn: async () => {
    const response = await axios.post(`${API_URL}/api/hvc/form-status-disable`);
    return response.data;
  }
});

export const useArchiveResponseMutation = () => useMutation({
  mutationFn: async (inputId) => {
    const response = await axios.post(`${API_URL}/api/hvc/archive-response`, { inputId });
    return response.data;
  }
});

export const useUnarchiveResponseMutation = () => useMutation({
  mutationFn: async (inputId) => {
    const response = await axios.post(`${API_URL}/api/hvc/unarchive-response`, { inputId });
    return response.data;
  }
});

export const useCreateValidationScheduleVisitMutation = () => useMutation({
  mutationFn: async (scheduleData) => {
    const response = await axios.post(`${API_URL}/api/hvc/create-validation-schedule-visit`, scheduleData);
    return response.data;
  }
});

export const useSetValidationVisitCompletedMutation = () => useMutation({
  mutationFn: async (visitData) => {
    const response = await axios.post(`${API_URL}/api/hvc/set-validation-visit-completed`, visitData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
});

export const useApproveValidationVisitDetailsMutation = () => useMutation({
  mutationFn: async (visitData) => {
    const response = await axios.post(`${API_URL}/api/hvc/approve-validation-visit-details`, visitData);
    return response.data;
  }
});

export const useRejectValidationVisitDetailsMutation = () => useMutation({
  mutationFn: async (visitData) => {
    const response = await axios.post(`${API_URL}/api/hvc/reject-validation-visit-details`, visitData);
    return response.data;
  }
});
import axios from 'axios';
import { useQuery, useMutation } from '@tanstack/react-query';

const API_URL = import.meta.env.VITE_API_URL;

// ======================= QUERIES =======================

export const usePendingTicketRequestsQuery = (page = 1, searchQuery = {}, role) =>
    useQuery({
        queryKey: ['pendingTicketRequests', page, searchQuery],
        queryFn: async () => {
            const res = await axios.get(`${API_URL}/api/machineries/get-pending-ticket-requests`, {
                params: { page, limit: 10, ...searchQuery },
            });
            return res.data;
        },
        enabled: role === 'MIM' || role === 'MIS',
    });


export const useAvailableMachineryTypesQuery = (role) =>
    useQuery({
        queryKey: ['availableMachineryTypes'],
        queryFn: async () => {
            const res = await axios.get(`${API_URL}/api/machineries/get-available-machinery-types`);
            return res.data;
        },
        enabled: role === 'MIM' || role === 'MIS', // Enable for all roles since we need this data in the TicketRequestPanel
    });

export const useOperatorsListQuery = (requestedMachineTypeId = null, role) =>
    useQuery({
        queryKey: ['operatorsList', requestedMachineTypeId],
        queryFn: async () => {
            const params = requestedMachineTypeId ? { requestedMachineTypeId } : {};
            const res = await axios.get(`${API_URL}/api/machineries/get-operators-list`, { params });
            return res.data;
        },
        enabled: role === 'MIM' || role === 'MIS', // Enable for all roles since we need this data in the TicketRequestPanel
    });

export const usePlannedWeeklySchedulesQuery = (page = 1, searchQuery = {}, role) =>
    useQuery({
        queryKey: ['plannedWeeklySchedules', page, searchQuery],
        queryFn: async () => {
            const res = await axios.get(`${API_URL}/api/machineries/get-planned-weekly-schedules`, {
                params: { page, limit: 10, ...searchQuery },
            });
            return res.data;
        },
        enabled: role === 'MIM' || role === 'MIS',
    });

export const useInProgressWeeklySchedulesQuery = (page = 1, searchQuery = {}, role) =>
    useQuery({
        queryKey: ['inProgressWeeklySchedules', page, searchQuery],
        queryFn: async () => {
            const res = await axios.get(`${API_URL}/api/machineries/get-in-progress-weekly-schedules`, {
                params: { page, limit: 10, ...searchQuery },
            });
            return res.data;
        },
        enabled: role === 'MIM' || role === 'MIS',
    });

export const usePendingExtensionRequestsCountQuery = (role) =>
    useQuery({
        queryKey: ['pendingExtensionCount'],
        queryFn: async () => {
            const response = await axios.get(`${API_URL}/api/machineries/pending-extension-count`);
            return response.data;
        },
        enabled: role === 'MIM' || role === 'MIS',
});

export const usePendingIncidentReportsCountQuery = (role) =>
    useQuery({
        queryKey: ['pendingIncidentReportsCount'],
        queryFn: async () => {
            const response = await axios.get(`${API_URL}/api/machineries/pending-incident-reports-count`);
            return response.data;
        },
        enabled: role === 'MIM' || role === 'MIS',
});

export const useMachineIncidentReportsQuery = (page = 1, searchQuery = {}, role) =>
    useQuery({
        queryKey: ['machineIncidentReports', page, searchQuery],
        queryFn: async () => {
            const res = await axios.get(`${API_URL}/api/machineries/get-machine-incident-reports`, {
                params: { page, limit: 10, ...searchQuery },
            });
            return res.data;
        },
        enabled: role === 'MIM' || role === 'MIS',
    });

export const useMachineUnitsForPhysicalCountingQuery = (role) =>
    useQuery({
        queryKey: ['machineUnitsForPhysicalCounting'],
        queryFn: async () => {
            const res = await axios.get(`${API_URL}/api/machineries/get-machine-units-for-physical-counting`);
            return res.data;
        },
        enabled: role === 'MIM' || role === 'MIS',
    });

export const usePhysicalCountingRecordsQuery = (page = 1, searchQuery = {}, role) =>
    useQuery({
        queryKey: ['physicalCountingRecords', page, searchQuery],
        queryFn: async () => {
            const res = await axios.get(`${API_URL}/api/machineries/get-physical-counting-records`, {
                params: { page, limit: 10, ...searchQuery },
            });
            return res.data;
        },
        enabled: role === 'MIM' || role === 'MIS',
    });

export const useMachineUnitsQuery = (page = 1, searchQuery = {}, role) =>
    useQuery({
        queryKey: ['machineUnits', page, searchQuery],
        queryFn: async () => {
            const response = await axios.get(`${API_URL}/api/machineries/get-machine-units`, {
                params: { page, limit: 5, ...searchQuery }
            });
            return response.data;
        },
        enabled: role === 'MIM' || role === 'MIS',
});

export const useOperatorAccountsQuery = (page = 1, searchQuery = {}, role) =>
    useQuery({
        queryKey: ['operatorAccounts', page, searchQuery],
        queryFn: async () => {
            const response = await axios.get(`${API_URL}/api/machineries/get-all-operators`, {
                params: { page, limit: 10, ...searchQuery }
            });
            return response.data;
        },
        enabled: role === 'MIM',
});

export const useOccupiedDatesForSchedulingQuery = (role) =>
    useQuery({
        queryKey: ['occupiedDatesForScheduling'],
        queryFn: async () => {
            const res = await axios.post(`${API_URL}/api/machineries/get-occupied-dates-for-scheduling`);
            return res.data;
        },
        enabled: role === 'MIM',
    });

export const useOperatorAssignedNumbersQuery = (role) =>
    useQuery({
        queryKey: ['operatorAssignedNumbers'],
        queryFn: async () => {
            const res = await axios.get(`${API_URL}/api/machineries/get-operators-assigned-numbers`);
            return res.data;
        },
        enabled: role === 'MIM',
    });

export const useMachineOverviewQuery = (role) =>
    useQuery({
        queryKey: ['machineOverview'],
        queryFn: async () => {
            const res = await axios.get(`${API_URL}/api/machineries/get-machine-overview`);
            return res.data;
        },
        enabled: role === 'MIM' || role === 'MIS',
    });

export const useMachineTypesQuery = (role) =>
    useQuery({
        queryKey: ['machineTypes'],
        queryFn: async () => {
            const res = await axios.get(`${API_URL}/api/machineries/get-machine-types-for-adding-units`);
            return res.data;
        },
        enabled: role === 'MIM' || role === 'MIS',
    });

export const useMachineTypeUnitCountsQuery = (role) =>
    useQuery({
        queryKey: ['machineTypeUnitCounts'],
        queryFn: async () => {
            const res = await axios.get(`${API_URL}/api/machineries/get-machine-type-unit-counts`);
            return res.data;
        },
        enabled: role === 'MIM' || role === 'MIS',
    });

export const useTicketStatusCountsQuery = (role) =>
    useQuery({
        queryKey: ['ticketStatusCounts'],
        queryFn: async () => {
            const res = await axios.get(`${API_URL}/api/machineries/get-ticket-status-counts`);
            return res.data;
        },
        enabled: role === 'MIM',
    });

export const useUpcomingAndOngoingSchedulesQuery = (role) =>
    useQuery({
        queryKey: ['upcomingAndOngoingSchedules'],
        queryFn: async () => {
            const res = await axios.get(`${API_URL}/api/machineries/get-upcoming-and-ongoing-schedules`);
            return res.data;
        },
        enabled: role === 'MIM',
    });

export const useMachineryUnitsForDropDownByTypeQuery = (machineryTypeId) =>
    useQuery({
        queryKey: ['machineryUnitsForDropDownByType', machineryTypeId],
        queryFn: async () => {
            const res = await axios.get(`${API_URL}/api/machineries/get-machinery-units-for-dropdown`, {
                params: { machineryTypeId }
            });
            return res.data;
        },
        enabled: !!machineryTypeId,
    });

export const useOperatorsListByMachineTypeQuery = (requestedMachineTypeId) =>
    useQuery({
        queryKey: ['operatorsListByMachineType', requestedMachineTypeId],
        queryFn: async () => {
            const res = await axios.get(`${API_URL}/api/machineries/get-operators-list`, {
                params: { requestedMachineTypeId }
            });
            return res.data;
        },
        enabled: !!requestedMachineTypeId,
    });

export const getMachineryUnitsForDropDownByType = async (machineryTypeId) => {
    const res = await axios.get(`${API_URL}/api/machineries/get-machinery-units-for-dropdown`, {
        params: { machineryTypeId }
    });
    return res.data;
};

export const getOperatorsListByMachineType = async (requestedMachineTypeId) => {
    const res = await axios.get(`${API_URL}/api/machineries/get-operators-list`, {
        params: { requestedMachineTypeId }
    });
    return res.data;
};

// ======================= MUTATIONS =======================

export const useCreateMachineryTypeMutation = () => useMutation({
    mutationFn: async (data) => {
        const res = await axios.post(`${API_URL}/api/machineries/create-machinery-type`, data);
        return res.data;
    }
});

export const useUpdateMachineryTypeMutation = () => useMutation({
    mutationFn: async (data) => {
        const res = await axios.put(`${API_URL}/api/machineries/update-machinery-type`, data);
        return res.data;
    }
});

export const useCreateMachineryUnitMutation = () => useMutation({
    mutationFn: async (data) => {
        const res = await axios.post(`${API_URL}/api/machineries/create-machinery-unit`, data);
        return res.data;
    }
});

export const useUpdateMachineryUnitMutation = () => useMutation({
    mutationFn: async (data) => {
        const res = await axios.post(`${API_URL}/api/machineries/update-machinery-unit`, data);
        return res.data;
    }
});

export const useGenerateMachineryReportMutation = () => useMutation({
    mutationFn: async (params = {}) => {
        const res = await axios.get(`${API_URL}/api/machineries/generate-machinery-report`, {
            params,
            responseType: 'blob',
        });
        return res.data;
    }
});

export const useCreateWeeklyScheduleMutation = () => useMutation({
    mutationFn: async (data) => {
        const res = await axios.post(`${API_URL}/api/machineries/create-weekly-schedule`, data);
        return res.data;
    }
});

export const useRemoveFromScheduleMutation = () => useMutation({
    mutationFn: async (ticketRequestId) => {
        const res = await axios.post(`${API_URL}/api/machineries/remove-from-schedule/${ticketRequestId}`);
        return res.data;
    }
});

export const useMoveToScheduleMutation = () => useMutation({
    mutationFn: async (data) => {
        const res = await axios.post(`${API_URL}/api/machineries/move-to-schedule`, data);
        return res.data;
    }
});

export const useSubmitTicketRequestMutation = () => useMutation({
    mutationFn: async (data) => {
        const res = await axios.post(`${API_URL}/api/machineries/submit-ticket-request`, data);
        return res.data;
    }
});

export const useArchiveTicketRequestMutation = () => useMutation({
    mutationFn: async (data) => {
        const res = await axios.post(`${API_URL}/api/machineries/archive-ticket-request`, data);
        return res.data;
    }
});

export const useUpdateWeeklyScheduleMutation = () => useMutation({
    mutationFn: async (data) => {
        const res = await axios.post(`${API_URL}/api/machineries/update-weekly-schedule`, data);
        return res.data;
    }
});

export const useSetTicketToCompleteMutation = () => useMutation({
    mutationFn: async (formData) => {
        const res = await axios.post(`${API_URL}/api/machineries/ticket-request-complete`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return res.data;
    }
});

export const useSetExtensionTicketToCompleteMutation = () => useMutation({
    mutationFn: async (formData) => {
        const res = await axios.post(`${API_URL}/api/machineries/extension-ticket-complete`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return res.data;
    }
});

export const useApproveExtensionRequestMutation = () => useMutation({
    mutationFn: async (data) => {
        const res = await axios.post(`${API_URL}/api/machineries/approve-extension-request`, data);
        return res.data;
    }
});

export const useDeclineExtensionRequestMutation = () => useMutation({
    mutationFn: async (data) => {
        const res = await axios.post(`${API_URL}/api/machineries/decline-extension-request`, data);
        return res.data;
    }
});

export const useUpdateMachineryUnitStatusMutation = () => useMutation({
    mutationFn: async (data) => {
        const res = await axios.post(`${API_URL}/api/machineries/update-machinery-unit-status`, data);
        return res.data;
    }
});

export const useDisableOperatorAccountMutation = () => useMutation({
    mutationFn: async (data) => {
        const res = await axios.post(`${API_URL}/api/machineries/disable-operator`, data);
        return res.data;
    }
});

export const useEnableOperatorAccountMutation = () => useMutation({
    mutationFn: async (data) => {
        const res = await axios.post(`${API_URL}/api/machineries/enable-operator`, data);
        return res.data;
    }
});

export const useAddOperatorLicenseMutation = () => useMutation({
    mutationFn: async (data) => {
        const res = await axios.post(`${API_URL}/api/machineries/add-operator-license`, data);
        return res.data;
    }
});

export const useUpdateOperatorLicenseMutation = () => useMutation({
    mutationFn: async (data) => {
        const res = await axios.put(`${API_URL}/api/machineries/update-operator-license`, data);
        return res.data;
    }
});

export const useRemoveOperatorLicenseMutation = () => useMutation({
    mutationFn: async (data) => {
        const res = await axios.post(`${API_URL}/api/machineries/remove-operator-license`, data);
        return res.data;
    }
});

export const useSetEmployeeLeaveStatusMutation = () => useMutation({
    mutationFn: async (data) => {
        const res = await axios.post(`${API_URL}/api/machineries/set-employee-leave-status`, data);
        return res.data;
    }
});

export const useDeclineIncidentReportMutation = () => useMutation({
    mutationFn: async (data) => {
        const res = await axios.post(`${API_URL}/api/machineries/decline-incident-report`, data);
        return res.data;
    }
});

export const useResolveIncidentReportMutation = () => useMutation({
    mutationFn: async (data) => {
        const res = await axios.post(`${API_URL}/api/machineries/resolve-incident-report`, data);
        return res.data;
    }
});

export const useConfirmIncidentReportMutation = () => useMutation({
    mutationFn: async (data) => {
        const res = await axios.post(`${API_URL}/api/machineries/confirm-incident-report`, data);
        return res.data;
    }
});

export const usePerformMachineCountCheckMutation = () => useMutation({
    mutationFn: async (data) => {
        const res = await axios.post(`${API_URL}/api/machineries/perform-machine-count-check`, data);
        return res.data;
    }
});

export const useResolveDiscrepancyInPhysicalCountMutation = () => useMutation({
    mutationFn: async (data) => {
        const res = await axios.post(`${API_URL}/api/machineries/resolve-discrepancy-in-physical-count`, data);
        return res.data;
    }
});

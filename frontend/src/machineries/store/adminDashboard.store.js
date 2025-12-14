import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useAuthStore } from '../../auth/store/authStore.js';

const API_URL = import.meta.env.VITE_API_URL;

// Queries
const usePendingTicketRequestsQuery = (page = 1, searchQuery = {}, role) =>
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


const useAvailableMachineryTypesQuery = () =>
    useQuery({
        queryKey: ['availableMachineryTypes'],
        queryFn: async () => {
            const res = await axios.get(`${API_URL}/api/machineries/get-available-machinery-types`);
            return res.data;
        },
        enabled: true,
    });

const useOperatorsListQuery = (requestedMachineTypeId = null) =>
    useQuery({
        queryKey: ['operatorsList', requestedMachineTypeId],
        queryFn: async () => {
            const params = requestedMachineTypeId ? { requestedMachineTypeId } : {};
            const res = await axios.get(`${API_URL}/api/machineries/get-operators-list`, { params });
            return res.data;
        },
        enabled: true, // Enable for all roles since we need this data in the TicketRequestPanel
    });

const usePlannedWeeklySchedulesQuery = (page = 1, searchQuery = {}, role) =>
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

const useInProgressWeeklySchedulesQuery = (page = 1, searchQuery = {}, role) =>
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

const usePendingExtensionRequestsCountQuery = (role) =>
    useQuery({
        queryKey: ['pendingExtensionCount'],
        queryFn: async () => {
            const response = await axios.get(`${API_URL}/api/machineries/pending-extension-count`);
            return response.data;
        },
        enabled: role === 'MIM' || role === 'MIS',
});

const usePendingIncidentReportsCountQuery = (role) =>
    useQuery({
        queryKey: ['pendingIncidentReportsCount'],
        queryFn: async () => {
            const response = await axios.get(`${API_URL}/api/machineries/pending-incident-reports-count`);
            return response.data;
        },
        enabled: role === 'MIM' || role === 'MIS',
});

const useMachineIncidentReportsQuery = (page = 1, searchQuery = {}, role) =>
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

const useMachineUnitsForPhysicalCountingQuery = (role) =>
    useQuery({
        queryKey: ['machineUnitsForPhysicalCounting'],
        queryFn: async () => {
            const res = await axios.get(`${API_URL}/api/machineries/get-machine-units-for-physical-counting`);
            return res.data;
        },
        enabled: role === 'MIM' || role === 'MIS',
    });

const usePhysicalCountingRecordsQuery = (page = 1, searchQuery = {}, role) =>
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

const useMachineUnitsQuery = (page = 1, searchQuery = {}, role) =>
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

const useOperatorAccountsQuery = (page = 1, searchQuery = {}, role) =>
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

const useOccupiedDatesForSchedulingQuery = (role) =>
    useQuery({
        queryKey: ['occupiedDatesForScheduling'],
        queryFn: async () => {
            const res = await axios.post(`${API_URL}/api/machineries/get-occupied-dates-for-scheduling`);
            return res.data;
        },
        enabled: role === 'MIM',
    });

const useOperatorAssignedNumbersQuery = (role) =>
    useQuery({
        queryKey: ['operatorAssignedNumbers'],
        queryFn: async () => {
            const res = await axios.get(`${API_URL}/api/machineries/get-operators-assigned-numbers`);
            return res.data;
        },
        enabled: role === 'MIM',
    });

const useMachineOverviewQuery = (role) =>
    useQuery({
        queryKey: ['machineOverview'],
        queryFn: async () => {
            const res = await axios.get(`${API_URL}/api/machineries/get-machine-overview`);
            return res.data;
        },
        enabled: role === 'MIM' || role === 'MIS',
    });

const useMachineTypesQuery = (role) =>
    useQuery({
        queryKey: ['machineTypes'],
        queryFn: async () => {
            const res = await axios.get(`${API_URL}/api/machineries/get-machine-types-for-adding-units`);
            return res.data;
        },
        enabled: role === 'MIM' || role === 'MIS',
    });

const useMachineTypeUnitCountsQuery = (role) =>
    useQuery({
        queryKey: ['machineTypeUnitCounts'],
        queryFn: async () => {
            const res = await axios.get(`${API_URL}/api/machineries/get-machine-type-unit-counts`);
            return res.data;
        },
        enabled: role === 'MIM' || role === 'MIS',
    });

const useTicketStatusCountsQuery = (role) =>
    useQuery({
        queryKey: ['ticketStatusCounts'],
        queryFn: async () => {
            const res = await axios.get(`${API_URL}/api/machineries/get-ticket-status-counts`);
            return res.data;
        },
        enabled: role === 'MIM',
    });

const useUpcomingAndOngoingSchedulesQuery = (role) =>
    useQuery({
        queryKey: ['upcomingAndOngoingSchedules'],
        queryFn: async () => {
            const res = await axios.get(`${API_URL}/api/machineries/get-upcoming-and-ongoing-schedules`);
            return res.data;
        },
        enabled: role === 'MIM',
    });

// Exported store
export const useAdminDashboard = (pages = {}, searchQuery = {}) => {
    const { user } = useAuthStore();
    const role = user?.role?.toString();

    const {
        pendingPage = 1,
        schedulesPage = 1,
        machineUnitsPage = 1,
        operatorAccountsPage = 1,
        machineIncidentReportsPage = 1,
        previousCountsPage = 1,
    } = pages;


    const { data: pendingTicketRequests = [], isLoading: isLoadingPendingTicketRequests, error: pendingTicketRequestsError } =
        usePendingTicketRequestsQuery(pendingPage, searchQuery, role);

    const { data: availableMachineryTypes = [], isLoading: isLoadingAvailableMachineryTypes, error: availableMachineryTypesError } =
        useAvailableMachineryTypesQuery();

    const { data: operatorsList = [], isLoading: isLoadingOperatorsList, error: operatorsListError } =
        useOperatorsListQuery(null); // Pass null to get all operators (for backward compatibility)

    const { data: plannedWeeklySchedules = [], isLoading: isLoadingPlannedWeeklySchedules, error: plannedWeeklySchedulesError } =
        usePlannedWeeklySchedulesQuery(schedulesPage, searchQuery, role);

    const { data: inProgressWeeklySchedules = [], isLoading: isLoadingInProgressWeeklySchedules, error: inProgressWeeklySchedulesError } =
        useInProgressWeeklySchedulesQuery(schedulesPage, searchQuery, role);

    const { data: pendingExtensionCount = 0, isLoading: isLoadingPendingExtensionCount, error: pendingExtensionCountError } =
        usePendingExtensionRequestsCountQuery(role);
    
    const { data: pendingIncidentReportsCount = 0, isLoading: isLoadingPendingIncidentReportsCount, error: pendingIncidentReportsCountError } =
        usePendingIncidentReportsCountQuery(role);
    
    const { data: machineIncidentReports = [], isLoading: isLoadingMachineIncidentReports, error: machineIncidentReportsError } =
        useMachineIncidentReportsQuery(machineIncidentReportsPage, searchQuery, role);
    
    const { data: machineUnitsForPhysicalCounting = [], isLoading: isLoadingMachineUnitsForPhysicalCounting, error: machineUnitsForPhysicalCountingError } =
        useMachineUnitsForPhysicalCountingQuery(role);
    
    const { data: physicalCountingRecords = [], isLoading: isLoadingPhysicalCountingRecords, error: physicalCountingRecordsError } =
        usePhysicalCountingRecordsQuery(previousCountsPage, {}, role);
    
    const { data: occupiedDatesForScheduling = [], isLoading: isLoadingOccupiedDatesForScheduling, error: occupiedDatesForSchedulingError } =
        useOccupiedDatesForSchedulingQuery(role);

    const { data: operatorAssignedNumbers = [], isLoading: isLoadingOperatorAssignedNumbers, error: operatorAssignedNumbersError } =
        useOperatorAssignedNumbersQuery(role);

    const { data: machineUnits = [], isLoading: isLoadingMachineUnits, error: machineUnitsError } =
        useMachineUnitsQuery(machineUnitsPage, searchQuery, role);

    const { data: machineOverview = [], isLoading: isLoadingMachineOverview, error: machineOverviewError } =
        useMachineOverviewQuery(role);

    const { data: machineTypes = [], isLoading: isLoadingMachineTypes, error: machineTypesError } =
        useMachineTypesQuery(role);

    const { data: machineTypeUnitCounts = [], isLoading: isLoadingMachineTypeUnitCounts, error: machineTypeUnitCountsError } =
        useMachineTypeUnitCountsQuery(role);

    const { data: ticketStatusCounts = {}, isLoading: isLoadingTicketStatusCounts, error: ticketStatusCountsError } =
        useTicketStatusCountsQuery(role);

    const { data: upcomingAndOngoingSchedules = [], isLoading: isLoadingUpcomingAndOngoingSchedules, error: upcomingAndOngoingSchedulesError } =
        useUpcomingAndOngoingSchedulesQuery(role);

    const { data: operatorAccounts = [], isLoading: isLoadingOperatorAccounts, error: operatorAccountsError } =
        useOperatorAccountsQuery(operatorAccountsPage, searchQuery, role);

    
    // Action flags
    const [isCreatingMachineryType, setIsCreatingMachineryType] = useState(false);
    const [isUpdatingMachineryType, setIsUpdatingMachineryType] = useState(false);
    const [isCreatingMachineryUnit, setIsCreatingMachineryUnit] = useState(false);
    const [isUpdatingMachineryUnit, setIsUpdatingMachineryUnit] = useState(false);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    const [isCreatingWeeklySchedule, setIsCreatingWeeklySchedule] = useState(false);
    const [isRemovingFromSchedule, setIsRemovingFromSchedule] = useState(false);
    const [isMovingToSchedule, setIsMovingToSchedule] = useState(false);
    const [isSubmittingTicketRequest, setIsSubmittingTicketRequest] = useState(false);
    const [isArchivingTicketRequest, setIsArchivingTicketRequest] = useState(false);
    //const [isDecliningTicketRequests, setIsDecliningTicketRequests] = useState(false); 
    const [isUpdatingWeeklySchedule, setIsUpdatingWeeklySchedule] = useState(false); 
    //const [isUndecliningTicketRequest, setIsUndecliningTicketRequest] = useState(false); 
    const [isSettingTicketToComplete, setIsSettingTicketToComplete] = useState(false);
    const [isApprovingExtensionRequest, setIsApprovingExtensionRequest] = useState(false);
    const [isDecliningExtensionRequest, setIsDecliningExtensionRequest] = useState(false);
    const [isSettingExtensionTicketToComplete, setIsSettingExtensionTicketToComplete] = useState(false);
    const [isUpdatingMachineryUnitStatus, setIsUpdatingMachineryUnitStatus] = useState(false);
    const [isEnablingDisablingOperatorAccount, setIsEnablingDisablingOperatorAccount] = useState(false);
    const [isAddingOperatorLicense, setIsAddingOperatorLicense] = useState(false);
    const [isUpdatingOperatorLicense, setIsUpdatingOperatorLicense] = useState(false);
    const [isRemovingOperatorLicense, setIsRemovingOperatorLicense] = useState(false);
    const [isSettingEmployeeLeaveStatus, setIsSettingEmployeeLeaveStatus] = useState(false);
    const [isDecliningIncidentReport, setIsDecliningIncidentReport] = useState(false);
    const [isResolvingIncidentReport, setIsResolvingIncidentReport] = useState(false);
    const [isConfirmingIncidentReport, setIsConfirmingIncidentReport] = useState(false);
    const [isPerformingMachineCountCheck, setIsPerformingMachineCountCheck] = useState(false);
    const [isResolvingDiscrepancyInPhysicalCount, setIsResolvingDiscrepancyInPhysicalCount] = useState(false);

    // Actions
    const createMachineryType = async (data) => {
        setIsCreatingMachineryType(true);
        try {
            const res = await axios.post(`${API_URL}/api/machineries/create-machinery-type`, data);
            return res.data;
        } catch (error) {
            throw error;
        } finally {
            setIsCreatingMachineryType(false);
        }
    };

    const updateMachineryType = async (data) => {
        setIsUpdatingMachineryType(true);
        try {
            const res = await axios.put(`${API_URL}/api/machineries/update-machinery-type`, data);
            return res.data;
        } catch (error) {
            throw error;
        } finally {
            setIsUpdatingMachineryType(false);
        }
    };

    const createMachineryUnit = async (data) => {
        setIsCreatingMachineryUnit(true);
        try {
            const res = await axios.post(`${API_URL}/api/machineries/create-machinery-unit`, data);
            return res.data;
        } catch (error) {
            throw error;
        } finally {
            setIsCreatingMachineryUnit(false);
        }
    };

    const updateMachineryUnit = async (data) => {
        setIsUpdatingMachineryUnit(true);
        try {
            // Route is POST in backend for update
            const res = await axios.post(`${API_URL}/api/machineries/update-machinery-unit`, data);
            return res.data;
        } catch (error) {
            throw error;
        } finally {
            setIsUpdatingMachineryUnit(false);
        }
    };

    const generateMachineryReport = async (params = {}) => {
        setIsGeneratingReport(true);
        try {
            const res = await axios.get(`${API_URL}/api/machineries/generate-machinery-report`, {
                params,
                responseType: 'blob',
            });
            return res.data;
        } catch (error) {
            throw error;
        } finally {
            setIsGeneratingReport(false);
        }
    };

    const createWeeklySchedule = async (data) => {
        setIsCreatingWeeklySchedule(true);
        try {
            const res = await axios.post(`${API_URL}/api/machineries/create-weekly-schedule`, data);
            return res.data;
        } catch (error) {
            throw error;
        } finally {
            setIsCreatingWeeklySchedule(false);
        }
    };

    const removeFromSchedule = async (ticketRequestId) => {
        setIsRemovingFromSchedule(true);
        try {
            const res = await axios.post(`${API_URL}/api/machineries/remove-from-schedule/${ticketRequestId}`);
            return res.data;
        } catch (error) {
            throw error;
        } finally {
            setIsRemovingFromSchedule(false);
        }
    };

    const moveToSchedule = async (data) => {
        setIsMovingToSchedule(true);
        try {
            const res = await axios.post(`${API_URL}/api/machineries/move-to-schedule`, data);
            return res.data;
        } catch (error) {
            throw error;
        } finally {
            setIsMovingToSchedule(false);
        }
    };

    const submitTicketRequest = async (data) => {
        setIsSubmittingTicketRequest(true);
        try {
            const res = await axios.post(`${API_URL}/api/machineries/submit-ticket-request`, data);
            return res.data;
        } catch (error) {
            throw error;
        } finally {
            setIsSubmittingTicketRequest(false);
        }
    };

    const archiveTicketRequest = async (data) => {
        setIsArchivingTicketRequest(true);
        try {
            const res = await axios.post(
                `${API_URL}/api/machineries/archive-ticket-request`, data);
            return res.data;
        } catch (error) {
            throw error;
        } finally {
            setIsArchivingTicketRequest(false);
        }
    };

    const updateWeeklySchedule = async (data) => {
        setIsUpdatingWeeklySchedule(true);
        try {
            const res = await axios.post(`${API_URL}/api/machineries/update-weekly-schedule`, data);
            return res.data;
        } catch (error) {
            throw error;
        } finally {
            setIsUpdatingWeeklySchedule(false);
        }
    };

    // Fetch units for dropdown filtered by machineryTypeId (new)
    const getMachineryUnitsForDropDownByType = async (machineryTypeId) => {
        try {
            const res = await axios.get(`${API_URL}/api/machineries/get-machinery-units-for-dropdown`, {
                params: { machineryTypeId }
            });
            return res.data;
        } catch (error) {
            throw error;
        }
    };

    // Fetch operators filtered by requestedMachineTypeId
    const getOperatorsListByMachineType = async (requestedMachineTypeId) => {
        try {
            const res = await axios.get(`${API_URL}/api/machineries/get-operators-list`, {
                params: { requestedMachineTypeId }
            });
            return res.data;
        } catch (error) {
            throw error;
        }
    };

    const setTicketToComplete = async (formData) => {
        setIsSettingTicketToComplete(true);
        try {
            const res = await axios.post(`${API_URL}/api/machineries/ticket-request-complete`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return res.data;
        } catch (error) {
            throw error;
        } finally {
            setIsSettingTicketToComplete(false);
        }
    };
    
    const setExtensionTicketToComplete = async (formData) => {
        setIsSettingExtensionTicketToComplete(true);
        try {
            const res = await axios.post(`${API_URL}/api/machineries/extension-ticket-complete`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return res.data;
        } catch (error) {
            throw error;
        } finally {
            setIsSettingExtensionTicketToComplete(false);
        }
    };

    const approveExtensionRequest = async (data) => {
        setIsApprovingExtensionRequest(true);
        try {
            const res = await axios.post(`${API_URL}/api/machineries/approve-extension-request`, data);
            return res.data;
        } catch (error) {
            throw error;
        } finally {
            setIsApprovingExtensionRequest(false);
        }
    };

    const declineExtensionRequest = async (data) => {
        setIsDecliningExtensionRequest(true);
        try {
            const res = await axios.post(`${API_URL}/api/machineries/decline-extension-request`, data);
            return res.data;
        } catch (error) {
            throw error;
        } finally {
            setIsDecliningExtensionRequest(false);
        }
    };

    const updateMachineryUnitStatus = async (data) => {
        setIsUpdatingMachineryUnitStatus(true);
        try {
            const res = await axios.post(`${API_URL}/api/machineries/update-machinery-unit-status`, data);
            return res.data;
        } catch (error) {
            throw error;
        } finally {
            setIsUpdatingMachineryUnitStatus(false);
        }
    };

    const disableOperatorAccount = async (data) => {
        setIsEnablingDisablingOperatorAccount(true);
        try {
            const res = await axios.post(`${API_URL}/api/machineries/disable-operator`, data);
            return res.data;
        } catch (error) {
            throw error;
        } finally {
            setIsEnablingDisablingOperatorAccount(false);
        }
    };

    const enableOperatorAccount = async (data) => {
        setIsEnablingDisablingOperatorAccount(true);
        try {
            const res = await axios.post(`${API_URL}/api/machineries/enable-operator`, data);
            return res.data;
        } catch (error) {
            throw error;
        } finally {
            setIsEnablingDisablingOperatorAccount(false);
        }
    };

    const addOperatorLicense = async (data) => {
        setIsAddingOperatorLicense(true);
        try {
            const res = await axios.post(`${API_URL}/api/machineries/add-operator-license`, data);
            return res.data;
        } catch (error) {
            throw error;
        } finally {
            setIsAddingOperatorLicense(false);
        }
    };

    const updateOperatorLicense = async (data) => {
        setIsUpdatingOperatorLicense(true);
        try {
            const res = await axios.put(`${API_URL}/api/machineries/update-operator-license`, data);
            return res.data;
        } catch (error) {
            throw error;
        } finally {
            setIsUpdatingOperatorLicense(false);
        }
    };

    const removeOperatorLicense = async (data) => {
        setIsRemovingOperatorLicense(true);
        try {
            const res = await axios.post(`${API_URL}/api/machineries/remove-operator-license`, data);
            return res.data;
        } catch (error) {
            throw error;
        } finally {
            setIsRemovingOperatorLicense(false);
        }
    };

    const setEmployeeLeaveStatus = async (data) => {
        setIsSettingEmployeeLeaveStatus(true);
        try {
            const res = await axios.post(`${API_URL}/api/machineries/set-employee-leave-status`, data);
            return res.data;
        } catch (error) {
            throw error;
        } finally {
            setIsSettingEmployeeLeaveStatus(false);
        }
    };

    const declineIncidentReport = async (data) => {
        setIsDecliningIncidentReport(true);
        try {
            const res = await axios.post(`${API_URL}/api/machineries/decline-incident-report`, data);
            return res.data;
        } catch (error) {
            throw error;
        } finally {
            setIsDecliningIncidentReport(false);
        }
    };

    const resolveIncidentReport = async (data) => {
        setIsResolvingIncidentReport(true);
        try {
            const res = await axios.post(`${API_URL}/api/machineries/resolve-incident-report`, data);
            return res.data;
        } catch (error) {
            throw error;
        } finally {
            setIsResolvingIncidentReport(false);
        }
    };

    const confirmIncidentReport = async (data) => {
        setIsConfirmingIncidentReport(true);
        try {
            const res = await axios.post(`${API_URL}/api/machineries/confirm-incident-report`, data);
            return res.data;
        } catch (error) {
            throw error;
        } finally {
            setIsConfirmingIncidentReport(false);
        }
    };

    const performMachineCountCheck = async (data) => {
        setIsPerformingMachineCountCheck(true);
        try {
            const res = await axios.post(`${API_URL}/api/machineries/perform-machine-count-check`, data);
            return res.data;
        } catch (error) {
            throw error;
        } finally {
            setIsPerformingMachineCountCheck(false);
        }
    };

    const resolveDiscrepancyInPhysicalCount = async (data) => {
        setIsResolvingDiscrepancyInPhysicalCount(true);
        try {
            const res = await axios.post(`${API_URL}/api/machineries/resolve-discrepancy-in-physical-count`, data);
            return res.data;
        } catch (error) {
            throw error;
        } finally {
            setIsResolvingDiscrepancyInPhysicalCount(false);
        }
    };

    
    return {
        // query data
        pendingTicketRequests,
        availableMachineryTypes,
        operatorsList,
        plannedWeeklySchedules, 
        inProgressWeeklySchedules,
        pendingExtensionCount,
        pendingIncidentReportsCount,
        machineIncidentReports,
        machineUnitsForPhysicalCounting,
        physicalCountingRecords,
        occupiedDatesForScheduling,
        operatorAssignedNumbers,
        machineUnits, 
        machineOverview,
        machineTypes,
        machineTypeUnitCounts,
        ticketStatusCounts,
        upcomingAndOngoingSchedules,
        operatorAccounts,

        // actions
        createMachineryType,
        updateMachineryType,
        createMachineryUnit,
        updateMachineryUnit,
        generateMachineryReport,
        createWeeklySchedule,
        removeFromSchedule,
        moveToSchedule,
        submitTicketRequest,
        archiveTicketRequest,
        //declineTicketRequests, 
        //undeclineTicketRequest, 
        getMachineryUnitsForDropDownByType,
        getOperatorsListByMachineType,
        updateWeeklySchedule, 
        setTicketToComplete,
        approveExtensionRequest,
        declineExtensionRequest,
        setExtensionTicketToComplete,
        updateMachineryUnitStatus,
        disableOperatorAccount,
        enableOperatorAccount,
        addOperatorLicense,
        updateOperatorLicense,
        removeOperatorLicense,
        setEmployeeLeaveStatus,
        declineIncidentReport,
        resolveIncidentReport,
        confirmIncidentReport,
        performMachineCountCheck,
        resolveDiscrepancyInPhysicalCount,

        // loading states (queries)
        isLoadingPendingTicketRequests,
        isLoadingAvailableMachineryTypes,
        isLoadingOperatorsList,
        isLoadingPlannedWeeklySchedules, 
        isLoadingInProgressWeeklySchedules,
        isLoadingPendingExtensionCount,
        isLoadingPendingIncidentReportsCount,
        isLoadingMachineIncidentReports,
        isLoadingMachineUnitsForPhysicalCounting,
        isLoadingPhysicalCountingRecords,
        isLoadingOccupiedDatesForScheduling,
        isLoadingOperatorAssignedNumbers,
        isLoadingMachineUnits,
        isLoadingMachineOverview,
        isLoadingMachineTypes,
        isLoadingMachineTypeUnitCounts,
        isLoadingTicketStatusCounts,
        isLoadingUpcomingAndOngoingSchedules,
        isLoadingOperatorAccounts,

        // action flags
        isCreatingMachineryType,
        isUpdatingMachineryType,
        isCreatingMachineryUnit,
        isUpdatingMachineryUnit,
        isGeneratingReport,
        isCreatingWeeklySchedule,
        isRemovingFromSchedule,
        isMovingToSchedule,
        isSubmittingTicketRequest,
        isArchivingTicketRequest,
        //isDecliningTicketRequests, 
        isUpdatingWeeklySchedule,  
        //isUndecliningTicketRequest, 
        isSettingTicketToComplete,
        isApprovingExtensionRequest,
        isDecliningExtensionRequest,
        isSettingExtensionTicketToComplete,
        isUpdatingMachineryUnitStatus,
        isEnablingDisablingOperatorAccount,
        isAddingOperatorLicense,
        isUpdatingOperatorLicense,
        isRemovingOperatorLicense,
        isSettingEmployeeLeaveStatus,
        isDecliningIncidentReport,
        isResolvingIncidentReport,
        isConfirmingIncidentReport,
        isPerformingMachineCountCheck,
        isResolvingDiscrepancyInPhysicalCount,

        // error states
        pendingTicketRequestsError,
        availableMachineryTypesError,
        operatorsListError,
        plannedWeeklySchedulesError, 
        inProgressWeeklySchedulesError,
        pendingExtensionCountError,
        pendingIncidentReportsCountError,
        machineIncidentReportsError,
        machineUnitsForPhysicalCountingError,
        physicalCountingRecordsError,
        occupiedDatesForSchedulingError,
        operatorAssignedNumbersError,
        machineUnitsError,
        machineOverviewError,
        machineTypesError,
        machineTypeUnitCountsError,
        ticketStatusCountsError,
        upcomingAndOngoingSchedulesError,
        isLoadingOperatorAccounts,
    };
};
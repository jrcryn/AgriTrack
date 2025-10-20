import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useAuthStore } from '../../auth/store/authStore.js';

const API_URL = import.meta.env.VITE_API_URL;

// Queries
const useMachineryTypesQuery = (role) =>
    useQuery({
        queryKey: ['machineryTypes'],
        queryFn: async () => {
            const res = await axios.get(`${API_URL}/api/machineries/get-machinery-types`);
            return res.data?.data ?? res.data;
        },
        enabled: role === 'MIM' || role === 'MIS',
    });

const useMachineryUnitsQuery = (role) =>
    useQuery({
        queryKey: ['machineryUnits'],
        queryFn: async () => {
            // updated to match new backend route (POST /get-machinery-unit)
            const res = await axios.post(`${API_URL}/api/machineries/get-machinery-unit`, {});
            return res.data;
        },
        enabled: role === 'MIM' || role === 'MIS',
    });

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

const useOngoingTicketRequestsQuery = (page = 1, searchQuery = {}, role) =>
    useQuery({
        queryKey: ['ongoingTicketRequests', page, searchQuery],
        queryFn: async () => {
            const res = await axios.get(`${API_URL}/api/machineries/get-ongoing-ticket-requests`, {
                params: { page, limit: 10, ...searchQuery },
            });
            return res.data;
        },
        enabled: role === 'MIM' || role === 'MIS',
    });

const useScheduledTicketRequestsQuery = (page = 1, searchQuery = {}, role) =>
    useQuery({
        queryKey: ['scheduledTicketRequests', page, searchQuery],
        queryFn: async () => {
            const res = await axios.get(`${API_URL}/api/machineries/get-scheduled-ticket-requests`, {
                params: { page, limit: 10, ...searchQuery },
            });
            return res.data;
        },
        enabled: role === 'MIM' || role === 'MIS',
    });

const useDeclinedTicketRequestsQuery = (page = 1, searchQuery = {}, role) =>
    useQuery({
        queryKey: ['declinedTicketRequests', page, searchQuery],
        queryFn: async () => {
            const res = await axios.get(`${API_URL}/api/machineries/get-declined-ticket-requests`, {
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

const useOperatorsListQuery = () =>
    useQuery({
        queryKey: ['operatorsList'],
        queryFn: async () => {
            const res = await axios.get(`${API_URL}/api/machineries/get-operators-list`);
            return res.data;
        },
        enabled: true, // Enable for all roles since we need this data in the TicketRequestPanel
    });

const useMachineryUnitsForDropDownQuery = (role) =>
    useQuery({
        queryKey: ['machineryUnitsForDropDown'],
        queryFn: async () => {
            const res = await axios.get(`${API_URL}/api/machineries/get-machinery-units-for-dropdown`);
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
        ongoingPage = 1,
        scheduledPage = 1,
        declinedPage = 1,
    } = pages;

    // Queries
    const { data: machineryTypes = [], isLoading: isLoadingMachineryTypes, error: machineryTypesError } =
        useMachineryTypesQuery(role);

    const { data: machineryUnits = [], isLoading: isLoadingMachineryUnits, error: machineryUnitsError } =
        useMachineryUnitsQuery(role);

    const { data: pendingTicketRequests = [], isLoading: isLoadingPendingTicketRequests, error: pendingTicketRequestsError } =
        usePendingTicketRequestsQuery(pendingPage, searchQuery, role);

    const { data: ongoingTicketRequests = [], isLoading: isLoadingOngoingTicketRequests, error: ongoingTicketRequestsError } =
        useOngoingTicketRequestsQuery(ongoingPage, searchQuery, role);

    const { data: scheduledTicketRequests = [], isLoading: isLoadingScheduledTicketRequests, error: scheduledTicketRequestsError } =
        useScheduledTicketRequestsQuery(scheduledPage, searchQuery, role);

    const { data: declinedTicketRequests = [], isLoading: isLoadingDeclinedTicketRequests, error: declinedTicketRequestsError } =
        useDeclinedTicketRequestsQuery(declinedPage, searchQuery, role);

    const { data: availableMachineryTypes = [], isLoading: isLoadingAvailableMachineryTypes, error: availableMachineryTypesError } =
        useAvailableMachineryTypesQuery();

    const { data: operatorsList = [], isLoading: isLoadingOperatorsList, error: operatorsListError } =
        useOperatorsListQuery(role);

    const { data: machineryUnitsForDropDown = [], isLoading: isLoadingMachineryUnitsForDropDown, error: machineryUnitsForDropDownError } = 
        useMachineryUnitsForDropDownQuery(role);

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

    // Actions
    const createMachineryType = async (data) => {
        setIsCreatingMachineryType(true);
        try {
            const res = await axios.post(`${API_URL}/api/machineries/create-machinery-type`, data);
            return res.data;
        } finally {
            setIsCreatingMachineryType(false);
        }
    };

    const updateMachineryType = async (data) => {
        setIsUpdatingMachineryType(true);
        try {
            const res = await axios.put(`${API_URL}/api/machineries/update-machinery-type`, data);
            return res.data;
        } finally {
            setIsUpdatingMachineryType(false);
        }
    };

    const createMachineryUnit = async (data) => {
        setIsCreatingMachineryUnit(true);
        try {
            const res = await axios.post(`${API_URL}/api/machineries/create-machinery-unit`, data);
            return res.data;
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
        } finally {
            setIsGeneratingReport(false);
        }
    };

    const createWeeklySchedule = async (data) => {
        setIsCreatingWeeklySchedule(true);
        try {
            const res = await axios.post(`${API_URL}/api/machineries/create-weekly-schedule`, data);
            return res.data;
        } finally {
            setIsCreatingWeeklySchedule(false);
        }
    };

    const removeFromSchedule = async (ticketRequestId) => {
        setIsRemovingFromSchedule(true);
        try {
            const res = await axios.post(`${API_URL}/api/machineries/remove-from-schedule/${ticketRequestId}`);
            return res.data;
        } finally {
            setIsRemovingFromSchedule(false);
        }
    };

    const moveToSchedule = async (data) => {
        setIsMovingToSchedule(true);
        try {
            const res = await axios.post(`${API_URL}/api/machineries/move-to-schedule`, data);
            return res.data;
        } finally {
            setIsMovingToSchedule(false);
        }
    };

    const submitTicketRequest = async (data) => {
        setIsSubmittingTicketRequest(true);
        try {
            const res = await axios.post(`${API_URL}/api/machineries/submit-ticket-request`, data);
            return res.data;
        } finally {
            setIsSubmittingTicketRequest(false);
        }
    };

    return {
        // query data
        machineryTypes,
        machineryUnits,
        pendingTicketRequests,
        ongoingTicketRequests,
        scheduledTicketRequests,
        declinedTicketRequests,
        availableMachineryTypes,
        operatorsList,
        machineryUnitsForDropDown,

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

        // loading states (queries)
        isLoadingMachineryTypes,
        isLoadingMachineryUnits,
        isLoadingPendingTicketRequests,
        isLoadingOngoingTicketRequests,
        isLoadingScheduledTicketRequests,
        isLoadingDeclinedTicketRequests,
        isLoadingAvailableMachineryTypes,
        isLoadingOperatorsList,
        isLoadingMachineryUnitsForDropDown,

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

        // error states
        machineryTypesError,
        machineryUnitsError,
        pendingTicketRequestsError,
        ongoingTicketRequestsError,
        scheduledTicketRequestsError,
        declinedTicketRequestsError,
        availableMachineryTypesError,
        operatorsListError,
        machineryUnitsForDropDownError,
    };
};
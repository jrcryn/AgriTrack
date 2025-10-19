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
            const res = await axios.get(`${API_URL}/api/machineries/machinery-units`);
            return res.data;
        },
        enabled: role === 'MIM' || role === 'MIS',
    });

const usePendingTicketRequestsQuery = (page = 1, searchParams = {}, role) =>
    useQuery({
        queryKey: ['pendingTicketRequests', page, searchParams],
        queryFn: async () => {
            const res = await axios.get(`${API_URL}/api/machineries/get-pending-ticket-requests`, {
                params: { page, limit: 10, ...searchParams },
            });
            return res.data;
        },
        enabled: role === 'MIM' || role === 'MIS',
    });

const useOngoingTicketRequestsQuery = (page = 1, searchParams = {}, role) =>
    useQuery({
        queryKey: ['ongoingTicketRequests', page, searchParams],
        queryFn: async () => {
            const res = await axios.get(`${API_URL}/api/machineries/get-ongoing-ticket-requests`, {
                params: { page, limit: 10, ...searchParams },
            });
            return res.data;
        },
        enabled: role === 'MIM' || role === 'MIS',
    });

const useScheduledTicketRequestsQuery = (page = 1, searchParams = {}, role) =>
    useQuery({
        queryKey: ['scheduledTicketRequests', page, searchParams],
        queryFn: async () => {
            const res = await axios.get(`${API_URL}/api/machineries/get-scheduled-ticket-requests`, {
                params: { page, limit: 10, ...searchParams },
            });
            return res.data;
        },
        enabled: role === 'MIM' || role === 'MIS',
    });

const useDeclinedTicketRequestsQuery = (page = 1, searchParams = {}, role) =>
    useQuery({
        queryKey: ['declinedTicketRequests', page, searchParams],
        queryFn: async () => {
            const res = await axios.get(`${API_URL}/api/machineries/get-declined-ticket-requests`, {
                params: { page, limit: 10, ...searchParams },
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

// Exported store
export const useAdminDashboard = (pages = {}, searchParams = {}) => {
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
        usePendingTicketRequestsQuery(pendingPage, searchParams, role);

    const { data: ongoingTicketRequests = [], isLoading: isLoadingOngoingTicketRequests, error: ongoingTicketRequestsError } =
        useOngoingTicketRequestsQuery(ongoingPage, searchParams, role);

    const { data: scheduledTicketRequests = [], isLoading: isLoadingScheduledTicketRequests, error: scheduledTicketRequestsError } =
        useScheduledTicketRequestsQuery(scheduledPage, searchParams, role);

    const { data: declinedTicketRequests = [], isLoading: isLoadingDeclinedTicketRequests, error: declinedTicketRequestsError } =
        useDeclinedTicketRequestsQuery(declinedPage, searchParams, role);

    const { data: availableMachineryTypes = [], isLoading: isLoadingAvailableMachineryTypes, error: availableMachineryTypesError } =
        useAvailableMachineryTypesQuery();

    // Action flags
    const [isCreatingMachineryType, setIsCreatingMachineryType] = useState(false);
    const [isUpdatingMachineryType, setIsUpdatingMachineryType] = useState(false);
    const [isCreatingMachineryUnit, setIsCreatingMachineryUnit] = useState(false);
    const [isUpdatingMachineryUnit, setIsUpdatingMachineryUnit] = useState(false);
    const [isAddingMachineryUnits, setIsAddingMachineryUnits] = useState(false);
    const [isDeletingMachinery, setIsDeletingMachinery] = useState(false);
    const [isDeletingMachineryUnits, setIsDeletingMachineryUnits] = useState(false);
    const [isTransferringMachineryUnit, setIsTransferringMachineryUnit] = useState(false);
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

    const addMachineryUnits = async (data) => {
        setIsAddingMachineryUnits(true);
        try {
            const res = await axios.post(`${API_URL}/api/machineries/add-machinery-units`, data);
            return res.data;
        } finally {
            setIsAddingMachineryUnits(false);
        }
    };

    const deleteMachinery = async (data) => {
        setIsDeletingMachinery(true);
        try {
            const res = await axios.delete(`${API_URL}/api/machineries/delete-machinery`, { data });
            return res.data;
        } finally {
            setIsDeletingMachinery(false);
        }
    };

    const deleteMachineryUnits = async (data) => {
        setIsDeletingMachineryUnits(true);
        try {
            const res = await axios.post(`${API_URL}/api/machineries/delete-machinery-units`, data);
            return res.data;
        } finally {
            setIsDeletingMachineryUnits(false);
        }
    };

    const transferMachineryUnit = async (data) => {
        setIsTransferringMachineryUnit(true);
        try {
            const res = await axios.post(`${API_URL}/api/machineries/transfer-machinery-unit`, data);
            return res.data;
        } finally {
            setIsTransferringMachineryUnit(false);
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

        // actions
        createMachineryType,
        updateMachineryType,
        createMachineryUnit,
        updateMachineryUnit,
        addMachineryUnits,
        deleteMachinery,
        deleteMachineryUnits,
        transferMachineryUnit,
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

        // action flags
        isCreatingMachineryType,
        isUpdatingMachineryType,
        isCreatingMachineryUnit,
        isUpdatingMachineryUnit,
        isAddingMachineryUnits,
        isDeletingMachinery,
        isDeletingMachineryUnits,
        isTransferringMachineryUnit,
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
    };
};
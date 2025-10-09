import axios from 'axios';
import { create } from 'zustand';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../../auth/store/authStore.js'

const API_URL = import.meta.env.VITE_API_URL;

export const useMachineryUnitsQuery = (role) => 
    useQuery({
        queryKey: ['machineryUnits'],
        queryFn: async () => {

            //await new Promise(resolve => setTimeout(resolve, 5000));

            const response = await axios.get(`${API_URL}/api/machineries/machinery-units`);
            return response.data;
        },
        staleTime: 0, //data is alwasys fresh
        refetchInterval: 1000, // (1 second)
        enabled: role === 'MIM' || role === 'MIS' 
    });

export const useAdminDashboard = () => {
    const { user } = useAuthStore();
    const role = user?.role.toString().toUpperCase();

    const { data: machineryUnits = [], isLoading: isLoadingMachineries, error: loadingMachineriesError } = useMachineryUnitsQuery(role);

    const [isCreatingMachineryUnit, setIsCreatingMachineryUnit] = useState(false);
    const [isUpdatingMachineryUnit, setIsUpdatingMachineryUnit] = useState(false);
    const [isAddingMachineryUnits, setIsAddingMachineryUnits] = useState(false);
    const [isDeletingMachinery, setIsDeletingMachinery] = useState(false);
    const [isDeletingMachineryUnits, setIsDeletingMachineryUnits] = useState(false);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);

    const [creationError, setCreationError] = useState(null);
    const [updateError, setUpdateError] = useState(null);
    const [addingError, setAddingError] = useState(null);
    const [deletionError, setDeletionError] = useState(null);

    const createMachineriesUnit = async (machineData) => {
        setIsCreatingMachineryUnit(true);
        try {
            const response = await axios.post(`${API_URL}/api/machineries/add-machinery-unit`, machineData);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'An error occurred while creating the machinery unit.';
            setCreationError(errorMessage);
            throw new Error(errorMessage); // Rethrow the error to be handled by the calling component
        } finally {
            setIsCreatingMachineryUnit(false);
        }
    };

    const addMachineryUnits = async (machineData) => {
        setIsAddingMachineryUnits(true);
        try {
            const response = await axios.post(`${API_URL}/api/machineries/add-machinery-units`, machineData);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'An error occurred while creating the machinery unit.';
            setAddingError(errorMessage);
            throw new Error(errorMessage); // Rethrow the error to be handled by the calling component
        } finally {
            setIsAddingMachineryUnits(false);
        }
    };

    const updateMachineriesUnit = async (machineData) => {
        setIsUpdatingMachineryUnit(true);
        try {
            const response = await axios.post(`${API_URL}/api/machineries/transfer-machinery-unit`, machineData);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'An error occurred while updating the machinery unit.';
            setUpdateError(errorMessage);
            throw new Error(errorMessage); // Rethrow the error to be handled by the calling component
        } finally {
            setIsUpdatingMachineryUnit(false);
        }
    };

    const deleteMachinery = async (machineData) => {
        setIsDeletingMachinery(true);
        try {
            const response = await axios.delete(`${API_URL}/api/machineries/delete-machinery`, { data: machineData });
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'An error occurred while deleting the machinery unit.';
            setDeletionError(errorMessage);
            throw new Error(errorMessage); // Rethrow the error to be handled by the calling component
        } finally {
            setIsDeletingMachinery(false);
        }
    }

    const deleteMachineryUnits = async (machineData) => {
        setIsDeletingMachineryUnits(true);
        try {
            const response = await axios.post(`${API_URL}/api/machineries/delete-machinery-units`, machineData);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'An error occurred while deleting the machinery unit.';
            setDeletionError(errorMessage);
            throw new Error(errorMessage); // Rethrow the error to be handled by the calling component
        } finally {
            setIsDeletingMachineryUnits(false);
        }
    }

    const updateMachineryNameAndRemarks = async (machineData) => {
        setIsUpdatingMachineryUnit(true);
        try {
            const response = await axios.post(`${API_URL}/api/machineries/update-machinery-unit`, machineData);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'An error occurred while updating the machinery unit.';
            setUpdateError(errorMessage);
            throw new Error(errorMessage); // Rethrow the error to be handled by the calling component
        } finally {
            setIsUpdatingMachineryUnit(false);
        }
    }; 
    
    const generateExcelReport = async () => {
        setIsGeneratingReport(true);
        try {
            const response = await axios.get(`${API_URL}/api/machineries/generate-machinery-report`, { responseType: 'blob' })
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'An error occurred while generating the report.';
            setReportError(errorMessage);
            throw new Error(errorMessage); // Rethrow the error to be handled by the calling component
        } finally {
            setIsGeneratingReport(false);
        }
    }

    return {
        //data to be fecthed
        machineryUnits,

        //loading states
        isLoading: isLoadingMachineries,
        isCreatingMachineryUnit,
        isUpdatingMachineryUnit,
        isAddingMachineryUnits,
        isDeletingMachinery,
        isDeletingMachineryUnits,
        isGeneratingReport,

        error: loadingMachineriesError || creationError || updateError || addingError || deletionError,
 
        //actions
        createMachineriesUnit,
        updateMachineriesUnit,
        addMachineryUnits,
        deleteMachinery,
        deleteMachineryUnits,
        updateMachineryNameAndRemarks,
        generateExcelReport
    };
};
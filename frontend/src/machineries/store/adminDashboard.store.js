import axios from 'axios';
import { create } from 'zustand';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

export const useMachineryUnitsQuery = () => 
    useQuery({
        queryKey: ['machineryUnits'],
        queryFn: async () => {

            //await new Promise(resolve => setTimeout(resolve, 5000));

            const response = await axios.get(`${API_URL}/machinery-units`);
            return response.data;
        },
        staleTime: 0, //data is alwasys fresh
        refetchInterval: 1000 // (1 second)
    });

export const useAdminDashboard = () => {

    const { data: machineryUnits = [], isLoading: isLoadingMachineries, error: loadingMachineriesError } = useMachineryUnitsQuery();

    const [isCreatingMachineryUnit, setIsCreatingMachineryUnit] = useState(false);
    const [isUpdatingMachineryUnit, setIsUpdatingMachineryUnit] = useState(false);
    const [creationError, setCreationError] = useState(null);
    const [updateError, setUpdateError] = useState(null);

    const createMachineriesUnit = async (machineData) => {
        setIsCreatingMachineryUnit(true);
        try {
            const response = await axios.post(`${API_URL}/add-machinery-unit`, machineData);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'An error occurred while creating the machinery unit.';
            setCreationError(errorMessage);
            throw new Error(errorMessage); // Rethrow the error to be handled by the calling component
        } finally {
            setIsCreatingMachineryUnit(false);
        }
    };

    const updateMachineriesUnit = async (machineData) => {
        setIsUpdatingMachineryUnit(true);
        try {
            const response = await axios.post(`${API_URL}/transfer-machinery-unit`, machineData);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'An error occurred while updating the machinery unit.';
            setUpdateError(errorMessage);
            throw new Error(errorMessage); // Rethrow the error to be handled by the calling component
        } finally {
            setIsUpdatingMachineryUnit(false);
        }
    };

    return {
        //data to be fecthed
        machineryUnits,

        //loading states
        isLoading: isLoadingMachineries,
        isCreatingMachineryUnit,
        isUpdatingMachineryUnit,

        error: loadingMachineriesError || creationError || updateError,

        //actions
        createMachineriesUnit,
        updateMachineriesUnit,
    };
};
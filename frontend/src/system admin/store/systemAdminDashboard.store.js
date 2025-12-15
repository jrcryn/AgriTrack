import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

axios.defaults.withCredentials = true;

export const useSystemAdminStore = create((set, get) => ({
    // Action Logs
    actionLogs: [],
    actionLogsLoading: false,
    actionLogsError: null,
    actionLogsPagination: {
        currentPage: 1,
        totalPages: 1,
        totalLogs: 0,
        limit: 20
    },

    fetchActionLogs: async (params = {}) => {
        set({ actionLogsLoading: true, actionLogsError: null });
        try {
            const {
                page = 1,
                limit = 20,
                search = '',
                action = '',
                module = '',
                status = '',
                userId = ''
            } = params;

            const queryParams = new URLSearchParams();
            if (page) queryParams.append('page', page);
            if (limit) queryParams.append('limit', limit);
            if (search) queryParams.append('search', search);
            if (action) queryParams.append('action', action);
            if (module) queryParams.append('module', module);
            if (status) queryParams.append('status', status);
            if (userId) queryParams.append('userId', userId);

            const response = await axios.get(
                `${API_URL}/api/system-admin/action-logs?${queryParams.toString()}`
            );

            set({
                actionLogs: response.data.logs || [],
                actionLogsPagination: response.data.pagination || {},
                actionLogsLoading: false
            });

            return response.data;
        } catch (error) {
            set({
                actionLogsError: error.response?.data?.message || 'Failed to fetch action logs',
                actionLogsLoading: false
            });
            throw error;
        }
    },

    // Employee Accounts
    employeeAccounts: [],
    employeeAccountsLoading: false,
    employeeAccountsError: null,
    employeeAccountsPagination: {
        currentPage: 1,
        totalPages: 1,
        totalEmployees: 0,
        limit: 50
    },

    fetchEmployeeAccounts: async (params = {}) => {
        set({ employeeAccountsLoading: true, employeeAccountsError: null });
        try {
            const {
                page = 1,
                limit = 50,
                search = '',
                role = '',
                status = ''
            } = params;

            const queryParams = new URLSearchParams();
            if (page) queryParams.append('page', page);
            if (limit) queryParams.append('limit', limit);
            if (search) queryParams.append('search', search);
            if (role) queryParams.append('role', role);
            if (status) queryParams.append('status', status);

            const response = await axios.get(
                `${API_URL}/api/system-admin/employee-accounts?${queryParams.toString()}`
            );

            set({
                employeeAccounts: response.data.employees || [],
                employeeAccountsPagination: response.data.pagination || {},
                employeeAccountsLoading: false
            });

            return response.data;
        } catch (error) {
            set({
                employeeAccountsError: error.response?.data?.message || 'Failed to fetch employee accounts',
                employeeAccountsLoading: false
            });
            throw error;
        }
    },

    // System Admin Accounts
    systemAdminAccounts: [],
    systemAdminAccountsLoading: false,
    systemAdminAccountsError: null,
    systemAdminAccountsPagination: {
        currentPage: 1,
        totalPages: 1,
        totalAdmins: 0,
        limit: 50
    },

    fetchSystemAdminAccounts: async (params = {}) => {
        set({ systemAdminAccountsLoading: true, systemAdminAccountsError: null });
        try {
            const {
                page = 1,
                limit = 50,
                search = '',
                status = ''
            } = params;

            const queryParams = new URLSearchParams();
            if (page) queryParams.append('page', page);
            if (limit) queryParams.append('limit', limit);
            if (search) queryParams.append('search', search);
            if (status) queryParams.append('status', status);

            const response = await axios.get(
                `${API_URL}/api/system-admin/system-admin-accounts?${queryParams.toString()}`
            );

            set({
                systemAdminAccounts: response.data.admins || [],
                systemAdminAccountsPagination: response.data.pagination || {},
                systemAdminAccountsLoading: false
            });

            return response.data;
        } catch (error) {
            set({
                systemAdminAccountsError: error.response?.data?.message || 'Failed to fetch system admin accounts',
                systemAdminAccountsLoading: false
            });
            throw error;
        }
    },

    // All Users (for dropdowns)
    allUsers: [],
    allUsersLoading: false,
    allUsersError: null,

    fetchAllUsers: async () => {
        set({ allUsersLoading: true, allUsersError: null });
        try {
            const [employeesRes, adminsRes] = await Promise.all([
                axios.get(`${API_URL}/api/system-admin/employee-accounts?limit=1000&page=1`),
                axios.get(`${API_URL}/api/system-admin/system-admin-accounts?limit=1000&page=1`)
            ]);

            const employees = (employeesRes.data.employees || []).map(emp => ({
                _id: emp._id,
                first_name: emp.first_name,
                last_name: emp.last_name,
                middle_name: emp.middle_name,
                suffix: emp.suffix,
                email: emp.email,
                accountType: 'EMPLOYEE'
            }));

            const admins = (adminsRes.data.admins || []).map(admin => ({
                _id: admin._id,
                first_name: admin.first_name,
                last_name: admin.last_name,
                middle_name: admin.middle_name,
                suffix: admin.suffix,
                email: admin.email,
                accountType: 'SYSTEM_ADMIN'
            }));

            const allUsers = [...employees, ...admins].map(user => ({
                ...user,
                displayName: `${user.first_name} ${user.middle_name || ''} ${user.last_name} ${user.suffix || ''}`.trim(),
                fullName: `${user.first_name} ${user.last_name}`
            }));

            set({
                allUsers,
                allUsersLoading: false
            });

            return allUsers;
        } catch (error) {
            set({
                allUsersError: error.response?.data?.message || 'Failed to fetch users',
                allUsersLoading: false
            });
            throw error;
        }
    },

    // Dashboard Stats
    dashboardStats: {
        totalEmployees: 0,
        totalAdmins: 0,
        recentActions: 0,
        lockedAccounts: 0,
        archivedAccounts: 0,
        activeAccounts: 0
    },
    dashboardStatsLoading: false,
    dashboardStatsError: null,

    fetchDashboardStats: async () => {
        set({ dashboardStatsLoading: true, dashboardStatsError: null });
        try {
            const response = await axios.get(`${API_URL}/api/system-admin/dashboard-stats`);

            set({
                dashboardStats: {
                    totalEmployees: response.data.stats.totalEmployees || 0,
                    totalAdmins: response.data.stats.totalAdmins || 0,
                    recentActions: response.data.stats.recentActions || 0,
                    lockedAccounts: response.data.stats.lockedAccounts || 0,
                    archivedAccounts: response.data.stats.archivedAccounts || 0,
                    activeAccounts: response.data.stats.activeAccounts || 0
                },
                dashboardStatsLoading: false
            });

            return get().dashboardStats;
        } catch (error) {
            set({
                dashboardStatsError: error.response?.data?.message || 'Failed to fetch dashboard stats',
                dashboardStatsLoading: false
            });
            throw error;
        }
    },

    // Register Employee
    registerEmployee: async (employeeData) => {
        set({ employeeAccountsLoading: true, employeeAccountsError: null });
        try {
            const response = await axios.post(
                `${API_URL}/api/system-admin/register-employee`,
                {
                    first_name: employeeData.firstName,
                    last_name: employeeData.lastName,
                    middle_name: employeeData.middleName || '',
                    suffix: employeeData.suffix || '',
                    email: employeeData.email,
                    phone: employeeData.phone,
                    roles: employeeData.roles,
                    office_position: employeeData.officePosition || null
                }
            );

            set({ employeeAccountsLoading: false });
            return response.data;
        } catch (error) {
            set({
                employeeAccountsError: error.response?.data?.message || 'Failed to register employee',
                employeeAccountsLoading: false
            });
            throw error;
        }
    },

    // Register System Admin
    registerSystemAdmin: async (adminData) => {
        set({ allUsersLoading: true, allUsersError: null });
        try {
            const response = await axios.post(
                `${API_URL}/api/system-admin/register-system-admin`,
                {
                    first_name: adminData.firstName,
                    last_name: adminData.lastName,
                    middle_name: adminData.middleName || '',
                    suffix: adminData.suffix || '',
                    email: adminData.email,
                    phone: adminData.phone
                }
            );

            set({ allUsersLoading: false });
            return response.data;
        } catch (error) {
            set({
                allUsersError: error.response?.data?.message || 'Failed to register system admin',
                allUsersLoading: false
            });
            throw error;
        }
    },

    // User Management Actions
    lockUserAccount: async (targetUserId, accountType) => {
        try {
            const response = await axios.put(
                `${API_URL}/api/system-admin/lock-account`,
                { targetUserId, accountType }
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    unlockUserAccount: async (targetUserId, accountType) => {
        try {
            const response = await axios.put(
                `${API_URL}/api/system-admin/unlock-account`,
                { targetUserId, accountType }
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    archiveUserAccount: async (targetUserId, accountType) => {
        try {
            const response = await axios.put(
                `${API_URL}/api/system-admin/archive-account`,
                { targetUserId, accountType }
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    unarchiveUserAccount: async (targetUserId, accountType) => {
        try {
            const response = await axios.put(
                `${API_URL}/api/system-admin/unarchive-account`,
                { targetUserId, accountType }
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    updateUserAccount: async (userData) => {
        try {
            const response = await axios.put(
                `${API_URL}/api/system-admin/update-account`,
                userData
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    generateNewPassword: async (targetUserId, accountType) => {
        try {
            const response = await axios.put(
                `${API_URL}/api/system-admin/generate-new-password`,
                { targetUserId, accountType }
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    resetUser2FA: async (targetUserId, accountType) => {
        try {
            const response = await axios.put(
                `${API_URL}/api/system-admin/reset-2fa`,
                { targetUserId, accountType }
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    resetUserPasswordAndTwoFA: async (targetUserId, accountType) => {
        try {
            const response = await axios.put(
                `${API_URL}/api/system-admin/reset-password-and-2fa`,
                { targetUserId, accountType }
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Clear errors
    clearErrors: () => set({
        actionLogsError: null,
        employeeAccountsError: null,
        allUsersError: null,
        dashboardStatsError: null
    })
}));

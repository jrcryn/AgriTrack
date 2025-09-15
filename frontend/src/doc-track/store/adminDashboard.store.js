import axios from 'axios'
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../../auth/store/authStore';

const API_URL = import.meta.env.VITE_API_URL;

export const useDocumentTypesQuery = () => 
    useQuery({
        queryKey: ['documentTypes'],
        queryFn: async () => {
            //await new Promise(resolve => setTimeout(resolve, 5000));
            const response = await axios.get(`${API_URL}/api/doc-track/get-document-types`)
            return response.data.data;
        },
    });

export const useStaffAndAdminAccountsQuery = (id) => 
    useQuery({
        queryKey: ['adminStaffAccounts', id],
        queryFn: async () => {
            const response = await axios.get(`${API_URL}/api/doc-track/get-admin-staff-accounts/${id}`)
            return response.data.data;
        },
        enabled: !!id,
    });

export const useIncomingForwardedDocumentsQuery = (id, page = 1, searchParams = {}) =>
    useQuery({
        queryKey: ['forwardedDocuments', id, page, searchParams],
        queryFn: async () => {
            const response = await axios.get(
                `${API_URL}/api/doc-track/get-incoming-forwarded-documents/${id}`,
                { params: { page, limit: 10, ...searchParams } }
            );
            return response.data;
        },
        enabled: !!id,
    });

export const usePendingDocumentsQuery = (id, page = 1, searchParams = {}) =>
    useQuery({
        queryKey: ['pendingDocuments', id, page, searchParams],
        queryFn: async () => {
            const response = await axios.get(
                `${API_URL}/api/doc-track/get-pending-documents/${id}`,
                { params: { page, limit: 10, ...searchParams } }
            );
            return response.data;
        },
        enabled: !!id,
    });

export const useOutgoingDocumentsQuery = (id, page = 1, searchParams = {}) =>
    useQuery({
        queryKey: ['outgoingDocuments', id, page, searchParams],
        queryFn: async () => {
            const response = await axios.get(
                `${API_URL}/api/doc-track/get-outgoing-forwarded-documents/${id}`,
                { params: { page, limit: 10, ...searchParams } }
            );
            return response.data;
        },
        enabled: !!id,
    });

export const useDocumentHistoryQuery = (id, page = 1) =>
    useQuery({
        queryKey: ['documentHistory', id, page],
        queryFn: async () => {
            const response = await axios.get(
                `${API_URL}/api/doc-track/get-document-history/${id}`,
                { params: { page, limit: 10 } }
            );
            return response.data;
        },
        enabled: !!id,
    });

export const useAdminDashboard = (pages = {}, searchParams = {}) => {
    const { user } = useAuthStore()
    const id = user?.id

    const {
        incomingPage = 1,
        pendingPage = 1,
        historyPage = 1,
        outgoingPage = 1,
    } = pages;

    const { data: documentTypes = [], isLoading: isLoadingDocumentTypes, error: documentTypesError } = useDocumentTypesQuery();
    const { data: adminAndStaffAccounts = [], isLoading: isLoadingAdminAndStaffAccounts, error: adminAndStaffAccountsError } = useStaffAndAdminAccountsQuery(id);

    const { data: forwardedDocuments = [], isLoading: isLoadingForwardedDocuments, error: forwardedDocumentsError, refetch: forwardedRefetch } =
        useIncomingForwardedDocumentsQuery(id, incomingPage, searchParams);

    const { data: pendingDocuments = [], isLoading: isLoadingPendingDocuments, error: pendingDocumentsError, refetch: pendingRefetch } =
        usePendingDocumentsQuery(id, pendingPage, searchParams);

    const { data: outgoingDocuments = [], isLoading: isLoadingOutgoingDocuments, error: outgoingDocumentsError, refetch: outgoingRefetch } =
        useOutgoingDocumentsQuery(id, outgoingPage, searchParams);

    const { data: documentHistory = [], isLoading: isLoadingDocumentHistory, error: documentHistoryError, refetch: historyRefetch } =
        useDocumentHistoryQuery(id, historyPage);

    const [isCreatingDocument, setIsCreatingDocument] = useState(false);
    const [isUpdatingDocumentType, setIsUpdatingDocumentType] = useState(false);
    const [isRegisteringDocument, setIsRegisteringDocument] = useState(false);
    const [isForwardingDocument, setIsForwardingDocument] = useState(false);
    const [isRegisteringAndForwardingDocument, setIsRegisteringAndForwardingDocument] = useState(false);
    const [isReceivingDocument, setIsReceivingDocument] = useState(false);
    const [isArchivingDocument, setIsArchivingDocument] = useState(false);
    const [isReleasingDocument, setIsReleasingDocument] = useState(false);
    const [isDownloadingQRCode, setIsDownloadingQRCode] = useState(false);
    const [isGettingDocumentStatus, setIsGettingDocumentStatus] = useState(false);


    const createDocument = async (data) => {
        setIsCreatingDocument(true);
        try {
            const response = await axios.post(`${API_URL}/api/doc-track/create-document`, data);
            return response.data;
        } catch (error) {
            throw error;
        } finally {
            setIsCreatingDocument(false);
        }
    };

    const updateDocumentType = async (data) => {
        setIsUpdatingDocumentType(true);
        try {
            const response = await axios.post(`${API_URL}/api/doc-track/update-document-type`, data);
            return response.data;
        } catch (error) {
            throw error;
        } finally {
            setIsUpdatingDocumentType(false);
        }
    };

    const registerDocument = async (data) => {
        setIsRegisteringDocument(true);
        try {
            const response = await axios.post(`${API_URL}/api/doc-track/register-document`, data);
            return response.data;
        } catch (error) {
            throw error;
        } finally {
            setIsRegisteringDocument(false);
        }
    };

    const forwardDocument = async (data) => {
        setIsForwardingDocument(true);
        try {   
            const response = await axios.post(`${API_URL}/api/doc-track/forward-document`, data)
            return response.data;
        } catch (error) {
            throw error;
        } finally {
            setIsForwardingDocument(false);
        }
    };

    const registerAndForwardDocument = async (data) => {
        setIsRegisteringAndForwardingDocument(true);
        try {   
            const response = await axios.post(`${API_URL}/api/doc-track/register-forward-document`, data)
            return response.data;
        } catch (error) {
            throw error;
        } finally {
            setIsRegisteringAndForwardingDocument(false);
        }
    };

    const receiveDocument = async (data) => {
        setIsReceivingDocument(true);
        try {   
            const response = await axios.post(`${API_URL}/api/doc-track/receive-document`, data)
            return response.data;
        } catch (error) {
            throw error;
        } finally {
            setIsReceivingDocument(false);
        }
    };

    const archiveDocument = async (data) => {
        setIsArchivingDocument(true);
        try {   
            const response = await axios.post(`${API_URL}/api/doc-track/archive-document`, data)
            return response.data;
        } catch (error) {
            throw error;
        } finally {
            setIsArchivingDocument(false);
        }
    };

    const releaseDocument = async (data) => {
        setIsReleasingDocument(true);
        try {   
            const response = await axios.post(`${API_URL}/api/doc-track/release-document`, data)
            return response.data;
        } catch (error) {
            throw error;
        } finally {
            setIsReleasingDocument(false);
        }
    };

    const downloadQRCode = async (id) => {
        setIsDownloadingQRCode(true);
        try {   
            const response = await axios.get(`${API_URL}/api/doc-track/download-qr-code/${id}`, {
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            throw error;
        } finally {
            setIsDownloadingQRCode(false);
        }
    };

    const documentStatus = async (data) => {
        setIsGettingDocumentStatus(true);
        try {  
            //await new Promise(resolve => setTimeout(resolve, 5000));
            const response = await axios.post(`${API_URL}/api/doc-track/get-document-status`, data)
            return response.data;
        } catch (error) {
            throw error;
        } finally {
            setIsGettingDocumentStatus(false);
        }
    };

    return {
        // automatic queries
        documentTypes,
        adminAndStaffAccounts,
        forwardedDocuments,
        pendingDocuments,
        documentHistory,
        outgoingDocuments,

        // refetchers
        forwardedRefetch,
        pendingRefetch,
        historyRefetch,
        outgoingRefetch,

        // action functions
        createDocument,
        updateDocumentType,
        registerDocument,
        forwardDocument,
        registerAndForwardDocument,
        receiveDocument,
        archiveDocument,
        releaseDocument,
        downloadQRCode,
        documentStatus,

        //loading states
        isLoadingDocumentTypes,
        isLoadingAdminAndStaffAccounts,
        isLoadingForwardedDocuments,
        isLoadingPendingDocuments,
        isLoadingDocumentHistory,
        isLoadingOutgoingDocuments,

        // action flags
        isCreatingDocument,
        isUpdatingDocumentType,
        isRegisteringDocument,
        isForwardingDocument,
        isRegisteringAndForwardingDocument,
        isReceivingDocument,
        isArchivingDocument,
        isReleasingDocument,
        isDownloadingQRCode,
        isGettingDocumentStatus,

        //error states
        documentTypesError,
        adminAndStaffAccountsError,
        forwardedDocumentsError,
        pendingDocumentsError,
        documentHistoryError,
        outgoingDocumentsError,
    };
}

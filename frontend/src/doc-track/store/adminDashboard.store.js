import axios from 'axios'
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

export const useDocumentTypesQuery = () => 
    useQuery({
        queryKey: ['documentTypes'],
        queryFn: async () => {
            const response = await axios.get(`${API_URL}/api/doc-track/get-document-types`)
            return response.data;
        },
    });

export const useIncomingForwardedDocumentsQuery = (page = 1, id) =>
    useQuery({
        queryKey: ['forwardedDocuments', page],
        queryFn: async () => {
            const params = URLSearchParams({page, limit: 10})
            const response = await axios.get(`${API_URL}/api/doc-track/get-incoming-forwarded-documents/${id}`, params);
            return response.data
        },
    });

export const usePendingDocumentsQuery = (page = 1, id) => 
    useQuery({
        queryKey: ['pendingDocuments', page],
        queryFn: async () => {
            const params = URLSearchParams({page, limit: 10})
            const response = await axios.get(`${API_URL}/api/doc-track/get-pending-documents/${id}`, params);
            return response.data;
        },
    });

export const useDocumentHistoryQuery = (page = 1, id) =>
    useQuery({
        queryKey: ['documentHistory', page],
        queryFn: async () => {
            const params = URLSearchParams({page, limit: 10});
            const response = await axios.get(`${API_URL}/api/doc-track/get-document-history/${id}`, params);
            return response.data;
        },
    });

export const useAdminDashboard = () => {
    const [id, setId] = useState(null);

    const { data: documentTypes = [], isLoading: isLoadingDocumentTypes, error: documentTypesError } = useDocumentTypesQuery();
    const { data: forwardedDocuments = [], isLoading: isLoadingForwardedDocuments, error: forwardedDocumentsError } = useIncomingForwardedDocumentsQuery(id);
    const { data: pendingDocuments = [], isLoading: isLoadingPendingDocuments, error: pendingDocumentsError } = usePendingDocumentsQuery(id);
    const { data: documentHistory = [], isLoading: isLoadingDocumentHistory, error: documentHistoryError } = useDocumentHistoryQuery(id);
    
    const [isCreatingDocument, setIsCreatingDocument] = useState(false);
    const [isRegisteringDocument, setIsRegisteringDocument] = useState(false);
    const [isForwardingDocument, setIsForwardingDocument] = useState(false);
    const [isReceivingDocument, setIsReceivingDocument] = useState(false);
    const [isArchivingDocument, setIsArchivingDocument] = useState(false);
    const [isReleasingDocument, setIsReleasingDocument] = useState(false);
    const [isDownloadingQRCode, setIsDownloadingQRCode] = useState(false);


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
        } catch {
            throw error;
        } finally {
            setIsForwardingDocument(false);
        }
    };

    const receiveDocument = async (data) => {
        setIsReceivingDocument(true);
        try {   
            const response = await axios.post(`${API_URL}/api/doc-track/receive-document`, data)
            return response.data;
        } catch {
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
        } catch {
            throw error;
        } finally {
            setIsArchivingDocument(false);
        }
    };

    const releaseDocument = async (data) => {
        setIsReleasingDocument(true);
        try {   
            const response = await axios.post(`${API_URL}/api/doc-track/releasing-document`, data)
            return response.data;
        } catch {
            throw error;
        } finally {
            setIsReleasingDocument(false);
        }
    };

    const downloadQRCode = async (data) => {
        setIsDownloadingQRCode(true);
        try {   
            const response = await axios.post(`${API_URL}/api/doc-track/download-qr-code/${data}`)
            return response.data;
        } catch {
            throw error;
        } finally {
            setIsDownloadingQRCode(false);
        }
    };

    return {
        // automatic queries
        documentTypes,
        forwardedDocuments,
        pendingDocuments,
        documentHistory,
        setId,

        // action functions
        createDocument,
        registerDocument,
        forwardDocument,
        receiveDocument,
        archiveDocument,
        releaseDocument,
        downloadQRCode,

        //loading states
        isLoadingDocumentTypes,
        isLoadingForwardedDocuments,
        isLoadingPendingDocuments,
        isLoadingDocumentHistory,

        isCreatingDocument,
        isRegisteringDocument,
        isForwardingDocument,
        isReceivingDocument,
        isArchivingDocument,
        isReleasingDocument,
        isDownloadingQRCode,

        //error states
        documentTypesError,
        forwardedDocumentsError,
        pendingDocumentsError,
        documentHistoryError,
    };
} 

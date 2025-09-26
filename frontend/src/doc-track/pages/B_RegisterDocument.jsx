import React, { useState, useEffect } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner'
import { 
  Box, Heading, Text, VStack, Button, FormControl, FormLabel, 
  Select, HStack, useToast, Flex, Icon, SimpleGrid, Divider, 
  Spinner, useDisclosure, Input, 
} from "@chakra-ui/react";

import { IoArrowForwardCircle } from "react-icons/io5";
import { MdCreateNewFolder } from "react-icons/md";
import { HiMiniViewfinderCircle } from "react-icons/hi2";
import { MdCancel } from "react-icons/md";
import { FiSearch } from 'react-icons/fi';

import { useAdminDashboard } from '../store/adminDashboard.store.js';
import { useAuthStore } from '../../auth/store/authStore.js';
import { useQueryClient } from '@tanstack/react-query';
import  DocumentLifeCycleModal  from '../../components/docLifeCyclePanel.jsx';
import QrScannerPanel from '../../components/qrScannerPanel.jsx';

const B_RegisterDocument = () => {

  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const {
      documentTypes,
      isLoadingDocumentTypes,
      documentTypesError,

      adminAndStaffAccounts,
      isLoadingAdminAndStaffAccounts,
      adminAndStaffAccountsError,

      registerDocument,
      isRegisteringDocument,
      registerAndForwardDocument,
      isRegisteringAndForwardingDocument,

      documentStatus,
      isGettingDocumentStatus,
    } = useAdminDashboard();

    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const [scanResults, setScanResults] = useState(null);

    const [formData, setFormData] = useState({
      userAccountId: user.id,
      documentId: '',
      priority: '',
      details: '',
      isRegisterOnly: true, // to differentiate if the action is just register or register and forward

      documentNameText: '',
      originatingOffice: '',
      isManuallyTyped: false, // to differentiate if the document is selected from dropdown or manually typed

      forwardAccountId: '',
      forwardRemarks: '',

      referenceNumber: ''
    }) /* yung ibang details: (Register: userAccountId, documentId) and (Forward: userAccountId, forwardAccountId, registeredDocId) sa mismong function 
     ng handle submits nalang nakalagay, mag kasama na roon yung function for registering and forwarding document*/
    
    const resetFormData = () => {
      setFormData({
        userAccountId: user.id,
        documentId: '',
        priority: '',
        details: '',
        isRegisterOnly: true,

        forwardAccountId: '',
        forwardRemarks: ''
      });
    };

    const handleInputChange = (e) => {
      const {name, value} = e.target;
      setFormData({...formData, [name]: value});
    };

    const handleRegisterDocument = async () => {
      if (formData.documentNameText && formData.originatingOffice) {
        formData.isManuallyTyped = true;
      }
      try {
        const response = await registerDocument(formData);
        toast({
          title: "Success",
          description: response.message,
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        resetFormData();
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['forwardedDocuments'] }),
          queryClient.invalidateQueries({ queryKey: ['sectionDocumentCount'] }),
          queryClient.invalidateQueries({ queryKey: ['documentWorkload'] }),
        ]);
      } catch (error) {
        toast({
          title: "Error",
          description: error.response?.data?.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        console.log(error);
      }
    };

    const handleRegisterAndForwardDocument = async () => {
      if (formData.documentNameText && formData.originatingOffice) {
        formData.isManuallyTyped = true;
      }
      try {
        const response = await registerAndForwardDocument(formData);
        toast({
          title: "Success",
          description: response.message,
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        resetFormData();
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['forwardedDocuments'] }),
          queryClient.invalidateQueries({ queryKey: ['outgoingDocuments'] }),
        ]);
      } catch (error) {
        toast({
          title: "Error",
          description: error.response?.data?.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    }

    const handleFindDocument = async () => {
      try {
        const refNumber = formData.referenceNumber.trim();
        const response = await documentStatus({refNumber});
        setScanResults(response.data);
        toast({
            title: "Success",
            description: response.message,
            status: "success",
            duration: 5000,
            isClosable: true,
          });
        onOpen();
        setFormData(prev => ({ ...prev, referenceNumber: '' }));
      } catch (error) {
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to retrieve document status.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };

  // A document is identified if either a documentId is selected
  // OR both a manual document name and originating office are provided.
  const isDocIdentified =
    Boolean(formData.documentId) ||
    (formData.documentNameText && formData.originatingOffice);

  return (
    <Box 
    overflow="hidden" 
    bg="white" 
    p={5} 
    minH="100vh"
  >
    <Heading as="h1" size="xl" mb={2}>
      Produce Documents
    </Heading>
    <Text color="gray.600" mb={5}>
      Register and locate documents in the system for management and tracking.
    </Text>

    <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
      {/* Document Registration Section */}
      <Box>
        <Flex 
          justify="space-between" 
          align="center" 
          mb={4}
          bg="green.50"
          p={3}
          borderRadius="md"
          borderLeftWidth="4px"
          borderLeftColor="green.500"
        >
          <Heading as="h2" size="md" display="flex" alignItems="center">
            <Icon as={MdCreateNewFolder} mr={2} color="green.600" /> REGISTER DOCUMENT
          </Heading>
        </Flex>
        
        <Box 
          p={6}
          borderRadius="lg" 
          boxShadow="sm" 
          borderWidth="1px" 
          borderColor="gray.200"
        >
          <VStack spacing={5} align="stretch">

              {!formData.documentNameText ? (
                <FormControl isRequired>
                <FormLabel>Select Document Type</FormLabel>
                  <Select
                    name="documentId"
                    value={formData.documentId}
                    onChange={handleInputChange}
                    isDisabled={isLoadingDocumentTypes || !documentTypes}
                  >
                    
                    {isLoadingDocumentTypes ? (
                      <option value="">Loading available document types...</option>
                    ) : documentTypes && documentTypes.length > 0 ? (
                      <>
                      <option value="">Select a document type</option>
                      {documentTypes.map((type) => (
                        <option key={type._id} value={type._id}>
                          {`(${type.documentCode}) ${type.documentName}`}
                        </option>
                      ))};
                      </>
                    ) : (
                      <option>No document types available...</option>
                    )}
                
                    {documentTypesError && (
                      <option>Error loadinng document types...</option>
                    )}
                  </Select>
                </FormControl>
              ) : (
                null
              )}

              
              {!formData.documentId && (
                <FormControl isRequired>
                  <FormLabel>Document Name</FormLabel>
                  <Input
                    name='documentNameText'
                    type='text'
                    placeholder='Enter document name'
                    value={formData.documentNameText}
                    onChange={handleInputChange}
                    borderColor='gray.300'
                    _focus={{ borderColor: "blue.400" }}
                  />
                </FormControl>
              )}
              
              
              {formData.documentNameText && (
                <FormControl isRequired>
                  <FormLabel>Originating Office</FormLabel>
                  <Input
                    name='originatingOffice'
                    type='text'
                    placeholder='Enter originating office'
                    value={formData.originatingOffice}
                    onChange={handleInputChange}
                    borderColor='gray.300'
                    _focus={{ borderColor: "blue.400" }}
                    isDisabled={!formData.documentNameText}
                  />
                </FormControl>
              )}
              


            <HStack>
              <FormControl isRequired>
                <FormLabel>Priority Level</FormLabel>
                <Select
                  name='priority'
                  placeholder='Select priority level'
                  value={formData.priority}
                  onChange={handleInputChange}
                  isDisabled={!isDocIdentified}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="Urgent">Urgent</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Details</FormLabel>
                <Input
                  name='details'
                  type='text'
                  placeholder='Details or remarks'
                  value={formData.details}
                  onChange={handleInputChange}
                  borderColor='gray.300'
                  _focus={{ borderColor: "blue.400" }}
                  isDisabled={!isDocIdentified}
                />
              </FormControl>
            </HStack>
            

              <FormControl isRequired>
                <FormLabel>Forward To:</FormLabel>
                <Select
                  name="forwardAccountId"
                  value={formData.forwardAccountId}
                  onChange={handleInputChange}
                  placeholder='Select a user to forward to'
                  isDisabled={isLoadingAdminAndStaffAccounts || !adminAndStaffAccounts || !formData.priority || !formData.details || !isDocIdentified}
                >
                  {isLoadingAdminAndStaffAccounts ? (
                      <option value="">Loading user accounts...</option>
                    ) : adminAndStaffAccounts && adminAndStaffAccounts.length > 0 ? (
                      adminAndStaffAccounts.map((account) => (
                        <option key={account._id} value={account._id}>
                          {`${account.first_name} ${account.last_name} (${account.office_position || account.role.charAt(0).toUpperCase() + account.role.slice(1)})`}
                        </option>
                      ))
                    ) : (
                      <option>No user accounts available...</option>
                    )}
                
                    {adminAndStaffAccountsError && (
                      <option>Error user accounts...</option>
                    )}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Forward Remarks</FormLabel>
                <Input
                  name='forwardRemarks'
                  type='text'
                  placeholder='Instructions or remarks'
                  value={formData.forwardRemarks}
                  onChange={handleInputChange}
                  borderColor='gray.300'
                  _focus={{ borderColor: "blue.400" }}
                  isDisabled={!isDocIdentified || !formData.priority || !formData.details}
                />
              </FormControl>

            
            <Divider my={2} />

            <HStack>
            
            {!formData.forwardAccountId ? (
              <Button
                colorScheme="green"
                leftIcon={<MdCreateNewFolder />}
                onClick={handleRegisterDocument}
                isLoading={isRegisteringDocument}
                loadingText="Registering..."
                size="md"
                width="100%"
                isDisabled={!isDocIdentified || !formData.priority || !formData.details}
              >
                Register Document
              </Button>
            ) : (
              <Button
                colorScheme="orange"
                leftIcon={<IoArrowForwardCircle />}
                onClick={handleRegisterAndForwardDocument}
                isLoading={isRegisteringAndForwardingDocument}
                loadingText='Registering and Forwarding...'
                size="md"
                width="100%"
                isDisabled={!isDocIdentified || !formData.priority || !formData.details || !formData.forwardAccountId || !formData.forwardRemarks}
                >
                  Register & Forward Immediately
              </Button>
            )}
              
            </HStack>
            
          </VStack>
        </Box>
      </Box>
        
        {/* Find Document Via QR-Code Section */}
        <Box>
          <Flex 
            justify="space-between" 
            align="center" 
            mb={4}
            bg="blue.50"
            p={3}
            borderRadius="md"
            borderLeftWidth="4px"
            borderLeftColor="blue.500"
          >
            <Heading as="h2" size="md" display="flex" alignItems="center">
              <Icon as={HiMiniViewfinderCircle} mr={2} color="blue.600" /> FIND DOCUMENT VIA REFERENECE NUMBER OR QR CODE 
            </Heading>
          </Flex>
          
          <Box 
            p={6}
            borderRadius="lg" 
            boxShadow="sm" 
            borderWidth="1px" 
            borderColor="gray.200"
          >
            <VStack spacing={5} align="stretch">

              <VStack spacing={4} align="center">
                <FormControl isRequired>
                  <FormLabel fontSize="md">Reference Number</FormLabel>
                  <Input
                    name='referenceNumber'
                    type='text'
                    placeholder='Enter reference number'
                    value={formData.referenceNumber}
                    onChange={handleInputChange}
                    borderColor='gray.300'
                    _focus={{ borderColor: "blue.400" }}
                  />
                </FormControl>
                <Button 
                  colorScheme="blue"
                  onClick={handleFindDocument}
                  size={"md"}
                  width="100%"
                  leftIcon={<FiSearch />}
                  isDisabled={!formData.referenceNumber || isGettingDocumentStatus}
                  isLoading={isGettingDocumentStatus}
                >
                  Find Document
                </Button>
              </VStack>

              <QrScannerPanel 
                scanResults={setScanResults}
                onOpen={onOpen}
              />
            
            </VStack>
          </Box>
        </Box>
      </SimpleGrid>

      {/* Document Lifecycle Modal */}
      <DocumentLifeCycleModal
        isOpen={isOpen}
        onClose={() => { setScanResults(null); onClose(); }}
        document={scanResults}
        isProduceDocumentPage={true}
        isPendingPage={false}
        isIncomingPage={false}
        isOutgoingPage={false}
      />
    </Box>
  );
};

export default B_RegisterDocument;
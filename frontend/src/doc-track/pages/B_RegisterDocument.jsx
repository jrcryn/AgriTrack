import React, { useState, useEffect } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner'
import { 
  Box, Heading, Text, VStack, Button, FormControl, FormLabel, 
  Select, HStack, useToast, Flex, Icon, SimpleGrid, Divider, 
  Spinner, Alert, AlertIcon, Badge, AlertTitle, AlertDescription, Input, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  useDisclosure, Table, Thead, Tbody, Tr, Th, Td, Tfoot, TableCaption, TableContainer
} from "@chakra-ui/react";
import { CheckCircleIcon, ArrowForwardIcon, TimeIcon } from "@chakra-ui/icons";
import { FaArchive } from "react-icons/fa";
import { CiInboxOut } from "react-icons/ci";

import { IoArrowForwardCircle } from "react-icons/io5";
import { MdCreateNewFolder } from "react-icons/md";
import { HiMiniViewfinderCircle } from "react-icons/hi2";
import { MdCancel } from "react-icons/md";
import { GrFolderCycle } from "react-icons/gr";

import { useAdminDashboard } from '../store/adminDashboard.store.js';
import { useAuthStore } from '../../auth/store/authStore.js';

const B_RegisterDocument = () => {

  const { user } = useAuthStore();
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

    const actionStyles = {
      "Document Created": { color: "green.400", icon: <CheckCircleIcon /> },
      "Forwarded": { color: "blue.400", icon: <ArrowForwardIcon /> },
      "Received/Work on Progress": { color: "gray.400", icon: <TimeIcon /> },
      "Archived": { color: "orange.400", icon: <FaArchive /> },
      "Released": { color: "red.400", icon: <CiInboxOut /> }
    };

    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const [scanning, setScanning] = useState(false);
    const [scanResults, setScanResults] = useState(null);
    const [devices, setDevices] = useState([]);
    const [selectedDeviceId, setSelectedDeviceId ] = useState('');

    const [formData, setFormData] = useState({
      userAccountId: user.id,
      documentId: '',
      priority: '',
      details: '',

      forwardAccountId: '',
      forwardRemarks: ''
    }) /* yung ibang details: (Register: userAccountId, documentId) and (Forward: userAccountId, forwardAccountId, registeredDocId) sa mismong function 
     ng handle submits nalang nakalagay, mag kasama na roon yung function for registering and forwarding document*/
    
    const resetFormData = () => {
      setFormData({
        userAccountId: user.id,
        documentId: '',
        priority: '',
        details: '',

        forwardAccountId: '',
        forwardRemarks: ''
      });
    };

    const handleInputChange = (e) => {
      const {name, value} = e.target;
      setFormData({...formData, [name]: value});
    };

    const handleRegisterDocument = async () => {
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
      } catch (error) {
        toast({
          title: "Error",
          description: error.response?.data?.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };

    const handleRegisterAndForwardDocument = async () => {
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

    const handleScan = async (data) => {
      if (!data) {
        toast({
          title: "Error",
          description: "No QR code data found.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
      try {
        const qrData = JSON.parse(data?.[0]?.rawValue);
        const response = await documentStatus({qrData});
        setScanResults(response.data);
        toast({
            title: "Success",
            description: response.message,
            status: "success",
            duration: 5000,
            isClosable: true,
          });
        onOpen();
        setScanning(false);
      } catch (error) {
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to retrieve document status.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        setScanResults(null);
      }
    };

    const handleStartScanning = async () => {
      setScanning(true);
      try {
        const availableDevices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = availableDevices.filter(d => d.kind === 'videoinput');
        setDevices(videoDevices);
        if (videoDevices.length > 0) {
          // Prefer the back camera if available, otherwise use the first one
          const rearCamera = videoDevices.find(device => device.label.toLowerCase().includes('back'));
          setSelectedDeviceId(rearCamera ? rearCamera.deviceId : videoDevices[0].deviceId);
        }
      } catch (err) {
        toast({
          title: "Camera Error",
          description: "Could not access camera devices. Please check permissions.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };

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

            <HStack spacing={4} align="flex-start">
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
            </HStack>
            <HStack>
              <FormControl isRequired>
                <FormLabel>Priority Level</FormLabel>
                <Select
                  name='priority'
                  placeholder='Select priority level'
                  value={formData.priority}
                  onChange={handleInputChange}
                  isDisabled={!formData.documentId}
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
                  isDisabled={!formData.documentId}
                />
              </FormControl>
            </HStack>
            

              <FormControl>
                <FormLabel>Forward To:</FormLabel>
                <Select
                  name="forwardAccountId"
                  value={formData.forwardAccountId}
                  onChange={handleInputChange}
                  placeholder='Select a user to forward to'
                  isDisabled={isLoadingAdminAndStaffAccounts || !adminAndStaffAccounts || !formData.documentId || !formData.priority || !formData.details}
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

              <FormControl>
                <FormLabel>Forward Remarks</FormLabel>
                <Input
                  name='forwardRemarks'
                  type='text'
                  placeholder='Instructions or remarks'
                  value={formData.forwardRemarks}
                  onChange={handleInputChange}
                  borderColor='gray.300'
                  _focus={{ borderColor: "blue.400" }}
                  isDisabled={!formData.documentId || !formData.priority || !formData.details}
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
                isDisabled={!formData.documentId || !formData.priority || !formData.details}
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
                isDisabled={!formData.documentId || !formData.priority || !formData.details || !formData.forwardAccountId || !formData.forwardRemarks}
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
              <Icon as={HiMiniViewfinderCircle} mr={2} color="blue.600" /> FIND DOCUMENT VIA QR CODE
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
            {!scanning ? (
              <VStack spacing={4} align="center">
                <Text>Scan a document QR code to quickly view its details and status. Your browser may ask for permission to use the camera.</Text>
                <Button
                  colorScheme="blue"
                  leftIcon={<HiMiniViewfinderCircle />}
                  onClick={() => setScanning(true)}
                  size="md"
                  width="100%"
                >
                  Start Camera Scanner
                </Button>
              </VStack>
            ) : isGettingDocumentStatus ? (
              <VStack spacing={4} align="center">
                <Spinner size="xl" color="blue.500" thickness="4px" speed="0.65s" />
                <Text color="gray.600">Retrieving document status...</Text>
              </VStack>
            ) : scanning && !scanResults ? (
              <VStack spacing={4}>
                <Text>Point your camera at a QR code to scan. Ensure the code is well-lit and clearly visible.</Text>

                {devices.length > 1 && (
                  <FormControl>
                    <FormLabel fontSize="sm">Change Camera</FormLabel>
                    <Select 
                      size="sm"
                      value={selectedDeviceId}
                      onChange={(e) => setSelectedDeviceId(e.target.value)}
                    >
                      {devices.map(device => (
                        <option key={device.deviceId} value={device.deviceId}>
                          {device.label || `Camera ${devices.indexOf(device) + 1}`}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                )}

                <Box 
                  borderWidth="1px" 
                  borderColor="gray.300" 
                  borderRadius="md" 
                  overflow="hidden"
                  width="100%"
                >
                  <Scanner
                    onScan={handleScan}
                    style={{ width: '100%' }}
                    constraints={{
                      audio: false,
                      video: { facingMode: "environment" },
                      deviceId: selectedDeviceId ? {exact: selectedDeviceId} : undefined
                    }}
                    isDisabled={true}
                  />
                </Box>
                <Button 
                  onClick={() => setScanning(false)} 
                  leftIcon={<MdCancel />}
                  colorScheme="red"
                  size="md"
                  width="100%"
                >
                  Cancel Scanning
                </Button>
              </VStack>
            ) : null}

            </VStack>
          </Box>
        </Box>
      </SimpleGrid>

      {/* Document Lifecycle Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="2xl" closeOnOverlayClick={false} scrollBehavior="inside"  motionPreset="none">
        <ModalOverlay />
        <ModalContent borderRadius="md" overflow="hidden" boxShadow="lg">
          <ModalHeader bg="blue.50" borderBottomWidth="1px" borderColor="gray.200" display="flex" alignItems="center" py={4}>
            <Icon as={GrFolderCycle} mr={3} color="blue.600" />
            Current Lifecycle
          </ModalHeader>

          <ModalBody py={6}>
            {!scanResults ? (
              <VStack spacing={4} align="center" py={6}>
                <Spinner size="xl" color="blue.500" thickness="4px" speed="0.65s" />
                <Text color="gray.600">Please scan a document QR code to view its lifecycle...</Text>
              </VStack>
            ) : (
              <VStack spacing={4} align="stretch">
                {/* Document Info Section */}
                <Box bg="gray.50" p={4} borderRadius="md">
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                    <Box>
                      <Text fontWeight="bold" fontSize="sm" color="gray.600">Document Type</Text>
                      <Text fontSize="md">{scanResults.documentName}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" fontSize="sm" color="gray.600">Document Code</Text>
                      <Text fontSize="md">{scanResults.documentCode}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" fontSize="sm" color="gray.600">Reference Number</Text>
                      <Text fontSize="md">{scanResults.refNumber}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" fontSize="sm" color="gray.600">Priority</Text>
                      <Badge colorScheme={
                        scanResults.priority === "Urgent" ? "red" : 
                        scanResults.priority === "Medium" ? "orange" : 
                        "green"
                      }>
                        {scanResults.priority}
                      </Badge>
                    </Box>
                  </SimpleGrid>
                </Box>
                
                <Divider my={2} />
                
                {/* Timeline Section */}
                <Heading size="sm" mb={2}>Document Lifecycle</Heading>
                
                <Box position="relative">
                  {/* Vertical line connecting timeline events */}
                  <Box 
                    position="absolute" 
                    left="24px" 
                    top="0" 
                    bottom="0" 
                    width="2px" 
                    bg="gray.200" 
                    zIndex={1}
                  />
                  
                  {/* Timeline Events */}
                  <VStack spacing={0} align="stretch" position="relative" zIndex={2}>
                    {scanResults.lifeCycle.map((event, index) => {
                      const isLast = index === scanResults.lifeCycle.length - 1;
                      const style = actionStyles[event.action];
                      const date = new Date(event.timeStamp);
                      const formattedDate = date.toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      });
                      
                      return (
                        <Box key={index} pb={isLast ? 0 : 4}>
                          <Flex>
                            {/* Timeline Icon */}
                            <Box 
                              minWidth="50px" 
                              height="50px" 
                              borderRadius="full" 
                              bg={style.color} 
                              color="white"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              fontSize="xl"
                              boxShadow="md"
                            >
                              {style.icon}
                            </Box>
                            
                            {/* Timeline Content */}
                            <Box ml={4} flex={1}>
                              <Flex justify="space-between" align="flex-start">
                                <Box>
                                  <Text fontWeight="bold">{event.action}</Text>
                                  <Text fontSize="sm" color="gray.600">
                                    {`By: ${event.performedBy.first_name} ${event.performedBy.last_name} (${event.performedBy.office_position || event.performedBy.role.charAt(0).toUpperCase() + event.performedBy.role.slice(1)})`}
                                  </Text>
                                </Box>
                                <Text fontSize="sm" color="gray.500">{formattedDate}</Text>
                              </Flex>
                              
                              {/* Forward Details - only for "Forwarded" action */}
                              {event.action === "Forwarded" && event.forwardDetails && (
                                <Box mt={2} p={3} bg="blue.50" borderRadius="md" borderLeftWidth="3px" borderLeftColor="blue.500">
                                  <Text fontSize="sm" fontWeight="bold">
                                    {`Forwarded to: ${event.forwardDetails.first_name} ${event.forwardDetails.last_name} (${event.forwardDetails.office_position || event.forwardDetails.role.charAt(0).toUpperCase() + event.forwardDetails.role.slice(1)})`}
                                  </Text>
                                  {event.forwardDetails.forwardRemarks && (
                                    <Text fontSize="sm" mt={1}>
                                      Remarks: "{event.forwardDetails.forwardRemarks}"
                                    </Text>
                                  )}
                                </Box>
                              )}
                              
                              {/* Received Details - only for "Received" action */}
                              {event.action === "Received" && event.receiveDetails && (
                                <Box mt={2} p={3} bg="green.50" borderRadius="md" borderLeftWidth="3px" borderLeftColor="green.500">
                                  <Text fontSize="sm">
                                    {event.receiveDetails.receiveRemarks && (
                                      <>Comments: "{event.receiveDetails.receiveRemarks}"</>
                                    )}
                                  </Text>
                                </Box>
                              )}
                              
                              {/* Archive Details - only for "Archived" action */}
                              {event.action === "Archived" && event.archiveDetails && (
                                <Box mt={2} p={3} bg="purple.50" borderRadius="md" borderLeftWidth="3px" borderLeftColor="purple.500">
                                  <SimpleGrid columns={2} spacing={2} fontSize="sm">
                                    <Text fontWeight="bold">Medium:</Text>
                                    <Text>{event.archiveDetails.medium}</Text>
                                    
                                    <Text fontWeight="bold">Location:</Text>
                                    <Text>{event.archiveDetails.location}</Text>
                                    
                                    {event.archiveDetails.archiveRemarks && (
                                      <>
                                        <Text fontWeight="bold">Remarks:</Text>
                                        <Text>"{event.archiveDetails.archiveRemarks}"</Text>
                                      </>
                                    )}
                                  </SimpleGrid>
                                </Box>
                              )}
                              
                              {/* Release Details - only for "Released" action */}
                              {event.action === "Released" && event.releaseDetails && (
                                <Box mt={2} p={3} bg="yellow.50" borderRadius="md" borderLeftWidth="3px" borderLeftColor="yellow.500">
                                  <SimpleGrid columns={2} spacing={2} fontSize="sm">
                                    <Text fontWeight="bold">Recipient Office:</Text>
                                    <Text>{event.releaseDetails.recipientOffice}</Text>
                                    
                                    <Text fontWeight="bold">Recipient Person:</Text>
                                    <Text>{event.releaseDetails.recipientPerson}</Text>
                                    
                                    <Text fontWeight="bold">Mode of Release:</Text>
                                    <Text>{event.releaseDetails.modeOfRelease}</Text>
                                    
                                    {event.releaseDetails.releaseRemarks && (
                                      <>
                                        <Text fontWeight="bold">Remarks:</Text>
                                        <Text>"{event.releaseDetails.releaseRemarks}"</Text>
                                      </>
                                    )}
                                  </SimpleGrid>
                                </Box>
                              )}
                            </Box>
                          </Flex>
                        </Box>
                      );
                    })}
                  </VStack>
                </Box>
                
                {/* Current Handler Section */}
                <Box mt={4} p={4} bg="blue.50" borderRadius="md">
                  <Heading size="sm" mb={2}>Current Document Handler</Heading>
                  {scanResults.lifeCycle.length > 0 && (
                    <Text>
                      {scanResults.currentHandler?.first_name ? (
                        `By: ${scanResults.currentHandler.first_name} ${scanResults.currentHandler.last_name} (${scanResults.currentHandler.office_position || scanResults.currentHandler.role.charAt(0).toUpperCase() + scanResults.currentHandler.role.slice(1)})`
                      ) : (
                        <i>No current handler (document may be archived or released)</i>
                      )} 
                    </Text>
                  )}
                </Box>
              </VStack>
            )}
          </ModalBody>

          <ModalFooter bg="gray.50" borderTopWidth="1px" borderColor="gray.200" py={4}>
              <Button 
                variant="outline" 
                onClick={() => {
                  onClose();
                  setScanResults(null);
                  setScanning(false);
                }}
                size="md"
                _hover={{ bg: "gray.100" }}
              >
                Close
              </Button>
              <Button 
                colorScheme='blue'
                ml={3}
                size="md"
                fontWeight="500"
                boxShadow="sm"
                _hover={{ boxShadow: "md", bg: "blue.600" }}
                onClick={() => {
                  onClose();
                  setScanResults(null);
                  setScanning(true);
                }}
              >
                Scan Again
              </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default B_RegisterDocument;
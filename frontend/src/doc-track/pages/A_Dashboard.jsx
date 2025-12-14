import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import {
  Box,
  Heading,
  Text,
  Stack,
  Flex,
  Icon,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  FormControl,
  FormLabel,
  Select,
  Progress,
  Tag,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Button,
  Spacer,
  useDisclosure,
  Input,
  HStack,
  VStack,
  FormErrorMessage,
  useToast,
  Tooltip
} from "@chakra-ui/react";
import {
  FiFileText,
  FiInbox,
  FiClock,
  FiSend,
  FiCalendar,
  FiUsers,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";
import { HiMiniDocumentPlus, HiInformationCircle } from "react-icons/hi2";
import { MdEditDocument } from "react-icons/md";
import { FaArchive } from "react-icons/fa";
import { GoArchive } from "react-icons/go";
import { FileOutput, FileInput } from "lucide-react";

import { useAdminDashboard } from '../store/adminDashboard.store.js';
import F_ArchivedDocuments from './F_ArchivedDocuments.jsx';


const A_Dashboard = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isOpenEditDocTypes, onOpen: onOpenEditDocTypes, onClose: onCloseEditDocTypes } = useDisclosure();

  const {
    documentTypes,
    isLoadingDocumentTypes,
    documentTypesError,
    createDocument,
    isCreatingDocument,
    updateDocumentType,
    isUpdatingDocumentType,

    totalIncomingDocuments,
    releasedDocuments,
    archivedDocuments,

    sectionDocumentCount,
    isLoadingSectionDocumentCount,
    sectionDocumentCountError
  } = useAdminDashboard();
  
  // Mock metrics data
  const metrics = {
    incomingDocuments: totalIncomingDocuments?.data?.totalCount ?? 0,
    outgoingDocuments: releasedDocuments?.data?.totalCount ?? 0,
    pendingDocuments: totalIncomingDocuments?.data?.totalCount ?? 0,
    archivedDocuments: archivedDocuments?.data?.totalCount ?? 0,

    processingRate: 78.5,
    avgProcessingTime: 2.4, // days
    responseRate: 92
  };
  const sectionPerformance = {
    managersIncoming: sectionDocumentCount?.data?.sections?.managers?.incoming ?? 0,
    managersPending: sectionDocumentCount?.data?.sections?.managers?.pending ?? 0,

    cfsIncoming: sectionDocumentCount?.data?.sections?.CFS?.incoming ?? 0,
    cfsPending: sectionDocumentCount?.data?.sections?.CFS?.pending ?? 0,

    lpmsIncoming: sectionDocumentCount?.data?.sections?.LPMS?.incoming ?? 0,
    lpmsPending: sectionDocumentCount?.data?.sections?.LPMS?.pending ?? 0,

    anmsIncoming: sectionDocumentCount?.data?.sections?.ANMS?.incoming ?? 0,
    anmsPending: sectionDocumentCount?.data?.sections?.ANMS?.pending ?? 0,

    rtssIncoming: sectionDocumentCount?.data?.sections?.RTSS?.incoming ?? 0,
    rtssPending: sectionDocumentCount?.data?.sections?.RTSS?.pending ?? 0,
  };

  const [isPermanent, setIsPermanent] = useState(false); //for retention period
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    documentName: '',
    documentCode: '',
    disposalMethod: '',
    retentionPeriod: '1'
  })

  const [selectedDocId, setSelectedDocId] = useState('');
  const [hasEditFormChanged, setHasEditFormChanged] = useState(false);
  const [isEditPermanent, setIsEditPermanent] = useState(true); 
  const [editFormErrors, setEditFormErrors] = useState({});
  const [editFormData, setEditFormData] = useState({
    documentName: '',
    documentCode: '',
    disposalMethod: '',
    retentionPeriod: ''
  });

  const clearFormData = () => {
    setFormData({
      documentName: '',
      documentCode: '',
      disposalMethod: '',
      retentionPeriod: ''
    });
  }

  const clearEditFormData = () => {
    setEditFormData({
      documentId: '',
      documentName: '',
      documentCode: '',
      disposalMethod: '',
      retentionPeriod: ''
    });
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'retentionPeriod') {
      if (value === 'permanent') {
        setIsPermanent(true);
        setFormData(prev => ({...prev, retentionPeriod: null})); // Set retentionPeriod to null for permanent
        setFormData(prev => ({ ...prev, disposalMethod: null })); // Clear disposal method
      } else {
        setIsPermanent(false);
      }
    }

    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: null });
    }
  }

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({ ...editFormData, [name]: value });

    if (name === 'retentionPeriod') {
      if (value === 'permanent') {
        setIsEditPermanent(true);
        setEditFormData(prev => ({ ...prev, retentionPeriod: null}));
        setEditFormData(prev => ({...prev, disposalMethod: null}))
      } else {
        setIsEditPermanent(false);
      }
    }

    if (editFormErrors[name]) {
      setEditFormErrors({ ...editFormErrors, [name]: null });
    }
  }

  const handleSelectDocumentForEdit = (e) => {
    const docId = e.target.value;
    setSelectedDocId(docId);

    if (!docId) {
      // Reset form if placeholder is selected
      setEditFormData({ documentName: '', documentCode: '', disposalMethod: '', retentionPeriod: '' });
      setIsEditPermanent(true);
      return;
    }

    const selectedDoc = documentTypes.find(doc => doc._id === docId);
    if (selectedDoc) {
      const isPerm = selectedDoc.retentionPeriod === null;
      setIsEditPermanent(isPerm);
      setEditFormData({
        documentName: selectedDoc.documentName,
        documentCode: selectedDoc.documentCode,
        retentionPeriod: isPerm ? 'permanent' : selectedDoc.retentionPeriod,
        disposalMethod: selectedDoc.disposalMethod || ''
      });
    }
  };

  useEffect (() => {
      const selectedDoc = documentTypes.find(doc => doc._id === selectedDocId);

      if (editFormData && selectedDocId && selectedDoc) {
        const hasEditFormChanged = 
          selectedDoc.documentName !== editFormData.documentName ||
          selectedDoc.documentCode !== editFormData.documentCode ||
          selectedDoc.retentionPeriod !== editFormData.retentionPeriod ||
          selectedDoc.disposalMethod !== editFormData.disposalMethod;

          setHasEditFormChanged(hasEditFormChanged);
      } else {
          setHasEditFormChanged(false);
      }
    }, [editFormData, selectedDocId, documentTypes]);

  const validateForm = () => {
    const errors = {};

    if (!formData.documentName.trim()) {
      errors.documentName = "Document name is required";
    }
    if (!formData.documentCode.trim()) {
      errors.documentCode = "Document code is required";
    }
    if (!isPermanent && !formData.retentionPeriod.trim()) {
      errors.retentionPeriod = "Retention period is required";
    }
    if (!isPermanent && !formData.disposalMethod.trim()) {
      errors.disposalMethod = "Disposal method is required";
    }

    return errors;
  }

  const validateEditForm = () => {
    const errors = {};

    if (!editFormData.documentName.trim()) {
      errors.documentName = "Document name is required";
    }
    if (!editFormData.documentCode.trim()) {
      errors.documentCode = "Document code is required";
    }
    if (!isEditPermanent && !editFormData.retentionPeriod) {
      errors.retentionPeriod = "Retention period is required";
    }
    if (!isEditPermanent && !editFormData.disposalMethod.trim()) {
      errors.disposalMethod = "Disposal method is required";
    }

    return errors;
  }

  const handleCreateDocumentType = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    try {
      const response = await createDocument(formData);
      toast({
        title: "Success",
        description: response.message,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      onClose();
      clearFormData();
      setFormErrors({});
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

  const handleEditDocumentType = async () => {
    const errors = validateEditForm();
    if (Object.keys(errors).length > 0) {
      setEditFormErrors(errors);
      return;
    }

    try {
      const dataToUpdate = {
        ...editFormData,
        documentId: selectedDocId 
      };

      const response = await updateDocumentType(dataToUpdate);
      toast({
        title: "Success",
        description: response.message,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      onCloseEditDocTypes();
      clearEditFormData();
      setSelectedDocId('');
      setEditFormErrors({});
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

  const handleCloseModal = () => {
    onClose();
    onCloseEditDocTypes();
    clearFormData();
    clearEditFormData();
    setSelectedDocId('');
    setFormErrors({});
    setEditFormErrors({});
  }

  return (
    <Box 
      overflow="hidden" 
      bg="white" 
      p={5} 
      minH="100vh"
    >
      <Heading as="h1" size="xl" mb={2} color="black">
        Document Tracking Metrics
      </Heading>
      <Text color="gray.600" mb={5}>
        Overview of document processing metrics and performance across all departments.
      </Text>
      
      {/* BUtton Section */}
      <Flex
        direction={{ base: 'column', md: 'row' }}
        alignItems="center"
        mb={6}
        gap={4}
        p={3}
        bg="blue.50"
        borderRadius="md"
        boxShadow="sm"
      >
        <Button 
          colorScheme="blue" 
          alignSelf={{ base: 'stretch', md: 'flex-end' }}
          leftIcon={<HiMiniDocumentPlus/>}
          onClick={onOpen}
          size={'sm'}
        >
          Create Document Type
        </Button>
        <Button 
          colorScheme="green" 
          alignSelf={{ base: 'stretch', md: 'flex-end' }}
          leftIcon={<MdEditDocument/>}
          onClick={onOpenEditDocTypes}
          size={'sm'}
        >
          Update Document Type
        </Button>
      </Flex>

      {/* DOCUMENT OVERVIEW SECTION */}
      <Box mb={8}>
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
            <Icon as={FiFileText} mr={2} color="blue.600" /> DOCUMENT OVERVIEW
          </Heading>
        </Flex>
      
        <Stack 
          direction={{ base: "column", md: "row" }} 
          spacing={4} 
          w="full"
        >
          {/* Incoming Documents */}
          <Box 
            as="button"
            type="button"
            p={5} 
            flex={1} 
            borderRadius="md" 
            boxShadow="sm" 
            bg="white"
            borderWidth="1px"
            borderColor="gray.200"
            cursor="pointer"
            transition="all 0.2s ease"
            _hover={{ boxShadow: "md", borderColor: "blue.400", bg: "blue.50", transform: "translateY(-2px)" }}
            _active={{ boxShadow: "sm", bg: "blue.100", transform: "translateY(0)" }}
            _focusVisible={{ outline: "none", boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.6)" }}
            textAlign="left"
            onClick={() => navigate('/doc-track/incoming-dashboard')}
          >
            <Stat>
              <StatLabel fontSize="md" display="flex" alignItems="center">
                <Icon as={FileInput} mr={2} color="green.500" /> Incoming Documents
              </StatLabel>
              <StatNumber fontSize="4xl" mb={2}>{metrics.incomingDocuments}</StatNumber>
              <Tag colorScheme="green" size="sm">Registered Documents</Tag>
            </Stat>
          </Box>
          
          {/* Outgoing Documents */}
          <Box 
            as="button"
            type="button"
            p={5} 
            flex={1} 
            borderRadius="md" 
            boxShadow="sm" 
            bg="white"
            borderWidth="1px"
            borderColor="gray.200"
            cursor="pointer"
            transition="all 0.2s ease"
            _hover={{ boxShadow: "md", borderColor: "blue.400", bg: "blue.50", transform: "translateY(-2px)" }}
            _active={{ boxShadow: "sm", bg: "blue.100", transform: "translateY(0)" }}
            _focusVisible={{ outline: "none", boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.6)" }}
            textAlign="left"
            onClick={() => navigate('/doc-track/outgoing-dashboard')}
          >
            <Stat>
              <StatLabel fontSize="md" display="flex" alignItems="center">
                <Icon as={FileOutput} mr={2} color="red.500" /> Outgoing Documents
              </StatLabel>
              <StatNumber fontSize="4xl" mb={2}>
                {metrics.outgoingDocuments}
              </StatNumber>
              <Tag colorScheme="red" size="sm">Released Documents</Tag>
            </Stat>
          </Box>
          
          {/* Pending Documents */}
          <Box 
            p={5} 
            flex={1} 
            borderRadius="md" 
            boxShadow="sm" 
            bg="white"
            borderWidth="1px"
            borderColor="gray.200"
          >
            <Stat>
              <StatLabel fontSize="md" display="flex" alignItems="center">
                <Icon as={FiClock} mr={2} color="yellow.500" /> Pending Documents
              </StatLabel>
              <StatNumber fontSize="4xl" mb={2}>{metrics.pendingDocuments}</StatNumber>
                <Tag colorScheme="green" size="sm" mr={{base: 0, md: 1}}>Forwarded</Tag>
                <Tag colorScheme="yellow" size="sm">Received/Work on Progress</Tag>
            </Stat>
          </Box>
          
          {/* Archived Documents */}
          <Box 
            as="button"
            type="button"
            p={5} 
            flex={1} 
            borderRadius="md" 
            boxShadow="sm" 
            bg="white"
            borderWidth="1px"
            borderColor="gray.200"
            cursor="pointer"
            transition="all 0.2s ease"
            _hover={{ boxShadow: "md", borderColor: "blue.400", bg: "blue.50", transform: "translateY(-2px)" }}
            _active={{ boxShadow: "sm", bg: "blue.100", transform: "translateY(0)" }}
            _focusVisible={{ outline: "none", boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.6)" }}
            textAlign="left"
            onClick={() => navigate('/doc-track/archived-documents')}
          >
            <Stat>
              <StatLabel fontSize="md" display="flex" alignItems="center">
                <Icon as={GoArchive} mr={2} color="red.500" /> Disposition Documents
              </StatLabel>
              <StatNumber fontSize="4xl" mb={2}>{metrics.archivedDocuments}</StatNumber>
              <Tag colorScheme="orange" size="sm" mr={{base: 1, md: 1}}>Archived Documents</Tag>
              <Tag colorScheme="gray" size="sm">Disposed Documents</Tag>
            </Stat>
          </Box>
        </Stack>
      </Box>
      
      {/* DEPARTMENTAL PERFORMANCE */}
      <Box mb={4}>
        <Flex 
          justify="space-between" 
          align="center" 
          mb={4}
          bg="purple.50"
          p={3}
          borderRadius="md"
          borderLeftWidth="4px"
          borderLeftColor="purple.500"
        >
          <Heading as="h2" size="md" display="flex" alignItems="center">
            <Icon as={FiUsers} mr={2} color="purple.600" /> SECTION DOCUMENTS
          </Heading>
        </Flex>
        
        <SimpleGrid columns={{ base: 1, md: 2, lg: 5 }} spacing={4}>

          {/* Managers */}
            <Box 
              p={4} 
              borderRadius="md" 
              boxShadow="sm" 
              bg="white"
              borderWidth="1px"
              borderColor="gray.200"
            >
              <Text fontWeight="medium" mb={2}>{'Managers'}</Text>
              <Flex align="center" justify="space-between" mb={2}>
                <Flex align="center">
                  <Icon as={FiInbox} color="green.500" mr={1} />
                  <Text fontSize="sm">Incoming</Text>
                </Flex>
                <Text fontWeight="bold">{sectionPerformance.managersIncoming}</Text>
              </Flex>
              <Flex align="center" justify="space-between">
                <Flex align="center">
                  <Icon as={FiClock} color="yellow.500" mr={1} />
                  <Text fontSize="sm">Pending</Text>
                </Flex>
                <Text fontWeight="bold">{sectionPerformance.managersPending}</Text>
              </Flex>
            </Box>

            {/* CFS SECTION */}
            <Tooltip label="Crop and Fishery Section" fontSize="sm" placement="top" hasArrow={true}>
            <Box 
              p={4} 
              borderRadius="md" 
              boxShadow="sm" 
              bg="white"
              borderWidth="1px"
              borderColor="gray.200"
            >
              <Text fontWeight="medium" mb={2} cursor="help">{'CFS'}</Text>  
              <Flex align="center" justify="space-between" mb={2}>
                <Flex align="center">
                  <Icon as={FiInbox} color="green.500" mr={1} />
                  <Text fontSize="sm">Incoming</Text>
                </Flex>
                <Text fontWeight="bold">{sectionPerformance.cfsIncoming}</Text>
              </Flex>
              <Flex align="center" justify="space-between">
                <Flex align="center">
                  <Icon as={FiClock} color="yellow.500" mr={1} />
                  <Text fontSize="sm">Pending</Text>
                </Flex>
                <Text fontWeight="bold">{sectionPerformance.cfsPending}</Text>
              </Flex>
            </Box>
            </Tooltip>

            {/* LPMS SECTION */}
            <Tooltip label="Livestock & Poultry Management Section" fontSize="sm" placement="top" hasArrow={true}>
            <Box 
              p={4} 
              borderRadius="md" 
              boxShadow="sm" 
              bg="white"
              borderWidth="1px"
              borderColor="gray.200"
            >
              <Text fontWeight="medium" mb={2}>{'LPMS'}</Text>
              <Flex align="center" justify="space-between" mb={2}>
                <Flex align="center">
                  <Icon as={FiInbox} color="green.500" mr={1} />
                  <Text fontSize="sm">Incoming</Text>
                </Flex>
                <Text fontWeight="bold">{sectionPerformance.lpmsIncoming}</Text>
              </Flex>
              <Flex align="center" justify="space-between">
                <Flex align="center">
                  <Icon as={FiClock} color="yellow.500" mr={1} />
                  <Text fontSize="sm">Pending</Text>
                </Flex>
                <Text fontWeight="bold">{sectionPerformance.lpmsPending}</Text>
              </Flex>
            </Box>
            </Tooltip>

            {/* ANMS SECTION */}
            <Tooltip label="Agricultural Nursery Management Section" fontSize="sm" placement="top" hasArrow={true}>
            <Box 
              p={4} 
              borderRadius="md" 
              boxShadow="sm" 
              bg="white"
              borderWidth="1px"
              borderColor="gray.200"
            >
              <Text fontWeight="medium" mb={2}>{'ANMS'}</Text>
              <Flex align="center" justify="space-between" mb={2}>
                <Flex align="center">
                  <Icon as={FiInbox} color="green.500" mr={1} />
                  <Text fontSize="sm">Incoming</Text>
                </Flex>
                <Text fontWeight="bold">{sectionPerformance.anmsIncoming}</Text>
              </Flex>
              <Flex align="center" justify="space-between">
                <Flex align="center">
                  <Icon as={FiClock} color="yellow.500" mr={1} />
                  <Text fontSize="sm">Pending</Text>
                </Flex>
                <Text fontWeight="bold">{sectionPerformance.anmsPending}</Text>
              </Flex>
            </Box>
            </Tooltip>

            {/* RTSS SECTION */}
            <Tooltip label="Research and Technical Services Section" fontSize="sm" placement="top" hasArrow={true}>
            <Box 
              p={4} 
              borderRadius="md" 
              boxShadow="sm" 
              bg="white"
              borderWidth="1px"
              borderColor="gray.200"
            >
              <Text fontWeight="medium" mb={2}>{'RTSS'}</Text>
              <Flex align="center" justify="space-between" mb={2}>
                <Flex align="center">
                  <Icon as={FiInbox} color="green.500" mr={1} />
                  <Text fontSize="sm">Incoming</Text>
                </Flex>
                <Text fontWeight="bold">{sectionPerformance.rtssIncoming}</Text>
              </Flex>
              <Flex align="center" justify="space-between">
                <Flex align="center">
                  <Icon as={FiClock} color="yellow.500" mr={1} />
                  <Text fontSize="sm">Pending</Text>
                </Flex>
                <Text fontWeight="bold">{sectionPerformance.rtssPending}</Text>
              </Flex>
            </Box>
            </Tooltip>

        </SimpleGrid>
      </Box>
      
      <Modal isOpen={isOpen} onClose={onClose} scrollBehavior='inside' isCentered motionPreset='none' closeOnOverlayClick={false} size='2xl'>
          <ModalOverlay />
          <ModalContent borderRadius="md" overflow="hidden" boxShadow="lg">
            <ModalHeader bg="blue.50" borderBottomWidth="1px" borderColor="gray.200" display="flex" alignItems="center" py={4}>
              <Icon as={HiMiniDocumentPlus} color="blue.500" mr={2} />
              Create New Document Type
              </ModalHeader>

            <ModalBody py={6}>

              <VStack spacing={6} align="stretch">
              <Box
                p={5} 
                borderRadius="md" 
                borderWidth="1px" 
                borderColor="gray.200" 
                bg="white"
                boxShadow="sm"
              >
                <Heading as="h3" size="md" mb={4} color="blue.600" fontWeight="600">
                  <HStack>
                    <Icon as={HiInformationCircle} boxSize="25px"/>
                    <Text>Document Information</Text>
                  </HStack>
                </Heading>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl isRequired isInvalid={formErrors.documentName}>
                    <FormLabel fontWeight="medium">Document Name</FormLabel>
                    <Input
                      name='documentName'
                      type='text'
                      placeholder="Enter document name"
                      value={formData.documentName}
                      onChange={handleInputChange}
                      borderColor='gray.300'
                      _focus={{ borderColor: "blue.400" }}

                    />
                    {formErrors.documentName && (
                      <FormErrorMessage>{formErrors.documentName}</FormErrorMessage>
                    )}
                  </FormControl>

                  <FormControl isRequired isInvalid={formErrors.documentCode}>
                    <FormLabel fontWeight="medium">Document Code</FormLabel>
                    <Input
                      name='documentCode'
                      type='text'
                      placeholder="Enter document code"
                      value={formData.documentCode}
                      onChange={(e) => setFormData({ ...formData, documentCode: e.target.value.toUpperCase()})}
                      borderColor='gray.300'
                      _focus={{ borderColor: "blue.400" }}

                    />
                    {formErrors.documentCode && (
                      <FormErrorMessage>{formErrors.documentCode}</FormErrorMessage>
                    )}
                  </FormControl>
                </SimpleGrid>

              </Box>

              <Box
                p={5} 
                borderRadius="md" 
                borderWidth="1px" 
                borderColor="gray.200" 
                bg="white"
                boxShadow="sm"
              >
                <Heading as="h3" size="md" mb={4} color="blue.600" fontWeight="600">
                  <HStack>
                    <Icon as={FaArchive}/>
                    <Text>Archival Details</Text>
                  </HStack>
                </Heading>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>

                  <FormControl isRequired isInvalid={formErrors.retentionPeriod}>
                    <FormLabel fontWeight="medium">Retention Period</FormLabel>
                    <Select
                      name='retentionPeriod'
                      value={formData.retentionPeriod}
                      onChange={handleInputChange}
                    >
                      <option value={1} >1 Month</option>
                      <option value={12}>1 Year</option>
                      <option value={24}>2 Years</option>
                      <option value={36}>3 Years</option>
                      <option value={48}>4 Years</option>
                      <option value={60}>5 Years</option>
                      <option value='permanent'>PERMANENT</option>
                    </Select>
                    {formErrors.retentionPeriod && (
                      <FormErrorMessage>{formErrors.retentionPeriod}</FormErrorMessage>
                    )}
                  </FormControl>
                  
                  {!isPermanent && (
                    <FormControl isRequired isInvalid={formErrors.disposalMethod}>
                      <FormLabel fontWeight="medium">Disposal Method</FormLabel>
                      <Input
                        name='disposalMethod'
                        type='text'
                        placeholder="Enter disposal method"
                        value={formData.disposalMethod}
                        onChange={(e) => setFormData({ ...formData, disposalMethod: e.target.value.toLowerCase()})}
                        borderColor='gray.300'
                        _focus={{ borderColor: "blue.400" }}

                      />
                      {formErrors.disposalMethod && (
                        <FormErrorMessage>{formErrors.disposalMethod}</FormErrorMessage>
                      )}
                    </FormControl>
                    
                  )}
                  

                </SimpleGrid>

              </Box>
              </VStack>

            </ModalBody>

            <ModalFooter bg="gray.50" borderTopWidth="1px" borderColor="gray.200" py={4}>
              <Button 
                variant="outline" 
                mr={3} 
                onClick={handleCloseModal}
                size="md"
                _hover={{ bg: "gray.100" }}
              >
                Cancel
              </Button>

              <Button 
                colorScheme='blue'
                size="md"
                fontWeight="500"
                boxShadow="sm"
                _hover={{ boxShadow: "md", bg: "blue.600" }}
                onClick={handleCreateDocumentType}
                isDisabled={!formData.documentName || !formData.documentCode || (!isPermanent && !formData.retentionPeriod) || (!isPermanent && !formData.disposalMethod) }
                isLoading={isCreatingDocument}
              >
                Create Document Type
              </Button>
            </ModalFooter>
          </ModalContent>
      </Modal>

      <Modal isOpen={isOpenEditDocTypes} onClose={onCloseEditDocTypes} scrollBehavior='inside' isCentered motionPreset='none' closeOnOverlayClick={false} size='2xl'>
          <ModalOverlay />
          <ModalContent borderRadius="md" overflow="hidden" boxShadow="lg">
            <ModalHeader bg="blue.50" borderBottomWidth="1px" borderColor="gray.200" display="flex" alignItems="center" py={4}>
              <Icon as={HiMiniDocumentPlus} color="blue.500" mr={2} />
              Update Document Type
              </ModalHeader>

            <ModalBody py={6}>

              <VStack spacing={6} align="stretch">
              <Box
                p={5} 
                borderRadius="md" 
                borderWidth="1px" 
                borderColor="gray.200" 
                bg="white"
                boxShadow="sm"
              >
                <FormControl>
                  <FormLabel fontWeight="medium" >Select Document Type to Edit</FormLabel>
                  <Select
                    value={selectedDocId}
                    onChange={handleSelectDocumentForEdit}
                    isDisabled={isLoadingDocumentTypes || !documentTypes}
                  >
                    <option value="">Select a document type</option>
                    {isLoadingDocumentTypes ? (
                      <option value="">Loading available document types...</option>
                    ) : documentTypes && documentTypes.length > 0 ? (
                      documentTypes.map((type) => (
                        <option key={type._id} value={type._id}>
                          {`(${type.documentCode}) ${type.documentName}`}
                        </option>
                      ))
                    ) : (
                      <option>No document types available...</option>
                    )}
            
                    {documentTypesError && (
                      <option>Error loadinng document types...</option>
                    )}
                  </Select>
                </FormControl>
              </Box>
              <Box
                p={5} 
                borderRadius="md" 
                borderWidth="1px" 
                borderColor="gray.200" 
                bg="white"
                boxShadow="sm"
              >
                <Heading as="h3" size="md" mb={4} color="blue.600" fontWeight="600">
                  <HStack>
                    <Icon as={HiInformationCircle} boxSize="25px"/>
                    <Text>Document Information</Text>
                  </HStack>
                </Heading>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl isRequired isInvalid={editFormErrors.documentName}>
                    <FormLabel fontWeight="medium">Document Name</FormLabel>
                    <Input
                      name='documentName'
                      type='text'
                      placeholder=' '
                      value={editFormData.documentName}
                      onChange={handleEditInputChange}
                      borderColor='gray.300'
                      _focus={{ borderColor: "blue.400" }}
                      isDisabled={!selectedDocId}

                    />
                    {editFormErrors.documentName && (
                      <FormErrorMessage>{editFormErrors.documentName}</FormErrorMessage>
                    )}
                  </FormControl>

                  <FormControl isRequired isInvalid={editFormErrors.documentCode}>
                    <FormLabel fontWeight="medium">Document Code</FormLabel>
                    <Input
                      name='documentCode'
                      type='text'
                      placeholder=' '
                      value={editFormData.documentCode}
                      onChange={(e) => setEditFormData({...editFormData, documentCode: e.target.value.toUpperCase()})}
                      borderColor='gray.300'
                      _focus={{ borderColor: "blue.400" }}
                      isDisabled={!selectedDocId}

                    />
                    {editFormErrors.documentCode && (
                      <FormErrorMessage>{editFormErrors.documentCode}</FormErrorMessage>
                    )}
                  </FormControl>
                </SimpleGrid>

              </Box>

              <Box
                p={5} 
                borderRadius="md" 
                borderWidth="1px" 
                borderColor="gray.200" 
                bg="white"
                boxShadow="sm"
              >
                <Heading as="h3" size="md" mb={4} color="blue.600" fontWeight="600">
                  <HStack>
                    <Icon as={FaArchive}/>
                    <Text>Archival Details</Text>
                  </HStack>
                </Heading>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>

                  <FormControl isRequired isInvalid={editFormErrors.retentionPeriod}>
                    <FormLabel fontWeight="medium">Retention Period</FormLabel>
                    {!selectedDocId && (
                      <Select
                        isDisabled={!selectedDocId}
                      >
                      </Select>
                    )}

                    {selectedDocId && (
                      <Select
                        name='retentionPeriod'
                        placeholder=''
                        value={editFormData.retentionPeriod}
                        onChange={handleEditInputChange}
                        
                      >
                        <option value={1}>1 Month</option>
                        <option value={12}>1 Year</option>
                        <option value={24}>2 Years</option>
                        <option value={36}>3 Years</option>
                        <option value={48}>4 Years</option>
                        <option value={60}>5 Years</option>
                        <option value='permanent'>PERMANENT</option>
                      </Select>
                    )}
                    
                    {editFormErrors.retentionPeriod && (
                      <FormErrorMessage>{editFormErrors.retentionPeriod}</FormErrorMessage>
                    )}
                  </FormControl>
                  
                  {!isEditPermanent && (
                    <FormControl isRequired isInvalid={editFormErrors.disposalMethod}>
                      <FormLabel fontWeight="medium">Disposal Method</FormLabel>
                      <Input
                        name='disposalMethod'
                        type='text'
                        placeholder=' '
                        value={editFormData.disposalMethod}
                        onChange={handleEditInputChange}
                        borderColor='gray.300'
                        _focus={{ borderColor: "blue.400" }}
                        isDisabled={!selectedDocId}
                      />
                      {editFormErrors.disposalMethod && (
                        <FormErrorMessage>{editFormErrors.disposalMethod}</FormErrorMessage>
                      )}
                    </FormControl>
                    
                  )}
                  

                </SimpleGrid>

              </Box>
              </VStack>

            </ModalBody>

            <ModalFooter bg="gray.50" borderTopWidth="1px" borderColor="gray.200" py={4}>
              <Button 
                variant="outline" 
                mr={3} 
                onClick={handleCloseModal}
                size="md"
                _hover={{ bg: "gray.100" }}
              >
                Cancel
              </Button>

              <Button 
                colorScheme='blue'
                size="md"
                fontWeight="500"
                boxShadow="sm"
                _hover={{ boxShadow: "md", bg: "blue.600" }}
                onClick={handleEditDocumentType}
                isDisabled={!selectedDocId || isUpdatingDocumentType || !hasEditFormChanged || (!isEditPermanent && !editFormData.retentionPeriod) || (!isEditPermanent && !editFormData.disposalMethod)}
                isLoading={isUpdatingDocumentType}
              >
                Update Document Type
              </Button>
            </ModalFooter>
          </ModalContent>
      </Modal>
    </Box>
  );
};

export default A_Dashboard;
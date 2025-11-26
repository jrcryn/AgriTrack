import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Flex,
  InputGroup,
  Input,
  InputRightElement,
  Button,
  Icon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  FormControl,
  FormLabel,
  Center,
  Spinner,
  TableContainer,
  Alert,
  AlertIcon,
  Tag,
  Tooltip,
  HStack,
  useToast,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Stack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Select,
  Switch,
  Divider,
  VStack,
  Badge,
  IconButton,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react';
import { FiSearch, FiInbox, FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import { FaUserCog, FaUserSlash, FaUserCheck, FaInfo, FaClipboardList, FaIdCard } from 'react-icons/fa';
import { GoAlertFill } from 'react-icons/go';
import { useAdminDashboard } from '../store/adminDashboard.store';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../auth/store/authStore';

const Operators = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [operatorAccountsPage, setOperatorAccountsPage] = useState(1);
  const [selectedOperator, setSelectedOperator] = useState(null);
  console.log("Selected Operator License: ", selectedOperator?.operatorLicense);
  const [licenseFormData, setLicenseFormData] = useState({
    licenseNumber: '',
    licenseType: '',
    issuedDate: '',
    expiryDate: '',
    allowedMachineryTypes: [],
    issuedBy: '',
    notes: '',
  });
  const [editingLicenseId, setEditingLicenseId] = useState(null);
  const [accordionIndex, setAccordionIndex] = useState([]);
  const [selectedLicenseForRemoval, setSelectedLicenseForRemoval] = useState(null);
  
  const toast = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isOpenRemoveModal, onOpen: onOpenRemoveModal, onClose: onCloseRemoveModal } = useDisclosure();

  const {
    operatorAccounts,
    isLoadingOperatorAccounts,
    operatorAccountsError,
    operatorAssignedNumbers,
    isLoadingOperatorAssignedNumbers,
    operatorAssignedNumbersError,
    machineTypes,
    isLoadingMachineTypes,

    enableOperatorAccount,
    disableOperatorAccount,
    isEnablingDisablingOperatorAccount,
    setEmployeeLeaveStatus,
    isSettingEmployeeLeaveStatus,
    addOperatorLicense,
    updateOperatorLicense,
    removeOperatorLicense,
    isAddingOperatorLicense,
    isUpdatingOperatorLicense,
    isRemovingOperatorLicense,
  } = useAdminDashboard(
    { operatorAccountsPage },
    { searchQuery }
  );

  // Reset to page 1 when search query changes
  useEffect(() => {
    setOperatorAccountsPage(1);
  }, [searchQuery]);

  const operatorAccountsList = operatorAccounts?.data?.operators || [];
  const operatorAccountsTotalPages = operatorAccounts?.data?.totalPages || 1;
  const operatorAccountsCurrentPage = operatorAccounts?.data?.currentPage || 1;
  const operatorAccountsTotalItems = operatorAccounts?.data?.totalCount || 0;

  // Calculate operator statistics
  const totalOperators = operatorAccountsTotalItems;
  const activeOperators = operatorAccountsList.filter(op => op.isOperatorDisabled === false).length;
  const disabledOperators = operatorAccountsList.filter(op => op.isOperatorDisabled === true).length;
  const totalActiveAssignments = operatorAssignedNumbers?.data?.totalActiveAssignments || 0;
  const operatorsWithAssignments = operatorAssignedNumbers?.data?.totalOperators || 0;
  
  // Check if search filter is active
  const hasSearchFilter = searchQuery && searchQuery.trim() !== '';

  const PaginationControls = ({ currentPage, setCurrentPage, totalPages, totalItems, colorScheme }) => (
    <Flex
      justifyContent="space-between"
      mt={4}
      alignItems="center"
      direction={{ base: "column", md: "row" }}
      gap={{ base: 3, md: 0 }}
      width={"100%"}
    >
      <Text color="gray.600" fontSize="md">
        Page {currentPage} of {totalPages || 1} ({totalItems} total)
      </Text>
      <Flex>
        <Button
          size="sm"
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          isDisabled={currentPage === 1}
          colorScheme={colorScheme}
          variant="outline"
          mr={2}
        >
          Previous
        </Button>
        <Button
          size="sm"
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          isDisabled={currentPage >= totalPages}
          colorScheme={colorScheme}
          variant="outline"
        >
          Next
        </Button>
      </Flex>
    </Flex>
  );

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (isActive) => {
    return isActive ? 'green' : 'red';
  };

  const getStatusText = (isActive) => {
    return isActive ? 'Active' : 'Disabled';
  };

  const handleEnableOperator = async (operatorId) => {
    try {
      await enableOperatorAccount( {operatorId: operatorId, employeeId: user.id} );
      
      toast({
        title: "Success",
        description: "Operator account has been enabled",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Refetch operator accounts
      await queryClient.invalidateQueries({ queryKey: ['operatorAccounts'] });
    } catch (error) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || error?.message || "Failed to enable operator account",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDisableOperator = async (operatorId) => {
    try {
      await disableOperatorAccount( {operatorId: operatorId, employeeId: user.id} );
      
      toast({
        title: "Success",
        description: "Operator account has been disabled",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Refetch operator accounts
      await queryClient.invalidateQueries({ queryKey: ['operatorAccounts'] });
    } catch (error) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || error?.message || "Failed to disable operator account",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleOpenModal = (operator) => {
    setSelectedOperator(operator);
    onOpen();
  };

  const handleCloseModal = () => {
    setSelectedOperator(null);
    setEditingLicenseId(null);
    setLicenseFormData({
      licenseNumber: '',
      licenseType: '',
      issuedDate: '',
      expiryDate: '',
      allowedMachineryTypes: [],
      issuedBy: '',
      notes: '',
    });
    onClose();
  };

  const handleEnableDisableInModal = async () => {
    if (!selectedOperator) return;
    
    try {
      if (selectedOperator.isOperatorDisabled === false) {
        await disableOperatorAccount({ operatorId: selectedOperator._id, employeeId: user.id });
        toast({
          title: "Success",
          description: "Operator account has been disabled",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        await enableOperatorAccount({ operatorId: selectedOperator._id, employeeId: user.id });
        toast({
          title: "Success",
          description: "Operator account has been enabled",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }

      await queryClient.invalidateQueries({ queryKey: ['operatorAccounts'] });
      // Update selected operator state
      const updatedOperator = operatorAccountsList.find(op => op._id === selectedOperator._id);
      if (updatedOperator) {
        setSelectedOperator(updatedOperator);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || error?.message || "Failed to update operator status",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleLeaveStatusChange = async (isInLeave) => {
    if (!selectedOperator) return;
    
    try {
      await setEmployeeLeaveStatus({ employeeId: selectedOperator._id, isInLeave });
      
      toast({
        title: "Success",
        description: `Operator leave status has been ${isInLeave ? 'set to on leave' : 'removed from leave'}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      await queryClient.invalidateQueries({ queryKey: ['operatorAccounts'] });
      // Update selected operator state
      const updatedOperator = operatorAccountsList.find(op => op._id === selectedOperator._id);
      if (updatedOperator) {
        setSelectedOperator(updatedOperator);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || error?.message || "Failed to update leave status",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleAddLicense = async () => {
    if (!selectedOperator) return;

    const { licenseNumber, licenseType, issuedDate, expiryDate, allowedMachineryTypes, issuedBy, notes } = licenseFormData;

    if (!licenseNumber || !licenseType || !issuedDate || !expiryDate || allowedMachineryTypes.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      await addOperatorLicense({
        operatorId: selectedOperator._id,
        licenseNumber,
        licenseType,
        issuedDate,
        expiryDate,
        allowedMachineryTypes,
        issuedBy: issuedBy || undefined,
        notes: notes || undefined,
      });

      toast({
        title: "Success",
        description: "License added successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      await queryClient.invalidateQueries({ queryKey: ['operatorAccounts'] });
      
      // Reset form
      setLicenseFormData({
        licenseNumber: '',
        licenseType: '',
        issuedDate: '',
        expiryDate: '',
        allowedMachineryTypes: [],
        issuedBy: '',
        notes: '',
      });

      // Close accordion after successful addition
      setAccordionIndex([]);

      // Close modal after successful addition
      handleCloseModal();
    } catch (error) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || error?.message || "Failed to add license",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleEditLicense = (license) => {
    setEditingLicenseId(license._id);
    setAccordionIndex([0]); // Open accordion when editing
    
    // Handle date conversion - dates might be strings or Date objects
    const formatDateForInput = (date) => {
      if (!date) return '';
      const dateObj = date instanceof Date ? date : new Date(date);
      if (isNaN(dateObj.getTime())) return '';
      return dateObj.toISOString().split('T')[0];
    };

    // Ensure allowedMachineryTypes are strings (ObjectIds might need conversion)
    const formatMachineryTypes = (types) => {
      if (!types || !Array.isArray(types)) return [];
      return types.map(type => typeof type === 'object' && type._id ? type._id : String(type));
    };

    setLicenseFormData({
      licenseNumber: license.licenseNumber || '',
      licenseType: license.licenseType || '',
      issuedDate: formatDateForInput(license.issuedDate),
      expiryDate: formatDateForInput(license.expiryDate),
      allowedMachineryTypes: formatMachineryTypes(license.allowedMachineryTypes),
      issuedBy: license.issuedBy || '',
      notes: license.notes || '',
    });
  };

  const handleUpdateLicense = async () => {
    if (!selectedOperator || !editingLicenseId) return;

    const { licenseNumber, licenseType, issuedDate, expiryDate, allowedMachineryTypes, issuedBy, notes } = licenseFormData;

    if (!licenseNumber || !licenseType || !issuedDate || !expiryDate || allowedMachineryTypes.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      await updateOperatorLicense({
        operatorId: selectedOperator._id,
        licenseId: editingLicenseId,
        licenseNumber,
        licenseType,
        issuedDate,
        expiryDate,
        allowedMachineryTypes,
        issuedBy: issuedBy || undefined,
        notes: notes || undefined,
        isActive: true,
      });

      toast({
        title: "Success",
        description: "License updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      await queryClient.invalidateQueries({ queryKey: ['operatorAccounts'] });

      // Reset form
      setEditingLicenseId(null);
      setAccordionIndex([]); // Close accordion after successful update
      setLicenseFormData({
        licenseNumber: '',
        licenseType: '',
        issuedDate: '',
        expiryDate: '',
        allowedMachineryTypes: [],
        issuedBy: '',
        notes: '',
      });

      // Close modal after successful update
      handleCloseModal();
    } catch (error) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || error?.message || "Failed to update license",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleRemoveLicense = (licenseId) => {
    setSelectedLicenseForRemoval(licenseId);
    onOpenRemoveModal();
  };

  const handleConfirmRemoveLicense = async () => {
    //console.log(selectedOperator, selectedLicenseForRemoval); //walang license id for removal

    if (!selectedOperator || !selectedLicenseForRemoval) return;
    
    try {
      await removeOperatorLicense({
        operatorId: selectedOperator._id,
        licenseId: selectedLicenseForRemoval,
      });

      toast({
        title: "Success",
        description: "License removed successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      await queryClient.invalidateQueries({ queryKey: ['operatorAccounts'] });
      
      // Close modals after successful removal
      setSelectedLicenseForRemoval(null);
      onCloseRemoveModal();
      handleCloseModal();
    } catch (error) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || error?.message || "Failed to remove license",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setSelectedLicenseForRemoval(null);
      onCloseRemoveModal();
    }
  };

  const handleCancelEdit = () => {
    setEditingLicenseId(null);
    setAccordionIndex([]); // Close accordion when canceling edit
    setLicenseFormData({
      licenseNumber: '',
      licenseType: '',
      issuedDate: '',
      expiryDate: '',
      allowedMachineryTypes: [],
      issuedBy: '',
      notes: '',
    });
  };

  const toggleMachineryType = (typeId) => {
    setLicenseFormData(prev => {
      const currentTypes = prev.allowedMachineryTypes || [];
      const isSelected = currentTypes.includes(typeId);
      return {
        ...prev,
        allowedMachineryTypes: isSelected
          ? currentTypes.filter(id => id !== typeId)
          : [...currentTypes, typeId],
      };
    });
  };

  // Update selected operator when operatorAccountsList changes
  useEffect(() => {
    if (selectedOperator && operatorAccountsList.length > 0) {
      const updated = operatorAccountsList.find(op => op._id === selectedOperator._id);
      if (updated) {
        setSelectedOperator(updated);
      }
    }
  }, [operatorAccountsList]);

  return (
    <Box overflow="hidden" bg="white" p={5} minH="100vh">
      <Heading as="h1" size="xl" mb={2}>
        Operator Accounts
      </Heading>
      <Text color="gray.600" mb={5}>
        Manage operator accounts and their access to complete tickets.
      </Text>

      {/* Operator Statistics Cards */}
      <Box mb={8}>
        <Flex
          justify="space-between"
          align="center"
          mb={4}
          bg="teal.50"
          p={3}
          borderRadius="md"
          borderLeftWidth="4px"
          borderLeftColor="teal.500"
        >
          <Heading as="h2" size="md" display="flex" alignItems="center">
            <Icon as={FaInfo} mr={2} color="teal.600" /> OPERATOR STATISTICS
          </Heading>
        </Flex>

        {/* Error Alert for Operator Statistics */}
        {operatorAssignedNumbersError && (
          <Alert status="error" mb={4} borderRadius="md">
            <AlertIcon />
            <Box>
              <Text fontWeight="medium">Error loading operator statistics</Text>
              <Text fontSize="sm">
                {operatorAssignedNumbersError?.response?.data?.message ||
                  operatorAssignedNumbersError?.message ||
                  "An error occurred while fetching operator statistics."}
              </Text>
            </Box>
          </Alert>
        )}

        <Stack direction={{ base: "column", md: "row" }} spacing={4} w="full">
          {/* Total Operators */}
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
                <Icon as={FaUserCog} mr={2} color="teal.500" /> Total Operators
              </StatLabel>
              {isLoadingOperatorAccounts ? (
                <Center h="65px">
                  <Spinner size="lg" thickness="3px" color="teal.500" />
                </Center>
              ) : (
                <StatNumber fontSize="4xl">{totalOperators}</StatNumber>
              )}
              <StatHelpText>All registered operators</StatHelpText>
            </Stat>
          </Box>

          {/* Active Operators */}
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
                <Icon as={FaUserCheck} mr={2} color="green.500" /> Active Operators
              </StatLabel>
              {isLoadingOperatorAccounts ? (
                <Center h="65px">
                  <Spinner size="lg" thickness="3px" color="green.500" />
                </Center>
              ) : (
                <StatNumber fontSize="4xl">{activeOperators}</StatNumber>
              )}
              <StatHelpText>
                {hasSearchFilter ? 'From current view' : 'Currently enabled'}
              </StatHelpText>
            </Stat>
          </Box>

          {/* Disabled Operators */}
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
                <Icon as={FaUserSlash} mr={2} color="red.500" /> Disabled Operators
              </StatLabel>
              {isLoadingOperatorAccounts ? (
                <Center h="65px">
                  <Spinner size="lg" thickness="3px" color="red.500" />
                </Center>
              ) : (
                <StatNumber fontSize="4xl">{disabledOperators}</StatNumber>
              )}
              <StatHelpText>
                {hasSearchFilter ? 'From current view' : 'Currently disabled'}
              </StatHelpText>
            </Stat>
          </Box>

          {/* Total Active Assignments */}
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
                <Icon as={FaClipboardList} mr={2} color="blue.500" /> Active Assignments
              </StatLabel>
              {isLoadingOperatorAssignedNumbers ? (
                <Center h="65px">
                  <Spinner size="lg" thickness="3px" color="blue.500" />
                </Center>
              ) : (
                <StatNumber fontSize="4xl">{totalActiveAssignments}</StatNumber>
              )}
              <StatHelpText>{operatorsWithAssignments} operators assigned</StatHelpText>
            </Stat>
          </Box>
        </Stack>
      </Box>

      {/* Filter Section */}
      <Flex direction="column" mb={6} gap={4} p={4} bg="teal.50" borderRadius="md" boxShadow="sm">
        <Flex direction={{ base: "column", md: "row" }} gap={4} alignItems={{ base: "stretch", md: "flex-end" }}>
          {/* Search */}
          <FormControl flex="1">
            <FormLabel fontSize="sm" fontWeight="medium" display="flex" alignItems="center" gap={2}>
              <Icon as={FiSearch} color="teal.500" /> Search
            </FormLabel>
            <InputGroup>
              <Input
                placeholder="Search by name, username, or ID..."
                value={searchQuery}
                type="text"
                onChange={(e) => setSearchQuery(e.target.value)}
                bg="white"
                _focus={{ borderColor: "teal.400" }}
              />
              <InputRightElement>
                <Icon as={FiSearch} boxSize={5} />
              </InputRightElement>
            </InputGroup>
          </FormControl>
        </Flex>
      </Flex>

      {/* Operator Accounts Section */}
      <Box mb={8}>
        <Flex 
          justify="space-between" 
          align="center" 
          mb={4} 
          bg={'teal.50'} 
          p={3} 
          borderRadius="md" 
          borderLeftWidth="4px" 
          borderLeftColor={'teal.500'}
        >
          <Heading as="h2" size="md" display="flex" alignItems="center">
            <Icon as={FaUserCog} mr={2} color={'teal.500'} /> OPERATOR ACCOUNTS
          </Heading>
        </Flex>

        {/* Error Alert */}
        {operatorAccountsError && (
          <Alert status="error" mb={4} borderRadius="md">
            <AlertIcon />
            <Box>
              <Text fontWeight="medium">Error loading operator accounts</Text>
              <Text fontSize="sm">
                {operatorAccountsError?.response?.data?.message ||
                  operatorAccountsError?.message ||
                  "An error occurred while fetching operator accounts."}
              </Text>
            </Box>
          </Alert>
        )}

        {isLoadingOperatorAccounts ? (
          <Center p={10}>
            <Spinner size="lg" color={'teal.500'} />
          </Center>
        ) : operatorAccountsList.length > 0 ? (
          <Box overflowX="auto">
            <TableContainer>
              <Table variant="simple" size="md">
                <Thead bg="gray.50">
                  <Tr>
                    <Th>Name</Th>
                    <Th>Email</Th>
                    <Th>Phone</Th>
                    <Th>Status</Th>
                    <Th>Leave Status</Th>
                    <Th>Last Login</Th>
                    <Th>Date Created</Th>
                    <Th
                      position={{ base: 'static', md: 'sticky' }}
                      right={0}
                      bg="gray.50"
                      zIndex={{ base: 0, md: 1 }}
                      textAlign="center"
                      width="150px"
                    >
                      <Box display={{ base: 'none', md: 'block' }}>Scroll →</Box>
                      <Box display={{ base: 'block', md: 'none' }}>Actions</Box>
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {operatorAccountsList.map((operator) => {
                    const fullName = `${operator.first_name || ''} ${operator.middle_name || ''} ${operator.last_name || ''}`.trim();
                    return (
                      <Tr key={operator._id} fontSize="sm">
                        <Td fontWeight={'semibold'}>{fullName || '—'}</Td>
                        <Td>{operator.email || '—'}</Td>
                        <Td>{operator.phone || '—'}</Td>
                        <Td>
                          <Badge
                            colorScheme={getStatusColor(operator.isOperatorDisabled === false)}
                            size="sm"
                          >
                            {getStatusText(operator.isOperatorDisabled === false)}
                          </Badge>
                        </Td>
                        <Td>
                          <Badge
                            colorScheme={operator.isInLeave ? 'orange' : 'purple'}
                            size="sm"
                          >
                            {operator.isInLeave ? 'On Leave' : 'Not On Leave'}
                          </Badge>
                        </Td>
                        <Td>{formatDate(operator.lastLogin)}</Td>
                        <Td>{formatDate(operator.createdAt)}</Td>
                        <Td
                          isNumeric
                          position={{ base: 'static', md: 'sticky' }}
                          right={0}
                          zIndex={1}
                          bg="white"
                        >
                          <HStack spacing={2} justify="flex-end">
                            <Button
                              size="xs"
                              colorScheme='teal'
                              leftIcon={<FaUserCog />}
                              onClick={() => handleOpenModal(operator)}
                            >
                              Manage
                            </Button>
                          </HStack>
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </TableContainer>
          </Box>
        ) : (
          <Center
            p={10}
            borderWidth="1px"
            borderRadius="md"
            borderStyle="dashed"
            borderColor="gray.300"
            flexDirection="column"
            gap={3}
          >
            <Icon as={FiInbox} boxSize={10} color="gray.400" />
            <Text color="gray.500" fontWeight="medium">
              No operator accounts found
            </Text>
            <Text fontSize="sm" color="gray.400">
              Try adjusting your search or check back later.
            </Text>
          </Center>
        )}

        <Flex justifyContent="space-between" alignItems="center" mt={4}>
          <PaginationControls
            currentPage={operatorAccountsCurrentPage}
            setCurrentPage={setOperatorAccountsPage}
            totalPages={operatorAccountsTotalPages}
            totalItems={operatorAccountsTotalItems}
            colorScheme='teal'
          />
        </Flex>
      </Box>

      {/* Operator Management Modal */}
      <Modal 
        isOpen={isOpen} 
        onClose={handleCloseModal} 
        size="xl"
        closeOnOverlayClick={false}
        scrollBehavior="inside" 
        isCentered
        motionPreset="none"
        blockScrollOnMount={false}
      >
        <ModalOverlay />
        <ModalContent 
          borderRadius="md" 
          overflow="hidden" 
          minH="600px"
          maxH="90vh"
        >
          <ModalHeader 
            bg="teal.50" 
            borderBottomWidth="1px" 
            borderColor="gray.200" 
            display="flex" 
            alignItems="center"
            py={4}
          >
            <Icon as={FaUserCog} mr={2} color="teal.500" />
            Manage Operator: {selectedOperator ? `${selectedOperator.first_name || ''} ${selectedOperator.last_name || ''}`.trim() : ''}
          </ModalHeader>
          <ModalBody 
            py={6}
            display="flex" 
            flexDirection="column"
          >
            {selectedOperator && (
              <Tabs colorScheme="teal" variant="enclosed" display="flex" flexDirection="column" flex={1}>
                <TabList>
                  <Tab>Account Status</Tab>
                  <Tab>Leave Status</Tab>
                  <Tab>Licenses</Tab>
                </TabList>

                <TabPanels flex={1} minH="400px">
                  {/* Account Status Tab */}
                  <TabPanel px={0} pt={4} pb={0}>
                    <VStack spacing={4} align="stretch">
                      <Box p={4} bg="gray.50" borderRadius="md">
                        <Text fontWeight="semibold" mb={2}>Current Status</Text>
                        <Tag
                          colorScheme={selectedOperator.isOperatorDisabled === false ? 'green' : 'red'}
                          size="lg"
                          mb={4}
                        >
                          {selectedOperator.isOperatorDisabled === false ? 'Active' : 'Disabled'}
                        </Tag>
                        <Text fontSize="sm" color="gray.600" mb={4}>
                          {selectedOperator.isOperatorDisabled === false
                            ? 'This operator account is currently active and can complete tickets.'
                            : 'This operator account is disabled and cannot complete tickets.'}
                        </Text>
                        <Button
                          colorScheme={selectedOperator.isOperatorDisabled === false ? 'red' : 'green'}
                          leftIcon={selectedOperator.isOperatorDisabled === false ? <FaUserSlash /> : <FaUserCheck />}
                          onClick={async () => {
                            await handleEnableDisableInModal();
                            handleCloseModal();
                          }}
                          isLoading={isEnablingDisablingOperatorAccount}
                          isDisabled={isEnablingDisablingOperatorAccount}
                          width="full"
                          size="sm"
                        >
                          {selectedOperator.isOperatorDisabled === false ? 'Disable Account' : 'Enable Account'}
                        </Button>
                      </Box>
                    </VStack>
                  </TabPanel>

                  {/* Leave Status Tab */}
                  <TabPanel px={0} pt={4} pb={0}>
                    <VStack spacing={4} align="stretch">
                      <Box p={4} bg="gray.50" borderRadius="md">
                        <Flex justify="space-between" align="center">
                          <Box>
                            <Text fontWeight="semibold" mb={1}>Leave Status</Text>
                            <Text fontSize="sm" color="gray.600">
                              {selectedOperator.isInLeave
                                ? 'Operator is currently on leave'
                                : 'Operator is not on leave'}
                            </Text>
                          </Box>
                            {isSettingEmployeeLeaveStatus ? (
                            <Center>
                              <Spinner size="sm" color="orange.500" />
                            </Center>
                          ) : (
                            <Switch
                            isChecked={selectedOperator.isInLeave || false}
                            onChange={async (e) => {
                              await handleLeaveStatusChange(e.target.checked);
                              handleCloseModal();
                            }}
                            colorScheme="orange"
                            size="md"
                            isDisabled={isSettingEmployeeLeaveStatus}
                            />
                          )}
                        </Flex>
                      </Box>
                    </VStack>
                  </TabPanel>

                  {/* Licenses Tab */}
                  <TabPanel px={0} pt={4} pb={0}>
                    <VStack spacing={4} align="stretch">
                      {/* Existing Licenses List - Show First */}
                      <Box>
                        <Heading size="sm" mb={4} display="flex" alignItems="center" gap={2}>
                          <Icon as={FaIdCard} />
                          Existing Licenses ({selectedOperator.operatorLicenses?.length || 0})
                        </Heading>
                        {selectedOperator.operatorLicenses && selectedOperator.operatorLicenses.length > 0 ? (
                          <VStack spacing={3} align="stretch">
                            {selectedOperator.operatorLicenses.map((license) => (
                              <Box
                                key={license._id}
                                p={4}
                                bg="white"
                                borderRadius="md"
                                borderWidth="1px"
                                borderColor="gray.200"
                              >
                                <Flex justify="space-between" align="start" mb={2}>
                                  <Box flex={1}>
                                    <Flex align="center" gap={2} mb={2}>
                                      <Text fontWeight="semibold" fontSize="sm">{license.licenseNumber}</Text>
                                      <Badge colorScheme={license.isActive ? 'green' : 'gray'} fontSize="xs">
                                        {license.isActive ? 'Active' : 'Inactive'}
                                      </Badge>
                                    </Flex>
                                    <Text fontSize="sm" color="gray.600" mb={1}>
                                      Type: {license.licenseType}
                                    </Text>
                                    <Text fontSize="sm" color="gray.600" mb={1}>
                                      Issued: {formatDate(license.issuedDate)} | Expires: {formatDate(license.expiryDate)}
                                    </Text>
                                    {license.issuedBy && (
                                      <Text fontSize="sm" color="gray.600" mb={1}>
                                        Issued by: {license.issuedBy}
                                      </Text>
                                    )}
                                    {license.notes && (
                                      <Text fontSize="sm" color="gray.600" mb={1}>
                                        Notes: {license.notes}
                                      </Text>
                                    )}
                                    {license.allowedMachineryTypes && license.allowedMachineryTypes.length > 0 && (
                                      <Box mt={2}>
                                        <Text fontSize="xs" fontWeight="semibold" color="gray.700" mb={1}>
                                          Allowed Machinery Types:
                                        </Text>
                                        <Flex wrap="wrap" gap={1}>
                                          {license.allowedMachineryTypes.map((typeId, idx) => {
                                            // Handle ObjectId conversion - ensure both are strings for comparison
                                            const typeIdStr = typeof typeId === 'object' && typeId._id ? typeId._id : String(typeId);
                                            const type = machineTypes?.data?.find(t => String(t._id) === typeIdStr);
                                            return type ? (
                                              <Badge key={idx} colorScheme="blue" fontSize="xs">
                                                {type.equipmentType}
                                              </Badge>
                                            ) : null;
                                          })}
                                        </Flex>
                                      </Box>
                                    )}
                                  </Box>
                                  <HStack spacing={2}>
                                    <IconButton
                                      icon={<FiEdit2 />}
                                      size="sm"
                                      colorScheme="blue"
                                      variant="ghost"
                                      onClick={() => handleEditLicense(license)}
                                      aria-label="Edit license"
                                    />
                                    <IconButton
                                      icon={<FiTrash2 />}
                                      size="sm"
                                      colorScheme="red"
                                      variant="ghost"
                                      onClick={() => handleRemoveLicense(license._id)}
                                      isLoading={isRemovingOperatorLicense}
                                      isDisabled={isRemovingOperatorLicense}
                                      aria-label="Remove license"
                                    />
                                  </HStack>
                                </Flex>
                              </Box>
                            ))}
                          </VStack>
                        ) : (
                          <Center p={8} borderWidth="1px" borderStyle="dashed" borderRadius="md" borderColor="gray.300">
                            <VStack>
                              <Icon as={FaIdCard} boxSize={8} color="gray.400" />
                              <Text color="gray.500" fontSize="sm">
                                No licenses added yet
                              </Text>
                            </VStack>
                          </Center>
                        )}
                      </Box>

                      <Divider />

                      {/* Add/Edit License Form in Accordion */}
                      <Accordion 
                        allowToggle 
                        index={accordionIndex}
                        onChange={(index) => setAccordionIndex(Array.isArray(index) ? index : [index])}
                        borderWidth="1px"
                        borderRadius="md"
                        borderColor="teal.200"
                        bg="teal.50"
                      >
                        <AccordionItem border="none">
                          <AccordionButton 
                            py={4}
                            px={{ base: 3, md: 4 }}
                            _hover={{ bg: 'teal.100' }}
                            _expanded={{ bg: 'teal.100', borderBottomWidth: '1px', borderBottomColor: 'teal.200' }}
                          >
                            <Box flex="1" textAlign="left">
                              <Heading size="sm" display="flex" alignItems="center" gap={2}>
                                <Icon as={editingLicenseId ? FiEdit2 : FiPlus} />
                                {editingLicenseId ? 'Edit Existing License' : 'Add New License'}
                              </Heading>
                            </Box>
                            <AccordionIcon />
                          </AccordionButton>
                          <AccordionPanel pb={5} pt={5} px={{ base: 3, md: 4 }}>
                            <VStack spacing={3} align="stretch">
                          <FormControl isRequired>
                            <FormLabel fontSize="sm">License Number</FormLabel>
                            <Input
                              value={licenseFormData.licenseNumber}
                              onChange={(e) => setLicenseFormData({ ...licenseFormData, licenseNumber: e.target.value })}
                              bg="white"
                              placeholder="Enter license number"
                              size="sm"
                            />
                          </FormControl>

                          <FormControl isRequired>
                            <FormLabel fontSize="sm">License Type</FormLabel>
                            <Input
                              value={licenseFormData.licenseType}
                              onChange={(e) => setLicenseFormData({ ...licenseFormData, licenseType: e.target.value })}
                              bg="white"
                              placeholder="e.g., 4 Wheel Tractor, Rotovator"
                              size="sm"
                            />
                          </FormControl>

                          <Flex gap={3}>
                            <FormControl isRequired flex={1}>
                              <FormLabel fontSize="sm">Issued Date</FormLabel>
                              <Input
                                type="date"
                                value={licenseFormData.issuedDate}
                                onChange={(e) => setLicenseFormData({ ...licenseFormData, issuedDate: e.target.value })}
                                bg="white"
                                size="sm"
                              />
                            </FormControl>

                            <FormControl isRequired flex={1}>
                              <FormLabel fontSize="sm">Expiry Date</FormLabel>
                              <Input
                                type="date"
                                value={licenseFormData.expiryDate}
                                onChange={(e) => setLicenseFormData({ ...licenseFormData, expiryDate: e.target.value })}
                                bg="white"
                                size="sm"
                              />
                            </FormControl>
                          </Flex>

                          <FormControl isRequired>
                            <FormLabel fontSize="sm">Allowed Machinery Types</FormLabel>
                            {isLoadingMachineTypes ? (
                              <Center p={4}>
                                <Spinner size="sm" />
                              </Center>
                            ) : (
                              <Box
                                maxH="200px"
                                overflowY="auto"
                                p={2}
                                bg="white"
                                borderRadius="md"
                                borderWidth="1px"
                              >
                                {machineTypes?.data?.map((type) => (
                                  <Flex
                                    key={type._id}
                                    align="center"
                                    p={2}
                                    borderRadius="md"
                                    _hover={{ bg: 'gray.50' }}
                                    cursor="pointer"
                                    onClick={() => toggleMachineryType(type._id)}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={licenseFormData.allowedMachineryTypes?.includes(type._id) || false}
                                      onChange={() => toggleMachineryType(type._id)}
                                      style={{ marginRight: '8px' }}
                                    />
                                    <Text fontSize="sm">
                                      {type.equipmentType} - {type.ownerName}
                                    </Text>
                                  </Flex>
                                ))}
                              </Box>
                            )}
                            {licenseFormData.allowedMachineryTypes?.length > 0 && (
                              <Text fontSize="xs" color="gray.600" mt={1}>
                                {licenseFormData.allowedMachineryTypes.length} type(s) selected
                              </Text>
                            )}
                          </FormControl>        
                          <FormControl isRequired>
                            <FormLabel fontSize="sm">Issued By</FormLabel>
                            <Input
                              value={licenseFormData.issuedBy}
                              onChange={(e) => setLicenseFormData({ ...licenseFormData, issuedBy: e.target.value })}
                              bg="white"
                              placeholder="Issuing authority"
                              size="sm"
                            />
                          </FormControl>

                          <FormControl>
                            <FormLabel fontSize="sm">Notes</FormLabel>
                            <Input
                              value={licenseFormData.notes}
                              onChange={(e) => setLicenseFormData({ ...licenseFormData, notes: e.target.value })}
                              bg="white"
                              placeholder="Additional notes (optional)"
                              size="sm"
                            />
                          </FormControl>

                          <Flex gap={2} mt={4}> 
                            {editingLicenseId ? (
                              <>
                                <Button
                                  colorScheme="teal"
                                  onClick={handleUpdateLicense}
                                  isLoading={isUpdatingOperatorLicense}
                                  isDisabled={isUpdatingOperatorLicense}
                                  flex={1}
                                  size="sm"
                                >
                                  Update License Details
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={handleCancelEdit}
                                  isDisabled={isUpdatingOperatorLicense}
                                  size="sm"
                                >
                                  Cancel
                                </Button>
                              </>
                            ) : (
                              <Button
                                colorScheme="teal"
                                onClick={handleAddLicense}
                                isLoading={isAddingOperatorLicense}
                                isDisabled={isAddingOperatorLicense}
                                width="full"
                                leftIcon={<FiPlus />}
                                size="sm"
                                mt={5}
                              >
                                Add License
                              </Button>
                            )}
                          </Flex>
                            </VStack>
                          </AccordionPanel>
                        </AccordionItem>
                      </Accordion>
                    </VStack>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            )}
          </ModalBody>
          <ModalFooter bg="gray.50" borderTopWidth="1px" borderColor="gray.200">
            <Button 
              variant="outline" 
              onClick={handleCloseModal}
              size="md"
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Remove License Confirmation Modal */}
      <Modal 
        isOpen={isOpenRemoveModal} 
        onClose={onCloseRemoveModal} 
        size="xs" 
        closeOnOverlayClick={false} 
        scrollBehavior="inside" 
        isCentered 
        motionPreset="none"
      >
        <ModalOverlay />
        <ModalContent borderRadius="lg" overflow="hidden">
          <ModalHeader
            bg="yellow.50" 
            borderBottomWidth="1px"
            borderColor="gray.200"
            py={4}
            display="flex" 
            alignItems="center"
          >
            <Icon as={GoAlertFill} mr={2} color="yellow.500" />
            Confirm Removal
          </ModalHeader>

          <ModalBody py={6}>
            <Text>
              Are you sure you want to remove this license? This action cannot be undone.
            </Text>
          </ModalBody>

          <ModalFooter bg="gray.50" borderTopWidth="1px" borderColor="gray.200">
            <Button 
              variant="outline" 
              mr={3} 
              onClick={() => {
                setSelectedLicenseForRemoval(null);
                onCloseRemoveModal();
              }}
              size="md"
              _hover={{ bg: "gray.100" }}
            >
              Cancel
            </Button>
            <Button 
              colorScheme="red"
              onClick={handleConfirmRemoveLicense}
              isLoading={isRemovingOperatorLicense}
              size="md"
              _hover={{ boxShadow: "md", bg: "red.600" }}
            >
              Remove
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Operators;
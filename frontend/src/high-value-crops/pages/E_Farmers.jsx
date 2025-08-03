import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  Flex,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Input,
  InputGroup,
  InputRightElement,
  Select,
  Icon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  useDisclosure,
  Spinner,
  VStack,
  SimpleGrid,
  FormControl,
  FormLabel,
  InputLeftAddon,
  FormHelperText,
  FormErrorMessage,
  Link,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Center,
  Spacer,
  Tooltip
} from "@chakra-ui/react";
import { FaSearch, FaEye, FaEdit, FaUserPlus, FaUsers, FaUser, FaAddressCard, FaInfo } from "react-icons/fa";
import { GoAlertFill } from "react-icons/go";
import { useAdminDashboard } from '../store/adminDashboard.store';
import { useQueryClient } from '@tanstack/react-query';
import Barangays from '../../components/barangays';
import debounce from 'lodash/debounce';

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";


const E_Farmers = () => {

  const [farmerNameSearch, setFarmerNameSearch] = useState(''); //name and resident barangay search
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const tableRef = useRef(null);

  const debouncedSetSearch = useMemo(
    () => debounce((value) => setDebouncedSearch(value), 300),
    []
  );

  useEffect(() => {
    debouncedSetSearch(farmerNameSearch);
    return () => {
      debouncedSetSearch.cancel();
    };
  }, [farmerNameSearch, debouncedSetSearch]);

  const { 
    farmerAccounts,
    isCreatingFarmerAccount, 
    deleteFarmerAccount,
    isDeletingFarmerAccount,
    error, 
    createFarmerAccount, 
    isLoading, 
    isUpdatingFarmerAccount, 
    updateFarmerAccount
   } = useAdminDashboard({farmerName: debouncedSearch, page: currentPage});

  const [isEditMode, setIsEditMode] = useState(false);
  const [originalFormData, setOriginalFormData] = useState(null);
  const [selectedFarmerId, setSelectedFarmerId] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Reset pagination when search terms change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    // Apply styles directly to the DOM
    const style = document.createElement('style');
    style.innerHTML = `
      .date-picker-wrapper {
        width: 100% !important;
      }
      .react-datepicker__input-container {
        width: 100% !important;
      }
      .react-datepicker-wrapper {
        width: 100% !important;
      }
    `;
    document.head.appendChild(style);
  
    // Cleanup
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  

  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    surname: '',
    suffix: '',
    farmer_barangay: '',
    mobile_number: '',
    facebook: '',
    birthdate: null, // Add birthdate field initialized as null
  });

  const [formErrors, setFormErrors] = useState({});

  const toast = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isEditMode && originalFormData) {
      // Compare current form data with original data
      const hasFormChanged = 
        formData.first_name !== originalFormData.first_name ||
        formData.middle_name !== originalFormData.middle_name ||
        formData.surname !== originalFormData.surname ||
        formData.suffix !== originalFormData.suffix ||
        formData.farmer_barangay !== originalFormData.farmer_barangay ||
        formData.mobile_number !== originalFormData.mobile_number ||
        formData.facebook !== originalFormData.facebook ||
        // Special handling for dates since they're objects
        ((formData.birthdate && !originalFormData.birthdate) || 
         (!formData.birthdate && originalFormData.birthdate) ||
         (formData.birthdate && originalFormData.birthdate && 
          formData.birthdate.getTime() !== originalFormData.birthdate.getTime()));
      
      setHasChanges(hasFormChanged);
    }
  }, [formData, originalFormData, isEditMode]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null,
      });
    }
  };

  // Handle date change specifically
  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      birthdate: date
    });
    
    if (formErrors.birthdate) {
      setFormErrors({
        ...formErrors,
        birthdate: null,
      });
    }
  };

  const validateFarmerAccountCreationForm = () => {
    const errors = {};
    
    if (!formData.first_name.trim()) {
      errors.first_name = "First name is required";
    }
    
    if (!formData.surname.trim()) {
      errors.surname = "Surname is required";
    }
    
    if (!formData.farmer_barangay.trim()) {
      errors.farmer_barangay = "Farmer address is required";
    }
    
    if (formData.mobile_number && !/^[0-9+\s-]{10,15}$/.test(formData.mobile_number)) {
      errors.mobile_number = "Enter a valid phone number";
    }
    
    return errors;
  };


   // Function to handle edit button click
  const handleEditClick = (farmer) => {
    setIsEditMode(true);
    setSelectedFarmerId(farmer.farmerId);
    
    // Convert birthdate string to Date object if it exists
    const birthdateObject = farmer.birthdate ? new Date(farmer.birthdate) : null;
    
    // Set form data with the selected farmer's data
    const farmerFormData = {
      first_name: farmer.first_name,
      middle_name: farmer.middle_name || '',
      surname: farmer.surname,
      suffix: farmer.suffix || '',
      farmer_barangay: farmer.farmer_barangay,
      mobile_number: farmer.mobile_number || '',
      facebook: farmer.facebook || '',
      birthdate: birthdateObject,
    };
    
    setFormData(farmerFormData);
    // Store original data for comparison
    setOriginalFormData(farmerFormData);
    setHasChanges(false);
    onOpen();
  };


  const handleSubmit = async () => {
    const errors = validateFarmerAccountCreationForm();
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
  
    
    try {
      // Format date as ISO string for backend if a date exists
      const formattedData = {
        ...formData,
        birthdate: formData.birthdate ? formData.birthdate.toISOString() : null
      };
      
      let responseResult;
      
      if (isEditMode) {
        // Update existing farmer account
        responseResult = await updateFarmerAccount(selectedFarmerId, formattedData);
        toast({
          title: "Success",
          description: "Farmer information updated successfully.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      } else {
        // Create new farmer account
        responseResult = await createFarmerAccount(formattedData);
        toast({
          title: "Success",
          description: responseResult.message || "Farmer registered successfully.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      }
      
      // Reset form and close modal
      resetForm();
      
      // Refetch farmer accounts data
      queryClient.invalidateQueries({ queryKey: ['farmerAccounts'] });
      
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: isEditMode ? "Failed to update farmer account." : (error.response?.data?.message || "Failed to register farmer."),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleFarmerAccountDeletion = async () => {
    try {
      await deleteFarmerAccount({farmerId: selectedFarmerId});
      toast({
        title: "Success",
        description: "Farmer account deleted successfully.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      // Refetch farmer accounts data
      queryClient.invalidateQueries({ queryKey: ['farmerAccounts'] });
      onClose();
      onDeleteClose();
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete farmer account.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const resetForm = () => {
    setFormData({
      first_name: '',
      middle_name: '',
      surname: '',
      suffix: '',
      farmer_barangay: '',
      mobile_number: '',
      facebook: '',
      birthdate: null,
    });
    setFormErrors({});
    setIsEditMode(false);
    setSelectedFarmerId(null);
    setOriginalFormData(null);
    setHasChanges(false);
  };

  const handleCloseModal = () => {
    resetForm();
    onClose();
  };
  
  // Modal controls
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isDeleteModalOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  
  // Filter farmers based on search query
  // const searchedFarmers = farmerAccounts.filter((farmers) => {
  //   const fullName = `${farmers.first_name} ${farmers.middle_name} ${farmers.last_name} ${farmers.suffix}`.toLowerCase();
  //   const farmerId = farmers.farmerId ? farmers.farmerId.toLowerCase() : '';
  //   const location = farmers.farmer_barangay ? farmers.farmer_barangay.toLowerCase() : '';
  //   const number = farmers.mobile_number ? farmers.mobile_number.toLowerCase() : '';
    
  //   // General search
  //   const matchesGeneralSearch = searchQuery ? (
  //     fullName.includes(searchQuery.toLowerCase()) ||
  //     location.includes(searchQuery.toLowerCase()) ||
  //     number.includes(searchQuery.toLowerCase()) ||
  //     farmerId.includes(searchQuery.toLowerCase())
  //   ) : true;
    
  //   // Farmer ID specific search
  //   let matchesFarmerId = true;
  //   if (farmerInitials || farmerIdNumber) {
  //     const farmerIdPattern = `f-${farmerInitials.toLowerCase()}-${farmerIdNumber.toLowerCase()}`;
  //     matchesFarmerId = farmerId.includes(farmerIdPattern);
  //   }
    
  //   return matchesGeneralSearch && matchesFarmerId;
  // });
  
  // Pagination calculation
  const itemsPerPage = 10;
  const totalPages = farmerAccounts?.totalPages || 1;
  const currentFarmers = farmerAccounts?.farmerAccounts || [];
  
  // Format date
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };

  // Show error state
  if (error) {
    return (
      <Box 
        overflow="hidden" 
        bg="white" 
        p={5} 
        minH="100vh"
      >
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <AlertTitle>Error loading data!</AlertTitle>
          <AlertDescription>
            {error || "Unable to load registered farmers. Please try again later."}
          </AlertDescription>
        </Alert>
      </Box>
    );
  }

  //modal header based on mode (edit mode or register mode)
  const modalTitle = isEditMode ? "Edit Farmer Information" : "Register New Farmer";
  const modalIcon = isEditMode ? FaEdit : FaUserPlus;
  const submitButtonText = isEditMode ? "Update Farmer" : "Register Farmer";
  const isSubmitting = isEditMode ? isUpdatingFarmerAccount : isCreatingFarmerAccount;

  return (
    <Box 
      overflow="hidden" 
      bg="white" 
      p={5} 
      minH="100vh"
    >
      <Heading as="h1" size="xl" mb={2}>
        Farmers Management
      </Heading>
      <Text color="gray.600" mb={5}>
        View and manage registered farmers in the system.
      </Text>
      
      {/* Search and Add Farmer Section */}
      <Box 
        mb={6}
        p={4}
        bg="blue.50"
        borderRadius="md"
      >
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 4, md: 6 }} alignItems="flex-end">
          {/* General Search */}
          
          <Box>
            
            <HStack
              spacing={2}
              mb={2}
              justifyContent="flex-start"
            >
              <Icon as={FaSearch} color="blue.500" />
              <Text fontWeight="medium" fontSize={'sm'}>
                Search by: <Tooltip label="Complete details give more accurate results. It is case insensitive and can handle complex search queries, but WRONG SPELLING and SPACES may give no results. " position="bottom" hasArrow>(<Icon as={FaInfo} color="blue.500" boxSize={3} />)</Tooltip>
              </Text>
            </HStack>
            
            
            <InputGroup>
              <Input
                placeholder="Name, Barangay, Farmer ID, or Contact Number..."
                bg="white"
                value={farmerNameSearch}
                onChange={(e) => setFarmerNameSearch(e.target.value)}
                _focus={{ borderColor: "blue.400" }}
              />
              <InputRightElement pointerEvents="none">
                <FaSearch color="gray.300" />
              </InputRightElement>
            </InputGroup>
          </Box>
          
          
          {/* Add Farmer Button */}
          <Button
            leftIcon={<FaUserPlus />}
            colorScheme="blue"
            onClick={onOpen}
            size="md"
            alignSelf="flex-end"
            height="40px"
          >
            Add New Farmer
          </Button>
        </SimpleGrid>
      </Box>
      
      {/* Farmers List Section */}
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
            <Icon as={FaUsers} mr={2} color="blue.600" /> REGISTERED FARMERS
          </Heading>
        </Flex>
        
        {/* Farmers Table with Loading State */}
        {isLoading ? (
              <Flex justifyContent="center" alignItems="center" minH="200px">
                <Spinner size="lg" color="blue.500" thickness="3px" />
                <Text ml={5}>Loading farmer accounts...</Text>
              </Flex>
        ) : (
          <Box overflowX="auto">
            <TableContainer ref={tableRef}>
              <Table variant="simple">
                <Thead bg="gray.50">
                  <Tr>
                    <Th>Farmer ID</Th>
                    <Th>Full Name</Th>
                    <Th>Farmer Resident Barangay</Th>
                    <Th>Birth Date</Th>
                    <Th>Contact Number</Th>
                    <Th>Facebook</Th>
                    <Th position={{ base: 'static', md: 'sticky' }} right={0} bg="gray.50" zIndex={{ base: 0, md: 1 }} textAlign={'center'}>
                      <Box display={{ base: 'none', md: 'block' }}>Scroll →</Box>
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {currentFarmers.length > 0 ? (
                    currentFarmers.map((farmers) => (
                      <Tr key={farmers._id}>
                        <Td fontWeight="medium">{farmers.farmerId ? farmers.farmerId : '-'}</Td>
                        <Td fontWeight="medium">
                          {`${farmers.first_name} ${farmers.middle_name ? farmers.middle_name +'.' : ''} ${farmers.surname} ${farmers.suffix ? farmers.suffix : ''}`.trim()}
                        </Td>
                        <Td>{farmers.farmer_barangay ? farmers.farmer_barangay : '-'}</Td>
                        <Td>{farmers.birthdate ? formatDate(new Date(farmers.birthdate)) : '-'}</Td>
                        <Td>{farmers.mobile_number ? farmers.mobile_number : '-'}</Td>
                        <Td>
                          {farmers.facebook ? (
                            <Link
                              href={farmers.facebook.startsWith("http") ? farmers.facebook : `https://${farmers.facebook}`}
                              color={'blue.500'}
                              isExternal
                            >
                              {farmers.facebook}
                            </Link>
                          ) : (
                            '-'
                          )}
                        </Td>
                        <Td position={{ base: 'static', md: 'sticky' }} right={0} bg="white" zIndex={1}>
                          <HStack spacing={2} justifyContent="center">
                            <Button
                              size="sm"
                              colorScheme="green"
                              leftIcon={<FaEdit />}
                              onClick={() => handleEditClick(farmers)}
                              boxShadow="sm"
                              _hover={{ boxShadow: "md", bg: "green.600" }}
                            >
                              Edit
                            </Button>
                          </HStack>
                        </Td>
                      </Tr>
                    ))
                  ) : (
                    <Tr>
                      <Td colSpan={8} textAlign="center" py={8}>
                        <Text color="gray.500">No registered farmers found.</Text>
                      </Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </TableContainer>
          </Box>
        )}
        
        {/* Pagination Controls (only shown when not loading) */}
        {!isLoading && (
          <Flex 
            justifyContent="space-between" 
            mt={4} 
            alignItems="center"
            direction={{ base: "column", md: "row" }}
            gap={{ base: 3, md: 0 }}
          >
            <Text color="gray.600">
              Page {currentPage} of {totalPages || 1} ({farmerAccounts?.totalCount || 0} total)
            </Text>
            
            <HStack spacing={2}>
              <Button
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                isDisabled={currentPage === 1}
                colorScheme="green"
                variant="outline"
              >
                Previous
              </Button>
              
              <Button
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                isDisabled={currentPage >= totalPages}
                colorScheme="green"
                variant="outline"
              >
                Next
              </Button>
            </HStack>
          </Flex>
        )}
      </Box>
      
      {/* Add/Edit Farmer Modal */}
      <Modal isOpen={isOpen} onClose={handleCloseModal} size="2xl" closeOnOverlayClick={false} scrollBehavior="inside"  motionPreset="none">
        <ModalOverlay/>
        <ModalContent borderRadius="md" overflow="hidden" boxShadow="lg">
          <ModalHeader bg="blue.50" borderBottomWidth="1px" borderColor="gray.200" display="flex" alignItems="center" py={4}>
            <Icon as={modalIcon} mr={2} color="blue.500" />
            {modalTitle}
          </ModalHeader>
          
          <ModalBody py={6}>
            <VStack spacing={6} align="stretch">
              {/* Personal Information Section */}
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
                    <Icon as={FaUser} />
                    <Text>Personal Information</Text>
                  </HStack>
                </Heading>
                
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl isRequired isInvalid={formErrors.first_name}>
                    <FormLabel fontWeight="medium">First Name</FormLabel>
                    <Input 
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      placeholder="Enter first name"
                      borderColor="gray.300"
                      _focus={{ borderColor: "blue.400" }}
                    />
                    {formErrors.first_name && (
                      <FormErrorMessage>{formErrors.first_name}</FormErrorMessage>
                    )}
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel fontWeight="medium">Middle Name</FormLabel>
                    <Input 
                      name="middle_name"
                      value={formData.middle_name}
                      onChange={handleInputChange}
                      placeholder="Enter middle name (optional)"
                      borderColor="gray.300"
                      _focus={{ borderColor: "blue.400" }}
                    />
                  </FormControl>
                </SimpleGrid>
                
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mt={4}>
                  <FormControl isRequired isInvalid={formErrors.surname}>
                    <FormLabel fontWeight="medium">Surname</FormLabel>
                    <Input 
                      name="surname"
                      value={formData.surname}
                      onChange={handleInputChange}
                      placeholder="Enter surname"
                      borderColor="gray.300"
                      _focus={{ borderColor: "blue.400" }}
                    />
                    {formErrors.surname && (
                      <FormErrorMessage>{formErrors.surname}</FormErrorMessage>
                    )}
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel fontWeight="medium">Suffix</FormLabel>
                    <Select
                      name="suffix"
                      value={formData.suffix}
                      onChange={handleInputChange}
                      placeholder="E.g., Jr., Sr., III (optional)"
                      textColor={formData.suffix ? "black" : "gray.500"}
                      borderColor="gray.300"
                      _focus={{ borderColor: "blue.400" }}
                    >
                      <option value="Jr.">Jr.</option>
                      <option value="Sr.">Sr.</option>
                      <option value="II">II</option>
                      <option value="III">III</option>
                      <option value="IV">IV</option>
                      <option value="V">V</option>
                    </Select>
                  </FormControl>
                </SimpleGrid>
              </Box>
              
              {/* Farm & Contact Information */}
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
                    <Icon as={FaAddressCard} />
                    <Text>Resident & Contact Information</Text>
                  </HStack>
                </Heading>
                
                <FormControl isRequired isInvalid={formErrors.farmer_barangay} mb={4}>
                  <FormLabel fontWeight="medium">Farmer Resident Barangay</FormLabel>
                  <Select 
                    name="farmer_barangay"
                    value={formData.farmer_barangay}
                    onChange={handleInputChange}
                    placeholder="Select farmer's resident barangay"
                    borderColor="gray.300"
                    _focus={{ borderColor: "blue.400" }}
                  >
                    {Barangays.map((barangay) => (
                      <option key={barangay} value={barangay}>
                        {barangay}
                      </option>
                    ))}
                  </Select>
                  {formErrors.farmer_barangay && (
                    <FormErrorMessage>{formErrors.farmer_barangay}</FormErrorMessage>
                  )}
                </FormControl>
                
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl isInvalid={formErrors.mobile_number}>
                    <FormLabel fontWeight="medium">Mobile Number</FormLabel>
                    <InputGroup>
                      <InputLeftAddon bg="gray.100" color="gray.700">+63</InputLeftAddon>
                      <Input 
                        type="tel"
                        maxLength={11}
                        name="mobile_number"
                        value={formData.mobile_number}
                        onChange={handleInputChange}
                        placeholder="0991XXXXXX"
                        borderColor="gray.300"
                        _focus={{ borderColor: "blue.400" }}
                      />
                    </InputGroup>
                    {formErrors.mobile_number ? (
                      <FormErrorMessage>{formErrors.mobile_number}</FormErrorMessage>
                    ) : (
                      <FormHelperText>11 Digits - Format: 09123456789 </FormHelperText>
                    )}
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel fontWeight="medium">Birth Date</FormLabel>
                    <div style={{ width: '100%' }}>
                      <DatePicker
                        selected={formData.birthdate}
                        onChange={handleDateChange}
                        dateFormat="MM/dd/yyyy"
                        placeholderText="MM/DD/YYYY"
                        className="datepicker-input"
                        isClearable
                        showYearDropdown
                        scrollableYearDropdown
                        yearDropdownItemNumber={100}
                        maxDate={new Date()}
                        customInput={
                          <Input
                            borderColor="gray.300"
                            _focus={{ borderColor: "blue.400" }}
                            width="100%"
                          />
                        }
                        wrapperClassName="date-picker-wrapper"
                      />
                    </div>
                    {formErrors.birthdate && (
                      <FormErrorMessage>{formErrors.birthdate}</FormErrorMessage>
                    )}
                  </FormControl>

                  <FormControl>
                    <FormLabel fontWeight="medium">Facebook Profile</FormLabel>
                    <Input 
                      name="facebook"
                      value={formData.facebook}
                      onChange={handleInputChange}
                      placeholder="https://facebook.com/profile"
                      borderColor="gray.300"
                      _focus={{ borderColor: "blue.400" }}
                    />
                    <FormHelperText>Enter full URL</FormHelperText>
                  </FormControl>
                </SimpleGrid>
              </Box>
            </VStack>
          </ModalBody>
          
          <ModalFooter bg="gray.50" borderTopWidth="1px" borderColor="gray.200" py={4}>
            <Flex w='100%'>
            {isEditMode && (
              <Button
                colorScheme="red"
                mr={3}
                onClick={onDeleteOpen}
                isLoading={isDeletingFarmerAccount}
                size="md"
                _hover={{ boxShadow: "md", bg: "red.600" }}
              >
                Delete Farmer Record
              </Button>
            )}
            <Spacer />
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
              colorScheme="blue"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              isDisabled={isEditMode && !hasChanges}
              size="md"
              fontWeight="500"
              boxShadow="sm"
              _hover={{ boxShadow: "md", bg: "blue.600" }}
            >
              {submitButtonText}
            </Button>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} size="xs" onClose={onDeleteClose} closeOnOverlayClick={false} scrollBehavior="inside" isCentered  motionPreset="none">
        <ModalOverlay/>
        <ModalContent borderRadius="lg" overflow="hidden">
          <ModalHeader
            bg="red.50" 
            borderBottomWidth="1px"
            borderColor="gray.200"
            py={4}
            display="flex" 
            alignItems="center"
          >
            <Icon as={GoAlertFill} mr={2} color="red.500" />
            Warning!
          </ModalHeader>

          <ModalFooter bg="gray.50" borderTopWidth="1px" borderColor="gray.200">
            <Button 
              variant="outline" 
              mr={3} 
              onClick={onDeleteClose}
              size="md"
              _hover={{ bg: "gray.100" }}
            >
              Cancel
            </Button>
            <Button 
                colorScheme="red"
                onClick={handleFarmerAccountDeletion}
                isLoading={isDeletingFarmerAccount}
                size="md"
                _hover={{ boxShadow: "md", bg: "red.600" }}
            >
              Delete Farmer Record
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default E_Farmers;
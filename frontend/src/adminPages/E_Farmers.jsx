import React, { useState, useRef } from 'react';
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
  useToast
} from "@chakra-ui/react";
import { FaSearch, FaEye, FaEdit, FaUserPlus, FaUsers } from "react-icons/fa";
import { useAdminDashboard } from '../store/adminDashboard.store';

const E_Farmers = () => {

  const { farmerAccounts, isLoading, error, createFarmerAccount } = useAdminDashboard();

  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    surname: '',
    suffix: '',
    farm_location: '',
    mobile_number: '',
    facebook: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

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

  const validateFarmerAccountCreationForm = () => {
    const errors = {};
    
    if (!formData.first_name.trim()) {
      errors.first_name = "First name is required";
    }
    
    if (!formData.surname.trim()) {
      errors.surname = "Surname is required";
    }
    
    if (!formData.farm_location.trim()) {
      errors.farm_location = "Farm location is required";
    }
    
    if (formData.mobile_number && !/^[0-9+\s-]{10,15}$/.test(formData.mobile_number)) {
      errors.mobile_number = "Enter a valid phone number";
    }
    
    return errors;
  };

  const handleSubmit = async () => {
    const errors = validateFarmerAccountCreationForm();
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Call API to create a farmer account
      await createFarmerAccount(formData);
      
      toast({
        title: "Success",
        description: "Farmer registered successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      
      // Reset form and close modal
      setFormData({
        first_name: '',
        middle_name: '',
        surname: '',
        suffix: '',
        farm_location: '',
        mobile_number: '',
        facebook: '',
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to register farmer",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setFormData({
      first_name: '',
      middle_name: '',
      surname: '',
      suffix: '',
      farm_location: '',
      mobile_number: '',
      facebook: '',
    });
    setFormErrors({});
    onClose();
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const tableRef = useRef(null);
  
  // Modal controls
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Filter farmers based on search query
  const searchedFarmers = farmerAccounts.filter((farmers) => {
    const fullName = `${farmers.first_name} ${farmers.middle_name} ${farmers.last_name} ${farmers.suffix}`.toLowerCase();
    const location = farmers.farm_location.toLowerCase();
    const number = farmers.mobile_number.toLowerCase();
    
    return fullName.includes(searchQuery.toLowerCase()) ||
           location.includes(searchQuery.toLowerCase()) ||
            number.includes(searchQuery.toLowerCase());
  });
  
  // Pagination calculation
  const itemsPerPage = 10;
  const totalPages = Math.ceil(searchedFarmers.length / itemsPerPage);
  const currentFarmers = searchedFarmers.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );
  
  // Format date
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };

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
      <Flex 
        direction={{ base: "column", md: "row" }} 
        mb={6} 
        p={4}
        bg="blue.50"
        borderRadius="md"
        alignItems="center"
        justifyContent="space-between"
      >

        <Flex 
          direction={{ base: "column", md: "row" }}
          width={{ base: "100%", md: "auto" }}
          mb={{ base: 4, md: 0 }}
          alignItems={{ base: "flex-start", md: "center" }}
        >

          <HStack 
            spacing={2} 
            mb={{ base: 2, md: 0 }} 
            width={{ base: "100%", md: "auto" }}
            justifyContent={{ base: "center", md: "flex-start" }}
          >
            <Icon as={FaSearch} color="blue.500" />
            <Text fontWeight="medium">Search:</Text>
          </HStack>
          
          <InputGroup width={{ base: "100%", md: "sm" }} ml={{ base: 0, md: 4 }}>
            <Input 
              placeholder="Search by name or barangay..." 
              bg="white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              _focus={{ borderColor: "blue.400" }}
            />
            <InputRightElement pointerEvents="none">
              <FaSearch color="gray.300" />
            </InputRightElement>
          </InputGroup>
        </Flex>
        
        <Button
          leftIcon={<FaUserPlus />}
          colorScheme="blue"
          onClick={onOpen}
          size={{ base: "md", md: "md" }}
          width={{ base: "100%", md: "auto" }}
        >
          Add New Farmer
        </Button>
      </Flex>
      
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
        
        {/* Farmers Table */}
        <Box overflowX="auto">
          <TableContainer ref={tableRef}>
            <Table variant="simple">
              <Thead bg="gray.50">
                <Tr>
                  <Th>Full Name</Th>
                  <Th>Farm Location</Th>
                  <Th>Contact Number</Th>
                  <Th>Facebook</Th>
                  <Th position={{ base: 'static', md: 'sticky' }} right={0} bg="gray.50" zIndex={1} textAlign="center">
                    <Box display={{ base: 'none', md: 'block' }}>Actions</Box>
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {currentFarmers.length > 0 ? (
                  currentFarmers.map((farmers) => (
                    <Tr key={farmers._id}>
                      <Td fontWeight="medium">
                        {`${farmers.first_name} ${farmers.middle_name ? farmers.middle_name.charAt(0).toUpperCase()+'.' : ''} ${farmers.surname} ${farmers.suffix ? farmers.suffix : ''}`.trim()}
                      </Td>
                      <Td>{farmers.farm_location ? farmers.farm_location : '-'}</Td>
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
                          'N/A'
                        )}
                      </Td>
                      <Td position={{ base: 'static', md: 'sticky' }} right={0} bg="white" zIndex={1}>
                        <HStack spacing={2} justifyContent="center">
                          <Button
                            size="sm"
                            colorScheme="blue"
                            leftIcon={<FaEye />}
                          >
                            View
                          </Button>
                          <Button
                            size="sm"
                            colorScheme="green"
                            leftIcon={<FaEdit />}
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
        
        {/* Pagination Controls */}
        <Flex 
          justifyContent="space-between" 
          mt={4} 
          alignItems="center"
          direction={{ base: "column", md: "row" }}
          gap={{ base: 3, md: 0 }}
        >
          <Text color="gray.600">
            Page {currentPage} of {totalPages || 1} ({searchedFarmers.length} total)
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
      </Box>
      
      {/* Add Farmer Modal - Empty for now */}
      <Modal isOpen={isOpen} onClose={handleCloseModal} size="2xl" closeOnOverlayClick={false} scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent borderRadius="lg" overflow="hidden">
          <ModalHeader bg="blue.50" borderBottomWidth="1px" display="flex" alignItems="center">
            <Icon as={FaUserPlus} mr={2} color="blue.500" />
            Register New Farmer
          </ModalHeader>
          
          <ModalBody py={6}>
            <VStack spacing={5} align="stretch">
              {/* Personal Information Section */}
              <Box>
                <Heading as="h3" size="sm" mb={3} color="blue.600">
                  Personal Information
                </Heading>
                
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl isRequired isInvalid={formErrors.first_name}>
                    <FormLabel>First Name</FormLabel>
                    <Input 
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      placeholder="Enter first name"
                    />
                    {formErrors.first_name && (
                      <FormErrorMessage>{formErrors.first_name}</FormErrorMessage>
                    )}
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Middle Name</FormLabel>
                    <Input 
                      name="middle_name"
                      value={formData.middle_name}
                      onChange={handleInputChange}
                      placeholder="Enter middle name (optional)"
                    />
                  </FormControl>
                </SimpleGrid>
                
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mt={4}>
                  <FormControl isRequired isInvalid={formErrors.surname}>
                    <FormLabel>Surname</FormLabel>
                    <Input 
                      name="surname"
                      value={formData.surname}
                      onChange={handleInputChange}
                      placeholder="Enter surname"
                    />
                    {formErrors.surname && (
                      <FormErrorMessage>{formErrors.surname}</FormErrorMessage>
                    )}
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Suffix</FormLabel>
                    <Input 
                      name="suffix"
                      value={formData.suffix}
                      onChange={handleInputChange}
                      placeholder="E.g., Jr., Sr., III (optional)"
                    />
                  </FormControl>
                </SimpleGrid>
              </Box>
              
              {/* Farm & Contact Information */}
              <Box mt={3}>
                <Heading as="h3" size="sm" mb={3} color="blue.600">
                  Resident & Contact Information
                </Heading>
                
                <FormControl isRequired isInvalid={formErrors.farm_location} mb={4}>
                  <FormLabel>Farmer Resident Address</FormLabel>
                  <Input 
                    name="farm_location"
                    value={formData.farm_location}
                    onChange={handleInputChange}
                    placeholder="Enter farmer's complete address"
                  />
                  {formErrors.farm_location && (
                    <FormErrorMessage>{formErrors.farm_location}</FormErrorMessage>
                  )}
                </FormControl>
                
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl isInvalid={formErrors.mobile_number}>
                    <FormLabel>Mobile Number</FormLabel>
                    <InputGroup>
                      <InputLeftAddon>+63</InputLeftAddon>
                      <Input 
                        name="mobile_number"
                        value={formData.mobile_number}
                        onChange={handleInputChange}
                        placeholder="9XX XXX XXXX"
                        type="tel"
                      />
                    </InputGroup>
                    {formErrors.mobile_number ? (
                      <FormErrorMessage>{formErrors.mobile_number}</FormErrorMessage>
                    ) : (
                      <FormHelperText>Format: 9XX XXX XXXX</FormHelperText>
                    )}
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Facebook Profile</FormLabel>
                    <Input 
                      name="facebook"
                      value={formData.facebook}
                      onChange={handleInputChange}
                      placeholder="https://facebook.com/profile"
                    />
                    <FormHelperText>Enter full URL</FormHelperText>
                  </FormControl>
                </SimpleGrid>
              </Box>
            </VStack>
          </ModalBody>
          
          <ModalFooter bg="gray.50">
            <Button variant="outline" mr={3} onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button 
              colorScheme="blue"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              loadingText="Registering"
            >
              Register Farmer
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      </Box>
  );
};

export default E_Farmers;
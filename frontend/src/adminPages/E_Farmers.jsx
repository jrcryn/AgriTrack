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
  useToast
} from "@chakra-ui/react";
import { FaSearch, FaEye, FaEdit, FaUserPlus, FaUsers, FaUser, FaAddressCard } from "react-icons/fa";
import { useAdminDashboard } from '../store/adminDashboard.store';
import { useQueryClient } from '@tanstack/react-query';

const E_Farmers = () => {

  const { farmerAccounts, isLoading, error, createFarmerAccount } = useAdminDashboard();

  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    surname: '',
    suffix: '',
    farmer_address: '',
    mobile_number: '',
    facebook: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toast = useToast();
  const queryClient = useQueryClient();

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
    
    if (!formData.farmer_address.trim()) {
      errors.farmer_address = "Farmer address is required";
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
      const responseResult = await createFarmerAccount(formData);
      
      toast({
        title: "Success",
        description: responseResult.message || "Farmer registered successfully",
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
        farmer_address: '',
        mobile_number: '',
        facebook: '',
      });

      queryClient.invalidateQueries({ queryKey: ['farmerAccounts'] });
      
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to register farmer",
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
      farmer_address: '',
      mobile_number: '',
      facebook: '',
    });
    setFormErrors({});
    onClose();
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [farmerInitials, setFarmerInitials] = useState('');
  const [farmerIdNumber, setFarmerIdNumber] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const tableRef = useRef(null);
  
  // Modal controls
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Filter farmers based on search query
  const searchedFarmers = farmerAccounts.filter((farmers) => {
    const fullName = `${farmers.first_name} ${farmers.middle_name} ${farmers.last_name} ${farmers.suffix}`.toLowerCase();
    const farmerId = farmers.farmerId ? farmers.farmerId.toLowerCase() : '';
    const location = farmers.farmer_address ? farmers.farmer_address.toLowerCase() : '';
    const number = farmers.mobile_number ? farmers.mobile_number.toLowerCase() : '';
    
    // General search
    const matchesGeneralSearch = searchQuery ? (
      fullName.includes(searchQuery.toLowerCase()) ||
      location.includes(searchQuery.toLowerCase()) ||
      number.includes(searchQuery.toLowerCase()) ||
      farmerId.includes(searchQuery.toLowerCase())
    ) : true;
    
    // Farmer ID specific search
    let matchesFarmerId = true;
    if (farmerInitials || farmerIdNumber) {
      const farmerIdPattern = `f-${farmerInitials.toLowerCase()}-${farmerIdNumber.toLowerCase()}`;
      matchesFarmerId = farmerId.includes(farmerIdPattern);
    }
    
    return matchesGeneralSearch && matchesFarmerId;
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
          {/* General Search */}
          <Box width={{ base: "100%", md: "auto" }} mb={{ base: 4, md: 0 }}>
            <HStack 
              spacing={2} 
              mb={2}
              width={{ base: "100%", md: "auto" }}
              justifyContent={{ base: "center", md: "flex-start" }}
            >
              <Icon as={FaSearch} color="blue.500" />
              <Text fontWeight="medium">Search by:</Text>
            </HStack>
            
            <InputGroup width={{ base: "100%", md: "sm" }}>
              <Input 
                placeholder="name or location..." 
                bg="white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                _focus={{ borderColor: "blue.400" }}
              />
              <InputRightElement pointerEvents="none">
                <FaSearch color="gray.300" />
              </InputRightElement>
            </InputGroup>
          </Box>
          
          {/* Farmer ID Search */}
          <Box ml={{ base: 0, md: 5 }} width={{ base: "100%", md: "auto" }}>
            <HStack 
              spacing={2} 
              mb={2}
              width={{ base: "100%", md: "auto" }}
              justifyContent={{ base: "center", md: "flex-start" }}
            >
              <Icon as={FaAddressCard} color="blue.500" />
              <Text fontWeight="medium">Search by Farmer ID:</Text>
            </HStack>
            
            <Flex>
              <Box 
                bg="gray.100" 
                px={3} 
                py={2} 
                borderLeftRadius="md" 
                display="flex" 
                alignItems="center"
                fontWeight="medium"
              >
                F-
              </Box>
              <Input 
                placeholder="Initials" 
                bg="white"
                value={farmerInitials}
                onChange={(e) => setFarmerInitials(e.target.value)}
                borderRadius="0"
                maxLength={4}
                _focus={{ borderColor: "blue.400" }}
              />
              <Box 
                bg="gray.100" 
                px={2} 
                py={2} 
                display="flex" 
                alignItems="center"
                fontWeight="medium"
              >
                -
              </Box>
              <Input 
                placeholder="Number" 
                bg="white"
                value={farmerIdNumber}
                onChange={(e) => setFarmerIdNumber(e.target.value)}
                borderRightRadius="md"
                borderLeftRadius="0"
                maxLength={4}
                _focus={{ borderColor: "blue.400" }}
              />
            </Flex>
          </Box>
        </Flex>
        
        <Button
          leftIcon={<FaUserPlus />}
          colorScheme="blue"
          onClick={onOpen}
          size={{ base: "md", md: "md" }}
          width={{ base: "100%", md: "auto" }}
          mt={{ base: 2, md: 0 }}
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
                  <Th>Farmer ID</Th>
                  <Th>Full Name</Th>
                  <Th>Farmer Resident Address</Th>
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
                        {`${farmers.first_name} ${farmers.middle_name ? farmers.middle_name.charAt(0).toUpperCase()+'.' : ''} ${farmers.surname} ${farmers.suffix ? farmers.suffix : ''}`.trim()}
                      </Td>
                      <Td>{farmers.farmer_address ? farmers.farmer_address : '-'}</Td>
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
      <Modal isOpen={isOpen} onClose={handleCloseModal} size="2xl" closeOnOverlayClick={false} scrollBehavior="inside" motionPreset="none">
        <ModalOverlay/>
        <ModalContent borderRadius="md" overflow="hidden" boxShadow="lg">
          <ModalHeader bg="white" borderBottomWidth="1px" borderColor="gray.200" display="flex" alignItems="center" py={4}>
            <Icon as={FaUserPlus} mr={2} color="blue.500" />
            Register New Farmer
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
                
                <FormControl isRequired isInvalid={formErrors.farmer_address} mb={4}>
                  <FormLabel fontWeight="medium">Farmer Resident Address</FormLabel>
                  <Input 
                    name="farmer_address"
                    value={formData.farmer_address}
                    onChange={handleInputChange}
                    placeholder="Enter farmer's complete address"
                    borderColor="gray.300"
                    _focus={{ borderColor: "blue.400" }}
                  />
                  {formErrors.farmer_address && (
                    <FormErrorMessage>{formErrors.farmer_address}</FormErrorMessage>
                  )}
                </FormControl>
                
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl isInvalid={formErrors.mobile_number}>
                    <FormLabel fontWeight="medium">Mobile Number</FormLabel>
                    <InputGroup>
                      <InputLeftAddon bg="gray.100" color="gray.700">+63</InputLeftAddon>
                      <Input 
                        name="mobile_number"
                        value={formData.mobile_number}
                        onChange={handleInputChange}
                        placeholder="0991XXXXXX"
                        type="number"
                        maxLength={11}
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
              loadingText="Registering"
              size="md"
              fontWeight="500"
              boxShadow="sm"
              _hover={{ boxShadow: "md", bg: "blue.600" }}
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
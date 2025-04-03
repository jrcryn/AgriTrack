import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Text,
  VStack,
  HStack,
  Button,
  Flex,
  Divider,
  Select,
  SimpleGrid,
  useToast,
  InputGroup,
  InputLeftAddon,
} from '@chakra-ui/react';
import { useFarmerFormStore } from '../store/farmerForm.store.js';
import { useAdminDashboard } from '../store/adminDashboard.store.js';
import Barangays from '../components/barangays';
import { FaUserCheck, FaSearch } from 'react-icons/fa';

const FarmerInput = ({ onNext, onBack }) => {

  // Get the existing farmer input data from the store
  const { formData, updateFarmerInput, isLoading } = useFarmerFormStore();
  const { getFarmerAccountById } = useAdminDashboard();
  
  // Initialize form data with existing data from the store
  const [localFormData, setLocalFormData] = useState(formData.farmerInput);
  const [isFormValid, setIsFormValid] = useState(false);
  
  // State for farmer ID search
  const [farmerInitials, setFarmerInitials] = useState('');
  const [farmerIdNumber, setFarmerIdNumber] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  // Set isFarmerSelected based on whether farmerId exists in the store
  const [isFarmerSelected, setIsFarmerSelected] = useState(!!formData.farmerInput.farmerId);

  // Set initial search fields if a farmer is already selected
  useEffect(() => {
    if (formData.farmerInput.farmerId) {
      const idParts = formData.farmerInput.farmerId.split('-');
      if (idParts.length === 3) { // format: F-ABC-1234
        setFarmerInitials(idParts[1]);
        setFarmerIdNumber(idParts[2]);
      }
    }
  }, [formData.farmerInput.farmerId]);

  const toast = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleNext = () => {
    // Update the store with the form data
    updateFarmerInput(localFormData);
    onNext();
  };

  // Find farmer by ID
  const handleFindFarmer = async () => {
    if (!farmerInitials || !farmerIdNumber) {
      toast({
        title: "Incomplete Farmer ID",
        description: "Please enter both initials and number",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSearching(true);
    try {
      const formattedFarmerId = `F-${farmerInitials.toUpperCase()}-${farmerIdNumber}`;
      
      const response = await getFarmerAccountById({ farmerId: formattedFarmerId });
      
      if (response) {
        // Populate form data with farmer information
        const updatedFormData = {
          farmerId: response._id, // This is the MongoDB ObjectId
          displayFarmerId: formattedFarmerId, // formatted ID for display
          surname: response.surname || '',
          first_name: response.first_name || '',
          middle_name: response.middle_name || '',
          suffix: response.suffix || '',
          farm_location: '',
        };
        
        setLocalFormData(updatedFormData);
        // Update the store immediately to persist the state
        updateFarmerInput(updatedFormData);
        
        setIsFarmerSelected(true);
        
        toast({
          title: "Farmer Found",
          description: `Found ${response.first_name} ${response.surname}`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Farmer Not Found",
        description: "No farmer with that ID exists in the system",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Reset farmer selection - FIXED
  const handleResetFarmerSelection = () => {
    // First update the form data
    const resetData = {
      farmerId: '', 
      displayFarmerId: '', 
      surname: '',
      first_name: '',
      middle_name: '',
      suffix: '',
      farm_location: '',
    };
    
    // Update store first
    updateFarmerInput(resetData);
    
    // Then update local state
    setLocalFormData(resetData);
    
    // Finally update UI state with small delay to ensure re-render
    setTimeout(() => {
      setIsFarmerSelected(false);
      setFarmerInitials('');
      setFarmerIdNumber('');
    }, 10);
  };

  useEffect(() => {
    const { surname, first_name, farm_location } = localFormData;
    setIsFormValid(surname && first_name && farm_location);
  }, [localFormData]);
  
  const cardBg = 'white';
  const headerBorder = 'gray.200';
  const accentColor = 'blue.600'; 

  return (
    <Box minH="100vh" py={10} px={4}>
      <VStack spacing={8} maxW="800px" mx="auto" w="full">
        <Box 
          bg={cardBg}
          borderRadius="xl"
          shadow="xl"
          w="full"
          overflow="hidden"
        >
          {/* Header */}
          <Box 
            p={6}
            borderBottomWidth="2px"
            borderColor={headerBorder}
            align="center"
          >
            <Heading 
              size="lg"
              color={accentColor}
              fontWeight="semibold"
              letterSpacing="tight"
              mb={3}
            >
              High Value Crop Planting and Harvesting Report
            </Heading>
            <Text fontSize="sm" color="gray.500" fontWeight="medium" mb={-2}>
              Fields marked with <Text as="span" color="red.500">*</Text> are required
            </Text>
          </Box>

          {/* Form Content */}
          <Box p={8}>

            <VStack spacing={6} align="stretch" key={isFarmerSelected ? 'selected' : 'not-selected'}>
              <Box>                
                {/* Improved Farmer ID Search */}
                <Box>
                  <FormControl isRequired>
                  <FormLabel mb={3} fontWeight="medium">
                    Enter your Farmer ID:
                  </FormLabel>
                  </FormControl>
                  
                  <Flex 
                    direction={{ base: "column", md: "row" }}
                    align={{ base: "stretch", md: "flex-end" }}
                    gap={4}
                  >
                    <Box width={{ base: "100%", md: "60%" }}>
                      <HStack spacing={0} width="100%">
                        <Box
                          bg="gray.100"
                          px={3}
                          py={2}
                          borderLeftRadius="md"
                          fontWeight="medium"
                          height="40px"
                          display="flex"
                          alignItems="center"
                        >
                          F-
                        </Box>
                        <Input
                          placeholder="Initials"
                          bg="white"
                          borderRadius="0"
                          maxLength={4}
                          value={farmerInitials}
                          onChange={(e) => setFarmerInitials(e.target.value.toUpperCase())}
                          isDisabled={isFarmerSelected}
                          _focus={{ borderColor: "blue.400" }}
                        />
                        <Box
                          bg="gray.100"
                          px={2}
                          py={2}
                          fontWeight="medium"
                          height="40px"
                          display="flex"
                          alignItems="center"
                        >
                          -
                        </Box>
                        <Input
                          placeholder="Number"
                          bg="white"
                          borderRightRadius="md"
                          borderLeftRadius="0"
                          maxLength={4}
                          value={farmerIdNumber}
                          onChange={(e) => setFarmerIdNumber(e.target.value)}
                          isDisabled={isFarmerSelected}
                          _focus={{ borderColor: "blue.400" }}
                        />
                      </HStack>
                    </Box>
                    
                    {!isFarmerSelected ? (
                      <Button
                        leftIcon={<FaSearch />}
                        colorScheme="blue"
                        onClick={handleFindFarmer}
                        isLoading={isSearching}
                        loadingText="Searching"
                      >
                        Find Farmer
                      </Button>
                    ) : (
                      <Button
                        colorScheme="gray"
                        onClick={handleResetFarmerSelection}
                        variant="outline"
                      >
                        Reset Selection
                      </Button>
                    )}
                  </Flex>
                </Box>
              </Box>

              <Divider />
              
              <Text 
                fontSize="sm" 
                fontWeight="bold" 
                color="gray.600"
                textTransform="uppercase"
                letterSpacing="wide"
                mb={2}
              >
                Personal Information
              </Text>
              
              {!isFarmerSelected ? (
                <>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <FormControl id="surname">
                  <FormLabel 
                    fontSize="sm" 
                    fontWeight="medium"
                    color="gray.200"
                  >
                    APELYIDO
                  </FormLabel>
                  <Input 
                    name='surname'
                    borderRadius="md"
                    isDisabled
                  />
                </FormControl>

                <FormControl id="firstname">
                  <FormLabel 
                    fontSize="sm" 
                    fontWeight="medium"
                    color="gray.200"
                  >
                    UNANG PANGALAN 
                  </FormLabel>
                  <Input 
                    name='first_name'
                    borderRadius="md"
                    isDisabled
                  />
                </FormControl>
              </SimpleGrid>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <FormControl id="middleName">
                  <FormLabel 
                    fontSize="sm" 
                    fontWeight="medium"
                    color="gray.200"
                  >
                    GITNANG PANGALAN
                  </FormLabel>
                  <Input 
                    name='middle_name'
                    borderRadius="md"
                    focusBorderColor={accentColor}
                    isDisabled
                  />
                </FormControl>

                <FormControl id="suffix">
                  <FormLabel 
                    fontSize="sm" 
                    fontWeight="medium"
                    color="gray.200"
                  >
                    SUFFIX
                  </FormLabel>
                  <Input 
                    name='suffix'
                    borderRadius="md"
                    focusBorderColor={accentColor}
                    isDisabled
                  />
                </FormControl>
              </SimpleGrid>

              <SimpleGrid>
                <FormControl id="farmLocation">
                  <FormLabel 
                    fontSize="sm" 
                    fontWeight="medium"
                    color="gray.200"
                  >
                    FARM LOCATION (PILIIN ANG BARANGAY KUNG NASAAN ANG INYONG TANIMAN)
                  </FormLabel>
                  <Input
                    name='farm_location'
                    borderRadius="md"
                    isDisabled
                  />
                </FormControl>
              </SimpleGrid>
              </>
              ) : (
                <>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <FormControl id="surname">
                  <FormLabel 
                    fontSize="sm" 
                    fontWeight="medium"
                    color="gray.600"
                  >
                    APELYIDO
                  </FormLabel>
                  <Input 
                    name='surname'
                    value={localFormData.surname}
                    onChange={handleChange}
                    placeholder="Your answer"
                    borderRadius="md"
                    focusBorderColor={accentColor}
                    isReadOnly
                  />
                </FormControl>

                <FormControl id="firstname">
                  <FormLabel 
                    fontSize="sm" 
                    fontWeight="medium"
                    color="gray.600"
                  >
                    UNANG PANGALAN 
                  </FormLabel>
                  <Input 
                    name='first_name'
                    value={localFormData.first_name}
                    onChange={handleChange}
                    placeholder="Your answer"
                    borderRadius="md"
                    focusBorderColor={accentColor}
                    isReadOnly
                  />
                </FormControl>
              </SimpleGrid>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <FormControl id="middleName">
                  <FormLabel 
                    fontSize="sm" 
                    fontWeight="medium"
                    color="gray.600"
                  >
                    GITNANG PANGALAN
                  </FormLabel>
                  <Input 
                    name='middle_name'
                    value={localFormData.middle_name}
                    onChange={handleChange}
                    placeholder="Your answer (optional)"
                    borderRadius="md"
                    focusBorderColor={accentColor}
                    isReadOnly
                  />
                </FormControl>

                <FormControl id="suffix">
                  <FormLabel 
                    fontSize="sm" 
                    fontWeight="medium"
                    color="gray.600"
                  >
                    SUFFIX
                  </FormLabel>
                  <Input
                    name='suffix'
                    value={localFormData.suffix}
                    onChange={handleChange}
                    placeholder="-"
                    borderRadius="md"
                    focusBorderColor={accentColor}
                    isReadOnly
                  />
                </FormControl>
              </SimpleGrid>

              <SimpleGrid>
                <FormControl id="farmLocation" isRequired>
                  <FormLabel 
                    fontSize="sm" 
                    fontWeight="medium"
                    color="gray.600"
                  >
                    FARM LOCATION (PILIIN ANG BARANGAY KUNG NASAAN ANG INYONG TANIMAN)
                  </FormLabel>
                  <Select 
                    name='farm_location'
                    value={localFormData.farm_location}
                    onChange={handleChange}
                    placeholder="Select Barangay"
                    borderRadius="md"
                    focusBorderColor={accentColor}
                  >
                    {Barangays.map((barangay) => (
                      <option key={barangay} value={barangay}>
                        {barangay}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </SimpleGrid>
              
              </>
              )}
            </VStack>

            {/* Navigation Buttons */}
            <Stack 
              direction={{ base: 'column', md: 'row' }}
              spacing={4}
              justify="flex-end"
              mt={12}
            >
              <Button 
                variant="ghost"
                colorScheme="blue"
                onClick={onBack}
                px={8}
                borderRadius="md"
              >
                Back
              </Button>
              <Button 
                bg={accentColor}
                color="white"
                _hover={{ bg: 'blue.700' }}
                onClick={handleNext}
                isLoading={isLoading}
                px={8}
                borderRadius="md"
                isDisabled={!isFormValid}
              >
                Continue
              </Button>
            </Stack>
          </Box>
        </Box>
      </VStack>
    </Box>
  );
};

export default FarmerInput;
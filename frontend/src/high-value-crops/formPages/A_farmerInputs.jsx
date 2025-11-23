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
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react';
import { useFarmerFormStore } from '../store/farmerForm.store.js';
import { usePublicFormStore } from '../../global/publicForm.store.js';
import Barangays from '../../components/barangays.js';
import { FaUserCheck, FaSearch } from 'react-icons/fa';
import CropTypes from './B_cropTypes.jsx';
import CropRecordsIndus from './C1_cropRecordsIndus.jsx';
import CropRecordsOther from './C2_cropRecordsOther.jsx';
import CropIndusNew from './D1_cropIndusNew.jsx';
import CropIndusHarvest from './D1_cropIndusHarvest.jsx';
import BcOtherFctNew from './D2_bc-other-fctNew.jsx';
import BcOtherFctHarvest from './D2_bc-other-fctHarvest.jsx';

const FarmerInput = ({ onNext, onBack }) => {
  // Get the existing farmer input data from the store
  const { 
    formData, 
    updateFarmerInput, 
    updateCropType,
    updateCropRecordIndus,
    updateCropRecordOther,
    updateCropIndusNew,
    updateCropIndusHarvest,
    updateCropOtherNew,
    updateCropOtherHarvest,
    isLoading 
  } = useFarmerFormStore();
  const { getFarmerAccountByName } = usePublicFormStore();
  
  // Initialize form data with existing data from the store
  const [localFormData, setLocalFormData] = useState(formData.farmerInput);
  const [isFormValid, setIsFormValid] = useState(false);
  
  const [isSearching, setIsSearching] = useState(false);

  //for farmer account search
  const [farmerName, setFarmerName] = useState('');
  const [farmerMiddleName, setFarmerMiddleName] = useState('');
  const [farmerSurname, setFarmerSurname] = useState('');
  const [farmerSuffix, setFarmerSuffix] = useState('');
  const [farmerLocation, setFarmerLocation] = useState('');


  // Set isFarmerSelected based on whether farmerId exists in the store
  const [isFarmerSelected, setIsFarmerSelected] = useState(!!formData.farmerInput.farmerId);

  // Set initial search fields if a farmer is already selected
  useEffect(() => {
    if (formData.farmerInput.farmerId) {
      setFarmerSurname(formData.farmerInput.surname);
      setFarmerName(formData.farmerInput.first_name);
      setFarmerMiddleName(formData.farmerInput.middle_name);
      setFarmerSuffix(formData.farmerInput.suffix);
      setFarmerLocation(formData.farmerInput.farmer_location);
    }
  }, [formData.farmerInput]);

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
    if (!farmerName || !farmerSurname || !farmerLocation) {
      toast({
        title: "Incomplete Farmer Information",
        description: "Please enter at least a name, surname, and select a barangay to search.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsSearching(true);
    try {
      
      const response = await getFarmerAccountByName( farmerSurname, farmerName, farmerMiddleName, farmerSuffix, farmerLocation );
      
      if (response) {
        // Populate form data with farmer information
        const updatedFormData = {
          _id: response._id, // MongoDB ObjectId
          farmerId: response.farmerId || '', 
          surname: response.surname || '',
          first_name: response.first_name || '',
          middle_name: response.middle_name || '',
          suffix: response.suffix || '',
          farm_location: '',
          farmer_location: farmerLocation || '',
        };
        
        setLocalFormData(updatedFormData);
        // Update the store immediately to persist the state
        updateFarmerInput(updatedFormData);
        
        setIsFarmerSelected(true);
        
        toast({
          title: "Success",
          description: `Found ${response.first_name} ${response.surname}.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Farmer not found.",
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
      setFarmerName('');
      setFarmerSurname('');
      setFarmerMiddleName('');
      setFarmerSuffix('');
      setFarmerLocation('');
      setIsFarmerSelected(false);
    }, 10);
  };

  useEffect(() => {
    const { farm_location } = localFormData;
    setIsFormValid(farm_location);
  }, [localFormData]);
  
  const cardBg = 'white';
  const headerBorder = 'gray.200';
  const accentColor = 'blue.600'; 

  // Inline step management
  const [steps, setSteps] = useState([]);
  const handleStepBack = () => {
    const currentStep = steps[steps.length - 1];
    
    // Clear data based on which step we're going back from
    switch (currentStep) {
      case 'cropRecordsIndus':
        updateCropRecordIndus(null);
        break;
      case 'cropRecordsOther':
        updateCropRecordOther(null);
        break;
      case 'cropIndusNew':
        updateCropIndusNew(null);
        break;
      case 'cropIndusHarvest':
        updateCropIndusHarvest(null);
        break;
      case 'otherFctNew':
        updateCropOtherNew(null);
        break;
      case 'otherFctHarvest':
        updateCropOtherHarvest(null);
        break;
      default:
        break;
    }
    
    // Remove the last step from the array
    setSteps(prev => prev.slice(0, -1));
  };

  // Removed previous effect that waited for farm_location before showing cropTypes
  // useEffect(() => {
  //   if (isFarmerSelected && localFormData.farm_location && !steps.includes('cropTypes')) {
  //     setSteps(['cropTypes']);
  //   }
  // }, [isFarmerSelected, localFormData.farm_location]);

  // Handlers passed to child forms
  const handleCropTypesNext = (selectedCropType) => {
    if (selectedCropType === 'VEGETABLES, ROOT CROPS AND OTHER INDUSTRIAL CROPS') {
      setSteps(prev => [...prev, 'cropRecordsIndus']);
    } else {
      setSteps(prev => [...prev, 'cropRecordsOther']);
    }
  };
  const handleCropRecordsIndusNext = (stage) => {
    setSteps(prev => [...prev, stage === 'NEWLY PLANTED' ? 'cropIndusNew' : 'cropIndusHarvest']);
  };
  const handleCropRecordsOtherNext = (stage) => {
    setSteps(prev => [...prev, stage === 'NEWLY PLANTED' ? 'otherFctNew' : 'otherFctHarvest']);
  };

  // Final submission success handler (optional)
  const handleFinalSuccess = () => {
    // Optionally scroll / toast; keep original onNext if needed
    onNext && onNext('/success');
  };

  // Remove bottom navigation (Continue/Back) – now managed inline
  return (
    <Box minH="100vh" py={10} px={4}>
      <VStack spacing={8} maxW="800px" mx="auto" w="full">
        <Box bg={cardBg} borderRadius="xl" shadow="xl" w="full" overflow="hidden">
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

          <Box p={8}>
            <VStack spacing={6} align="stretch" key={isFarmerSelected ? 'selected' : 'not-selected'}>

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
              
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <FormControl id="surname" isRequired>
                  <FormLabel 
                    fontSize="sm" 
                    fontWeight="medium"
                    color="gray.600"
                  >
                    APELYIDO
                  </FormLabel>
                  <Input 
                    name='surname'
                    value={farmerSurname}
                    onChange={(e) => setFarmerSurname(e.target.value)}
                    placeholder="Your answer"
                    borderRadius="md"
                    focusBorderColor={accentColor}
                    isDisabled={isFarmerSelected}
                  />
                </FormControl>

                <FormControl id="firstname" isRequired>
                  <FormLabel 
                    fontSize="sm" 
                    fontWeight="medium"
                    color="gray.600"
                  >
                    UNANG PANGALAN 
                  </FormLabel>
                  <Input 
                    name='first_name'
                    value={farmerName}
                    onChange={(e) => setFarmerName(e.target.value)}
                    placeholder="Your answer"
                    borderRadius="md"
                    focusBorderColor={accentColor}
                    isDisabled={isFarmerSelected}
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
                    value={farmerMiddleName}
                    onChange={(e) => setFarmerMiddleName(e.target.value)}
                    placeholder="Your answer"
                    borderRadius="md"
                    focusBorderColor={accentColor}
                    isDisabled={isFarmerSelected}
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
                  <Select
                    name='suffix'
                    value={farmerSuffix}
                    onChange={(e) => setFarmerSuffix(e.target.value)}
                    placeholder="E.g., Jr., Sr., III"
                    borderRadius="md"
                    focusBorderColor={accentColor}
                    isDisabled={isFarmerSelected}
                  >
                      <option value="Jr.">Jr.</option>
                      <option value="Sr.">Sr.</option>
                      <option value="II">II</option>
                      <option value="III">III</option>
                      <option value="IV">IV</option>
                      <option value="V">V</option>
                  </Select>
                </FormControl>

                <FormControl id="farmerLocation" isRequired>
                  <FormLabel 
                    fontSize="sm" 
                    fontWeight="medium"
                    color="gray.600"
                  >
                    FARMER RESIDENT BARANGAY
                  </FormLabel>
                  <Select 
                    name='farmer_location'
                    value={farmerLocation}
                    onChange={(e) => setFarmerLocation(e.target.value)}
                    placeholder="Select Barangay"
                    borderRadius="md"
                    focusBorderColor={accentColor}
                    isDisabled={isFarmerSelected}
                  >
                    {Barangays.map((barangay) => (
                      <option key={barangay} value={barangay}>
                        {barangay}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </SimpleGrid>

              {!isFarmerSelected ? (
                 <Button
                  bg={accentColor}
                  color="white"
                  _hover={{ bg: 'blue.700' }}
                  isLoading={isSearching}
                  onClick={handleFindFarmer}
                  px={8}
                  borderRadius="md"
                  isDisabled={!farmerName || !farmerSurname || !farmerLocation}
                >
                  Find Farmer
                </Button>
              ): (
                  <Button 
                    variant={'outline'}
                    colorScheme='green'
                    isLoading={isSearching}
                    onClick={handleResetFarmerSelection}
                    px={8}
                    borderRadius="md"
                  >
                    Reset Farmer Selection
                  </Button>
              )}

            </VStack>
          </Box>
        </Box>

        {isFarmerSelected && (
          <Box bg={cardBg} borderRadius="xl" shadow="xl" w="full" overflow="hidden">
              <Accordion allowToggle defaultIndex={[0]} mt={0}>
                <AccordionItem border="1px" borderColor="gray.200" borderRadius="md">
                  <AccordionButton _expanded={{ bg: 'blue.50', color: accentColor }} py={4}>
                    <Box flex="1" textAlign="left" fontWeight="semibold">
                      Farm Location & Crop Forms
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel p={8}>
                    {/* Farm Location + Crop Type side by side */}
                    <SimpleGrid  spacing={8} mb={10}>  
                      <FormControl id="farmLocation" isRequired>
                        <FormLabel fontSize="sm" fontWeight="medium" color="gray.600">
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

                      <CropTypes
                        inline
                        onNext={handleCropTypesNext}
                        onBack={handleStepBack}
                        isDisabled={!localFormData.farm_location}
                      />
                    </SimpleGrid>

                    <VStack align="stretch" spacing={10}>
                      {steps.includes('cropRecordsIndus') && (
                        <CropRecordsIndus onNext={handleCropRecordsIndusNext} onBack={handleStepBack} />
                      )}
                      {steps.includes('cropRecordsOther') && (
                        <CropRecordsOther
                          cropType={formData.cropType}
                          onNext={handleCropRecordsOtherNext}
                          onBack={handleStepBack}
                        />
                      )}
                      {steps.includes('cropIndusNew') && (
                        <CropIndusNew onBack={handleStepBack} onNext={handleFinalSuccess} />
                      )}
                      {steps.includes('cropIndusHarvest') && (
                        <CropIndusHarvest onBack={handleStepBack} onNext={handleFinalSuccess} />
                      )}
                      {steps.includes('otherFctNew') && (
                        <BcOtherFctNew onBack={handleStepBack} onNext={handleFinalSuccess} />
                      )}
                      {steps.includes('otherFctHarvest') && (
                        <BcOtherFctHarvest onBack={handleStepBack} onNext={handleFinalSuccess} />
                      )}
                    </VStack>
                  </AccordionPanel>
                </AccordionItem>
              </Accordion>
            </Box>
        )}
      </VStack>
    </Box>
  );
};

export default FarmerInput;
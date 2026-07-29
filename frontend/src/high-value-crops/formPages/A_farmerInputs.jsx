import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  IconButton,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useFarmerFormStore } from '../store/farmerForm.store.js';
import { usePublicFormStore } from '../../global/publicForm.store.js';
import Barangays from '../../components/barangays.js';
import { FaUserCheck, FaSearch, FaPlus, FaTrash } from 'react-icons/fa';
import CropTypes from './B_cropTypes.jsx';
import CropRecordsIndus from './C1_cropRecordsIndus.jsx';
import CropRecordsOther from './C2_cropRecordsOther.jsx';
import CropIndusNew from './D1_cropIndusNew.jsx';
import CropIndusHarvest from './D1_cropIndusHarvest.jsx';
import BcOtherFctNew from './D2_bc-other-fctNew.jsx';
import BcOtherFctHarvest from './D2_bc-other-fctHarvest.jsx';

// Component for a single crop form accordion
const CropFormAccordion = ({ 
  accordionId, 
  displayIndex,
  farmerInput, 
  onRemove, 
  canRemove,
  onCompletionChange,
  onGetFormData
}) => {
  const { 
    updateCropType,
    updateCropRecordIndus,
    updateCropRecordOther,
    updateCropIndusNew,
    updateCropIndusHarvest,
    updateCropOtherNew,
    updateCropOtherHarvest,
  } = useFarmerFormStore();
  
  const accentColor = 'blue.600';
  
  // Local state for this accordion - INDEPENDENT from store
  const [accordionFormData, setAccordionFormData] = useState({
    farm_location: '',
    cropType: '',
    cropRecordIndus: null,
    cropRecordOther: null,
    cropIndusHarvest: null,
    cropIndusNew: null,
    cropOtherHarvest: null,
    cropOtherNew: null,
  });
  
  const [steps, setSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  
  // Use ref to store the latest form data for the getter function
  const formDataRef = useRef(accordionFormData);
  formDataRef.current = accordionFormData;
  
  const handleFarmLocationChange = (e) => {
    setAccordionFormData(prev => ({ ...prev, farm_location: e.target.value }));
  };
  
  const handleCropTypesNext = (selectedCropType) => {
    // Update LOCAL state only
    setAccordionFormData(prev => ({ ...prev, cropType: selectedCropType }));
    
    // Update store temporarily for child component
    updateCropType(selectedCropType);
    
    if (selectedCropType === 'VEGETABLES, ROOT CROPS AND OTHER INDUSTRIAL CROPS') {
      setSteps(prev => [...prev, 'cropRecordsIndus']);
      setCurrentStepIndex(prev => prev + 1);
    } else {
      setSteps(prev => [...prev, 'cropRecordsOther']);
      setCurrentStepIndex(prev => prev + 1);
    }
  };
  
  const handleStepBack = () => {
    const currentStep = steps[steps.length - 1];
    
    switch (currentStep) {
      case 'cropTypes':
        setAccordionFormData(prev => ({ ...prev, cropType: '' }));
        updateCropType('');
        break;
      case 'cropRecordsIndus':
        setAccordionFormData(prev => ({ ...prev, cropRecordIndus: null }));
        updateCropRecordIndus(null);
        break;
      case 'cropRecordsOther':
        setAccordionFormData(prev => ({ ...prev, cropRecordOther: null }));
        updateCropRecordOther(null);
        break;
      case 'cropIndusNew':
        setAccordionFormData(prev => ({ ...prev, cropIndusNew: null }));
        updateCropIndusNew(null);
        break;
      case 'cropIndusHarvest':
        setAccordionFormData(prev => ({ ...prev, cropIndusHarvest: null }));
        updateCropIndusHarvest(null);
        break;
      case 'otherFctNew':
        setAccordionFormData(prev => ({ ...prev, cropOtherNew: null }));
        updateCropOtherNew(null);
        break;
      case 'otherFctHarvest':
        setAccordionFormData(prev => ({ ...prev, cropOtherHarvest: null }));
        updateCropOtherHarvest(null);
        break;
      default:
        break;
    }
    
    setSteps(prev => prev.slice(0, -1));
    setCurrentStepIndex(prev => prev - 1);
  };
  
  const handleCropRecordsIndusNext = (stage) => {
    // Get data from store and save to LOCAL state
    const store = useFarmerFormStore.getState();
    const cropRecordData = store.formData.cropRecordIndus;
    
    setAccordionFormData(prev => ({ ...prev, cropRecordIndus: cropRecordData }));
    setSteps(prev => [...prev, stage === 'NEWLY PLANTED' ? 'cropIndusNew' : 'cropIndusHarvest']);
    setCurrentStepIndex(prev => prev + 1);
  };
  
  const handleCropRecordsOtherNext = (stage) => {
    // Get data from store and save to LOCAL state
    const store = useFarmerFormStore.getState();
    const cropRecordData = store.formData.cropRecordOther;
    
    setAccordionFormData(prev => ({ ...prev, cropRecordOther: cropRecordData }));
    setSteps(prev => [...prev, stage === 'NEWLY PLANTED' ? 'otherFctNew' : 'otherFctHarvest']);
    setCurrentStepIndex(prev => prev + 1);
  };
  
  // Check if form is complete
  const checkFormCompletion = () => {
    const hasFarmLocation = !!accordionFormData.farm_location;
    const hasCropType = !!accordionFormData.cropType;
    
    if (!hasFarmLocation || !hasCropType) {
      return false;
    }
    
    // Check based on crop type - only check local accordion state
    if (accordionFormData.cropType === 'VEGETABLES, ROOT CROPS AND OTHER INDUSTRIAL CROPS') {
      const hasCropRecord = !!accordionFormData.cropRecordIndus;
      const hasFinalForm = !!(accordionFormData.cropIndusHarvest || accordionFormData.cropIndusNew);
      return hasCropRecord && hasFinalForm;
    } else if (accordionFormData.cropType) {
      const hasCropRecord = !!accordionFormData.cropRecordOther;
      const hasFinalForm = !!(accordionFormData.cropOtherHarvest || accordionFormData.cropOtherNew);
      return hasCropRecord && hasFinalForm;
    }
    
    return false;
  };
  
  // Update completion status when form data changes
  useEffect(() => {
    const isComplete = checkFormCompletion();
    if (onCompletionChange) {
      onCompletionChange(accordionId, isComplete);
    }
  }, [
    accordionFormData.farm_location,
    accordionFormData.cropType,
    accordionFormData.cropRecordIndus,
    accordionFormData.cropRecordOther,
    accordionFormData.cropIndusHarvest,
    accordionFormData.cropIndusNew,
    accordionFormData.cropOtherHarvest,
    accordionFormData.cropOtherNew,
    accordionId,
    onCompletionChange
  ]);
  
  // Expose form data getter to parent - return LOCAL data
  // Use a stable getter function that reads from ref to avoid infinite loops
  useEffect(() => {
    if (onGetFormData) {
      // Create a stable getter function that always reads the latest data from ref
      const getter = () => {
        const currentData = formDataRef.current;
        return {
          privacyConsent: '',
          farmerInput: {
            ...farmerInput,
            farm_location: currentData.farm_location,
          },
          cropType: currentData.cropType,
          cropRecordIndus: currentData.cropRecordIndus,
          cropRecordOther: currentData.cropRecordOther,
          cropIndusHarvest: currentData.cropIndusHarvest,
          cropIndusNew: currentData.cropIndusNew,
          cropOtherHarvest: currentData.cropOtherHarvest,
          cropOtherNew: currentData.cropOtherNew,
        };
      };
      onGetFormData(accordionId, getter);
    }
    // Only update when accordionId or farmerInput changes, not when form data changes
    // The getter function will always read the latest data from the ref
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accordionId, farmerInput._id, farmerInput.farmerId, onGetFormData]);
  
  const handleFinalSuccess = () => {
    // Get final data from store and save to LOCAL state
    const store = useFarmerFormStore.getState();
    
    // Update accordion state with final form data
    setAccordionFormData(prev => {
      const updated = { ...prev };
      
      // Handle industrial crops
      if (store.formData.cropIndusHarvest) {
        updated.cropIndusHarvest = store.formData.cropIndusHarvest;
        updated.cropIndusNew = null; // Clear conflicting field
      } else if (store.formData.cropIndusNew) {
        updated.cropIndusNew = store.formData.cropIndusNew;
        updated.cropIndusHarvest = null; // Clear conflicting field
      }
      
      // Handle other crops
      if (store.formData.cropOtherHarvest) {
        updated.cropOtherHarvest = store.formData.cropOtherHarvest;
        updated.cropOtherNew = null; // Clear conflicting field
      } else if (store.formData.cropOtherNew) {
        updated.cropOtherNew = store.formData.cropOtherNew;
        updated.cropOtherHarvest = null; // Clear conflicting field
      }
      
      return updated;
    });
  };
  
  return (
    <AccordionItem border="1px" borderColor="gray.200" borderRadius="md" mb={4}>
      <AccordionButton _expanded={{ bg: 'blue.50', color: accentColor }} py={4}>
        <Box flex="1" textAlign="left" fontWeight="semibold" ml={4}>
          Form {displayIndex !== undefined ? `#${displayIndex + 1}` : '#1'}
        </Box>
        {canRemove && (
          <IconButton
            icon={<FaTrash />}
            size="sm"
            variant="ghost"
            colorScheme="red"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            aria-label="Remove accordion"
            mr={2}
          />
        )}
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel pt={5}>
        
          <Box borderRadius="xl" borderColor="gray.200" borderWidth="1px" p={4} mb={8}>
            <FormControl id={`farmLocation-${accordionId}`} isRequired isDisabled={currentStepIndex >= 0}>
              <FormLabel fontSize="sm" fontWeight="bold" color="gray.600" mb={4}>
                FARM LOCATION (PILIIN ANG BARANGAY KUNG NASAAN ANG INYONG TANIMAN)
              </FormLabel>
              <Select
                name={`farm_location-${accordionId}`}
                value={accordionFormData.farm_location}
                onChange={handleFarmLocationChange}
                placeholder="Select Barangay"
                borderRadius="md"
                focusBorderColor={accentColor}
                isDisabled={currentStepIndex >= 0}
              >
                {Barangays.map((barangay) => (
                  <option key={barangay} value={barangay}>
                    {barangay}
                  </option>
                ))}
              </Select>
            </FormControl>
            
            <Stack 
              direction={{ base: 'column', md: 'row' }} 
              spacing={4} 
              justify="flex-end"
              mt={4}
            >
              <Button
                bg={accentColor}
                color="white"
                _hover={{ bg: 'blue.700' }}
                onClick={() => {
                  setSteps(prev => [...prev, 'cropTypes']);
                  setCurrentStepIndex(prev => prev + 1);
                }}
                isDisabled={!accordionFormData.farm_location || currentStepIndex >= 0}
                borderRadius="md"
                w={{ base: 'full', md: 'auto' }}
              >
                Continue
              </Button>
            </Stack>
          </Box>


        

        <VStack align="stretch" spacing={10}>
          {steps.includes('cropTypes') && (
            <CropTypes
              inline
              onNext={handleCropTypesNext}
              onBack={handleStepBack}
              isDisabled={!accordionFormData.farm_location}
              disabled={currentStepIndex > steps.indexOf('cropTypes')}
          />
          )}
          {steps.includes('cropRecordsIndus') && (
            <CropRecordsIndus 
              onNext={handleCropRecordsIndusNext} 
              onBack={handleStepBack}
              disabled={currentStepIndex > steps.indexOf('cropRecordsIndus')}
            />
          )}
          {steps.includes('cropRecordsOther') && (
            <CropRecordsOther
              cropType={accordionFormData.cropType}
              onNext={handleCropRecordsOtherNext}
              onBack={handleStepBack}
              disabled={currentStepIndex > steps.indexOf('cropRecordsOther')}
            />
          )}
          {steps.includes('cropIndusNew') && (
            <CropIndusNew 
              onBack={handleStepBack} 
              onNext={handleFinalSuccess}
              disabled={currentStepIndex > steps.indexOf('cropIndusNew')}
            />
          )}
          {steps.includes('cropIndusHarvest') && (
            <CropIndusHarvest 
              onBack={handleStepBack} 
              onNext={handleFinalSuccess}
              disabled={currentStepIndex > steps.indexOf('cropIndusHarvest')}
            />
          )}
          {steps.includes('otherFctNew') && (
            <BcOtherFctNew 
              onBack={handleStepBack} 
              onNext={handleFinalSuccess}
              disabled={currentStepIndex > steps.indexOf('otherFctNew')}
            />
          )}
          {steps.includes('otherFctHarvest') && (
            <BcOtherFctHarvest 
              onBack={handleStepBack} 
              onNext={handleFinalSuccess}
              disabled={currentStepIndex > steps.indexOf('otherFctHarvest')}
            />
          )}
        </VStack>
      </AccordionPanel>
    </AccordionItem>
  );
};

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
    updateCropOtherHarvest
  } = useFarmerFormStore();
  const { getFarmerAccountByName } = usePublicFormStore();
  const navigate = useNavigate();
  
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
  const [isResettingFarmerSelection, setIsResettingFarmerSelection] = useState(false);
  // Reset farmer selection - FIXED
  const handleResetFarmerSelection = () => {
    setIsResettingFarmerSelection(true);
    
    // First update the form data
    const resetData = {
      _id: '',
      farmerId: '',
      surname: '',
      first_name: '',
      middle_name: '',
      suffix: '',
      farm_location: '',
      farmer_location: '',
    };
    
    // Update store first
    updateFarmerInput(resetData);
    
    // Clear all crop-related data from store
    updateCropType('');
    updateCropRecordIndus(null);
    updateCropRecordOther(null);
    updateCropIndusNew(null);
    updateCropIndusHarvest(null);
    updateCropOtherNew(null);
    updateCropOtherHarvest(null);
    
    // Reset all accordions to initial state
    setAccordionIds([0]);
    setAccordionCompletions({});
    setAccordionFormDataGetters({});
    
    // Then update local state
    setLocalFormData(resetData);
    
    // Finally update UI state
    setFarmerName('');
    setFarmerSurname('');
    setFarmerMiddleName('');
    setFarmerSuffix('');
    setFarmerLocation('');
    setIsFarmerSelected(false);
    setIsResettingFarmerSelection(false);
  };

  useEffect(() => {
    const { farm_location } = localFormData;
    setIsFormValid(farm_location);
  }, [localFormData]);
  
  const cardBg = 'white';
  const headerBorder = 'gray.200';
  const accentColor = 'blue.600'; 

  // Manage multiple accordions
  const [accordionIds, setAccordionIds] = useState([0]);
  const [accordionCompletions, setAccordionCompletions] = useState({});
  const [accordionFormDataGetters, setAccordionFormDataGetters] = useState({});
  const { submitMultipleFarmerForms, isLoading } = useFarmerFormStore();
  
  // Initialize completion status for all accordions
  useEffect(() => {
    const newCompletions = {};
    let hasChanges = false;
    
    accordionIds.forEach(id => {
      if (!(id in accordionCompletions)) {
        newCompletions[id] = false;
        hasChanges = true;
      }
    });
    
    if (hasChanges) {
      setAccordionCompletions(prev => ({ ...prev, ...newCompletions }));
    }
  }, [accordionIds.length]); // Only depend on the length, not the array itself
  
  const handleAddAccordion = () => {
    const newId = accordionIds.length > 0 ? Math.max(...accordionIds) + 1 : 0;
    setAccordionIds(prev => [...prev, newId]);
    setAccordionCompletions(prev => ({ ...prev, [newId]: false }));
  };
  
  const handleRemoveAccordion = (idToRemove) => {
    if (accordionIds.length > 1) {
      setAccordionIds(prev => prev.filter(id => id !== idToRemove));
      setAccordionCompletions(prev => {
        const updated = { ...prev };
        delete updated[idToRemove];
        return updated;
      });
      setAccordionFormDataGetters(prev => {
        const updated = { ...prev };
        delete updated[idToRemove];
        return updated;
      });
    } else {
      toast({
        title: "Cannot Remove",
        description: "You must have at least one crop form.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  const handleCompletionChange = useCallback((accordionId, isComplete) => {
    setAccordionCompletions(prev => ({ ...prev, [accordionId]: isComplete }));
  }, []);
  
  const handleGetFormData = useCallback((accordionId, getter) => {
    setAccordionFormDataGetters(prev => ({ ...prev, [accordionId]: getter }));
  }, []);
  
  // Check if all accordions are complete
  const areAllAccordionsComplete = () => {
    if (accordionIds.length === 0) return false;
    return accordionIds.every(id => accordionCompletions[id] === true);
  };
  
  // Validate form data structure
  const validateFormData = (formData, index) => {
    if (!formData.farmerInput || !formData.farmerInput._id || !formData.farmerInput.farmerId) {
      return `Form ${index + 1}: Missing farmer information`;
    }
    if (!formData.farmerInput.farm_location) {
      return `Form ${index + 1}: Missing farm location`;
    }
    if (!formData.cropType) {
      return `Form ${index + 1}: Missing crop type`;
    }
    
    const isIndustrial = formData.cropType === 'VEGETABLES, ROOT CROPS AND OTHER INDUSTRIAL CROPS';
    if (isIndustrial) {
      if (!formData.cropRecordIndus) {
        return `Form ${index + 1}: Missing industrial crop record`;
      }
      const hasHarvest = !!formData.cropIndusHarvest;
      const hasNew = !!formData.cropIndusNew;
      if (!hasHarvest && !hasNew) {
        return `Form ${index + 1}: Missing industrial crop details (harvest or new)`;
      }
      if (hasHarvest && hasNew) {
        return `Form ${index + 1}: Cannot have both harvest and new data for industrial crops`;
      }
    } else {
      if (!formData.cropRecordOther) {
        return `Form ${index + 1}: Missing other crop record`;
      }
      const hasHarvest = !!formData.cropOtherHarvest;
      const hasNew = !!formData.cropOtherNew;
      if (!hasHarvest && !hasNew) {
        return `Form ${index + 1}: Missing other crop details (harvest or new)`;
      }
      if (hasHarvest && hasNew) {
        return `Form ${index + 1}: Cannot have both harvest and new data for other crops`;
      }
    }
    
    return null; // Valid
  };
  
  // Submit all completed forms
  const handleSubmitAll = async () => {
    if (!areAllAccordionsComplete()) {
      toast({
        title: "Incomplete Forms",
        description: "Please complete all crop forms before submitting.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    // Collect all form data
    const allFormData = accordionIds
      .map(id => {
        const getter = accordionFormDataGetters[id];
        return getter ? getter() : null;
      })
      .filter(Boolean);
    
    if (allFormData.length === 0) {
      toast({
        title: "Error",
        description: "No form data to submit.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    // Validate each form
    for (let i = 0; i < allFormData.length; i++) {
      const validationError = validateFormData(allFormData[i], i);
      if (validationError) {
        toast({
          title: "Validation Error",
          description: validationError,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        return;
      }
    }
    
    // Submit all forms in a single request
    try {
      const result = await submitMultipleFarmerForms(allFormData);
      
      if (result.success) {
        toast({
          title: "Success",
          description: `Successfully submitted ${result.count} crop form(s)!`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        // Navigate to success page
        navigate('/hvc/form/success', { 
          state: { fromSubmission: true },
          replace: true 
        });
      } else {
        throw new Error(result.error || 'Submission failed');
      }
      
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit forms. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
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
                    isLoading={isSearching || isResettingFarmerSelection}
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
          <Box bg={cardBg} borderRadius="xl" shadow="xl" w="full" overflow="hidden" p={6}>
            <VStack spacing={4} align="stretch">
              <Accordion allowToggle defaultIndex={[0]} mt={0}>
                {accordionIds.map((accordionId, index) => (
                  <CropFormAccordion
                    key={accordionId}
                    accordionId={accordionId}
                    displayIndex={index}
                    farmerInput={localFormData}
                    onRemove={() => handleRemoveAccordion(accordionId)}
                    canRemove={accordionIds.length > 1}
                    onCompletionChange={handleCompletionChange}
                    onGetFormData={handleGetFormData}
                  />
                ))}
              </Accordion>
              
              <Button
                leftIcon={<FaPlus />}
                variant='outline'
                color={accentColor}
                borderColor='blue.500'
                onClick={handleAddAccordion}
                borderRadius="md"
                mt={4}
              >
                Add Another Crop Type
              </Button>
              
              <Button
                bg="green.600"
                color="white"
                _hover={{ bg: 'green.700' }}
                onClick={handleSubmitAll}
                isLoading={isLoading}
                borderRadius="md"
                size="md"
                isDisabled={!areAllAccordionsComplete()}
              >
                Submit All Forms
              </Button>
            </VStack>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default FarmerInput;
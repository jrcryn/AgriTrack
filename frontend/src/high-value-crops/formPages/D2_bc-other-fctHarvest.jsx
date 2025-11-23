import React, { useState, useEffect } from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Button,
  Text,
  VStack,
  Radio,
  RadioGroup,
  Select,
  useToast,
} from '@chakra-ui/react';
import Destination from '../../components/destinations.js';
import ModeOfDelivery from '../../components/modeOfDelivery.js';
import DateMonthOptions from '../../components/dateMonthOptions.js';
import { useFarmerFormStore } from '../store/farmerForm.store.js';

const bc_other_fctHarvest = ({ onNext, onBack }) => {
  const toast = useToast();
  const dateOptions = DateMonthOptions();

  // Create combined date options, initially apat kasi yung binibigay ni DateMonthOptions
  const combinedOptions = [
    {
      label: dateOptions[0].label,
      value: `${dateOptions[0].startDate}_to_${dateOptions[0].endDate}`,
    },
    {
      label: dateOptions[1].label,
      value: `${dateOptions[1].startDate}_to_${dateOptions[1].endDate}`,
    }
  ];

  const { formData, updateCropOtherHarvest, submitFarmerForm, isLoading } = useFarmerFormStore();
  const [localFormData, setLocalFormData] = useState(formData.cropOtherHarvest || {
    harvest_start_date: '',
    harvest_end_date: '',
    total_weight: '',
    crop_purpose: '',
    destination: '',
    mode_of_payment: '',
    mode_of_delivery: '',
  });

  const [otherPayment, setOtherPayment] = useState(localFormData.mode_of_payment);
  const [otherDestination, setOtherDestination] = useState(localFormData.destination);
  const [otherDelivery, setOtherDelivery] = useState(localFormData.mode_of_delivery);
  
  const [cropPurpose, setCropPurpose] = useState(localFormData.crop_purpose);

  const [isFormValid, setIsFormValid] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'destination_others') {
      setOtherDestination(value);
    } else if (name === 'mode_of_payment_others') {
      setOtherPayment(value);
    } else if (name === 'mode_of_delivery_others') {
      setOtherDelivery(value);
    } else {
      setLocalFormData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  const handleRadioChange = (name, value) => {
    setLocalFormData((prevData) => ({ ...prevData, [name]: value }));
    
    if (name === 'destination' && value !== 'OTHERS') {
      setOtherDestination('');
    }
    if (name === 'mode_of_payment' && value !== 'OTHERS') {
      setOtherPayment('');
    }
    if (name === 'mode_of_delivery' && value !== 'OTHERS') {
      setOtherDelivery('');
    }
  };

  const handleDateRadioChange = (value) => {
    const [harvest_start_date, harvest_end_date] = value.split('_to_');
    setLocalFormData((prevData) => ({
      ...prevData,
      harvest_start_date,
      harvest_end_date,
    }));
  };

  const handleSubmit = async () => {
    // Validate for negative numbers
    if (parseFloat(localFormData.trees_harvested) < 0) {
      toast({
        title: 'Mali ang Input',
        description: 'Hindi pwedeng negative ang kabuuang bilang ng punong inanihan.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (parseFloat(localFormData.total_weight) < 0) {
      toast({
        title: 'Mali ang Input',
        description: 'Hindi pwedeng negative ang kabuuang timbang ng naani.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setSubmitting(true);
    
    const formDataToSubmit = { ...localFormData };

    if (formDataToSubmit.destination === 'OTHERS' && otherDestination) {
      formDataToSubmit.destination = otherDestination;
    }
    if (formDataToSubmit.mode_of_payment === 'OTHERS' && otherPayment) {
      formDataToSubmit.mode_of_payment = otherPayment;
    }
    if (formDataToSubmit.mode_of_delivery === 'OTHERS' && otherDelivery) {
      formDataToSubmit.mode_of_delivery = otherDelivery;
    }

    updateCropOtherHarvest(formDataToSubmit);
    
    try {
      const success = await submitFarmerForm();
      setSubmitting(false);
      if (success) onNext();
    } catch (error) {
      console.error("Submission error:", error);
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const { harvest_start_date, harvest_end_date, trees_harvested, total_weight, crop_purpose, destination, mode_of_payment, mode_of_delivery } = localFormData;
    
    // Check harvest date is selected
    const hasHarvestDate = harvest_start_date && harvest_end_date;
    
    const needsDestinationFields = crop_purpose === 'PANG BENTA';
    const isOthersValid = !needsDestinationFields || 
                          ((localFormData.destination !== 'OTHERS' || otherDestination) &&
                           (localFormData.mode_of_payment !== 'OTHERS' || otherPayment) &&
                           (localFormData.mode_of_delivery !== 'OTHERS' || otherDelivery));
    
    const destinationFieldsValid = !needsDestinationFields || 
                                 (destination && mode_of_payment && mode_of_delivery);
    
    setIsFormValid(
      hasHarvestDate && 
      trees_harvested && 
      total_weight && 
      crop_purpose &&
      destinationFieldsValid &&
      isOthersValid
    );
  }, [localFormData, otherDestination, otherPayment, otherDelivery]);

  const accentColor = 'blue.600';

  return (
    <Box border="1px" borderColor="gray.200" p={6} borderRadius="lg" bg="white">
      <VStack spacing={6} align="stretch">
        <FormControl id="dateOfHarvest" isRequired>
          <FormLabel fontSize="sm" fontWeight="bold" color="gray.600" textTransform="uppercase" letterSpacing="wide" mb={4}>
            DATE OF HARVEST (PILIIN ANG PETSA KUNG KAILAN NAG-ANI)
          </FormLabel>
          <RadioGroup name="harvest_date" onChange={handleDateRadioChange} value={`${localFormData.harvest_start_date}_to_${localFormData.harvest_end_date}`}>
            <Stack direction="column" spacing={4}>
              {combinedOptions.map((option) => (
                <Radio key={option.value} value={option.value} colorScheme="blue">
                  <Text fontSize="md" color="gray.700">
                    {option.label}
                  </Text>
                </Radio>
              ))}
            </Stack>
          </RadioGroup>
        </FormControl>

        <FormControl id="totalTreesHarvested" isRequired>
          <FormLabel fontSize="sm" fontWeight="bold" color="gray.600" textTransform="uppercase" letterSpacing="wide" mb={4}>
            TOTAL NUMBER OF TREES HARVESTED (ILAN ANG KABUUANG BILANG NG PUNO NA KINUHANAN NINYO NG ANI?)
          </FormLabel>
          <Input 
            type="number" 
            name="trees_harvested" 
            value={localFormData.trees_harvested} 
            onChange={handleChange} 
            onWheel={(e) => e.target.blur()}
            inputMode='numeric'
            min="0"
            step="1"
            placeholder="Your answer" 
          />
        </FormControl>

        <FormControl id="totalWeightHarvested" isRequired>
          <FormLabel fontSize="sm" fontWeight="bold" color="gray.600" textTransform="uppercase" letterSpacing="wide" mb={4}>
            TOTAL WEIGHT OF HARVESTED CROPS (ILAN ANG KABUUANG TIMBANG NA INYONG NAANI?)
          </FormLabel>
          <Input 
            type="number" 
            name="total_weight" 
            value={localFormData.total_weight} 
            onChange={handleChange} 
            onWheel={(e) => e.target.blur()}
            inputMode='numeric'
            min="0"
            step="0.01"
            placeholder="Your answer in kilograms" 
          />
        </FormControl>

        <FormControl id="cropPurpose" isRequired>
          <FormLabel fontSize="sm" fontWeight="bold" color="gray.600" textTransform="uppercase" letterSpacing="wide" mb={4}>
            PURPOSE OF HARVEST (SAAN GAGAMITIN AND INYONG NAANI?)
          </FormLabel>
          <Select name="crop_purpose" placeholder='Select purpose' value={cropPurpose} onChange={(e) => {
            const value = e.target.value;
            setCropPurpose(value);
            setLocalFormData((prevData) => ({
              ...prevData,
              crop_purpose: value
            }));
          }}>
            <option value="PANG BENTA">PANG BENTA (FOR SELLING)</option>
            <option value="PANG SARILI LAMANG">PANG SARILI LAMANG (FOR PERSONAL USE)</option>
          </Select>
        </FormControl>

        {cropPurpose === 'PANG BENTA' && (
          <>
            <FormControl id="destination" isRequired>
              <FormLabel fontSize="sm" fontWeight="bold" color="gray.600" mb={4}>
                DESTINATION (SAAN NIYO DINADALA ANG INYONG MGA INANING GULAY?)
              </FormLabel>
              <RadioGroup name="destination" onChange={(value) => handleRadioChange('destination', value)} value={localFormData.destination}>
                <Stack direction="column" spacing={4}>
                  {Destination.map((option) => (
                    <Radio key={option} value={option} colorScheme="blue">
                      <Text fontSize="md" color="gray.700">
                        {option}
                      </Text>
                    </Radio>
                  ))}
                </Stack>
              </RadioGroup>
              {localFormData.destination === 'OTHERS' && (
                <Box mt={4}>
                  <FormLabel fontSize="sm" fontWeight="bold" color="gray.600">
                    SPECIFY OTHER MODE OF PAYMENT
                  </FormLabel>
                  <Input type="text" name="destination_others" value={otherDestination} onChange={handleChange} placeholder="Please specify" />
                </Box>
              )}
            </FormControl>

            <FormControl id="modeOfPayment" isRequired>
              <FormLabel fontSize="sm" fontWeight="bold" color="gray.600" mb={4}>
                MODE OF PAYMENT (PAANO ANG MODE OF PAYMENT SA INYONG PRODUKTO?)
              </FormLabel>
              <RadioGroup name="mode_of_payment" onChange={(value) => handleRadioChange('mode_of_payment', value)} value={localFormData.mode_of_payment}>
                <Stack direction="column" spacing={4}>
                  <Radio colorScheme="blue" value="CASH">CASH</Radio>
                  <Radio colorScheme="blue" value="GCASH">GCASH</Radio>
                  <Radio colorScheme="blue" value="CHECK (TSEKE)">CHECK (TSEKE)</Radio>
                  <Radio colorScheme="blue" value="OTHERS">OTHERS</Radio>
                </Stack>
              </RadioGroup>
              {localFormData.mode_of_payment === 'OTHERS' && (
                <Box mt={4}>
                  <FormLabel fontSize="sm" fontWeight="bold" color="gray.600" textTransform="uppercase" letterSpacing="wide">
                    SPECIFY OTHER MODE OF PAYMENT
                  </FormLabel>
                  <Input type="text" name="mode_of_payment_others" value={otherPayment} onChange={handleChange} placeholder="Please specify" />
                </Box>
              )}
            </FormControl>

            <FormControl id="modeOfDelivery" isRequired>
              <FormLabel fontSize="sm" fontWeight="bold" color="gray.600" mb={4}>
                MODE OF DELIVERY (PAANO ANG MODE OF DELIVERY NG INYONG PRODUKTO?)
              </FormLabel>
              <RadioGroup name="mode_of_delivery" onChange={(value) => handleRadioChange('mode_of_delivery', value)} value={localFormData.mode_of_delivery}>
                <Stack direction="column" spacing={4}>
                  {ModeOfDelivery.map((option) => (
                    <Radio key={option} value={option} colorScheme="blue">
                      <Text fontSize="md" color="gray.700">
                        {option}
                      </Text>
                    </Radio>
                  ))}
                </Stack>
              </RadioGroup>
              {localFormData.mode_of_delivery === 'OTHERS' && (
                <Box mt={4}>
                  <FormLabel fontSize="sm" fontWeight="bold" color="gray.600" textTransform="uppercase" letterSpacing="wide">
                    SPECIFY OTHER MODE OF DELIVERY
                  </FormLabel>
                  <Input type="text" name="mode_of_delivery_others" value={otherDelivery} onChange={handleChange} placeholder="Please specify" />
                </Box>
              )}
            </FormControl>
          </>
        )}
      </VStack>

      {/* Navigation Buttons */}
      <Stack 
        direction={{ base: 'column', md: 'row' }} 
        spacing={4} 
        justify="flex-end"
        mt={4}
      >
        <Button 
          variant="ghost" 
          colorScheme="blue"
          onClick={onBack}
          w={{ base: 'full', md: 'auto' }}
          borderRadius="md"
        >
          Back
        </Button>
        <Button 
          bg={accentColor}
          color="white"
          _hover={{ bg: 'blue.700' }}
          onClick={handleSubmit} 
          isDisabled={!isFormValid} 
          isLoading={isLoading || submitting}
          w={{ base: 'full', md: 'auto' }}
          borderRadius="md"
        >
          Submit
        </Button>
      </Stack>
    </Box>
  );
};

export default bc_other_fctHarvest;
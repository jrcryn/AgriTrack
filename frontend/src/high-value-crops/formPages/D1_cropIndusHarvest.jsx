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

const CropIndusHarvest = ({ onNext, onBack }) => {
  const toast = useToast();
  const dateOptions = DateMonthOptions();
  const { formData, updateCropIndusHarvest } = useFarmerFormStore();

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
  
  // Initialize from store
  const [localFormData, setLocalFormData] = useState(formData.cropIndusHarvest || {
    harvest_start_date: '',
    harvest_end_date: '',
    crop_purpose: '',
    total_area_harvested: '',
    total_weight: '',
    destination: '',
    mode_of_payment: '',
    mode_of_delivery: '',
  });

  const [otherPayment, setOtherPayment] = useState(localFormData.mode_of_payment);
  const [otherDestination, setOtherDestination] = useState(localFormData.destination);
  const [otherDelivery, setOtherDelivery] = useState(localFormData.mode_of_delivery);

  const [cropPurpose, setCropPurpose] = useState(localFormData.crop_purpose);
  
  
  const [isFormValid, setIsFormValid] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'destination_others') {
      setOtherDestination(value);
      // Don't update the radio selection, just the text field value
    } else if (name === 'mode_of_payment_others') {
      setOtherPayment(value);
      // Don't update the radio selection, just the text field value
    } else if (name === 'mode_of_delivery_others') {
      setOtherDelivery(value);
      // Don't update the radio selection, just the text field value
    } else {
      setLocalFormData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  const handleRadioChange = (name, value) => {
    setLocalFormData((prevData) => ({ ...prevData, [name]: value }));
    
    // Reset "other" fields when selecting non-"OTHERS" options
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

  const handleContinue = () => {
    // Validate for negative numbers
    if (parseFloat(localFormData.total_area_harvested) < 0) {
      toast({
        title: 'Mali ang Input',
        description: 'Hindi pwedeng negative ang kabuuang sukat na inanihan.',
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
    
    const formDataToSubmit = {...localFormData};
    
    if (formDataToSubmit.destination === 'OTHERS' && otherDestination) {
      formDataToSubmit.destination = otherDestination;
    }
    
    if (formDataToSubmit.mode_of_payment === 'OTHERS' && otherPayment) {
      formDataToSubmit.mode_of_payment = otherPayment;
    }
    
    if (formDataToSubmit.mode_of_delivery === 'OTHERS' && otherDelivery) {
      formDataToSubmit.mode_of_delivery = otherDelivery;
    }
    
    updateCropIndusHarvest(formDataToSubmit);
    onNext();
  };


  useEffect(() => {
    const { harvest_start_date, harvest_end_date, total_area_harvested, total_weight, crop_purpose, destination, mode_of_payment, mode_of_delivery } = localFormData;
    
    // Check harvest date is selected
    const hasHarvestDate = harvest_start_date && harvest_end_date;
    
    // Only require destination, payment and delivery fields if crop_purpose is PANG BENTA
    const needsDestinationFields = crop_purpose === 'PANG BENTA';
    const isOthersValid = !needsDestinationFields || 
                          ((localFormData.destination !== 'OTHERS' || otherDestination) &&
                           (localFormData.mode_of_payment !== 'OTHERS' || otherPayment) &&
                           (localFormData.mode_of_delivery !== 'OTHERS' || otherDelivery));
    
    const destinationFieldsValid = !needsDestinationFields || 
                                 (destination && mode_of_payment && mode_of_delivery);
    
    setIsFormValid(
      hasHarvestDate && 
      total_area_harvested && 
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

        {/* Date of Harvest */}
        <FormControl id="harvestDate" isRequired>
          <FormLabel
            fontSize="sm"
            fontWeight="bold"
            color="gray.600"
            textTransform="uppercase"
            letterSpacing="wide"
            mb={4}
          >
            DATE OF HARVEST (PILIIN ANG PETSA KUNG KAILAN NAG-ANI)
          </FormLabel>
          <RadioGroup
            name="harvest_date"
            onChange={handleDateRadioChange}
            value={`${localFormData.harvest_start_date}_to_${localFormData.harvest_end_date}`}
          >
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

        {/* Total Area Harvested */}
        <FormControl id="totalAreaHarvested" isRequired>
          <FormLabel
            fontSize="sm"
            fontWeight="bold"
            color="gray.600"
            textTransform="uppercase"
            letterSpacing="wide"
            mb={4}
          >
            TOTAL AREA HARVESTED (ILAN ANG KABUUANG SUKAT NA INYONG INANIHAN?)
          </FormLabel>
          <Box 
            bg='blue.50'
            borderRadius="md"
            p={4}
            mb={5}
            borderLeftWidth="4px"
            borderColor={accentColor}
          >
            <Text fontWeight={'bold'} fontSize={'sm'}>PAALALA:</Text>
            <Text 
              fontWeight={'normal'}
              fontSize={'sm'}
              mb={5}
            >
              <strong>EKTARYA (HECTARE / HA)</strong> ang gamiting sukat sa pagsagot sa area ng inyong tanim
            </Text>          
            <Text fontWeight={'bold'} fontSize={'sm'}>HALIMBAWA:</Text>
            <Text fontSize={'sm'}>Ang 1000 square meters o 1 arya ay katumbas ng <strong><u><i>0.1 ektarya</i></u></strong></Text>

            <Text fontSize={'sm'} mb={5}>Ang 500 square meters o kalahating arya (1/2 arya) ay katumbas ng <strong><u><i>0.05 ektarya</i></u></strong></Text>

            <Text fontWeight={'bold'} fontSize={'sm'} textDecoration={'underline'} fontStyle={'italic'}>Paano i-compute:</Text>
            <Text fontSize={'sm'}>1,000 square meters divided by 10,000 square meters = <strong><u><i>0.1 ektarya</i></u></strong></Text>
          </Box>
          <Input 
            type="number" 
            name="total_area_harvested"
            value={localFormData.total_area_harvested}
            onChange={handleChange}
            onWheel={(e) => e.target.blur()}
            inputMode='numeric'
            min="0"
            step="0.01"
            placeholder="Your answer" 
          />
        </FormControl>

        {/* Total Weight of Production */}
        <FormControl id="totalWeightProduction" isRequired>
          <FormLabel
            fontSize="sm"
            fontWeight="bold"
            color="gray.600"
            textTransform="uppercase"
            letterSpacing="wide"
            mb={4}
          >
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

        {/* Crop Purpose */}
        <FormControl id="cropPurpose" isRequired>
          <FormLabel
            fontSize="sm"
            fontWeight="bold"
            color="gray.600"
            textTransform="uppercase"
            letterSpacing="wide"
            mb={4}
          >
            PURPOSE OF HARVEST (SAAN GAGAMITIN AND INYONG NAANI?)
          </FormLabel>
          <Select
            name="crop_purpose"
            placeholder='Select purpose'
            value={cropPurpose}
            onChange={(e) => {
              const value = e.target.value;
              setCropPurpose(value);
              setLocalFormData((prevData) => ({
                ...prevData,
                crop_purpose: value
              }));
            }}
          >
            <option value="PANG BENTA">PANG BENTA (FOR SELLING)</option>
            <option value="PANG SARILI LAMANG">PANG SARILI LAMANG (FOR PERSONAL USE)</option>
          </Select>
        </FormControl>

        {cropPurpose === 'PANG BENTA' && (
          <>
          {/* Destination */}
          <FormControl id="destination" isRequired>
            <FormLabel
              fontSize="sm"
              fontWeight="bold"
              color="gray.600"
              textTransform="uppercase"
              letterSpacing="wide"
              mb={4}
            >
              DESTINATION (SAAN NIYO DINADALA ANG INYONG MGA INANING GULAY?)
            </FormLabel>
            <RadioGroup
              name="destination"
              onChange={(value) => handleRadioChange('destination', value)}
              value={localFormData.destination}
            >
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
              <FormLabel
                fontSize="sm"
                fontWeight="bold"
                color="gray.600"
                textTransform="uppercase"
                letterSpacing="wide"
              >
                SPECIFY OTHER MODE OF PAYMENT
              </FormLabel>
              <Input
                type="text"
                name="destination_others"
                value={otherDestination}
                onChange={handleChange}
                placeholder="Please specify"
              />
            </Box>
          )}
          </FormControl>

          {/* Mode of Payment */}
          <FormControl id="modeOfPayment" isRequired>
            <FormLabel
              fontSize="sm"
              fontWeight="bold"
              color="gray.600"
              textTransform="uppercase"
              letterSpacing="wide"
              mb={4}
            >
              MODE OF PAYMENT (PAANO ANG MODE OF PAYMENT SA INYONG PRODUKTO?)
            </FormLabel>
            <RadioGroup
              name="mode_of_payment"
              onChange={(value) => handleRadioChange('mode_of_payment', value)}
              value={localFormData.mode_of_payment}
            >
              <Stack direction="column" spacing={4}>
                <Radio colorScheme="blue" value="CASH">
                  CASH
                </Radio>
                <Radio colorScheme="blue" value="GCASH">
                  GCASH
                </Radio>
                <Radio colorScheme="blue" value="CHECK (TSEKE)">
                  CHECK (TSEKE)
                </Radio>
                <Radio colorScheme="blue" value="OTHERS">
                  OTHERS
                </Radio>
              </Stack>
            </RadioGroup>
            {localFormData.mode_of_payment === 'OTHERS' && (
              <Box mt={4}>
              <FormLabel
                fontSize="sm"
                fontWeight="bold"
                color="gray.600"
                textTransform="uppercase"
                letterSpacing="wide"
              >
                SPECIFY OTHER MODE OF PAYMENT
              </FormLabel>
              <Input
                type="text"
                name="mode_of_payment_others"
                value={otherPayment}
                onChange={handleChange}
                placeholder="Please specify"
              />
            </Box>
          )}
          </FormControl>

          {/* Mode of Delivery */}
          <FormControl id="modeOfDelivery" isRequired>
            <FormLabel
              fontSize="sm"
              fontWeight="bold"
              color="gray.600"
              textTransform="uppercase"
              letterSpacing="wide"
              mb={4}
            >
              MODE OF DELIVERY (PAANO ANG MODE OF DELIVERY NG INYONG PRODUKTO?)
            </FormLabel>
            <RadioGroup
              name="mode_of_delivery"
              onChange={(value) => handleRadioChange('mode_of_delivery', value)}
              value={localFormData.mode_of_delivery}
            >
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
              <FormLabel
                fontSize="sm"
                fontWeight="bold" 
                color="gray.600"
                textTransform="uppercase"
                letterSpacing="wide"
              >
                SPECIFY OTHER MODE OF DELIVERY
              </FormLabel>
              <Input
                type="text"
                name="mode_of_delivery_others"
                value={otherDelivery}
                onChange={handleChange}
                placeholder="Please specify"
              />
            </Box>
          )}
          </FormControl>
          </>

        )}
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
            onClick={handleContinue} 
            isDisabled={!isFormValid} 
            w={{ base: 'full', md: 'auto' }}
            borderRadius="md"
          >
            Continue
          </Button>
        </Stack>
      </VStack>
    </Box>
  );
};

export default CropIndusHarvest;
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
import DateMonthOptions from '../../components/dateMonthOptions.js';
import { useFarmerFormStore } from '../store/farmerForm.store.js';

const CropIndusNew = ({ onNext, onBack }) => {
  const toast = useToast();
  const dateOptions = DateMonthOptions();
  const { formData, updateCropIndusNew, submitFarmerForm, isLoading } = useFarmerFormStore();

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

  const [localFormData, setLocalFormData] = useState(formData.cropIndusNew || {
    plantation_start_date: '',
    plantation_end_date: '',
    harvest_month_year: '',
    total_area_planted: '',
  });

  const [isFormValid, setIsFormValid] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleDateRadioChange = (value) => {
    const [plantation_start_date, plantation_end_date] = value.split('_to_');
    setLocalFormData((prevData) => ({
      ...prevData,
      plantation_start_date,
      plantation_end_date,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate for negative numbers
    if (parseFloat(localFormData.total_area_planted) < 0) {
      toast({
        title: 'Mali ang Input',
        description: 'Hindi pwedeng negative ang kabuuang sukat ng tinaniman.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    // Combine harvest_month and harvest_year into a date value
    const harvestDate = new Date(`${localFormData.harvest_year}-${localFormData.harvest_month}-01`);
    const formattedHarvestDate = harvestDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD

    const data = {
      ...localFormData,
      harvest_month_year: formattedHarvestDate,
    };
    updateCropIndusNew(data);
    
    try {
      const success = await submitFarmerForm();
      if (success) onNext();
    } catch (error) {
      console.error("Submission error:", error);
    }
  };

  useEffect(() => {
    const { plantation_start_date, plantation_end_date, harvest_month, harvest_year, total_area_planted } = localFormData;
    const isValidYear = /^\d{4}$/.test(harvest_year);
    const hasPlantationDate = plantation_start_date && plantation_end_date;
    setIsFormValid(hasPlantationDate && harvest_month && isValidYear && total_area_planted);
  }, [localFormData]);

  const accentColor = 'blue.600';

  return (
    <Box border="1px" borderColor="gray.200" p={6} borderRadius="lg" bg="white">
      <VStack spacing={6} align="stretch">
        {/* DATE OF PLANTATION */}
        <FormControl id="plantationDate" isRequired>
          <FormLabel
            fontSize="sm"
            fontWeight="bold"
            color="gray.600"
            textTransform="uppercase"
            letterSpacing="wide"
            mb={4}
          >
            DATE OF PLANTATION (PILIIN ANG PETSA KUNG KAILAN ITO ITINANIM)
          </FormLabel>
          <RadioGroup
            name="plantation_date"
            onChange={handleDateRadioChange}
            value={`${localFormData.plantation_start_date}_to_${localFormData.plantation_end_date}`}
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

        {/* MONTH AND YEAR OF HARVEST */}
        <FormControl id="monthOfHarvest" isRequired>
          <FormLabel
            fontSize="sm"
            fontWeight="bold"
            color="gray.600"
            textTransform="uppercase"
            letterSpacing="wide"
            mb={4}
          >
            MONTH AND YEAR OF HARVEST (BUWAN AT TAON KUNG KAILAN AANIHIN ANG ITINANIM)
          </FormLabel>
          <Stack direction={{ base: "column", md: "row" }} spacing={4}>
            <Select
              name="harvest_month"
              placeholder="Select month"
              value={localFormData.harvest_month}
              onChange={handleChange}
            >
              <option value="01">JANUARY</option>
              <option value="02">FEBRUARY</option>
              <option value="03">MARCH</option>
              <option value="04">APRIL</option>
              <option value="05">MAY</option>
              <option value="06">JUNE</option>
              <option value="07">JULY</option>
              <option value="08">AUGUST</option>
              <option value="09">SEPTEMBER</option>
              <option value="10">OCTOBER</option>
              <option value="11">NOVEMBER</option>
              <option value="12">DECEMBER</option>
            </Select>
            <Input
              name="harvest_year"
              type="text"
              placeholder="YYYY"
              maxLength={4}
              pattern="^[0-9]{4}$"
              inputMode="numeric"
              title="Please enter a valid 4-digit year"
              value={localFormData.harvest_year}
              onChange={handleChange}
              required
            />
          </Stack>
        </FormControl>

        {/* TOTAL AREA PLANTED */}
        <FormControl id="totalAreaPlanted" isRequired>
          <FormLabel
            fontSize="sm"
            fontWeight="bold"
            color="gray.600"
            textTransform="uppercase"
            letterSpacing="wide"
            mb={4}
          >
            TOTAL AREA PLANTED (KABUUANG SUKAT NG TINANIMAN)
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
            name="total_area_planted"
            value={localFormData.total_area_planted}
            onChange={handleChange}
            onWheel={(e) => e.target.blur()}
            inputMode='numeric'
            min="0"
            step="0.01"
            placeholder="Your answer"
          />
        </FormControl>

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
            isLoading={isLoading}
            w={{ base: 'full', md: 'auto' }}
            borderRadius="md"
          >
            Submit
          </Button>
        </Stack>
      </VStack>
    </Box>
  );
};

export default CropIndusNew;
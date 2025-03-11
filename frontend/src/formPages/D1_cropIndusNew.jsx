import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
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
} from '@chakra-ui/react';
import DateMonthOptions from '../components/dateMonthOptions.js';
import { useFarmerFormStore } from '../store/farmerForm.store.js';

const CropIndusNew = ({ onNext, onBack }) => {
  const dateOptions = DateMonthOptions();
  const { formData, updateCropIndusNew, submitFarmerForm, isLoading } = useFarmerFormStore();

  // Create combined date options, initially apat kasi yung binibigay ni DateMonthOptions
  const combinedOptions = [
    {
      label: `${dateOptions[0].label} to ${dateOptions[1].label}`,
      value: `${dateOptions[0].startDate}_to_${dateOptions[1].endDate}`,
      startDate: dateOptions[0].startDate,
      endDate: dateOptions[1].endDate
    },
    {
      label: `${dateOptions[2].label} to ${dateOptions[3].label}`,
      value: `${dateOptions[2].startDate}_to_${dateOptions[3].endDate}`,
      startDate: dateOptions[2].startDate,
      endDate: dateOptions[3].endDate
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

  const handleSubmit = async () => {
    // Combine harvest_month and harvest_year into a date value
    const harvestDate = new Date(`${localFormData.harvest_year}-${localFormData.harvest_month}-01`);
    const formattedHarvestDate = harvestDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD

    const data = {
      ...localFormData,
      harvest_month_year: formattedHarvestDate,
    };
    updateCropIndusNew(data);
    
    const success = await submitFarmerForm();
    if (success) {
      onNext('/success');
    }
  };

  useEffect(() => {
    const { harvest_month, harvest_year, total_area_planted } = localFormData;
    const isValidYear = /^\d{4}$/.test(harvest_year);
    setIsFormValid( harvest_month && isValidYear && total_area_planted);
  }, [localFormData]);

  const cardBg = 'white';
  const accentColor = 'blue.600';
  const headerBorder = 'gray.200';

  return (
    <Box minH="100vh" py={10} px={4}>
      <VStack spacing={8} maxW="800px" mx="auto" w="full">
        {/* Main Card */}
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

          {/* Form Content */}
          <Box p={8}>
            <VStack spacing={6} align="stretch">
              {/* Section Label */}
              <Box
                bg='blue.50'
                borderRadius="md"
                p={4}
                borderLeftWidth="4px"
                borderColor={accentColor}
              >
                <Text fontSize="md" fontWeight="bold" color="blue.600">
                  VEGETABLES, ROOT CROPS AND OTHER INDUSTRIAL CROPS (NEWLY PLANTED)
                </Text>
              </Box>

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
                    <option value="01">January</option>
                    <option value="02">February</option>
                    <option value="03">March</option>
                    <option value="04">April</option>
                    <option value="05">May</option>
                    <option value="06">June</option>
                    <option value="07">July</option>
                    <option value="08">August</option>
                    <option value="09">September</option>
                    <option value="10">October</option>
                    <option value="11">November</option>
                    <option value="12">December</option>
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
                  placeholder="Your answer"
                />
              </FormControl>
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
                onClick={handleSubmit}
                isLoading={isLoading}
                px={8}
                borderRadius="md"
                isDisabled={!isFormValid}
              >
                Submit
              </Button>
            </Stack>
          </Box>
        </Box>
      </VStack>
    </Box>
  );
};

export default CropIndusNew;
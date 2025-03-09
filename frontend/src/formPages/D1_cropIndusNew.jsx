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
  const options = DateMonthOptions();
  const { formData, updateCropIndusNew, submitFarmerForm, isLoading } = useFarmerFormStore();

  const [localFormData, setLocalFormData] = useState(formData.cropIndusNew || {
    plantation_date: '',
    harvest_month: '',
    harvest_year: '',
    total_area_planted: '',
  });

  const [isFormValid, setIsFormValid] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'harvest_year' && !/^\d{0,4}$/.test(value)) {
      return; // Prevent invalid year input
    }
    setLocalFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleRadioChange = (name, value) => {
    setLocalFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async () => {
    const data = {
      ...localFormData,
      harvest_month: `${localFormData.harvest_month} ${localFormData.harvest_year}`,
    };
    updateCropIndusNew(data);
    
    const success = await submitFarmerForm();
    if (success) {
      onNext('/success');
    }
  };

  useEffect(() => {
    const { plantation_date, harvest_month, harvest_year, total_area_planted } = localFormData;
    const isValidYear = /^\d{4}$/.test(harvest_year);
    setIsFormValid(plantation_date && harvest_month && isValidYear && total_area_planted);
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
                  onChange={(value) => handleRadioChange('plantation_date', value)}
                  value={localFormData.plantation_date}
                >
                  <Stack direction="column" spacing={4}>
                    {options.map((option) => (
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
                    <option value="January">January</option>
                    <option value="February">February</option>
                    <option value="March">March</option>
                    <option value="April">April</option>
                    <option value="May">May</option>
                    <option value="June">June</option>
                    <option value="July">July</option>
                    <option value="August">August</option>
                    <option value="September">September</option>
                    <option value="October">October</option>
                    <option value="November">November</option>
                    <option value="December">December</option>
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
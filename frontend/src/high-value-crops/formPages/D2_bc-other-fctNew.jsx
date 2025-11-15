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
  useToast,
} from '@chakra-ui/react';
import DateMonthOptions from '../../components/dateMonthOptions.js';
import { useFarmerFormStore } from '../store/farmerForm.store.js';

const bc_other_fctNew = ({ onNext, onBack }) => {
  const toast = useToast();
  const dateOptions = DateMonthOptions();
  const { formData, updateCropOtherNew, submitFarmerForm, isLoading } = useFarmerFormStore();

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

  const [localFormData, setLocalFormData] = useState(formData.cropOtherNew || {
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
    // Validate for negative numbers
    if (parseFloat(localFormData.total_trees) < 0) {
      toast({
        title: 'Mali ang Input',
        description: 'Hindi pwedeng negative ang kabuuang bilang ng puno.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    const harvestDate = new Date(`${localFormData.harvest_year}-${localFormData.harvest_month}-01`);
    const formattedHarvestDate = harvestDate.toISOString().split('T')[0];

    const data = {
      ...localFormData,
      harvest_month_year: formattedHarvestDate,
    };
    updateCropOtherNew(data);
    
    try {
      const success = await submitFarmerForm();
      if (success) {
        onNext('/success', null, { state: { fromSubmission: true } });
      }
    } catch (error) {
      console.error("Submission error:", error);
    }
  };

  useEffect(() => {
    const { plantation_start_date, plantation_end_date, harvest_month, harvest_year, total_trees } = localFormData;
    const isValidYear = /^\d{4}$/.test(harvest_year);
    setIsFormValid( plantation_start_date && plantation_end_date && harvest_month && isValidYear && total_trees);
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

              {/* Section Header */}
              <Box
                bg="blue.50"
                borderRadius="md"
                p={4}
                borderLeftWidth="4px"
                borderColor="blue.600"
              >
                <Text fontSize="md" fontWeight="bold" color="blue.600">
                  OTHER FRUIT CROPS/TREES (NEWLY PLANTED)
                </Text>
              </Box>

              {/* DATE OF PLANTATION */}
              <FormControl id="dateOfPlantation" isRequired>
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

              {/* TOTAL NUMBER OF TREES */}
              <FormControl id="totalNumberOfTrees" isRequired>
                <FormLabel
                  fontSize="sm"
                  fontWeight="bold"
                  color="gray.600"
                  textTransform="uppercase"
                  letterSpacing="wide"
                  mb={4}
                >
                  TOTAL NUMBER OF TREES (KABUUANG BILANG NG PUNO NA NAKATANIM)
                </FormLabel>
                <Box 
                  bg='blue.50'
                  borderRadius="md"
                  p={4}
                  mb={5}
                  borderLeftWidth="4px"
                  borderColor={accentColor}
                >
                  <Text fontSize="sm">
                    <Text fontWeight="bold" mb={3}>PAALALA:</Text> 
                    Isulat kung ilang piraso ng puno ang nakatanim.
                  </Text>
                </Box>
                <Input
                  type="number"
                  name="total_trees"
                  value={localFormData.total_trees}
                  onChange={handleChange}
                  onWheel={(e) => e.target.blur()}
                  min="0"
                  step="1"
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

export default bc_other_fctNew;
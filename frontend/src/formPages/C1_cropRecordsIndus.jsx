import React, { useState } from 'react';
import {
  Box,
  Heading,
  FormControl,
  FormLabel,
  Stack,
  Button,
  Text,
  VStack,
  Radio,
  RadioGroup,
  Select,
  Input
} from '@chakra-ui/react';
import IndusCrops from '../components/indusCrops.js';
import { useFarmerFormStore } from '../store/farmerForm.js';

const CropRecordsIndus = ({ onNext, onBack }) => {
  const [stageOfCrop, setStageOfCrop] = useState('');

  const [formData, setFormData] = useState({
    crop_type: '',
    crop_variety: '',
    crop_stage: '',
  });

  const { CropRecordIndus } = useFarmerFormStore();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleStageChange = (value) => {
    setStageOfCrop(value);
    setFormData((prevData) => ({ ...prevData, crop_stage: value }));
  };

  const handleSubmit = async () => {
    await CropRecordIndus(formData);
    handleNext();
  };

  const handleNext = () => {
    let nextPath = '';
    if (stageOfCrop === 'NEWLY PLANTED') {
      nextPath = '/d1_cin'; // dedicated page for newly planted crops
    } else if (stageOfCrop === 'HARVESTING') {
      nextPath = '/d1_cih'; // dedicated page for harvesting crops
    }
    onNext(nextPath);
  };

  const cardBg = 'white';
  const accentColor = 'blue.600';
  const headerBorder = 'gray.200';

  return (
    <Box bg='white' minH="100vh" py={10} px={4}>
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
                  VEGETABLES, ROOT CROPS AND OTHER INDUSTRIAL CROPS
                </Text>
              </Box>

              {/* URI NG TANIM */}
              <FormControl id="cropName" isRequired>
                <FormLabel
                  fontSize="sm"
                  fontWeight="bold"
                  color="gray.600"
                  textTransform="uppercase"
                  letterSpacing="wide"
                  mb={4}
                >
                  URI NG TANIM
                </FormLabel>
                <Select 
                name="crop_type" 
                placeholder="Choose"
                value={formData.crop_type}
                onChange={handleChange}
                >
                  {IndusCrops.map((crop) => (
                    <option key={crop} value={crop}>
                      {crop}
                    </option>
                  ))}
                </Select>
              </FormControl>

              {/* VARIETY NG TANIM */}
              <FormControl id="variety">
                <FormLabel
                  fontSize="sm"
                  fontWeight="bold"
                  color="gray.600"
                  textTransform="uppercase"
                  letterSpacing="wide"
                  mb={4}
                >
                  VARIETY NG TANIM
                </FormLabel>
                <Box
                  bg='blue.50'
                  borderRadius="md"
                  p={3}
                  borderLeftWidth="4px"
                  borderColor={accentColor}
                  mb={3}
                >
                  <Text fontSize="sm" fontWeight="bold" color='black' mb={3}>
                    PAALALA:
                  </Text>
                  <Text fontSize='sm' fontWeight={'normal'}>
                    Huwag sagutan kung hindi alam ang ginamit na variety ng tanim.
                  </Text>
                </Box>
                <Input 
                name='crop_variety'
                value={formData.crop_variety}
                onChange={handleChange}
                type="text" 
                placeholder="Isulat ang variety ng inyong tanim" 
                />
              </FormControl>

              {/* YUGTO NG INYONG PANANIM */}
              <FormControl id="stageOfCrop" isRequired>
                <FormLabel
                  fontSize="sm"
                  fontWeight="bold"
                  color="gray.600"
                  textTransform="uppercase"
                  letterSpacing="wide"
                  mb={4}
                >
                  YUGTO NG INYONG PANANIM
                </FormLabel>
                <RadioGroup 
                onChange={handleStageChange} 
                value={stageOfCrop}
                >
                  <Stack direction="column" spacing={4}>
                    <Radio value="NEWLY PLANTED" colorScheme="blue">
                      <Text fontSize="md" color="gray.700">NEWLY PLANTED</Text>
                    </Radio>
                    <Radio value="HARVESTING" colorScheme="blue">
                      <Text fontSize="md" color="gray.700">HARVESTING</Text>
                    </Radio>
                  </Stack>
                </RadioGroup>
              </FormControl>
            </VStack>

            {/* Navigation Buttons */}
            <Stack direction={{ base: 'column', md: 'row' }} spacing={4} justify="flex-end" mt={12}>
              <Button variant="ghost" colorScheme="blue" onClick={onBack} px={8} borderRadius="md">
                Back
              </Button>
              <Button
                bg={accentColor}
                color="white"
                _hover={{ bg: 'blue.700' }}
                onClick={handleSubmit}
                px={8}
                borderRadius="md"
                isDisabled={!stageOfCrop}
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

export default CropRecordsIndus;

import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  FormControl,
  FormLabel,
  Stack,
  Button,
  Text,
  VStack,
  RadioGroup,
  Radio,
  Select,
} from '@chakra-ui/react';
import OtherFCT from '../components/otherFCT.js';
import { useFarmerFormStore } from '../store/farmerForm.js';

const CropRecordsOther = ({ onNext, onBack, cropType }) => {
  const [stageOfCrop, setStageOfCrop] = useState('');

  const [formData, setFormData] = useState({
    crop_variety: '',
    crop_stage: '',
  });

  const { CropRecordOther, isLoading } = useFarmerFormStore();
  const [isFormValid, setIsFormValid] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleStageChange = (value) => {
    setStageOfCrop(value);
    setFormData((prevData) => ({ ...prevData, crop_stage: value }));
  };

  const handleSubmit = async () => {
    await CropRecordOther(formData);
    handleNext();
  };

  const handleNext = () => {
    let nextPath = '';
    if (stageOfCrop === 'NEWLY PLANTED') {
      nextPath = '/d2_bc_ofn'; // dedicated page for newly planted crops
    } else if (stageOfCrop === 'HARVESTING') {
      nextPath = '/d2_bc_ofh'; // dedicated page for harvesting crops
    }
    onNext(nextPath);
  };

  useEffect(() => {
    const { crop_variety, crop_stage } = formData;
    setIsFormValid(crop_variety && crop_stage);
  }, [formData]);

  const cardBg = 'white';
  const accentColor = 'blue.600';
  const headerBorder = 'gray.200';

  return (
    <Box minH="100vh" py={10} px={4} bg='white'>
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

          {/* Form Content */}
          <Box p={8}>
            {cropType === "BANANA" && (
              <>
                {/* Section Header */}
                <Box
                  bg="blue.50"
                  borderRadius="md"
                  p={4}
                  mb={6}
                  borderLeftWidth="4px"
                  borderColor="blue.600"
                >
                  <Text fontSize="md" fontWeight="bold" color="blue.600">
                    BANANA
                  </Text>
                </Box>

                {/* Variety Selection */}
                <FormControl id="bananaVariety" isRequired mb={6}>
                  <FormLabel
                    fontSize="sm"
                    fontWeight="bold"
                    color="gray.600"
                    textTransform="uppercase"
                    letterSpacing="wide"
                    mb={4}
                  >
                    PUMILI NG VARIETY NG BANANA
                  </FormLabel>
                  <RadioGroup
                    name='crop_variety'
                    onChange={handleChange}
                    value={formData.crop_variety}
                  >
                    <Stack direction="column" spacing={4}>
                      <Radio colorScheme="blue" value="BUNGULAN">
                        <Text fontSize="md" color="gray.700">BUNGULAN</Text>
                      </Radio>
                      <Radio colorScheme="blue" value="LACATAN">
                        <Text fontSize="md" color="gray.700">LACATAN</Text>
                      </Radio>
                      <Radio colorScheme="blue" value="LAGKITAN">
                        <Text fontSize="md" color="gray.700">LAGKITAN</Text>
                      </Radio>
                      <Radio colorScheme="blue" value="LATUNDAN">
                        <Text fontSize="md" color="gray.700">LATUNDAN</Text>
                      </Radio>
                      <Radio colorScheme="blue" value="SABA">
                        <Text fontSize="md" color="gray.700">SABA</Text>
                      </Radio>
                      <Radio colorScheme="blue" value="SENORITA">
                        <Text fontSize="md" color="gray.700">SENORITA</Text>
                      </Radio>
                    </Stack>
                  </RadioGroup>
                </FormControl>

                {/* Stage Selection */}
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
                      <Radio colorScheme="blue" value="NEWLY PLANTED">
                        <Text fontSize="md" color="gray.700">NEWLY PLANTED</Text>
                      </Radio>
                      <Radio colorScheme="blue" value="HARVESTING">
                        <Text fontSize="md" color="gray.700">HARVESTING</Text>
                      </Radio>
                    </Stack>
                  </RadioGroup>
                </FormControl>
              </>
            )}

            {cropType === "COFFEE" && (
              <>
                {/* Section Header */}
                <Box
                  bg="blue.50"
                  borderRadius="md"
                  p={4}
                  mb={6}
                  borderLeftWidth="4px"
                  borderColor="blue.600"
                >
                  <Text fontSize="md" fontWeight="bold" color="blue.600">
                    COFFEE
                  </Text>
                </Box>

                {/* Variety Selection */}
                <FormControl id="coffeeVariety" isRequired mb={6}>
                  <FormLabel
                    fontSize="sm"
                    fontWeight="bold"
                    color="gray.600"
                    textTransform="uppercase"
                    letterSpacing="wide"
                    mb={4}
                  >
                    PUMILI NG VARIETY NG COFFEE
                  </FormLabel>
                  <RadioGroup 
                  name='crop_variety'
                  onChange={handleChange}
                  value={formData.crop_variety} 
                  >
                    <Stack direction="column" spacing={4}>
                      <Radio colorScheme="blue" value="LIBERICA">
                        <Text fontSize="md" color="gray.700">LIBERICA</Text>
                      </Radio>
                      <Radio colorScheme="blue" value="ROBUSTA">
                        <Text fontSize="md" color="gray.700">ROBUSTA</Text>
                      </Radio>
                    </Stack>
                  </RadioGroup>
                </FormControl>

                {/* Stage Selection */}
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
                      <Radio colorScheme="blue" value="NEWLY PLANTED">
                        <Text fontSize="md" color="gray.700">NEWLY PLANTED</Text>
                      </Radio>
                      <Radio colorScheme="blue" value="HARVESTING">
                        <Text fontSize="md" color="gray.700">HARVESTING</Text>
                      </Radio>
                    </Stack>
                  </RadioGroup>
                </FormControl>
              </>
            )}

            {cropType === "OTHER FRUIT CROPS/TREES" && (
              <>
                {/* Section Header */}
                <Box
                  bg="blue.50"
                  borderRadius="md"
                  p={4}
                  mb={6}
                  borderLeftWidth="4px"
                  borderColor="blue.600"
                >
                  <Text fontSize="md" fontWeight="bold" color="blue.600">
                    OTHER FRUIT CROPS/TREES
                  </Text>
                </Box>

                {/* Crop Type Selection */}
                <FormControl id="farmLocation" isRequired mb={6}>
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
                  name="crop_variety"
                  value={formData.crop_variety}
                  onChange={handleChange} 
                  placeholder="Choose"
                  >
                    {OtherFCT.map((otherFCT) => (
                      <option key={otherFCT} value={otherFCT}>
                        {otherFCT}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                {/* Stage Selection */}
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
                      <Radio colorScheme="blue" value="NEWLY PLANTED">
                        <Text fontSize="md" color="gray.700">NEWLY PLANTED</Text>
                      </Radio>
                      <Radio colorScheme="blue" value="HARVESTING">
                        <Text fontSize="md" color="gray.700">HARVESTING</Text>
                      </Radio>
                    </Stack>
                  </RadioGroup>
                </FormControl>
              </>
            )}

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
                Continue
              </Button>
            </Stack>
          </Box>
        </Box>
      </VStack>
    </Box>
  );
};

export default CropRecordsOther;
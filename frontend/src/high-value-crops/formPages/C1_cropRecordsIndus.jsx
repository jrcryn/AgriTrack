import React, { useState, useEffect } from 'react';
import {
  Box,
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
import IndusCrops from '../../components/indusCrops.js';
import { useFarmerFormStore } from '../store/farmerForm.store.js';

const CropRecordsIndus = ({ onNext, onBack, disabled = false }) => {

  const { formData, updateCropRecordIndus, isLoading } = useFarmerFormStore();

  // Initialize with data from store
  const [localFormData, setLocalFormData] = useState(formData.cropRecordIndus || {
    crop_type: '',
    crop_variety: '',
    crop_stage: ''
  });
  
  const [isFormValid, setIsFormValid] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleStageChange = (value) => {
    setLocalFormData((prevData) => ({ ...prevData, crop_stage: value }));
  };

  const handleSubmit = async () => {
    updateCropRecordIndus(localFormData);
    onNext(localFormData.crop_stage);
  };

  useEffect(() => {
    const { crop_type, crop_stage } = localFormData;
    setIsFormValid(crop_type && crop_stage);
  }, [localFormData]);

  const accentColor = 'blue.600';

  return (
    <Box border="1px" borderColor="gray.200" p={6} borderRadius="lg" bg="white">
      <VStack spacing={6} align="stretch">
        <FormControl id="cropName" isRequired isDisabled={disabled}>
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
            value={localFormData.crop_type}
            onChange={handleChange}
            isDisabled={disabled}
          >
            {IndusCrops.map((crop) => (
              <option key={crop} value={crop}>
                {crop}
              </option>
            ))}
          </Select>
        </FormControl>

        <FormControl id="variety" isDisabled={disabled}>
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
            value={localFormData.crop_variety}
            onChange={handleChange}
            type="text" 
            placeholder="Isulat ang variety ng inyong tanim"
            isDisabled={disabled}
          />
        </FormControl>

        <FormControl id="stageOfCrop" isRequired isDisabled={disabled}>
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
            onChange={(value) => handleStageChange(value)} 
            value={localFormData.crop_stage}
            isDisabled={disabled}
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
            isDisabled={disabled}
          >
            Back
          </Button>
          <Button
            bg={accentColor}
            color="white"
            _hover={{ bg: 'blue.700' }}
            onClick={handleSubmit}
            isDisabled={!isFormValid || disabled}
            isLoading={isLoading}
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

export default CropRecordsIndus;
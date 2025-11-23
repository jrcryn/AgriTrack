import React, { useState, useEffect } from 'react';
import {
  Box,
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
import OtherFCT from '../../components/otherFCT.js';
import { useFarmerFormStore } from '../store/farmerForm.store.js';

const CropRecordsOther = ({ onNext, onBack, cropType }) => {
  const { formData, updateCropRecordOther, isLoading } = useFarmerFormStore();
  
  // Initialize from store
  const [localFormData, setLocalFormData] = useState(formData.cropRecordOther || {
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
    updateCropRecordOther(localFormData);
    onNext(localFormData.crop_stage);
  };

  useEffect(() => {
    const { crop_variety, crop_stage } = localFormData;
    setIsFormValid(crop_variety && crop_stage);
  }, [localFormData]);

  const accentColor = 'blue.600';

  return (
    <Box border="1px" borderColor="gray.200" p={6} borderRadius="lg" bg="white">
      <VStack spacing={6} align="stretch">
        
          {cropType === "BANANA" && (
            <>
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
                  onChange={(value) => setLocalFormData(prev => ({ ...prev, crop_variety: value }))}
                  value={localFormData.crop_variety}
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
                value={localFormData.crop_stage}
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
                onChange={(value) => setLocalFormData(prev => ({ ...prev, crop_variety: value }))}
                value={localFormData.crop_variety} 
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
                value={localFormData.crop_stage}
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
                value={localFormData.crop_variety}
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
                value={localFormData.crop_stage}
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
            isLoading={isLoading}
            w={{ base: 'full', md: 'auto' }}
            borderRadius="md"
            isDisabled={!isFormValid}
          >
            Continue
          </Button>
        </Stack>
      </VStack>
    </Box>
  );
};

export default CropRecordsOther;
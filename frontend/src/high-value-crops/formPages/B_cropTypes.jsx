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
} from '@chakra-ui/react';
import { useFarmerFormStore } from '../store/farmerForm.store.js';

const CropTypes = ({ onNext, onBack, isDisabled, disabled = false }) => {

  const { formData, updateCropType, isLoading } = useFarmerFormStore();

  // Initialize local state with store data
  const [selectedCropType, setSelectedCropType] = useState(formData.cropType || '');
  const [isFormValid, setIsFormValid] = useState(!!formData.cropType);

  const handleNext = async () => {
    updateCropType(selectedCropType);
    onNext(selectedCropType);
  };

  useEffect(() => {
    setIsFormValid(!!selectedCropType);
  }, [selectedCropType]);

  const accentColor = 'blue.600';

  return (
    <Box border="1px" borderColor="gray.200" p={6} borderRadius="lg" bg="white">
      <VStack spacing={6} align="stretch">
        <FormControl id="cropType" isRequired isDisabled={disabled}>
          <FormLabel 
            fontSize="sm" 
            fontWeight="bold"
            color="gray.600"
            textTransform="uppercase"
            letterSpacing="wide"
            mb={4}
          >
            Select Crop Type
          </FormLabel>
          
          <RadioGroup 
            onChange={setSelectedCropType} 
            value={selectedCropType}
            isDisabled={disabled}
          >
            <Stack direction="column" spacing={4}>
              {[
                'VEGETABLES, ROOT CROPS AND OTHER INDUSTRIAL CROPS',
                'BANANA',
                'COFFEE',
                'OTHER FRUIT CROPS/TREES'
              ].map((crop) => (
                <Radio 
                  key={crop}
                  value={crop}
                  colorScheme="blue"
                >
                  <Text fontSize="md" color="gray.700">
                    {crop}
                  </Text>
                </Radio>
              ))}
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
            isDisabled={disabled}
            w={{ base: 'full', md: 'auto' }}
            borderRadius="md"
          >
            Back
          </Button>
          <Button 
            bg={accentColor}
            color="white"
            _hover={{ bg: 'blue.700' }}
            onClick={handleNext} 
            isDisabled={!isFormValid || isDisabled || disabled} 
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

export default CropTypes;
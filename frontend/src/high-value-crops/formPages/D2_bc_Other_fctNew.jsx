import React, { useState } from 'react';
import {
  Box, Button, FormControl, FormLabel, Heading, Input, Select, Spinner, Text, useToast, VStack
} from '@chakra-ui/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFarmerFormStore } from '../store/farmerForm.store.js';

const D2_bc_Other_fctNew = ({ onNext, onBack, inline }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { 
    formData, 
    updateFarmerInput, 
    submitFarmerForm, 
    isLoading, 
    success, 
    error 
  } = useFarmerFormStore();

  const [localData, setLocalData] = useState({
    otherCrops: formData.otherCrops || '',
    hasOtherCrops: formData.hasOtherCrops || 'No',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const harvestDate = new Date(`${localData.harvest_year}-${localData.harvest_month}-01`);
    const formattedHarvestDate = harvestDate.toISOString().split('T')[0];

    const data = {
      ...localData,
      harvest_month_year: formattedHarvestDate,
    };
    updateCropOtherNew(data);
    
    if (inline) {
      try {
        const success = await submitFarmerForm();
        if (success) onNext();
      } catch {}
      return;
    }

    try {
      const success = await submitFarmerForm();
      if (success) {
        onNext('/success', null, { state: { fromSubmission: true } });
      }
    } catch (error) {

    }
  };

  if (inline) {
    return (
      <Box border="1px" borderColor="gray.200" p={6} borderRadius="lg" bg="white">
        {/* Removed header */}
        <VStack spacing={6} maxW="600px" mx="auto">
          <Heading size="lg" textAlign="center">
            Provide Details on Other Crops
          </Heading>

          <Text textAlign="center" color="gray.600">
            Please specify the other crops you are planting or have planted in the past.
          </Text>

          <FormControl isRequired>
            <FormLabel>Do you plant other crops?</FormLabel>
            <Select
              name="hasOtherCrops"
              value={localData.hasOtherCrops}
              onChange={handleChange}
              placeholder="Select an option"
            >
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </Select>
          </FormControl>

          {localData.hasOtherCrops === 'Yes' && (
            <FormControl isRequired>
              <FormLabel>Other Crops</FormLabel>
              <Input
                name="otherCrops"
                value={localData.otherCrops}
                onChange={handleChange}
                placeholder="e.g. Corn, Soybean, etc."
              />
            </FormControl>
          )}

          <Stack direction="row" justify="space-between" mt={6}>
            <Button variant="ghost" onClick={onBack}>Back</Button>
            <Button colorScheme="blue" onClick={handleSubmit} isLoading={isLoading}>Submit</Button>
          </Stack>
        </VStack>
      </Box>
    );
  }

  return (
    <Box py={8} px={4}>
      <VStack spacing={6} maxW="600px" mx="auto">
        <Heading size="lg" textAlign="center">
          Provide Details on Other Crops
        </Heading>

        <Text textAlign="center" color="gray.600">
          Please specify the other crops you are planting or have planted in the past.
        </Text>

        <FormControl isRequired>
          <FormLabel>Do you plant other crops?</FormLabel>
          <Select
            name="hasOtherCrops"
            value={localData.hasOtherCrops}
            onChange={handleChange}
            placeholder="Select an option"
          >
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </Select>
        </FormControl>

        {localData.hasOtherCrops === 'Yes' && (
          <FormControl isRequired>
            <FormLabel>Other Crops</FormLabel>
            <Input
              name="otherCrops"
              value={localData.otherCrops}
              onChange={handleChange}
              placeholder="e.g. Corn, Soybean, etc."
            />
          </FormControl>
        )}

        <Button
          colorScheme="blue"
          size="lg"
          onClick={handleSubmit}
          isLoading={isLoading}
          width="full"
        >
          Submit
        </Button>

        <Button
          variant="outline"
          size="lg"
          onClick={onBack}
          width="full"
        >
          Back
        </Button>
      </VStack>
    </Box>
  );
};

export default D2_bc_Other_fctNew;
import React, { useState } from 'react';
import {
  Box, Button, FormControl, FormLabel, Heading, Input, Select, Spinner, Text, useToast, VStack
} from '@chakra-ui/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFarmerFormStore } from '../store/farmerForm.store.js';

const D2_bc_Other_fctNew = ({ onNext, onBack }) => {
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
    
    // Validate required fields
    if (!localData.otherCrops) {
      toast({
        title: "Missing fields",
        description: "Please specify the other crops planted.",
        status: "warning",
        duration: 4000,
        isClosable: true
      });
      return;
    }

    // Prepare form data for submission
    const formDataToSubmit = {
      ...formData,
      otherCrops: localData.otherCrops,
      hasOtherCrops: localData.hasOtherCrops === 'Yes',
    };

    try {
      // Submit the form data
      await submitFarmerForm(formDataToSubmit);

      // Navigate to success page with state
      onNext('/success', null, { state: { fromSubmission: true } });
      
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Error submitting form data",
        status: "error",
        duration: 5000,
        isClosable: true
      });
    }
  };

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
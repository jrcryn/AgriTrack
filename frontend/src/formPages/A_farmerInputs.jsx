import React from 'react';
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
  Divider,
  Select
} from '@chakra-ui/react';
import Barangays from '../components/barangays.js';

const farmerInput = ({ onNext, onBack }) => {
  return (
    <Box bg={'purple.50'} minH="100vh" p={3} >
      <VStack spacing={3}>
        <Box
          maxW="650px"
          w="100%"
          borderRadius="md"
          borderWidth={2}
          overflow="hidden" // Ensures the purple bar follows the container's corner radius
        >
          {/* Purple Top Bar */}
          <Box bg="purple.600" height="10px" />

          {/* White Actual Header */}
          <Box bg="white" p={5}>
            <Heading size="xl" fontWeight="normal" mb={6}>
              High Value Crop Planting and Harvesting Report
            </Heading>
            <Divider borderColor="gray.400" my={3} />
            <Text
              textColor="red"
              fontWeight="normal"
              fontStyle="italic"
            >
              * Indicates required question
            </Text>
          </Box>
        </Box>






        {/* Form Fields */}
        <Box
        maxW="650px"
        w="100%"
        bg="white"

        borderRadius="lg"
        borderWidth={2}
        overflow='hidden'
        >
          <Box bg={'purple.600'} height={'50px'}>
            <Text textColor={'white'} fontWeight={'medium'} pt={3} paddingLeft={5}>PERSONAL INFORMATION</Text>
          </Box>

          <Box p={5}>
              <FormControl id="surname" isRequired>
                <FormLabel fontWeight={'normal'} mb={5}>APELYIDO (SURNAME)</FormLabel>
                <Input type="text" placeholder="Your answer" />
              </FormControl>
          </Box>
        </Box>

        <Box
        maxW="650px"
        w="100%"
        bg="white"
        p={5}
        borderRadius="lg"
        borderWidth={2}
        >
            <FormControl id="firstName" isRequired>
              <FormLabel fontWeight={'normal'} mb={5}>UNANG PANGALAN (FIRST NAME)</FormLabel>
              <Input type="text" placeholder="Your answer" />
            </FormControl>
        </Box>

        <Box
        maxW="650px"
        w="100%"
        bg="white"
        p={5}
        borderRadius="lg"
        borderWidth={2}
        >
            <FormControl id="middleName">
              <FormLabel fontWeight={'normal'} mb={5}>GITNANG PANGALAN (MIDDLE NAME)</FormLabel>
              <Input type="text" placeholder="Your answer" />
            </FormControl>
        </Box>

        <Box
        maxW="650px"
        w="100%"
        bg="white"
        p={5}
        borderRadius="lg"
        borderWidth={2}
        >    
            <FormControl id="farmLocation" isRequired>
              <FormLabel fontWeight={'normal'} mb={5}>FARM LOCATION (PILIIN ANG BARANGAY KUNG NASAAN ANG INYONG TANIMAN)</FormLabel>
              <Select
                name='barangay'
                placeholder="Select Barangay"
              >
                {Barangays.map((barangay) => (
                  <option key={barangay} value={barangay}>
                    {barangay}
                  </option>
                ))}
              </Select>
            </FormControl>
        </Box>    





        {/* Navigation Buttons */}
          <Stack direction='row' spacing={4} justify="flex-start" mt={1} mb={5}>
              <Button 
                bg={'white'} 
                w={'100px'} 
                textColor={'purple.500'} 
                boxShadow={'md'} 
                onClick={onBack}
              >
                Back
              </Button>
              <Button 
                bg={'white'} 
                w={'100px'} 
                textColor={'purple.500'} 
                boxShadow={'md'} 
                onClick={onNext}
              >
                Next
              </Button>
          </Stack>

      </VStack>
    </Box>
  );
};

export default farmerInput;
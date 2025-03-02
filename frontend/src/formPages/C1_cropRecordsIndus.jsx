import React from 'react';
import {
  Box,
  Heading,
  FormControl,
  FormLabel,
  Stack,
  Button,
  Text,
  VStack,
  Divider,
  Input,
  Radio,
  RadioGroup,
  Select
} from '@chakra-ui/react';
import IndusCrops from '../components/indusCrops.js';

const cropRecordsIndus = ({ onNext, onBack }) => {
  return (
    <Box bg={'purple.50'} minH="100vh" p={3}>
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
          <Box bg={'purple.600'} minH={'50px'}>
            <Text textColor={'white'} fontWeight={'medium'} p={3} paddingLeft={5}>VEGETABLES, ROOT CROPS AND OTHER INDUSTRIAL CROPS</Text>
          </Box>

          <Box p={5}>
            <FormControl id="firstName" isRequired>
              <FormLabel fontWeight={'semibold'} mb={5}>URI NG TANIM</FormLabel>
              <Select
                name='indusCrops'
                placeholder="Choose"
              >
                {IndusCrops.map((indusCrops) => (
                  <option key={indusCrops} value={indusCrops}>
                    {indusCrops}
                  </option>
                ))}
              </Select>
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
          <FormControl id="firstName">
            <FormLabel fontWeight={'semibold'} mb={5}>VARIETY NG TANIM</FormLabel>
                <Text fontWeight={'bold'} mb={3}>PAALALA:</Text>
                <Text 
                  fontWeight={'normal'}
                  fontStyle={'italic'}
                  fontSize={'sm'}
                  mb={5}
                >
                  Huwag sagutan kung hindi alam ang ginamit na variety ng tanim.
                </Text>    

            <Input type="text" placeholder="Isulat ang variety ng inyong tanim" />

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
          <FormControl id="firstName" isRequired>
            <FormLabel fontWeight={'semibold'} mb={5}>YUGTO NG INYONG PANANIM</FormLabel>
              <RadioGroup>
                <Stack direction="column" spacing={5}>
                  <Radio colorScheme='purple' value="NEWLY PLANTED">NEWLY PLANTED</Radio>
                  <Radio colorScheme='purple' value="HARVESTING">HARVESTING</Radio>
                </Stack>
              </RadioGroup>
          </FormControl>
        </Box>





        {/* Navigation Buttons */}
        <Stack direction='row' spacing={4} justifyContent="flex-start" mt={1} mb={5}>
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

export default cropRecordsIndus;
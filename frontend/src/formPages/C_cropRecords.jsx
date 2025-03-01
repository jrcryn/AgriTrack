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
  RadioGroup,
  Radio
} from '@chakra-ui/react';

const cropRecords = ({ onNext, onBack }) => {
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
          <Box bg={'purple.600'} height={'50px'}>
            <Text textColor={'white'} fontWeight={'medium'} pt={3} paddingLeft={5}>URI NG TANIM</Text>
          </Box>

          <Box p={5}>
            <Text fontWeight={'bold'} mb={5}>PAALALA:</Text>
            <Text 
              fontWeight={'normal'}
              fontStyle={'italic'}
              fontSize={'sm'}
            >
              Kung sakaling mayroon kayong higit sa isang klase ng tanim ay maaaring magsagot ulit sa link na ibinigay pagkatapos ninyong sagutan ang form na ito.
            </Text>
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
            <FormLabel fontWeight={'normal'} mb={5}>PUMILI NG URI NG TANIM</FormLabel>
            <RadioGroup>
              <Stack direction="column" spacing={5}>
                <Radio colorScheme='purple' value="VEGETABLES, ROOT CROPS AND OTHER INDUSTRIAL CROPS">VEGETABLES, ROOT CROPS AND OTHER INDUSTRIAL CROPS</Radio>
                <Radio colorScheme='purple' value="BANANA">BANANA</Radio>
                <Radio colorScheme='purple' value="COFFEE">COFFEE</Radio>
                <Radio colorScheme='purple' value="OTHER FRUIT CROPS/TREES">OTHER FRUIT CROPS/TREES</Radio>
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

export default cropRecords;
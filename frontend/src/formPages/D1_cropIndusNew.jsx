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
  Radio,
  RadioGroup,
  Select
} from '@chakra-ui/react';
import DateMonthOptions from '../components/dateMonthOptions.js';
import MonthsAndYear from '../components/monthsAndYear.js';

const cropIndusNew = ({ onNext, onBack }) => {

    const options = DateMonthOptions();
    const options1 = MonthsAndYear();

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
          <Box bg={'purple.600'} minH={'50px'}>
            <Text textColor={'white'} fontWeight={'medium'} p={3} paddingLeft={5}>VEGETABLES, ROOT CROPS AND OTHER INDUSTRIAL CROPS (NEWLY PLANTED)</Text>
          </Box>

          <Box p={5}>
              <FormControl id="surname" isRequired>
              <FormLabel fontWeight={'semibold'} mb={5}>DATE OF PLANTATION (PILIIN ANG PETSA KUNG KAILAN ITO ITINANIM
              )</FormLabel>
                <RadioGroup>
                    <Stack direction="column">
                        {options.map((option) => (
                        <Radio key={option.value} value={option.value} colorScheme='purple'>
                            {option.label}
                        </Radio>
                        ))}
                    </Stack>
                </RadioGroup>
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
              <FormLabel fontWeight={'semibold'} mb={5}>MONTH OF HARVEST (BUWAN KUNG KAILAN AANIHIN ANG ITINANIM)</FormLabel>
                <Select
                    name='monthOfHarvest'
                    placeholder="Choose"
                >
                    {options1.map((options1) => (
                    <option key={options1} value={options1}>
                        {options1}
                    </option>
                    ))}
                </Select>
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
              <FormLabel fontWeight={'semibold'} mb={5}>TOTAL AREA PLANTED (KABUUANG SUKAT NG TINANIMAN)</FormLabel>
                 <Text fontWeight={'bold'} fontSize={'sm'}>PAALALA:</Text>
                 <Text 
                   fontWeight={'normal'}
                   fontSize={'sm'}
                   mb={5}
                 >
                   <strong>EKTARYA (HECTARE / HA)</strong> ang gamiting sukat sa pagsagot sa area ng inyong tanim
                 </Text>          
                 <Text fontWeight={'bold'} fontSize={'sm'}>HALIMBAWA:</Text>
                 <Text fontSize={'sm'}>Ang 1000 square meters o 1 arya ay katumbas ng <strong><u><i>0.1 ektarya</i></u></strong></Text>

                 <Text fontSize={'sm'} mb={5}>Ang 500 square meters o kalahating arya (1/2 arya) ay katumbas ng <strong><u><i>0.05 ektarya</i></u></strong></Text>

                 <Text fontWeight={'bold'} fontSize={'sm'} textDecoration={'underline'} fontStyle={'italic'}>Paano i-compute:</Text>
                 <Text fontSize={'sm'} mb={5}>1,000 square meters divided by 10,000 square meters = <strong><u><i>0.1 ektarya</i></u></strong></Text>

              <Input type="number" placeholder="Your answer" />
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

export default cropIndusNew;
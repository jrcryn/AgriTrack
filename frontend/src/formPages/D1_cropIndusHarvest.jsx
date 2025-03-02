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
  UnorderedList,
  ListItem,
} from '@chakra-ui/react';
import Destination from '../components/destinations.js';
import ModeOfDelivery from '../components/modeOfDelivery.js';
import DateMonthOptions from '../components/dateMonthOptions.js';

const cropIndusHarvest = ({ onNext, onBack }) => {

    const options = DateMonthOptions();

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
            <Text textColor={'white'} fontWeight={'medium'} p={3} paddingLeft={5}>VEGETABLES, ROOT CROPS AND OTHER INDUSTRIAL CROPS (HARVESTING)</Text>
          </Box>

          <Box p={5}>
              <FormControl id="surname" isRequired>
              <FormLabel fontWeight={'semibold'} mb={5}>DATE OF HARVEST (PILIIN ANG PETSA KUNG KAILAN NAG-ANI)</FormLabel>
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
              <FormLabel fontWeight={'semibold'} mb={5}>TOTAL AREA HARVESTED (ILAN ANG KABUUANG SUKAT NA INYONG INANIHAN?)</FormLabel>
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

        <Box
        maxW="650px"
        w="100%"
        bg="white"
        p={5}
        borderRadius="lg"
        borderWidth={2}
        >
            <FormControl id="firstName" isRequired>
              <FormLabel fontWeight={'semibold'} mb={5}>TOTAL VOLUME OF PRODUCTION (ILAN ANG KABUUANG TIMBANG NA INYONG NAANI?)</FormLabel>
                 <Text fontWeight={'bold'} fontSize={'sm'}>PAALALA:</Text>
                 <Text 
                   fontWeight={'normal'}
                   fontSize={'sm'}
                   mb={5}
                 >
                   <strong>KILO (KG)</strong> ang gamiting sukat sa pagsagot ng dami ng gulay na inyong inani
                 </Text>          
                 <Text fontWeight={'bold'} fontSize={'sm'}>HALIMBAWA:</Text>
                 <Text fontSize={'sm'}>Ang 1,000 grams (g) ay katumbas ng <strong><u><i>1 kilogram (kg)</i></u></strong></Text>
                 <Text fontSize={'sm'} mb={5}>Ang 100 grams (g) ay katumbas ng <strong><u><i>0.1 kilogram (kg)</i></u></strong></Text>

                 <Text fontWeight={'bold'} fontSize={'sm'} mb={3} textDecoration={'underline'} fontStyle={'italic'}>Paano i-compute:</Text>
                 <Text fontSize={'sm'} ml={5} mb={5}>
                    <UnorderedList>
                        <ListItem>1,000 grams divided by 1,000 = <strong><u><i>1 kilogram (kg)</i></u></strong></ListItem>
                        <ListItem>100 grams divided by 1,000 = <strong><u><i>0.1 kilogram (kg)</i></u></strong></ListItem>
                    </UnorderedList>
                 </Text>

              <Input type="number" placeholder="Your answer" />
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
            <FormLabel fontWeight={'semibold'} mb={5}>DESTINATION (SAAN NIYO DINADALA ANG INYONG MGA INANING GULAY?)</FormLabel>
            <RadioGroup>
              <Stack direction="column">
                {Destination.map((option) => (
                  <Radio key={option} value={option} colorScheme='purple'>
                    {option}
                  </Radio>
                ))}
              </Stack>
            </RadioGroup>
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
            <FormLabel fontWeight={'semibold'} mb={5}>MODE OF PAYMENT (PAANO ANG MODE OF PAYMENT SA INYONG PRODUKTO?)</FormLabel>
            <RadioGroup>
             <Stack direction="column">
                <Radio colorScheme='purple' value="CASH">CASH</Radio>
                <Radio colorScheme='purple' value="CHECK">GCASH</Radio>
                <Radio colorScheme='purple' value="BOTH">CHECK (TSEKE)</Radio>
                <Radio colorScheme='purple' value="BOTH">OTHERS</Radio>
              </Stack>
            </RadioGroup>
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
            <FormLabel fontWeight={'semibold'} mb={5}>MODE OF DELIVERY (PAANO ANG MODE OF DELIVERY NG INYONG PRODUKTO?)</FormLabel>
            <RadioGroup>
             <Stack direction="column">
                {ModeOfDelivery.map((option) => (
                  <Radio key={option} value={option} colorScheme='purple'>
                    {option}
                  </Radio>
                ))}
              </Stack>
            </RadioGroup>
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
                isDisabled
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

export default cropIndusHarvest;
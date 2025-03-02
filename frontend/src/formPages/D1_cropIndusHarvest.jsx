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

// Helper function para sa pagcompute ng 15 days approx. per month, and pag lagpas na sa 1-15 days, next month na
const getLastDayOfMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  const getMonthName = (month, locale = 'en-US') => {
    // month is 0-based; to get a short month name:
    return new Date(2025, month).toLocaleString(locale, { month: 'long' });
  };
  
  const getHarvestPeriods = () => {
    const today = new Date();
    const day = today.getDate();
    const currentMonth = today.getMonth(); // 0-based index
    const currentYear = today.getFullYear();
  
    const options = [];
    
    if (day <= 15) {
      // Option 1: current month, 1-15
      options.push({
        label: `${getMonthName(currentMonth)} 1-15, ${currentYear}`,
        value: `${currentYear}-${currentMonth + 1}-01_to_${currentYear}-${currentMonth + 1}-15`
      });
      // Option 2: current month, 16-end
      const lastDay = getLastDayOfMonth(currentYear, currentMonth);
      options.push({
        label: `${getMonthName(currentMonth)} 16-${lastDay}, ${currentYear}`,
        value: `${currentYear}-${currentMonth + 1}-16_to_${currentYear}-${currentMonth + 1}-${lastDay}`
      });
    } else {
      // Option 1: current month, 16-end
      const lastDay = getLastDayOfMonth(currentYear, currentMonth);
      options.push({
        label: `${getMonthName(currentMonth)} 16-${lastDay}, ${currentYear}`,
        value: `${currentYear}-${currentMonth + 1}-16_to_${currentYear}-${currentMonth + 1}-${lastDay}`
      });
      // Option 2: next month, 1-15 (handle year change)
      let nextMonth = currentMonth + 1;
      let nextYear = currentYear;
      if (nextMonth > 11) {
        nextMonth = 0;
        nextYear++;
      }
      options.push({
        label: `${getMonthName(nextMonth)} 1-15, ${nextYear}`,
        value: `${nextYear}-${nextMonth + 1}-01_to_${nextYear}-${nextMonth + 1}-15`
      });
    }
    return options;
  };





const cropIndusHarvest = ({ onNext, onBack }) => {

    const options = getHarvestPeriods();

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
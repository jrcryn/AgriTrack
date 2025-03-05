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
  Radio,
  RadioGroup,
} from '@chakra-ui/react';
import Destination from '../components/destinations.js';
import ModeOfDelivery from '../components/modeOfDelivery.js';
import DateMonthOptions from '../components/dateMonthOptions.js';

const bc_other_fctHarvest = ({ onNext, onBack }) => {
  const options = DateMonthOptions();

  // Design tokens matching CropTypes
  const cardBg = 'white';
  const accentColor = 'blue.600';
  const headerBorder = 'gray.200';

  return (
    <Box minH="100vh" py={10} px={4}>
      <VStack spacing={8} maxW="800px" mx="auto" w="full">
        {/* Main Card */}
        <Box bg={cardBg} borderRadius="xl" shadow="xl" w="full" overflow="hidden">

          {/* Header */}
          <Box 
            p={6}
            borderBottomWidth="2px"
            borderColor={headerBorder}
            align="center"
          >
            <Heading 
              size="lg"
              color={accentColor}
              fontWeight="semibold"
              letterSpacing="tight"
              mb={3}
            >
              High Value Crop Planting and Harvesting Report
            </Heading>
            <Text fontSize="sm" color="gray.500" fontWeight="medium" mb={-2}>
              Fields marked with <Text as="span" color="red.500">*</Text> are required
            </Text>
          </Box>

          {/* Form Content */}
          <Box p={8}>
            <VStack spacing={6} align="stretch">
              {/* DATE OF HARVEST */}
              <FormControl id="dateOfHarvest" isRequired>
                <FormLabel
                  fontSize="sm"
                  fontWeight="bold"
                  color="gray.600"
                  textTransform="uppercase"
                  letterSpacing="wide"
                  mb={4}
                >
                  DATE OF HARVEST (PILIIN ANG PETSA KUNG KAILAN NAG-ANI)
                </FormLabel>
                <RadioGroup>
                  <Stack direction="column" spacing={4}>
                    {options.map((option) => (
                      <Radio key={option.value} value={option.value} colorScheme="blue">
                        <Text fontSize="md" color="gray.700">
                          {option.label}
                        </Text>
                      </Radio>
                    ))}
                  </Stack>
                </RadioGroup>
              </FormControl>

              {/* TOTAL NUMBER OF TREES HARVESTED */}
              <FormControl id="totalTreesHarvested" isRequired>
                <FormLabel
                  fontSize="sm"
                  fontWeight="bold"
                  color="gray.600"
                  textTransform="uppercase"
                  letterSpacing="wide"
                  mb={4}
                >
                  TOTAL NUMBER OF TREES HARVESTED (ILAN ANG KABUUANG BILANG NG PUNO NA KINUHANAN NINYO NG ANI?)
                </FormLabel>
                <Input type="number" placeholder="Your answer" />
              </FormControl>

              {/* TOTAL WEIGHT OF HARVESTED CROPS */}
              <FormControl id="totalWeightHarvested" isRequired>
                <FormLabel
                  fontSize="sm"
                  fontWeight="bold"
                  color="gray.600"
                  textTransform="uppercase"
                  letterSpacing="wide"
                  mb={4}
                >
                  TOTAL WEIGHT OF HARVESTED CROPS (ILAN ANG KABUUANG TIMBANG NA INYONG NAANI?)
                </FormLabel>
                <Input type="number" placeholder="Your answer" />
              </FormControl>

              {/* DESTINATION */}
              <FormControl id="destination" isRequired>
                <FormLabel
                  fontSize="sm"
                  fontWeight="bold"
                  color="gray.600"
                  textTransform="uppercase"
                  letterSpacing="wide"
                  mb={4}
                >
                  DESTINATION (SAAN NIYO DINADALA ANG INYONG MGA INANING GULAY?)
                </FormLabel>
                <RadioGroup>
                  <Stack direction="column" spacing={4}>
                    {Destination.map((option) => (
                      <Radio key={option} value={option} colorScheme="blue">
                        <Text fontSize="md" color="gray.700">
                          {option}
                        </Text>
                      </Radio>
                    ))}
                  </Stack>
                </RadioGroup>
              </FormControl>

              {/* MODE OF PAYMENT */}
              <FormControl id="modeOfPayment" isRequired>
                <FormLabel
                  fontSize="sm"
                  fontWeight="bold"
                  color="gray.600"
                  textTransform="uppercase"
                  letterSpacing="wide"
                  mb={4}
                >
                  MODE OF PAYMENT (PAANO ANG MODE OF PAYMENT SA INYONG PRODUKTO?)
                </FormLabel>
                <RadioGroup>
                  <Stack direction="column" spacing={4}>
                    <Radio colorScheme="blue" value="CASH">
                      CASH
                    </Radio>
                    <Radio colorScheme="blue" value="GCASH">
                      GCASH
                    </Radio>
                    <Radio colorScheme="blue" value="CHECK (TSEKE)">
                      CHECK (TSEKE)
                    </Radio>
                    <Radio colorScheme="blue" value="OTHERS">
                      OTHERS
                    </Radio>
                  </Stack>
                </RadioGroup>
              </FormControl>

              {/* MODE OF DELIVERY */}
              <FormControl id="modeOfDelivery" isRequired>
                <FormLabel
                  fontSize="sm"
                  fontWeight="bold"
                  color="gray.600"
                  textTransform="uppercase"
                  letterSpacing="wide"
                  mb={4}
                >
                  MODE OF DELIVERY (PAANO ANG MODE OF DELIVERY NG INYONG PRODUKTO?)
                </FormLabel>
                <RadioGroup>
                  <Stack direction="column" spacing={4}>
                    {ModeOfDelivery.map((option) => (
                      <Radio key={option} value={option} colorScheme="blue">
                        <Text fontSize="md" color="gray.700">
                          {option}
                        </Text>
                      </Radio>
                    ))}
                  </Stack>
                </RadioGroup>
              </FormControl>
            </VStack>

            {/* Navigation Buttons */}
            <Stack direction={{ base: 'column', md: 'row' }} spacing={4} justify="flex-end" mt={12}>
              <Button variant="ghost" colorScheme="blue" onClick={onBack} px={8} borderRadius="md">
                Back
              </Button>
              <Button bg={accentColor} color="white" _hover={{ bg: 'blue.700' }} onClick={onNext} px={8} borderRadius="md">
                Next
              </Button>
            </Stack>
          </Box>
        </Box>
      </VStack>
    </Box>
  );
};

export default bc_other_fctHarvest;

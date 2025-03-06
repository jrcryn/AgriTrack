import React, { useState } from 'react';
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
import { useFarmerFormStore } from '../store/farmerForm.js';

const bc_other_fctHarvest = ({ onNext, onBack }) => {
  const options = DateMonthOptions();
  const [formData, setFormData] = useState({
    harvest_date: '',
    trees_harvested: '',
    total_weight: '',
    destination: '',
    mode_of_payment: '',
    mode_of_delivery: '',
  });

  const { D2OtherHarv } = useFarmerFormStore();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleRadioChange = (name, value) => {
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async () => {
    await D2OtherHarv(formData);
    onNext();
  };

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
                <RadioGroup
                  name="harvest_date"
                  onChange={(value) => handleRadioChange('harvest_date', value)}
                  value={formData.harvest_date}
                >
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
                <Input
                  type="number"
                  name="trees_harvested"
                  value={formData.trees_harvested}
                  onChange={handleChange}
                  placeholder="Your answer"
                />
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
                <Input
                  type="number"
                  name="total_weight"
                  value={formData.total_weight}
                  onChange={handleChange}
                  placeholder="Your answer"
                />
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
                <RadioGroup
                  name="destination"
                  onChange={(value) => handleRadioChange('destination', value)}
                  value={formData.destination}
                >
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
                <RadioGroup
                  name="mode_of_payment"
                  onChange={(value) => handleRadioChange('mode_of_payment', value)}
                  value={formData.mode_of_payment}
                >
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
                <RadioGroup
                  name="mode_of_delivery"
                  onChange={(value) => handleRadioChange('mode_of_delivery', value)}
                  value={formData.mode_of_delivery}
                >
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
              <Button bg={accentColor} color="white" _hover={{ bg: 'blue.700' }} onClick={handleSubmit} px={8} borderRadius="md">
                Submit
              </Button>
            </Stack>
          </Box>
        </Box>
      </VStack>
    </Box>
  );
};

export default bc_other_fctHarvest;
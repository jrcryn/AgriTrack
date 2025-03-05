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
  Select,
} from '@chakra-ui/react';
import DateMonthOptions from '../components/dateMonthOptions.js';
import MonthsAndYear from '../components/monthsAndYear.jsx';

const bc_other_fctNew = ({ onNext, onBack }) => {
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
              {/* DATE OF PLANTATION */}
              <FormControl id="dateOfPlantation" isRequired>
                <FormLabel
                  fontSize="sm"
                  fontWeight="bold"
                  color="gray.600"
                  textTransform="uppercase"
                  letterSpacing="wide"
                  mb={4}
                >
                  DATE OF PLANTATION (PILIIN ANG PETSA KUNG KAILAN ITO ITINANIM)
                </FormLabel>
                <RadioGroup>
                  <Stack direction="column" spacing={4}>
                    {options.map((option) => (
                      <Radio
                        key={option.value}
                        value={option.value}
                        colorScheme="blue"
                      >
                        <Text fontSize="md" color="gray.700">
                          {option.label}
                        </Text>
                      </Radio>
                    ))}
                  </Stack>
                </RadioGroup>
              </FormControl>

              {/* MONTH OF HARVEST */}
              <FormControl id="monthOfHarvest" isRequired>
                <FormLabel
                  fontSize="sm"
                  fontWeight="bold"
                  color="gray.600"
                  textTransform="uppercase"
                  letterSpacing="wide"
                  mb={4}
                >
                  MONTH AND YEAR OF HARVEST (BUWAN AT TAON KUNG KAILAN AANIHIN ANG ITINANIM)
                </FormLabel>
                <Stack direction={{ base: "column", md: "row" }} spacing={4}>
                  <Select placeholder="Select month">
                    <option value="January">January</option>
                    <option value="February">February</option>
                    <option value="March">March</option>
                    <option value="April">April</option>
                    <option value="May">May</option>
                    <option value="June">June</option>
                    <option value="July">July</option>
                    <option value="August">August</option>
                    <option value="September">September</option>
                    <option value="October">October</option>
                    <option value="November">November</option>
                    <option value="December">December</option>
                  </Select>
                  <Input
                    type="text"
                    placeholder="YYYY"
                    maxLength={4}
                    pattern="^[0-9]{4}$"
                    inputMode="numeric"
                    title="Please enter a valid 4-digit year"
                    required
                  />
                </Stack>
              </FormControl>

              {/* TOTAL NUMBER OF TREES */}
              <FormControl id="totalNumberOfTrees" isRequired>
                <FormLabel
                  fontSize="sm"
                  fontWeight="bold"
                  color="gray.600"
                  textTransform="uppercase"
                  letterSpacing="wide"
                  mb={4}
                >
                  TOTAL NUMBER OF TREES (KABUUANG BILANG NG PUNO NA NAKATANIM)
                </FormLabel>
                  <Box 
                    bg='blue.50'
                    borderRadius="md"
                    p={4}
                    mb={5}
                    borderLeftWidth="4px"
                    borderColor={accentColor}
                  >
                    <Text fontSize="sm">
                      <Text fontWeight="bold" mb={3}>PAALALA:</Text> 
                      Isulat kung ilang piraso ng puno ang nakatanim.
                    </Text>
                  </Box>
                <Input type="number" placeholder="Your answer" />
              </FormControl>
            </VStack>

            {/* Navigation Buttons */}
            <Stack
              direction={{ base: 'column', md: 'row' }}
              spacing={4}
              justify="flex-end"
              mt={12}
            >
              <Button
                variant="ghost"
                colorScheme="blue"
                onClick={onBack}
                px={8}
                borderRadius="md"
              >
                Back
              </Button>
              <Button
                bg={accentColor}
                color="white"
                _hover={{ bg: 'blue.700' }}
                onClick={onNext}
                px={8}
                borderRadius="md"
              >
                Next
              </Button>
            </Stack>
          </Box>
        </Box>
      </VStack>
    </Box>
  );
};

export default bc_other_fctNew;

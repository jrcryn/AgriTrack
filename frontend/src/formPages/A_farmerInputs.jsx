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
  HStack,
  Divider,
  Select,
  SimpleGrid,
  Image
} from '@chakra-ui/react';
import Barangays from '../components/barangays';
import Logo from '../images/D.A_Logo.png';

const FarmerInput = ({ onNext, onBack }) => {
  const cardBg = 'white';
  const headerBorder = 'gray.200';
  const accentColor = 'blue.600';

  return (
    <Box minH="100vh" py={10} px={4}>
      <VStack spacing={8} maxW="800px" mx="auto" w="full">
        <Box 
          bg={cardBg}
          borderRadius="xl"
          shadow="xl"
          w="full"
          overflow="hidden"
        >
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
              <Box>
                <Text 
                  fontSize="sm" 
                  fontWeight="bold" 
                  color="gray.600"
                  textTransform="uppercase"
                  letterSpacing="wide"
                  mb={4}
                >
                  Personal Information
                </Text>
                <Divider />
              </Box>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <FormControl id="surname" isRequired>
                  <FormLabel 
                    fontSize="sm" 
                    fontWeight="medium"
                    color="gray.600"
                  >
                    APELYIDO
                  </FormLabel>
                  <Input 
                    placeholder="Your answer"
                    borderRadius="md"
                    focusBorderColor={accentColor}
                  />
                </FormControl>

                <FormControl id="firstName" isRequired>
                  <FormLabel 
                    fontSize="sm" 
                    fontWeight="medium"
                    color="gray.600"
                  >
                    UNANG PANGALAN 
                  </FormLabel>
                  <Input 
                    placeholder="Your answer"
                    borderRadius="md"
                    focusBorderColor={accentColor}
                  />
                </FormControl>


              </SimpleGrid>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>

            <FormControl id="middleName">
                <FormLabel 
                  fontSize="sm" 
                  fontWeight="medium"
                  color="gray.600"
                >
                  GITNANG PANGALAN
                </FormLabel>
                <Input 
                  placeholder="Your answer (optional)"
                  borderRadius="md"
                  focusBorderColor={accentColor}
                />
              </FormControl>

              <FormControl id="suffix">
                <FormLabel 
                  fontSize="sm" 
                  fontWeight="medium"
                  color="gray.600"
                >
                  SUFFIX
                </FormLabel>
                <Input 
                  placeholder="Your answer (optional)"
                  borderRadius="md"
                  focusBorderColor={accentColor}
                />
              </FormControl>
            </SimpleGrid>

              <SimpleGrid>
              <FormControl id="farmLocation" isRequired>
                <FormLabel 
                  fontSize="sm" 
                  fontWeight="medium"
                  color="gray.600"
                >
                  FARM LOCATION (PILIIN ANG BARANGAY KUNG NASAAN ANG INYONG TANIMAN)
                </FormLabel>
                <Select 
                  placeholder="Select Barangay"
                  borderRadius="md"
                  focusBorderColor={accentColor}
                >
                  {Barangays.map((barangay) => (
                    <option key={barangay} value={barangay}>
                      {barangay}
                    </option>
                  ))}
                </Select>
              </FormControl>
              </SimpleGrid>
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
                isDisabled
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
                Continue
              </Button>
            </Stack>
          </Box>
        </Box>
      </VStack>
    </Box>
  );
};

export default FarmerInput;
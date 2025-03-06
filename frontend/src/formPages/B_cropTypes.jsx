import React, { useState } from 'react';
import {
  Box,
  Heading,
  FormControl,
  FormLabel,
  Stack,
  Button,
  Text,
  VStack,
  RadioGroup,
  Radio,
} from '@chakra-ui/react';
import { useFarmerFormStore } from '../store/farmerForm';

const CropTypes = ({ onNext, onBack }) => {
  const [selectedCropType, setSelectedCropType] = useState('');
  const { CropType, isLoading } = useFarmerFormStore();


  const handleNext = async () => {
    await CropType({crop_type: selectedCropType});
    let nextPath = '';
    switch (selectedCropType) {
      case 'VEGETABLES, ROOT CROPS AND OTHER INDUSTRIAL CROPS':
        nextPath = '/c1_cri';
        break;
      case 'BANANA':
      case 'COFFEE':
      case 'OTHER FRUIT CROPS/TREES':
        nextPath = '/c2_cro';
        break;
    }
    onNext(nextPath, selectedCropType);
  };

  const cardBg = 'white';
  const accentColor = 'blue.600';
  const headerBorder = 'gray.200';

  return (
    <Box minH="100vh" py={10} px={4}>
      <VStack spacing={8} maxW="800px" mx="auto" w="full">
        {/* Main Card */}
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
              {/* Instruction Section */}
              <Box 
                bg='blue.50'
                borderRadius="md"
                p={4}
                borderLeftWidth="4px"
                borderColor={accentColor}
              >
                <Text fontSize="sm">
                  <Text fontWeight="bold" mb={3}>PAALALA:</Text> 
                  Kung sakaling mayroon kayong higit sa isang klase ng tanim ay maaaring magsagot ulit sa link na ibinigay pagkatapos ninyong sagutan ang form na ito.
                </Text>
              </Box>

              {/* Crop Selection */}
              <FormControl id="cropType" isRequired>
                <FormLabel 
                  fontSize="sm" 
                  fontWeight="bold"
                  color="gray.600"
                  textTransform="uppercase"
                  letterSpacing="wide"
                  mb={4}
                >
                  Select Crop Type
                </FormLabel>
                
                <RadioGroup 
                  onChange={setSelectedCropType} 
                  value={selectedCropType}
                >
                  <Stack direction="column" spacing={4}>
                    {[
                      'VEGETABLES, ROOT CROPS AND OTHER INDUSTRIAL CROPS',
                      'BANANA',
                      'COFFEE',
                      'OTHER FRUIT CROPS/TREES'
                    ].map((crop) => (
                      <Radio 
                        key={crop}
                        value={crop}
                        colorScheme="blue"
                      >
                        <Text fontSize="md" color="gray.700">
                          {crop}
                        </Text>
                      </Radio>
                    ))}
                  </Stack>
                </RadioGroup>
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
                onClick={handleNext}
                isLoading={isLoading}
                px={8}
                borderRadius="md"
                isDisabled={!selectedCropType}
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

export default CropTypes;
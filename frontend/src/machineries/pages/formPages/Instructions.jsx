import React, { useState } from 'react';
import {
  Box,
  Heading,
  Stack,
  Button,
  Text,
  VStack,
} from '@chakra-ui/react';

const Instructions = ({ onNext }) => {
  const [isLoading, setIsLoading] = useState(false);
  
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
              BASAHIN NG MABUTI
            </Text>
          </Box>

          {/* Form Content */}
          <Box p={8}>
            <VStack spacing={6} align="stretch">
              {/* General Instructions */}
              <Box 
                bg='blue.50'
                borderRadius="md"
                p={4}
                borderLeftWidth="4px"
                borderColor={accentColor}
              >
                <Text fontSize="md" fontWeight="bold" mb={3}>
                  GENERAL INSTRUCTIONS:
                </Text>
                <Text fontSize="sm" fontWeight={'bold'} mb={2}>
                  • Pakisigurong tama ang mga impormasyong ibibigay.
                </Text>
                <Text fontSize="sm" mb={2}>
                  • Lahat ng sagutang may markang <Text as="span" color="red.500" fontSize='md' ><b>*</b></Text> ay kinakailangan.
                </Text>
                <Text fontSize="sm">
                  • Dapat tapusin ang form sa isang session lamang.<b> Huwag i-refresh ang page habang naglalagay ng impormasyon.</b>
                </Text>
                <Text fontSize="sm">
                  • Kung ma i-refresh ang page, mawawala ang mga impormasyong nailagay, at kinakailangan na ulitin ang pagsasagot.
                </Text>
                <Text fontSize="sm">
                  • Pindutin ang <b>CONTINUE/SUSUNOD</b> para simulan ang pagsasagot at makapunta sa mga susunod na pahina.
                </Text>
                <Text fontSize="sm">
                  • Pindutin naman ang <b>BACK/BUMALIK</b> para makabalik sa mga naunang pahina.
                </Text>
              </Box>
            </VStack>

            {/* Navigation Buttons */}
            <Stack 
              direction={{ base: 'column', md: 'row' }}
              spacing={4}
              justify="flex-end"
              mt={8}
            >
              <Button 
                variant="ghost"
                colorScheme="blue"
                px={8}
                borderRadius="md"
                isDisabled
              >
                Back
              </Button>
              <Button 
                bg={accentColor}
                color="white"
                _hover={{ bg: 'blue.700' }}
                onClick={onNext}
                isLoading={isLoading}
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

export default Instructions;
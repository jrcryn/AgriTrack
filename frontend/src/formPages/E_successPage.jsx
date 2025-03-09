import React from 'react';
import { Box, Heading, Text, Button, VStack, Icon } from '@chakra-ui/react';
import { FiCheckCircle } from 'react-icons/fi';
import { useFarmerFormStore } from '../store/farmerForm.store.js';
import { useNavigate } from 'react-router-dom';

const SuccessPage = () => {
  const { resetForm } = useFarmerFormStore();
  const navigate = useNavigate();

  const handleNewForm = () => {
    resetForm();
    navigate('/form/a_fi');
  };

  const cardBg = 'white';
  const accentColor = 'blue.600';
  const borderColor = 'gray.200';

  return (
    <Box minH="100vh" py={10} px={4}>
      <VStack spacing={8} maxW="800px" mx="auto" w="full">
        {/* Main Card */}
        <Box bg={cardBg} borderRadius="xl" shadow="xl" w="full" overflow="hidden">
          {/* Header */}
          <Box
            p={6}
            borderBottomWidth="2px"
            borderColor={borderColor}
            textAlign="center"
          >
            <Icon as={FiCheckCircle} w={20} h={20} color="green.500" mb={4} />
            <Heading
              size="lg"
              color="green.600"
              fontWeight="semibold"
              letterSpacing="tight"
            >
              Form Submitted Successfully!
              <Text mt={1} color="green.600" fontWeight="semibold"  fontSize="md">
                Lahat ng impormasyon ay matagumpay nang naitala.
              </Text>
            </Heading>
            <Text mt={5}  fontSize="sm">
              Maraming salamat sa pagsagot ng High Value Crop Planting and Harvesting Report.
            </Text>  

          </Box>
          {/* Content */}
          <Box p={8} textAlign="center">
            <Button
              bg={accentColor}
              color="white"
              _hover={{ bg: 'blue.700' }}
              size="lg"
              onClick={handleNewForm}
            >
              Magpasa ng Panibago
            </Button>
          </Box>
        </Box>
      </VStack>
    </Box>
  );
};

export default SuccessPage;

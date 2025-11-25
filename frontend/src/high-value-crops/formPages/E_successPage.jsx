import React, { useEffect, useLayoutEffect } from 'react';
import { Box, Heading, Text, Button, VStack, Icon, useToast } from '@chakra-ui/react';
import { FiCheckCircle } from 'react-icons/fi';
import { useFarmerFormStore } from '../store/farmerForm.store.js';
import { useNavigate, useLocation } from 'react-router-dom';

const SuccessPage = () => {
  const { resetForm } = useFarmerFormStore();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  
  // Flag to store in sessionStorage to indicate form completion
  const FORM_COMPLETION_KEY = 'hvc_form_completed';

  // On mount, mark the form as completed in session storage
  useEffect(() => {
    // Set completion flag
    sessionStorage.setItem(FORM_COMPLETION_KEY, 'true');
    
    // Block back button behavior
    const blockBackNavigation = (e) => {
      // Cancel the default navigation behavior
      e.preventDefault();
    };

    window.history.pushState(null, "", window.location.pathname);
    window.addEventListener('popstate', blockBackNavigation);

    return () => {
      window.removeEventListener('popstate', blockBackNavigation);
    };
  }, []);
  
  // Detect if user tries to access this page directly
  useLayoutEffect(() => {
    // Check if we got here from the form submission
    const directAccess = !location.state?.fromSubmission;
    
    // If direct access and not from form submission, redirect to start
    if (directAccess) {
      toast({
        title: "Access Denied",
        description: "Please submit the form first.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      navigate('/hvc/form/istcns', { replace: true });
    }
  }, []); // Run only once on mount

  const handleReturnToStart = () => {
    // Clear completion flag before navigating
    sessionStorage.removeItem(FORM_COMPLETION_KEY);
    resetForm();
    navigate('/hvc/form/istcns');
  };

  const cardBg = 'white';
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
              <Text mt={1} color="green.600" fontWeight="semibold" fontSize="md">
                Lahat ng impormasyon ay matagumpay nang naitala.
              </Text>
            </Heading>
            <Text mt={5} fontSize="sm">
              Maraming salamat sa pagsagot ng High Value Crop Planting and Harvesting Report.
            </Text>  
          </Box>

          {/* Footer */}
          <Box pt={8} pb={8} textAlign="center">
            <Button
              bg="green.600"
              color="white"
              _hover={{ bg: 'green.700' }}
              size="lg"
              onClick={handleReturnToStart}
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

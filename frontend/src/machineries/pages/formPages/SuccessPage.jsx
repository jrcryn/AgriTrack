import React, { useEffect, useLayoutEffect } from 'react';
import { Box, Heading, Text, VStack, Icon, useToast } from '@chakra-ui/react';
import { FiCheckCircle } from 'react-icons/fi';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTicketRequestFormStore } from '../../store/ticketRequestForm.store.js';

const SuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { resetForm } = useTicketRequestFormStore();
  
  // Flag to store in sessionStorage to indicate form completion
  const FORM_COMPLETION_KEY = 'machinery_form_completed';

  // On mount, mark the form as completed in session storage and reset form data
  useEffect(() => {
    // Reset the form data in the store
    resetForm();
    
    // Set completion flag
    sessionStorage.setItem(FORM_COMPLETION_KEY, 'true');
    
    // Block back button behavior
    const blockBackNavigation = (e) => {
      // Cancel the default navigation behavior
      e.preventDefault();
      
      // Force redirect to the start with a full page reload to clear any lingering state
      window.location.href = '/machineries/form/istcns';
    };

    window.history.pushState(null, "", window.location.pathname);
    window.addEventListener('popstate', blockBackNavigation);

    return () => {
      window.removeEventListener('popstate', blockBackNavigation);
    };
  }, [toast, resetForm]);
  
  // Detect if user tries to access this page directly or through browser back button
  useLayoutEffect(() => {
    // Check if we got here from the form submission
    const directAccess = !location.state?.fromSubmission;
    
    // If direct access and not from form submission, redirect to start
    if (directAccess) {
      // Reset the form data
      resetForm();
      // Redirect with page reload to ensure clean state
      window.location.href = '/machineries/form/istcns';
    }
  }, [location, navigate, resetForm]);

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
              Maari nang isara ang form na ito.
            </Text>  

          </Box>
          {/* Footer */}

        </Box>
      </VStack>
    </Box>
  );
};

export default SuccessPage;

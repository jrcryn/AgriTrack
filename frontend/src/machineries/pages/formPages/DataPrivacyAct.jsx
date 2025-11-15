import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Stack,
  Button,
  Text,
  VStack,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  FormErrorMessage,
} from '@chakra-ui/react';
import { useTicketRequestFormStore } from '../../store/ticketRequestForm.store.js'; //to be changed


const DataPrivacyAct = ({ onNext, onBack }) => {

  const { formData, updatePrivacyConsent } = useTicketRequestFormStore();
  const [consent, setConsent] = useState(formData.privacyConsent || '');

  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (formData.privacyConsent) {
      setConsent(formData.privacyConsent);
    }
  }, [formData.privacyConsent]);
  
  const handleNext = () => {
    setIsLoading(true);

    updatePrivacyConsent(consent);
    setTimeout(() => {
      setIsLoading(false);
      onNext();
    });
  };

  const handleConsentChange = (value) => {
    setConsent(value);
    setShowError(false);
    updatePrivacyConsent(value);
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
              Free Tractor Services (Ticket Request) Form
            </Heading>
            <Text fontSize="sm" color="gray.500" fontWeight="medium" mb={-2}>
            BASAHIN NG MABUTI
            </Text>
          </Box>

          {/* Form Content */}
          <Box p={8}>
            <VStack spacing={6} align="stretch">
              {/* Data Privacy Notice */}
              <Box 
                bg='blue.50'
                borderRadius="md"
                p={5}
                borderLeftWidth="4px"
                borderColor={accentColor}
                overflowY="auto"
                maxHeight="400px"
              >
                <Text fontSize="md" fontWeight="bold" color="blue.600" mb={4}>
                  DATA PRIVACY NOTICE
                </Text>
                
                <Text fontSize="sm" fontWeight="bold" mb={2}>Data Privacy Act of 2012 (Republic Act No. 10173)</Text>
                <Text fontSize="sm" mb={3}>
                Ang <b><i>City Agricultural Services Department (CASD)</i></b> ay sumusunod sa <b><i>Data Privacy Act of 2012</i></b> at nakatuon sa pagprotekta ng inyong privacy.  
                Ang mga impormasyon na makakalap mula sa pagsasagot ng form na ito ay naglalayon na magamit ng CASD sa mga opisyal na pagdodokumento at pagre-report 
                sa mga nangangailangang ahensya.
                </Text>

                <Text fontSize="sm">
                Sumagot ng <b>OO</b> kung kayo ay sumasang-ayon at <b>HINDI</b> naman kung hindi sumasang-ayon na ibahagi ang mga makokolektang data o impormasyon mula sa inyo.
                </Text>
                
                
              </Box>

              {/* Consent Form */}
              <FormControl isRequired isInvalid={showError}>
                <FormLabel fontSize="sm" fontWeight="bold" color="gray.600">
                  Sumasang-ayon ba kayo patungkol sa Data Privacy Act of 2012?
                </FormLabel>
                <RadioGroup onChange={handleConsentChange} value={consent}>
                  <Stack direction="row" spacing={6} mt={2}>
                    <Radio value="yes" colorScheme="blue">
                      <Text fontSize="md">OO</Text>
                    </Radio>
                    <Radio value="no" colorScheme="red">
                      <Text fontSize="md">HINDI</Text>
                    </Radio>
                  </Stack>
                </RadioGroup>
                {showError && (
                  <FormErrorMessage>
                    You must consent to the Data Privacy Act to proceed with the form.
                  </FormErrorMessage>
                )}
              </FormControl>
              
              {/* Notice if No is selected */}
              {consent === 'no' && (
                <Box 
                  bg='red.50'
                  borderRadius="md"
                  p={4}
                  borderLeftWidth="4px"
                  borderColor="red.400"
                >
                  <Text fontSize="sm" color="red.600">
                  Paumanhin, ngunit hindi kami maaaring magpatuloy nang walang inyong pagsang-ayon sa Data Privacy Act. 
                  Kailangan namin ang inyong pahintulot upang makolekta at maproseso ang mga impormasyong kinakailangan.
                  </Text>
                </Box>
              )}
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
                onClick={onBack}
                px={8}
                borderRadius="md"
              >
                Back
              </Button>
              <Button 
                bg={accentColor}
                color="white"
                _hover={consent === 'yes' ? { bg: 'blue.700' } : {}}
                onClick={handleNext}
                isLoading={isLoading}
                px={8}
                borderRadius="md"
                isDisabled={consent !== 'yes'}
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

export default DataPrivacyAct;
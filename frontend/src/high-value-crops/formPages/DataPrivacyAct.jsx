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
import { useFarmerFormStore } from '../store/farmerForm.store';


const DataPrivacyAct = ({ onNext, onBack }) => {

  const { formData, updatePrivacyConsent } = useFarmerFormStore();
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
              High Value Crop Planting and Harvesting Report
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
                maxHeight="500px"
              >
                <Text fontSize="md" fontWeight="bold" color="blue.600" mb={4}>
                  DATA PRIVACY NOTICE
                </Text>
                
                <Text fontSize="sm" mb={4}>
                  Ang <b><i>City Agricultural Services Department (CASD)</i></b> ay sumusunod sa <b><i>Data Privacy Act of 2012 (RA 10173)</i></b> at sinisigurong protektado ang inyong personal na impormasyon.
                </Text>

                <Text fontSize="sm" fontWeight="bold" mb={2}>📋 Mga Impormasyong Kinokolekta</Text>
                <Text fontSize="sm" mb={3}>
                  Maaaring hingin namin ang ilang detalye tulad ng:
                </Text>
                <Text fontSize="sm" mb={3} pl={4}>
                  • Lawak ng inyong taniman<br />
                  • Dami ng ani<br />
                  • Lokasyon<br />
                  • Mga petsa ng pagtatanim at pag-aani<br />
                  • Iba pang impormasyong may kinalaman sa inyong sakahan
                </Text>

                <Text fontSize="sm" fontWeight="bold" mb={2}>🎯 Layunin ng Pagkolekta</Text>
                <Text fontSize="sm" mb={3}>
                  Ginagamit ang mga impormasyong ito para sa:
                </Text>
                <Text fontSize="sm" mb={3} pl={4}>
                  • Opisyal na dokumentasyon at pag-uulat ng lungsod<br />
                  • Pagpaplano at pagpapatupad ng mga programa sa agrikultura<br />
                  • Pagsusuri at pagwawasto ng datos kung kinakailangan<br />
                  • Pagkilala sa mga magsasakang kwalipikado sa mga benepisyo, ayuda, o interbensyon mula sa pamahalaan gaya ng binhi, pataba, makinarya, at iba pang tulong pang-agrikultura
                </Text>

                <Text fontSize="sm" fontWeight="bold" mb={2}>🔍 Pagberipika at Pagwawasto</Text>
                <Text fontSize="sm" mb={3}>
                  Sa pagpili ng <b>"SUMANG-AYON,"</b> pinapayagan ninyo ang CASD o mga kawani nito na:
                </Text>
                <Text fontSize="sm" mb={3} pl={4}>
                  • I-verify o tingnan ang inyong sakahan kung may kailangang linawin sa datos<br />
                  • Itama ang mga maling impormasyon kung mapatunayan na may pagkakamali
                </Text>
                <Text fontSize="sm" mb={3}>
                  Kapag may binago sa inyong datos, ipapaalam ito sa inyo sa pamamagitan ng text o abiso mula sa aming tanggapan.
                </Text>

                <Text fontSize="sm" fontWeight="bold" mb={2}>🤝 Pagbabahagi ng Datos</Text>
                <Text fontSize="sm" mb={3}>
                  Ang inyong impormasyon (kasama ang mga binagong datos) ay maaaring ibahagi sa ibang ahensya ng pamahalaan kung kailangan para sa opisyal na gawain, pagpapatupad ng batas, o sa pagbibigay ng mga benepisyo at tulong sa mga magsasaka.
                  Lahat ng ito ay ginagawa nang may pagsunod sa mga alituntunin ng proteksyon ng datos.
                </Text>

                <Text fontSize="sm" fontWeight="bold" mb={2}>🧑‍🌾 Karapatan ng Magsasaka (Data Owner)</Text>
                <Text fontSize="sm" mb={3}>
                  Mayroon kayong mga karapatan sa inyong impormasyon:
                </Text>
                <Text fontSize="sm" mb={3} pl={4}>
                  • <b>Tingnan (Access):</b> Maaaring humingi ng kopya ng datos na hawak namin.<br />
                  • <b>Magwasto (Rectify):</b> Maaaring ipabago ang maling impormasyon.<br />
                  • <b>Tumanggi o Bawiin (Withdraw Consent):</b> Maaaring tumanggi o bawiin ang pahintulot sa paggamit ng datos.<br />
                  • <b>Tutulan (Object):</b> Kung naniniwala kayong naaapektuhan ang inyong karapatan.<br />
                  • <b>Ipahinto o I-block:</b> Maaaring hilingin na hindi muna gamitin ang inyong datos sa ilang sitwasyon.
                </Text>

                <Text fontSize="sm" fontWeight="bold" mb={2}>🔐 Seguridad ng Datos</Text>
                <Text fontSize="sm">
                  Ang inyong datos ay ligtas naming itatago hangga't kailangan, at protektado laban sa anumang hindi awtorisadong paggamit o paglabag.
                </Text><br />

                <Text fontSize="sm"  fontWeight={'semibold'}>
                Kung may tanong o may gustong gawin sa inyong mga datos, maaari kayong makipag-ugnayan sa aming opisina.                
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
import React from 'react';
import {
  Button,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  VStack,
  Text,
  Box,
  Divider,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  useBreakpointValue,
} from '@chakra-ui/react';
import { FiHelpCircle } from 'react-icons/fi';

const FAQButton = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Responsive button size
  const buttonSize = useBreakpointValue({ base: 'md', md: 'lg' });
  const iconSize = useBreakpointValue({ base: '20px', md: '24px' });

  const faqData = [
    {
      question: 'How do I reset my password?',
      answer: 'Click on "Forgot Password?" link on the login page. Enter your email address and follow the instructions sent to your email to reset your password.',
    },
    {
      question: 'What is Two-Factor Authentication (2FA)?',
      answer: 'Two-Factor Authentication adds an extra layer of security to your account. After entering your password, you will need to enter a code from your authenticator app to complete the login process.',
    },
    {
      question: 'How do I set up 2FA?',
      answer: 'If you haven\'t set up 2FA yet, you will be prompted to do so after logging in. You will need to scan a QR code with an authenticator app (like Google Authenticator (recommended) or Authy) and enter the verification code.',
    },
    {
      question: 'I forgot my 2FA code. What should I do?',
      answer: 'If you have lost access to your 2FA device, please contact IT support to regain access to your account. They will help you reset your 2FA settings.',
    },
    {
      question: 'Why is my account locked?',
      answer: 'Your account may be locked after multiple failed login attempts for security reasons. If this happens, please contact IT support to unlock your account.',
    },
    {
      question: 'How do I contact support?',
      answer: 'For technical support or account-related issues, please contact the City Agriculture Services Department IT support team. You can reach them through the official channels provided by your organization.',
    },
    {
      question: 'What browsers are supported?',
      answer: 'AgriTrack works best on modern browsers such as Google Chrome, Mozilla Firefox, Microsoft Edge, or Safari. Make sure your browser is updated to the latest version for the best experience.',
    },
    {
      question: 'Can I access AgriTrack on mobile devices?',
      answer: 
      <Text>
        <Text>
            Yes, AgriTrack is accessible on mobile devices, but the system is primarily designed with a desktop-first approach. This means certain buttons, icons, and interface elements may not yet be fully optimized for smaller screens.
        </Text>
        <br></br>
        <Text>
            However, key forms—such as the High-Value Crop (HVC) submission form and Machinery Ticket Request forms—are intentionally built to be responsive, since many farmers commonly use mobile phones to submit their information. These sections work well on mobile and are continuously being improved for a better user experience.
        </Text>
        <br></br>
        <Text>
            We&apos;re still actively working on enhancing the full mobile experience to ensure the entire system becomes fully optimized and user-friendly across all device sizes.
        </Text>
      </Text>
    },
  ];

  return (
    <>
      <IconButton
        aria-label="FAQ"
        icon={<FiHelpCircle size={iconSize} />}
        onClick={onOpen}
        position="fixed"
        bottom={{ base: 4, md: 6 }}
        right={{ base: 4, md: 6 }}
        size={buttonSize}
        colorScheme="blue"
        borderRadius="full"
        boxShadow="lg"
        zIndex={1000}
        _hover={{
          transform: 'scale(1.1)',
          boxShadow: 'xl',
        }}
        transition="all 0.2s"
      />

      <Modal isOpen={isOpen} onClose={onClose} size={{ base: 'full', md: 'xl' }} isCentered motionPreset="none">
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent maxH={{ base: '100vh', md: '90vh' }} overflowY="auto">

          <ModalHeader  borderBottomWidth="1px" borderColor="gray.200" display="flex" alignItems="center">
            <FiHelpCircle style={{ marginRight: 12}} />
            Frequently Asked Questions
          </ModalHeader>
 

          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Accordion allowToggle>
                {faqData.map((faq, index) => (
                  <AccordionItem key={index} border="none">
                    <AccordionButton
                      _hover={{ bg: 'gray.50' }}
                      py={4}
                      px={4}
                      borderRadius="md"
                    >
                      <Box flex="1" textAlign="left" fontWeight="semibold">
                        {faq.question}
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel pb={4} px={4} color="gray.700">
                      {faq.answer}
                    </AccordionPanel>
                  </AccordionItem>
                ))}
              </Accordion>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose} variant="outline">Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default FAQButton;


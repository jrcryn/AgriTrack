import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  VStack,
  Button,
  useToast,
  Image,
  FormControl,
  FormLabel,
  HStack,
  PinInput,
  PinInputField,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from '@chakra-ui/react';
import { useAuthStore } from '../store/authStore';
import BackgroundImage from '../../images/bg.jpg';
import { WarningIcon } from '@chakra-ui/icons';

const Verify2FA = () => {
  const [token, setToken] = useState('');
  const { verify2FA, isLoading, user } = useAuthStore();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [modalMessage, setModalMessage] = useState('');
  

  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const userId = location.state?.userId;

  useEffect(() => {
      if (!userId) {
        toast({
          title: 'Error',
          description: 'User ID not found. Please log in again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        navigate('/auth/login');
        return;
      }
    }, [userId, toast, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (token.length !== 6) {
      toast({
        title: 'Error',
        description: 'Please enter a 6-digit code.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await verify2FA({ userId, token });
      toast({
        title: 'Success',
        description: response.message,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      if (response.user?.role === 'HVCM' || response.user?.role === 'HVCS') {
        navigate('/hvc/metrics');
      } else if (response.user?.role === 'DMM' || response.user?.role === 'DMS') {
        navigate('/doc-track/metrics');
      } else {
        navigate('/machineries/metrics');
      }
    } catch (error) {
      
      const errorMessage = error.response?.data?.message;

      if (errorMessage.includes('Account is now locked due to multiple failed 2FA attempts.') || errorMessage.includes('Too many 2FA verification attempts. Please try again after 15 minutes.') || errorMessage.includes('Unauthorized.')) {
        toast({
          title: 'Error',
          description: errorMessage,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        navigate('/auth/login');
        return;
      }
      if (errorMessage?.includes('Account locked. Contact IT support to regain access.')) {
            setModalMessage(errorMessage);
            onOpen();
            return;
        }
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box
      minH="100vh"
      position="relative"
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={4}
    >
      <Box
        position="absolute"
        top="0"
        left="0"
        width="100%"
        height="100%"
        bgImage={`url(${BackgroundImage})`}
        bgSize="cover"
        bgPosition="center"
        bgRepeat="no-repeat"
        filter="blur(3px)"
        zIndex="-1"
      />

      <Box
        bg="white"
        borderRadius="2xl"
        shadow="2xl"
        maxW="md"
        w="full"
        p={{ base: 6, md: 10 }}
        zIndex="1"
      >
        <VStack spacing={3} textAlign="center" mb={6}>
          <Heading size="lg">Verify Two-Factor Authentication</Heading>
          <Text fontSize="sm" color="gray.500">
            Enter the 6-digit code from your authenticator app.
          </Text>
        </VStack>

        <form onSubmit={handleSubmit}>
          <VStack spacing={6}>
            <FormControl>
              <FormLabel htmlFor="token" srOnly>Verification Code</FormLabel>
              <HStack justify="center">
                <PinInput id="token" otp value={token} onChange={setToken}>
                  <PinInputField boxShadow={"lg"}/>
                  <PinInputField boxShadow={"lg"}/>
                  <PinInputField boxShadow={"lg"}/>
                  <PinInputField boxShadow={"lg"}/>
                  <PinInputField boxShadow={"lg"}/>
                  <PinInputField boxShadow={"lg"}/>
                </PinInput>
              </HStack>
            </FormControl>
            
            <Button
              colorScheme="blue"
              width="full"
              size="lg"
              type="submit"
              borderRadius="lg"
              isLoading={isLoading}
              isDisabled={token.length !== 6}
            >
              Verify
            </Button>
          </VStack>
          </form>
          
        <Text mt={8} fontSize="xs" color="gray.500" textAlign="center">
          © {new Date().getFullYear()} City Agriculture Services Department. All rights reserved.
        </Text>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent borderTop="6px solid red" borderRadius="md" bg="white">
          <ModalHeader display="flex" alignItems="center" gap={2} color="red.600">
            <WarningIcon boxSize={5} />
            Account Locked
          </ModalHeader>
          <ModalBody>
            <Box p={2} rounded="md" bg="red.50" border="1px solid" borderColor="red.200">
              <Text fontSize="md" color="red.700" fontWeight="medium">
                {modalMessage}
              </Text>
            </Box>
          </ModalBody>
          <ModalFooter>
            <Button onClick={() => {
              onClose(); 
              navigate('/auth/login');
            }} 
            colorScheme="red" 
            variant="solid">
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Verify2FA;
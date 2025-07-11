import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  VStack,
  Image,
  Button,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  Flex,
  useBreakpointValue,
  HStack,
  PinInput,
  PinInputField,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import { useAuthStore } from '../store/authStore';
import BackgroundImage from '../../images/bg.jpg';

const Setup2FA = () => {
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [token, setToken] = useState('');
  const { generate2FASecret, isLoading, verify2FA } = useAuthStore();
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

    const fetchQRCode = async () => {
      try {
        const response = await generate2FASecret({ userId });
        setQrCode(response.qr);
        setSecret(response.secret); 
      } catch (err) {
        toast({
          title: 'Error',
          description: err.response?.data?.message || 'Failed to generate QR code.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };

    fetchQRCode();
  }, [userId, generate2FASecret, navigate, toast]);

  const handleSubmit = async () => {
      if (!token || token.length !== 6) {
        toast({
          title: 'Error',
          description: 'Please enter a valid 6-digit code.',
          status: 'error',
          duration: 5000,
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
          duration: 5000,
          isClosable: true,
        });
        if (response.user?.role === 'HVCM' || response.user?.role === 'HVCS') {
          navigate('/hvc/metrics');
        } else if (response.user?.role === 'DMM' || response.user?.role === 'DMS') {
          navigate('/doc-track/metrics');
        } else {
          navigate('/machineries/metrics');
        }; 
      } catch (err) {
        toast({
          title: 'Error',
          description: err.response?.data?.message,
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
      {/* Background Blur */}
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

      {/* Main Content */}
      <Box
        bg="white"
        borderRadius="2xl"
        shadow="2xl"
        maxW="5xl"
        w="full"
        p={{ base: 6, md: 10 }}
        zIndex="1"
      >
        <VStack spacing={2} textAlign="center" mb={6}>
          <Heading size={{ base: 'md', md: 'lg' }}>
            Set Up Two-Factor Authentication
          </Heading>
        </VStack>

        {/* Responsive Layout */}
        <Flex direction={{ base: 'column', md: 'row' }} gap={{ base: 8, md: 10 }}>
          {/* Left - Instructions */}
          <VStack align="start" spacing={4} flex="1" justify="center">
            <Text fontSize="sm" color="gray.700">
              To enhance the security of your account, two-factor authentication (2FA) is <b>required</b> after your first login. This adds an extra layer of protection by requiring both your password and a time-based verification code.
            </Text>

            <Box pl={2}>
              <Text fontSize="sm" color="gray.700" mb={2}>
                <b>To enable 2FA:</b>
              </Text>
              <VStack as="ol" align="start" pl={4} spacing={2} fontSize="sm" color="gray.600">
                <li>
                  Download the <b>Google Authenticator</b> app on your device.
                </li>
                <li>
                  Use the app to scan the QR code shown on the right. This will automatically register your account.
                </li>
                <li>
                  If scanning is not possible, manually enter this key:
                  <br />
                  <Text fontFamily="mono" fontWeight="bold" mt={1}>
                    {secret || '[loading secret...]'}
                  </Text>
                </li>
                <li>
                  Once set up, your app will generate a 6-digit verification code that refreshes every 30 seconds.
                </li>
                <li>
                  Lastly, enter the code to complete your 2FA setup.
                </li>
              </VStack>
            </Box>

            <Text fontSize="sm" color="gray.600">
              Click the button below to proceed to code verification.
            </Text>
          </VStack>

          {/* Right - QR Code */}
          <VStack spacing={5} align="center" justify="center" flex="1">
            {isLoading && <Spinner size="xl" thickness="4px" />}
            {qrCode && !isLoading && (
              <Box
                p={6}
                borderWidth="1px"
                borderColor="gray.200"
                borderRadius="xl"
                bg="white"
                boxShadow="lg"
              >
                <Image src={qrCode} alt="QR Code" boxSize={{ base: "200px", md: "240px" }} />
              </Box>
            )}
            {qrCode && !isLoading && (
                <VStack spacing={4}>
                    
                    <FormControl>
                        <FormLabel textAlign="center" color="gray.600" fontSize="sm">Enter your 6-digit code below</FormLabel>
                        <HStack justify="center">
                            <PinInput otp value={token} onChange={setToken}>
                                <PinInputField boxShadow={"lg"}/>
                                <PinInputField boxShadow={"lg"}/>
                                <PinInputField boxShadow={"lg"}/>
                                <PinInputField boxShadow={"lg"}/>
                                <PinInputField boxShadow={"lg"}/>
                                <PinInputField boxShadow={"lg"}/>
                            </PinInput>
                        </HStack>
                    </FormControl>
                </VStack>
            )}
          </VStack>
        </Flex>

        {/* Button */}
        <Button
          mt={6}
          colorScheme="blue"
          width="full"
          size="lg"
          borderRadius="lg"
          onClick={handleSubmit}
          isLoading={isLoading}
          isDisabled={!qrCode || !secret || isLoading || token.length !== 6}
        >
          Continue to Verification
        </Button>

        {/* Footer */}
        <Text mt={8} fontSize="xs" color="gray.500" textAlign="center">
          © {new Date().getFullYear()} City Agriculture Services Department. All rights reserved.
        </Text>
      </Box>
    </Box>
  );
};

export default Setup2FA;

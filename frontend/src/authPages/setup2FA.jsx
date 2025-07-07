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
} from '@chakra-ui/react';
import { useAuthStore } from './store/authStore';
import BackgroundImage from '../images/bg.jpg';
import Logo from '../images/Calamba_Seal.png';

const Setup2FA = () => {
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [error, setError] = useState('');
  const { generate2FASecret, isLoading } = useAuthStore();
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
        setSecret(response.secret); // assuming your API sends this
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to generate QR code.');
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
        <VStack spacing={2} textAlign="center" mb={10}>
          <Image boxSize="60px" src={Logo} alt="City Logo" />
          <Heading size={{ base: 'md', md: 'lg' }}>
            Set Up Two-Factor Authentication
          </Heading>
        </VStack>

        {/* Responsive Layout */}
        <Flex direction={{ base: 'column', md: 'row' }} gap={{ base: 8, md: 10 }}>
          {/* Left - Instructions */}
          <VStack align="start" spacing={4} flex="1" justify="center">
            <Text fontSize="sm" color="gray.700">
              To enhance the security of your account, two-factor authentication (2FA) is required after your first login. This adds an extra layer of protection by requiring both your password and a time-based verification code.
            </Text>

            <Box pl={2}>
              <Text fontSize="sm" color="gray.700">
                <strong>To enable 2FA:</strong>
              </Text>
              <VStack as="ol" align="start" pl={4} spacing={2} fontSize="sm" color="gray.600">
                <li>
                  Download the <strong>Google Authenticator</strong> app on your device.
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
                  Enter the code in the next step to complete your 2FA setup.
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
            {error && (
              <Alert status="error" w="full" borderRadius="md">
                <AlertIcon />
                {error}
              </Alert>
            )}
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
                <Text fontSize="md" color="gray.600" fontWeight={"bold"}>Scan with Google Authenticator</Text>
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
          onClick={() => navigate('/auth/2fa/verify-2fa', { state: { userId } })}
          isDisabled={!qrCode || isLoading}
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

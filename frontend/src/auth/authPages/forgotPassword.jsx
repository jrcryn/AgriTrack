import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  VStack,
  Button,
  useToast,
  FormControl,
  Input
} from '@chakra-ui/react';
import { useAuthStore } from '../store/authStore';
import BackgroundImage from '../../images/bg.jpg';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const toast = useToast();
  const navigate = useNavigate();

  const { isLoading, forgotPassword } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: 'Error',
        description: 'Please enter a valid email address.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await forgotPassword({ email });
      toast({
        title: 'Success',
        description: response.message,
        status: 'success',
        duration: 20000,
        isClosable: true,
      });
      navigate('/auth/login');
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message,
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
          <Heading size="lg">Forgot Password?</Heading>
          <Text fontSize="sm" color="gray.500">
            Enter you email and we'll send you a link to reset your password.
          </Text>
        </VStack>
        <form onSubmit={handleSubmit}>
          <VStack spacing={6}>
            <FormControl>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
              />
            </FormControl>

            <Button
              colorScheme="blue"
              width="full"
              size="lg"
              type="submit"
              borderRadius="lg"
              isLoading={isLoading}
              isDisabled={!email}
            >
              Request Reset
            </Button>
          </VStack>
        </form>

        <Text mt={8} fontSize="xs" color="gray.500" textAlign="center">
          © {new Date().getFullYear()} City Agriculture Services Department. All rights reserved.
        </Text>
      </Box>
    </Box>
  );
};

export default ForgotPassword;
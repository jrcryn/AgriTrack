import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Input,
  InputGroup,
  InputRightElement,
  Icon,
  FormErrorMessage,
} from '@chakra-ui/react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuthStore } from '../store/authStore';
import BackgroundImage from '../../images/bg.jpg';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword1, setShowPassword1] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { resetPassword, isLoading } = useAuthStore();

  const isStrongPassword = (newPassword) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(newPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    if (newPassword.length < 6) {
        toast({
          title: 'Error',
          description: 'Password must be at least 6 characters long.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

    try {
      const response = await resetPassword({ token, newPassword });
      toast({
        title: 'Success',
        Description: 'Password Reset Successful.',
        description: response.message,
        status: 'success',
        duration: 3000,
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
          <Heading size="lg">Reset Your Password</Heading>
          <Text fontSize="sm" color="gray.500">
            Enter and confirm your new password below.
          </Text>
        </VStack>

        <form onSubmit={handleSubmit}>
          <VStack spacing={6}>
            <FormControl  isRequired isInvalid={newPassword && !isStrongPassword(newPassword)}>
              <FormLabel>New Password</FormLabel>
              <InputGroup>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  sx={{
                    '::-ms-reveal': {
                      display: 'none',
                    },
                  }}
                />
                <InputRightElement>
                  <Button variant="ghost" size="sm" onClick={() => setShowPassword(!showPassword)}>
                    <Icon as={showPassword ? FiEyeOff : FiEye} color="gray.400" />
                  </Button>
                </InputRightElement>
              </InputGroup>

              <FormErrorMessage>
                Password must be at least 8 characters and include uppercase, lowercase, number, and special character.
              </FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={confirmPassword && confirmPassword !== newPassword}>
              <FormLabel>Confirm New Password</FormLabel>
              <InputGroup>
              <Input
                type={showPassword1 ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                sx={{
                    '::-ms-reveal': {
                      display: 'none',
                    },
                  }}
              />
                <InputRightElement>
                  <Button variant="ghost" size="sm" onClick={() => setShowPassword1(!showPassword1)}>
                    <Icon as={showPassword1 ? FiEyeOff : FiEye} color="gray.400" />
                  </Button>
                </InputRightElement>
              </InputGroup>

            <FormErrorMessage>
              Passwords do not match.
            </FormErrorMessage>
            </FormControl>

            <Button
              colorScheme="blue"
              width="full"
              size="lg"
              type="submit"
              borderRadius="lg"
              isLoading={isLoading}
              isDisabled={!newPassword || !confirmPassword || !isStrongPassword(newPassword) || newPassword !== confirmPassword}
            >
              Reset Password
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

export default ResetPassword;
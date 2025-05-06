import React, { useState } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  FormErrorMessage,
  InputGroup,
  InputRightElement,
  InputLeftElement,
  Icon,
  Flex,
  Image,
  Link,
  Stack
} from '@chakra-ui/react';
import { FiEye, FiEyeOff, FiMail, FiLock } from 'react-icons/fi';
import Logo from '../images/Calamba_Seal.png';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  // Card styling variables
  const cardBg = 'white';
  const accentColor = 'blue.600';
  const borderColor = 'gray.200';
  
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      return 'Email address is required';
    } else if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (emailError) {
      setEmailError(validateEmail(value));
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    if (passwordError && value) {
      setPasswordError('');
    }
  };

  const handleEmailBlur = () => {
    setEmailError(validateEmail(email));
  };

  const handlePasswordBlur = () => {
    setPasswordError(password ? '' : 'Password is required');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const emailValidationError = validateEmail(email);
    const passwordValidationError = password.trim() ? '' : 'Password is required';
    
    setEmailError(emailValidationError);
    setPasswordError(passwordValidationError);
    
    if (!emailValidationError && !passwordValidationError) {
      // Authentication logic would go here in the future
      console.log('Valid form submitted');
    }
  };

  return (
    <Box minH="100vh" py={10} px={4} bg="gray.50">
      <VStack spacing={8} maxW="500px" mx="auto" w="full">
        {/* Logo and Department Info */}
        <Box textAlign="center">
          <Image boxSize="110px" src={Logo} mx="auto" mb={3} />
          <Text mt={2} fontSize="sm" fontWeight="medium" color="gray.600">
            CITY AGRICULTURE SERVICES DEPARTMENT
          </Text>
          <Text fontSize="xl" fontWeight="bold" color="gray.700">
            AgriTrack SYSTEM
          </Text>
        </Box>
        
        {/* Main Card */}
        <Box bg={cardBg} borderRadius="xl" shadow="xl" w="full" overflow="hidden">
          {/* Header */}
          <Box 
            p={6}
            borderBottomWidth="2px"
            borderColor={borderColor}
            align="center"
          >
            <Heading 
              size="lg"
              color={accentColor}
              fontWeight="semibold"
              letterSpacing="tight"
              mb={3}
            >
              Login to AgriTrack
            </Heading>
            <Text fontSize="sm" color="gray.500" fontWeight="medium" mb={-2}>
              Enter your credentials to access your account
            </Text>
          </Box>

          {/* Form Content */}
          <Box p={8}>
            <form onSubmit={handleSubmit}>
              <VStack spacing={6} align="stretch">
                {/* Login Section Banner */}
                <Box
                  bg="blue.50"
                  borderRadius="md"
                  p={4}
                  borderLeftWidth="4px"
                  borderColor={accentColor}
                >
                  <Text fontSize="md" fontWeight="bold" color="blue.600">
                    ACCOUNT AUTHENTICATION
                  </Text>
                </Box>

                <FormControl isInvalid={emailError} id="email">
                  <FormLabel 
                    fontSize="sm" 
                    fontWeight="bold"
                    color="gray.600"
                    textTransform="uppercase"
                    letterSpacing="wide"
                  >
                    Email Address
                  </FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <Icon as={FiMail} color="gray.400" />
                    </InputLeftElement>
                    <Input 
                      type="email"
                      value={email}
                      onChange={handleEmailChange}
                      onBlur={handleEmailBlur}
                      placeholder="Enter your email address"
                      borderRadius="md"
                      focusBorderColor={accentColor}
                    />
                  </InputGroup>
                  {emailError && (
                    <FormErrorMessage>{emailError}</FormErrorMessage>
                  )}
                </FormControl>

                <FormControl isInvalid={passwordError} id="password">
                  <FormLabel 
                    fontSize="sm" 
                    fontWeight="bold"
                    color="gray.600"
                    textTransform="uppercase"
                    letterSpacing="wide"
                  >
                    Password
                  </FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <Icon as={FiLock} color="gray.400" />
                    </InputLeftElement>
                    <Input 
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={handlePasswordChange}
                      onBlur={handlePasswordBlur}
                      placeholder="Enter your password"
                      borderRadius="md"
                      focusBorderColor={accentColor}
                    />
                    <InputRightElement>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={togglePasswordVisibility}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        <Icon as={showPassword ? FiEyeOff : FiEye} color="gray.400" />
                      </Button>
                    </InputRightElement>
                  </InputGroup>
                  {passwordError && (
                    <FormErrorMessage>{passwordError}</FormErrorMessage>
                  )}
                </FormControl>

                {/* Forgot Password Link */}
                <Flex justify="flex-end">
                  <Link 
                    color={accentColor} 
                    fontSize="sm"
                    _hover={{ textDecoration: "underline" }}
                    fontWeight="medium"
                  >
                    Forgot Password?
                  </Link>
                </Flex>

                {/* Login Button - following pattern from other forms */}
                <Stack
                  direction={{ base: 'column', md: 'row' }}
                  spacing={4}
                  justify="flex-end"
                  mt={12}
                >
                  <Button
                    bg={accentColor}
                    color="white"
                    _hover={{ bg: 'blue.700' }}
                    type="submit"
                    px={8}
                    borderRadius="md"
                  >
                    Login
                  </Button>
                </Stack>
              </VStack>
            </form>
          </Box>
        </Box>
        
        {/* Footer Text */}
        <Text fontSize="xs" color="gray.500" textAlign="center">
          © {new Date().getFullYear()} City Agriculture Services Department. All rights reserved.
        </Text>
      </VStack>
    </Box>
  );
};

export default LoginPage;
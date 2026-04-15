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
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from '@chakra-ui/react';
import { FiEye, FiEyeOff, FiMail, FiLock } from 'react-icons/fi';
import { WarningIcon } from '@chakra-ui/icons';
import Logo from '../../images/Calamba_Seal.png';
import BackgroundImage from '../../images/bg.jpg';
import { useAuthStore } from '../store/authStore.js'
import { useNavigate, Link } from 'react-router-dom';
import FAQButton from '../../components/FAQButton.jsx';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  const { login, isLoading } = useAuthStore()
  const toast = useToast();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) return 'Email address is required.';
    if (!emailRegex.test(email)) return 'Please enter a valid email address.';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailValidationError = validateEmail(email);
    const passwordValidationError = password.trim() ? '' : 'Password is required.';

    setEmailError(emailValidationError);
    setPasswordError(passwordValidationError);

    if (!emailValidationError && !passwordValidationError) {
      try {
        const response = await login({ email, password });
        toast({
          title: 'Success',
          description: response.message,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        navigate('/auth/2fa/verify-2fa', { state: { userId: response.userId } });
      } catch (error) {

        const errorMessage = error.response?.data?.message;
        const userId = error.response?.data?.userId; 

        if (errorMessage?.includes('Account locked. Contact IT support to regain access.')) {
            setModalMessage(errorMessage);
            onOpen();
            return;
        }
          toast({
            title: 'Error',
            description: errorMessage || 'An error occurred during login.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });

        if (errorMessage?.includes('You are required to set up 2FA first.')) {
          navigate('/auth/2fa/setup-2fa', { state: { userId } });
          return;
        }

        
      }
    }
  };

  return (
    <Box // Parent container for positioning
      minH="100vh"
      position="relative" // Establishes a stacking context
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={4}
    >
      {/* Background Image Box */}
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
        filter="blur(3px)" // Apply blur only to this box
        zIndex="-1" // Ensure it's behind the content
      />

      {/* Login Form Box */}
      <Box
        bg="white" // Or useColorModeValue('white', 'gray.700') for dark mode
        borderRadius="2xl"
        shadow="2xl"
        maxW="lg"
        w="full"
        p={{ base: 6, md: 10 }}
        zIndex="1" // Ensure it's on top of the blurred background
      >
        {/* Logo and Title */}
        <VStack spacing={3} textAlign="center" mb={6}>
          <Image boxSize="80px" src={Logo} alt="Calamba City Logo" mb={-1} />
          <Heading size="lg">AgriTrack</Heading>
          <Text fontSize="sm" color="gray.500">City Agricultural Services Department-Calamba</Text>
        </VStack>

        <form onSubmit={handleSubmit}>
          <VStack spacing={5}>
            <FormControl isInvalid={!!emailError}>
              <FormLabel>Email Address</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Icon as={FiMail} color="gray.400" />
                </InputLeftElement>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setEmailError(validateEmail(email))}
                  placeholder="example@email.com"
                />
              </InputGroup>
              {emailError && <FormErrorMessage>{emailError}</FormErrorMessage>}
            </FormControl>

            <FormControl isInvalid={!!passwordError}>
              <FormLabel>Password</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Icon as={FiLock} color="gray.400" />
                </InputLeftElement>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setPasswordError(password.trim() ? '' : 'Password is required.')}
                  placeholder="Enter password"
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
              {passwordError && <FormErrorMessage>{passwordError}</FormErrorMessage>}
            </FormControl>

            <Flex w="full" justify="space-between" align="center" fontSize="sm">
              <Box /> {/* Empty Box for spacing if needed, or for a "Remember me" checkbox */}
              <Link color="blue.600" _hover={{ textDecoration: 'underline' }} as={Link} to="/auth/forgot-password">
                Forgot Password?
              </Link>
            </Flex>

            <Button
              colorScheme="blue"
              width="full"
              size="lg"
              type="submit"
              borderRadius="lg"
              isLoading={isLoading}
              isDisabled={!email || !password}
            >
              Log In 
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
              window.location.reload();
            }} 
            colorScheme="red" 
            variant="solid">
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* FAQ Button */}
      <FAQButton />
    </Box> 
  );
};

export default LoginPage;
import { useState } from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  FormControl,
  FormLabel,
  Input,
  Flex,
  Grid,
  VStack,
  HStack,
  Alert,
  AlertIcon,
  AlertDescription,
  Icon,
  List,
  ListItem,
  ListIcon
} from '@chakra-ui/react';
import { FiShield, FiMail, FiPhone, FiUser, FiCheckCircle, FiAlertCircle, FiCheck } from 'react-icons/fi';

const RegisterSystemAdmin = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    suffix: '',
    email: '',
    phone: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      setMessage({ type: 'error', text: 'Please fill in all required fields.' });
      setLoading(false);
      return;
    }

    // Simulate API call
    setTimeout(() => {
      setMessage({ 
        type: 'success', 
        text: `System Admin ${formData.firstName} ${formData.lastName} registered successfully! Default password sent to ${formData.email}` 
      });
      setLoading(false);
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        middleName: '',
        suffix: '',
        email: '',
        phone: ''
      });
    }, 1500);
  };

  return (
    <Box p={8} bg="gray.50" minH="100vh">
      {/* Header */}
      <Box mb={8}>
        <Heading size="xl" color="gray.800">Register System Admin</Heading>
        <Text color="gray.600" mt={2}>Create a new system administrator account</Text>
      </Box>

      {/* Warning Banner */}
      <Alert status="warning" borderRadius="lg" maxW="4xl" mb={6}>
        <AlertIcon as={FiAlertCircle} />
        <Box flex="1">
          <Heading size="sm" mb={1}>Important Notice</Heading>
          <Text fontSize="sm">
            System administrators have full access to all system functions and user data. 
            Only register trusted personnel as system administrators.
          </Text>
        </Box>
      </Alert>

      {/* Form Card */}
      <Box maxW="4xl" bg="white" borderRadius="xl" boxShadow="md" p={8}>
        {/* Message Alert */}
        {message.text && (
          <Alert
            status={message.type === 'success' ? 'success' : 'error'}
            borderRadius="lg"
            mb={6}
          >
            <AlertIcon as={message.type === 'success' ? FiCheckCircle : FiAlertCircle} />
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <VStack align="stretch" spacing={8}>
            {/* Personal Information */}
            <Box>
              <Heading size="md" color="gray.800" mb={4}>
                <HStack>
                  <Icon as={FiUser} />
                  <Text>Personal Information</Text>
                </HStack>
              </Heading>
              <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
                <FormControl isRequired>
                  <FormLabel>First Name</FormLabel>
                  <Input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Juan"
                    focusBorderColor="purple.500"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Last Name</FormLabel>
                  <Input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Dela Cruz"
                    focusBorderColor="purple.500"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Middle Name</FormLabel>
                  <Input
                    type="text"
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleInputChange}
                    placeholder="Santos"
                    focusBorderColor="purple.500"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Suffix</FormLabel>
                  <Input
                    type="text"
                    name="suffix"
                    value={formData.suffix}
                    onChange={handleInputChange}
                    placeholder="Jr., Sr., III"
                    focusBorderColor="purple.500"
                  />
                </FormControl>
              </Grid>
            </Box>

            {/* Contact Information */}
            <Box>
              <Heading size="md" color="gray.800" mb={4}>
                <HStack>
                  <Icon as={FiMail} />
                  <Text>Contact Information</Text>
                </HStack>
              </Heading>
              <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
                <FormControl isRequired>
                  <FormLabel>Email Address</FormLabel>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="admin@agritrack.com"
                    focusBorderColor="purple.500"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Phone Number</FormLabel>
                  <Input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+63 912 345 6789"
                    focusBorderColor="purple.500"
                  />
                </FormControl>
              </Grid>
            </Box>

            {/* Permissions Info */}
            <Box p={6} bg="purple.50" borderRadius="lg" border="1px" borderColor="purple.200">
              <Heading size="sm" color="purple.900" mb={3}>
                <HStack>
                  <Icon as={FiShield} />
                  <Text>System Admin Permissions</Text>
                </HStack>
              </Heading>
              <List spacing={2} fontSize="sm" color="purple.800">
                <ListItem display="flex" alignItems="start">
                  <ListIcon as={FiCheck} color="purple.600" mt={1} />
                  <Text>Full access to all system modules and features</Text>
                </ListItem>
                <ListItem display="flex" alignItems="start">
                  <ListIcon as={FiCheck} color="purple.600" mt={1} />
                  <Text>Ability to create, edit, and manage all user accounts</Text>
                </ListItem>
                <ListItem display="flex" alignItems="start">
                  <ListIcon as={FiCheck} color="purple.600" mt={1} />
                  <Text>Access to view and manage action logs</Text>
                </ListItem>
                <ListItem display="flex" alignItems="start">
                  <ListIcon as={FiCheck} color="purple.600" mt={1} />
                  <Text>Permission to register other system administrators</Text>
                </ListItem>
                <ListItem display="flex" alignItems="start">
                  <ListIcon as={FiCheck} color="purple.600" mt={1} />
                  <Text>Ability to lock, unlock, and archive accounts</Text>
                </ListItem>
              </List>
            </Box>

            {/* Submit Button */}
            <HStack spacing={4}>
              <Button
                type="submit"
                isLoading={loading}
                loadingText="Registering..."
                colorScheme="purple"
                leftIcon={<Icon as={FiShield} />}
                fontWeight="medium"
              >
                Register System Admin
              </Button>
              
              <Button
                type="button"
                variant="outline"
                colorScheme="gray"
                fontWeight="medium"
                onClick={() => {
                  setFormData({
                    firstName: '',
                    lastName: '',
                    middleName: '',
                    suffix: '',
                    email: '',
                    phone: ''
                  });
                  setMessage({ type: '', text: '' });
                }}
              >
                Clear Form
              </Button>
            </HStack>

            {/* Info Box */}
            <Alert status="info" borderRadius="lg">
              <AlertIcon />
              <AlertDescription>
                <Text as="strong">Note:</Text> A randomly generated password will be sent to the admin's email address upon successful registration. 
                The new administrator will be prompted to change their password and set up 2FA on first login.
              </AlertDescription>
            </Alert>
          </VStack>
        </form>
      </Box>
    </Box>
  );
};

export default RegisterSystemAdmin;

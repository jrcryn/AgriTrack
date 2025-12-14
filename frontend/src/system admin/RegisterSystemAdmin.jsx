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
  ListIcon,
  useToast
} from '@chakra-ui/react';
import { FiShield, FiMail, FiPhone, FiUser, FiCheckCircle, FiAlertCircle, FiCheck } from 'react-icons/fi';
import { useSystemAdminStore } from './store/systemAdminDashboard.store';

const RegisterSystemAdmin = () => {
  const { registerSystemAdmin, allUsersLoading, allUsersError } = useSystemAdminStore();
  const toast = useToast();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    suffix: '',
    email: '',
    phone: ''
  });

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
    setMessage({ type: '', text: '' });

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      setMessage({ type: 'error', text: 'Please fill in all required fields.' });
      return;
    }

    try {
      const result = await registerSystemAdmin(formData);
      
      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: `System Admin ${formData.firstName} ${formData.lastName} registered successfully! Default password sent to ${formData.email}` 
        });
        
        toast({
          title: 'Success',
          description: 'System admin registered successfully',
          status: 'success',
          duration: 3000,
          isClosable: true
        });
        
        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          middleName: '',
          suffix: '',
          email: '',
          phone: ''
        });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || allUsersError || 'Failed to register system admin';
      setMessage({ type: 'error', text: errorMessage });
      
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    }
  };

  return (
    <Box p={6} minH="100vh">
      {/* Header */}
      <Box mb={6}>
        <Heading size="lg">Register System Admin</Heading>
        <Text color="gray.600" fontSize="sm" mt={1}>Create a new system administrator account</Text>
      </Box>

      {/* Warning Banner */}
      <Alert status="warning" borderRadius="md" maxW="4xl" mb={4}>
        <AlertIcon />
        <Box>
          <Text fontSize="sm" fontWeight="medium" mb={1}>Important Notice</Text>
          <Text fontSize="xs">
            System administrators have full access to all system functions and user data.
          </Text>
        </Box>
      </Alert>

      {/* Form Card */}
      <Box maxW="4xl" bg="white" border="1px" borderColor="gray.200" borderRadius="md" p={6}>
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
          <VStack align="stretch" spacing={6}>
            {/* Personal Information */}
            <Box>
              <Heading size="sm" mb={3}>Personal Information</Heading>
              <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                <FormControl isRequired>
                  <FormLabel fontSize="sm">First Name</FormLabel>
                  <Input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Juan"
                    size="sm"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="sm">Last Name</FormLabel>
                  <Input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Dela Cruz"
                    size="sm"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm">Middle Name</FormLabel>
                  <Input
                    type="text"
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleInputChange}
                    placeholder="Santos"
                    size="sm"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm">Suffix</FormLabel>
                  <Input
                    type="text"
                    name="suffix"
                    value={formData.suffix}
                    onChange={handleInputChange}
                    placeholder="Jr., Sr., III"
                    size="sm"
                  />
                </FormControl>
              </Grid>
            </Box>

            {/* Contact Information */}
            <Box>
              <Heading size="sm" mb={3}>Contact Information</Heading>
              <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                <FormControl isRequired>
                  <FormLabel fontSize="sm">Email Address</FormLabel>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="admin@agritrack.com"
                    size="sm"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="sm">Phone Number</FormLabel>
                  <Input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+63 912 345 6789"
                    size="sm"
                  />
                </FormControl>
              </Grid>
            </Box>

            {/* Permissions Info */}
            <Box p={3} bg="purple.50" borderRadius="md" border="1px" borderColor="purple.200">
              <Text fontSize="sm" fontWeight="medium" mb={2}>System Admin Permissions</Text>
              <List spacing={1} fontSize="xs">
                <ListItem display="flex" alignItems="start">
                  <ListIcon as={FiCheck} color="purple.600" mt={0.5} />
                  <Text>Full access to all system modules</Text>
                </ListItem>
                <ListItem display="flex" alignItems="start">
                  <ListIcon as={FiCheck} color="purple.600" mt={0.5} />
                  <Text>Manage all user accounts</Text>
                </ListItem>
                <ListItem display="flex" alignItems="start">
                  <ListIcon as={FiCheck} color="purple.600" mt={0.5} />
                  <Text>View and manage action logs</Text>
                </ListItem>
                <ListItem display="flex" alignItems="start">
                  <ListIcon as={FiCheck} color="purple.600" mt={0.5} />
                  <Text>Register other system administrators</Text>
                </ListItem>
              </List>
            </Box>

            {/* Submit Button */}
            <HStack spacing={3}>
              <Button
                type="submit"
                isLoading={allUsersLoading}
                loadingText="Registering..."
                colorScheme="purple"
                size="sm"
              >
                Register Admin
              </Button>
              
              <Button
                type="button"
                variant="outline"
                size="sm"
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
                Clear
              </Button>
            </HStack>

            {/* Info Box */}
            <Alert status="info" borderRadius="md" size="sm">
              <AlertIcon />
              <AlertDescription fontSize="xs">
                A randomly generated password will be sent to the admin's email. 2FA setup required on first login.
              </AlertDescription>
            </Alert>
          </VStack>
        </form>
      </Box>
    </Box>
  );
};

export default RegisterSystemAdmin;

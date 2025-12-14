import { useState } from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Flex,
  Grid,
  GridItem,
  Alert,
  AlertIcon,
  AlertDescription,
  VStack,
  HStack,
  Icon,
  useToast
} from '@chakra-ui/react';
import { FiUserPlus, FiMail, FiPhone, FiUser, FiBriefcase, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const RegisterEmployee = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    suffix: '',
    email: '',
    phone: '',
    roles: [],
    officePosition: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const availableRoles = ['HVC', 'DMS', 'MACHINERIES', 'DOC_TRACK'];
  const officePositions = ['CFS', 'LPMS', 'ANMS', 'RTSS'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleToggle = (role) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role]
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

    if (formData.roles.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one role.' });
      setLoading(false);
      return;
    }

    if (formData.roles.includes('DMS') && !formData.officePosition) {
      setMessage({ type: 'error', text: 'Office position is required for DMS role.' });
      setLoading(false);
      return;
    }

    // Simulate API call
    setTimeout(() => {
      setMessage({ 
        type: 'success', 
        text: `Employee ${formData.firstName} ${formData.lastName} registered successfully! Default password sent to ${formData.email}` 
      });
      setLoading(false);
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        middleName: '',
        suffix: '',
        email: '',
        phone: '',
        roles: [],
        officePosition: ''
      });
    }, 1500);
  };

  return (
    <Box p={8} bg="gray.50" minH="100vh">
      {/* Header */}
      <Box mb={8}>
        <Heading size="xl" color="gray.800">Register Employee</Heading>
        <Text color="gray.600" mt={2}>Create a new employee account</Text>
      </Box>

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
          {/* Personal Information */}
          <VStack align="stretch" spacing={8}>
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
                    placeholder="juan.delacruz@agritrack.com"
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
                  />
                </FormControl>
              </Grid>
            </Box>

            {/* Roles & Position */}
            <Box>
              <Heading size="md" color="gray.800" mb={4}>
                <HStack>
                  <Icon as={FiBriefcase} />
                  <Text>Roles & Position</Text>
                </HStack>
              </Heading>
              
              {/* Roles */}
              <FormControl isRequired mb={6}>
                <FormLabel>Roles</FormLabel>
                <Grid templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }} gap={3}>
                  {availableRoles.map((role) => (
                    <Button
                      key={role}
                      type="button"
                      onClick={() => handleRoleToggle(role)}
                      variant={formData.roles.includes(role) ? 'solid' : 'outline'}
                      colorScheme={formData.roles.includes(role) ? 'blue' : 'gray'}
                      fontWeight="medium"
                    >
                      {role}
                    </Button>
                  ))}
                </Grid>
              </FormControl>

              {/* Office Position (conditional) */}
              {formData.roles.includes('DMS') && (
                <FormControl isRequired>
                  <FormLabel>Office Position</FormLabel>
                  <Select
                    name="officePosition"
                    value={formData.officePosition}
                    onChange={handleInputChange}
                    placeholder="Select office position"
                  >
                    {officePositions.map((position) => (
                      <option key={position} value={position}>
                        {position}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Box>

            {/* Submit Button */}
            <HStack spacing={4}>
              <Button
                type="submit"
                isLoading={loading}
                loadingText="Registering..."
                colorScheme="blue"
                leftIcon={<Icon as={FiUserPlus} />}
                fontWeight="medium"
              >
                Register Employee
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
                    phone: '',
                    roles: [],
                    officePosition: ''
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
                <Text as="strong">Note:</Text> A randomly generated password will be sent to the employee's email address upon successful registration. 
                The employee will be prompted to change their password on first login.
              </AlertDescription>
            </Alert>
          </VStack>
        </form>
      </Box>
    </Box>
  );
};

export default RegisterEmployee;

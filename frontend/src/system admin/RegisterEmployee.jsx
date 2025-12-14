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
  useToast,
  Code,
  IconButton,
  Tooltip
} from '@chakra-ui/react';
import { FiUserPlus, FiMail, FiPhone, FiUser, FiBriefcase, FiCheckCircle, FiAlertCircle, FiCopy } from 'react-icons/fi';
import { useSystemAdminStore } from './store/systemAdminDashboard.store';

const RegisterEmployee = () => {
  const { registerEmployee, employeeAccountsLoading, employeeAccountsError } = useSystemAdminStore();
  const toast = useToast();

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

  const [message, setMessage] = useState({ type: '', text: '' });
  const [temporaryPassword, setTemporaryPassword] = useState('');

  const availableRoles = ['DMS', 'DMM', 'MIS', 'MIM', 'HVCS', 'HVCM'];
  const officePositions = ['CFS', 'LPMS', 'ANMS', 'RTSS'];
  
  const roleMeanings = {
    'DMS': 'DOCUMENT MANAGEMENT STAFF',
    'DMM': 'DOCUMENT MANAGEMENT MANAGER',
    'MIS': 'MACHINE INVENTORY STAFF',
    'MIM': 'MACHINE INVENTORY MANAGER',
    'HVCS': 'HIGH-VALUE CROPS STAFF',
    'HVCM': 'HIGH-VALUE CROPS MANAGER'
  };

  // Define mutually exclusive role pairs (staff <-> manager)
  const rolePairs = {
    'DMS': 'DMM',
    'DMM': 'DMS',
    'MIS': 'MIM',
    'MIM': 'MIS',
    'HVCS': 'HVCM',
    'HVCM': 'HVCS'
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleToggle = (role) => {
    setFormData(prev => {
      const isCurrentlySelected = prev.roles.includes(role);
      const oppositeRole = rolePairs[role];
      
      if (isCurrentlySelected) {
        // If deselecting, just remove the role
        return {
          ...prev,
          roles: prev.roles.filter(r => r !== role)
        };
      } else {
        // If selecting, remove the opposite role if it exists, then add the new role
        const filteredRoles = prev.roles.filter(r => r !== oppositeRole);
        return {
          ...prev,
          roles: [...filteredRoles, role]
        };
      }
    });
  };

  // Check if a role should be disabled (when its opposite is selected)
  const isRoleDisabled = (role) => {
    const oppositeRole = rolePairs[role];
    return formData.roles.includes(oppositeRole);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setTemporaryPassword(''); // Clear previous password

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      setMessage({ type: 'error', text: 'Please fill in all required fields.' });
      return;
    }

    if (formData.roles.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one role.' });
      return;
    }

    if (formData.roles.includes('DMS') && !formData.officePosition) {
      setMessage({ type: 'error', text: 'Office position is required for DMS role.' });
      return;
    }

    try {
      const result = await registerEmployee(formData);
      
      if (result.success) {
        const tempPassword = result.temporaryPassword || '';
        setTemporaryPassword(tempPassword);
        
        setMessage({ 
          type: 'success', 
          text: `Employee ${formData.firstName} ${formData.lastName} registered successfully!` 
        });
        
        toast({
          title: 'Success',
          description: 'Employee registered successfully',
          status: 'success',
          duration: 5000,
          isClosable: true
        });
        
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
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || employeeAccountsError || 'Failed to register employee';
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
        <Heading size="lg">Register Employee</Heading>
        <Text color="gray.600" fontSize="sm" mt={1}>Create a new employee account</Text>
      </Box>

      {/* Form Card */}
      <Box maxW="4xl" bg="white" border="1px" borderColor="gray.200" borderRadius="md" p={6}>
        {/* Message Alert */}
        {message.text && (
          <Alert
            status={message.type === 'success' ? 'success' : 'error'}
            borderRadius="lg"
            mb={6}
            flexDirection="column"
            alignItems="flex-start"
          >
            <Flex width="100%" align="center">
              <AlertIcon as={message.type === 'success' ? FiCheckCircle : FiAlertCircle} />
              <AlertDescription flex="1">{message.text}</AlertDescription>
            </Flex>
            {message.type === 'success' && temporaryPassword && (
              <Box mt={3} width="100%">
                <Text fontSize="sm" fontWeight="medium" mb={2}>
                  Temporary Password (also sent via email):
                </Text>
                <Flex align="center" gap={2}>
                  <Code
                    colorScheme="green"
                    fontSize="md"
                    p={2}
                    borderRadius="md"
                    fontFamily="mono"
                    fontWeight="bold"
                  >
                    {temporaryPassword}
                  </Code>
                  <Tooltip label="Copy password">
                    <IconButton
                      icon={<FiCopy />}
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(temporaryPassword);
                        toast({
                          title: 'Copied!',
                          description: 'Password copied to clipboard',
                          status: 'success',
                          duration: 2000,
                          isClosable: true
                        });
                      }}
                      aria-label="Copy password"
                    />
                  </Tooltip>
                </Flex>
                <Text fontSize="xs" color="gray.600" mt={2}>
                  Please save this password securely. The user will need it to log in for the first time.
                </Text>
              </Box>
            )}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          {/* Personal Information */}
          <VStack align="stretch" spacing={6}>
            <Box>
              <Heading size="sm" mb={3}>Personal Information</Heading>
              <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
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
              <Heading size="sm" mb={3}>Contact Information</Heading>
              <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
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
              <Heading size="sm" mb={3}>Roles & Position</Heading>
              
              {/* Role Meanings Note */}
              <Alert status="info" borderRadius="md" mb={4} size="sm">
                <AlertIcon />
                <Box>
                  <AlertDescription fontSize="xs">
                    <Text as="span" fontWeight="medium">DMS</Text> = Document Management Staff |{' '}
                    <Text as="span" fontWeight="medium">DMM</Text> = Document Management Manager |{' '}
                    <Text as="span" fontWeight="medium">MIS</Text> = Machine Inventory Staff |{' '}
                    <Text as="span" fontWeight="medium">MIM</Text> = Machine Inventory Manager |{' '}
                    <Text as="span" fontWeight="medium">HVCS</Text> = High-Value Crops Staff |{' '}
                    <Text as="span" fontWeight="medium">HVCM</Text> = High-Value Crops Manager
                  </AlertDescription>
                </Box>
              </Alert>

              {/* Manager Role Priority Note */}
              <Alert status="warning" borderRadius="md" mb={4} size="sm">
                <AlertIcon />
                <AlertDescription fontSize="xs">
                  The first role selected will be the default module shown upon login. Please select the primary role first.
                </AlertDescription>
              </Alert>
              
              {/* Roles */}
              <FormControl isRequired mb={4}>
                <FormLabel fontSize="sm">Roles</FormLabel>
                <Grid templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }} gap={2}>
                  {availableRoles.map((role) => {
                    const isDisabled = isRoleDisabled(role);
                    const isSelected = formData.roles.includes(role);
                    return (
                      <Button
                        key={role}
                        type="button"
                        size="sm"
                        onClick={() => handleRoleToggle(role)}
                        variant={isSelected ? 'solid' : 'outline'}
                        colorScheme={isSelected ? 'blue' : 'gray'}
                        title={isDisabled ? `${roleMeanings[role]} - Cannot select both staff and manager roles for the same module` : roleMeanings[role]}
                        isDisabled={isDisabled}
                        opacity={isDisabled ? 0.5 : 1}
                        cursor={isDisabled ? 'not-allowed' : 'pointer'}
                      >
                        {role}
                      </Button>
                    );
                  })}
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
            <HStack spacing={3}>
              <Button
                type="submit"
                isLoading={employeeAccountsLoading}
                loadingText="Registering..."
                colorScheme="blue"
                size="sm"
              >
                Register Employee
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
                    phone: '',
                    roles: [],
                    officePosition: ''
                  });
                  setMessage({ type: '', text: '' });
                  setTemporaryPassword('');
                }}
              >
                Clear
              </Button>
            </HStack>

            {/* Info Box */}
            <Alert status="info" borderRadius="md" size="sm">
              <AlertIcon />
              <AlertDescription fontSize="xs">
                A randomly generated password will be displayed on screen and sent to the employee's email upon registration.
              </AlertDescription>
            </Alert>
          </VStack>
        </form>
      </Box>
    </Box>
  );
};

export default RegisterEmployee;

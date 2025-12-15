import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  HStack,
  Text,
  Badge,
  Grid,
  Alert,
  AlertIcon,
  AlertDescription,
  Box,
  useToast,
  Center,
  Spinner,
  Divider,
  Code,
  IconButton,
  Tooltip,
  useDisclosure
} from '@chakra-ui/react';
import { FiKey, FiShield, FiAlertTriangle, FiCopy } from 'react-icons/fi';
import { useSystemAdminStore } from '../system admin/store/systemAdminDashboard.store';

const EditUserModal = ({ isOpen, onClose, user, onSuccess }) => {
  const { 
    updateUserAccount, 
    generateNewPassword, 
    resetUser2FA, 
    resetUserPasswordAndTwoFA 
  } = useSystemAdminStore();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [isResetting2FA, setIsResetting2FA] = useState(false);
  const [isResettingBoth, setIsResettingBoth] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    middle_name: '',
    suffix: '',
    email: '',
    phone: '',
    roles: [],
    office_position: ''
  });

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

  // Initialize form data when user prop changes
  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        middle_name: user.middle_name || '',
        suffix: user.suffix || '',
        email: user.email || '',
        phone: user.phone || '',
        roles: user.roles || [],
        office_position: user.office_position || ''
      });
      setGeneratedPassword(''); // Clear password when modal opens
    }
  }, [user]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
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

  const handleGenerateNewPassword = async () => {
    if (!user) return;

    setIsResettingPassword(true);
    try {
      const result = await generateNewPassword(user._id, user.accountType);
      
      setGeneratedPassword(result.temporaryPassword || '');
      
      toast({
        title: 'Success',
        description: 'New password generated and sent to user via email',
        status: 'success',
        duration: 5000,
        isClosable: true
      });
      
      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to generate new password',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleReset2FA = async () => {
    if (!user) return;

    setIsResetting2FA(true);
    try {
      await resetUser2FA(user._id, user.accountType);
      
      toast({
        title: 'Success',
        description: '2FA has been reset for this user',
        status: 'success',
        duration: 5000,
        isClosable: true
      });
      
      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to reset 2FA',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setIsResetting2FA(false);
    }
  };

  const handleResetBoth = async () => {
    if (!user) return;

    setIsResettingBoth(true);
    try {
      const result = await resetUserPasswordAndTwoFA(user._id, user.accountType);
      
      setGeneratedPassword(result.temporaryPassword || '');
      
      toast({
        title: 'Success',
        description: 'Password and 2FA have been reset. New password sent via email.',
        status: 'success',
        duration: 5000,
        isClosable: true
      });
      
      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to reset password and 2FA',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setIsResettingBoth(false);
    }
  };

  const copyPasswordToClipboard = () => {
    if (generatedPassword) {
      navigator.clipboard.writeText(generatedPassword);
      toast({
        title: 'Copied!',
        description: 'Password copied to clipboard',
        status: 'success',
        duration: 2000,
        isClosable: true
      });
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'First name and last name are required',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      return;
    }

    if (!formData.email.trim() || !formData.phone.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Email and phone are required',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      return;
    }

    if (user.accountType === 'EMPLOYEE' && (!formData.roles || formData.roles.length === 0)) {
      toast({
        title: 'Validation Error',
        description: 'At least one role is required for employees',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      return;
    }

    // Check if DMS role requires office_position
    if (user.accountType === 'EMPLOYEE' && formData.roles.includes('DMS') && !formData.office_position) {
      toast({
        title: 'Validation Error',
        description: 'Office position is required for DMS role',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      return;
    }

    setIsLoading(true);

    try {
      const updateData = {
        targetUserId: user._id,
        accountType: user.accountType,
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        middle_name: formData.middle_name.trim() || undefined,
        suffix: formData.suffix.trim() || undefined,
        email: formData.email.trim(),
        phone: formData.phone.trim()
      };

      // Add roles and office_position only for employees
      if (user.accountType === 'EMPLOYEE') {
        updateData.roles = formData.roles;
        updateData.office_position = formData.roles.includes('DMS') ? formData.office_position : null;
      }

      await updateUserAccount(updateData);

      toast({
        title: 'Success',
        description: 'User account updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update user account',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" motionPreset='none' scrollBehavior='inside'>
      <ModalOverlay />
      <ModalContent>
        {!user ? (
          <ModalBody py={10}>
            <Center>
              <Spinner />
            </Center>
          </ModalBody>
        ) : (
          <>
            <ModalHeader>
              <Text fontSize="lg" fontWeight="bold">Edit User Account</Text>
              <HStack mt={2} spacing={2}>
                <Badge
                  colorScheme={user.accountType === 'SYSTEM_ADMIN' ? 'purple' : 'blue'}
                  fontSize="xs"
                >
                  {user.accountType === 'SYSTEM_ADMIN' ? 'System Admin' : 'Employee'}
                </Badge>
                <Badge
                  colorScheme={
                    user.isArchived ? 'red' : 
                    user.isLocked ? 'orange' : 
                    'green'
                  }
                  fontSize="xs"
                >
                  {user.isArchived ? 'Archived' : user.isLocked ? 'Locked' : 'Active'}
                </Badge>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />

            <ModalBody>
              <VStack spacing={4} align="stretch">
                {/* Generated Password Display */}
                {generatedPassword && (
                  <Alert status="success" borderRadius="md">
                    <AlertIcon />
                    <Box flex="1">
                      <AlertDescription fontSize="sm">
                        <Text fontWeight="medium" mb={2}>New Password Generated:</Text>
                        <HStack>
                          <Code colorScheme="green" fontSize="md" p={2} borderRadius="md" fontFamily="mono">
                            {generatedPassword}
                          </Code>
                          <Tooltip label="Copy password">
                            <IconButton
                              icon={<FiCopy />}
                              size="sm"
                              onClick={copyPasswordToClipboard}
                              aria-label="Copy password"
                            />
                          </Tooltip>
                        </HStack>
                        <Text fontSize="xs" color="gray.600" mt={2}>
                          This password has been sent to the user's email.
                        </Text>
                      </AlertDescription>
                    </Box>
                  </Alert>
                )}

                {/* Security Actions */}
                <Box>
                  <Text fontSize="sm" fontWeight="semibold" mb={2}>Security Actions</Text>
                  <VStack spacing={2} align="stretch">
                    <HStack spacing={2}>
                      <Button
                        size="sm"
                        leftIcon={<FiKey />}
                        colorScheme="orange"
                        variant="outline"
                        onClick={handleGenerateNewPassword}
                        isLoading={isResettingPassword}
                        loadingText="Generating..."
                        flex={1}
                      >
                        Generate New Password
                      </Button>
                      <Button
                        size="sm"
                        leftIcon={<FiShield />}
                        colorScheme="purple"
                        variant="outline"
                        onClick={handleReset2FA}
                        isLoading={isResetting2FA}
                        loadingText="Resetting..."
                        flex={1}
                      >
                        Reset 2FA
                      </Button>
                    </HStack>
                    <Button
                      size="sm"
                      leftIcon={<FiAlertTriangle />}
                      colorScheme="red"
                      variant="outline"
                      onClick={handleResetBoth}
                      isLoading={isResettingBoth}
                      loadingText="Resetting..."
                      width="full"
                    >
                      Reset Password & 2FA
                    </Button>
                  </VStack>
                  <Text fontSize="xs" color="gray.500" mt={2}>
                    These actions will immediately affect the user's account. A new password will be sent via email.
                  </Text>
                </Box>

                <Divider />

                {/* Name Fields */}
                <HStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel fontSize="sm">First Name</FormLabel>
                    <Input
                      value={formData.first_name}
                      onChange={(e) => handleInputChange('first_name', e.target.value)}
                      placeholder="Enter first name"
                      size="sm"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm">Middle Name</FormLabel>
                    <Input
                      value={formData.middle_name}
                      onChange={(e) => handleInputChange('middle_name', e.target.value)}
                      placeholder="Enter middle name"
                      size="sm"
                    />
                  </FormControl>
                </HStack>

                <HStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel fontSize="sm">Last Name</FormLabel>
                    <Input
                      value={formData.last_name}
                      onChange={(e) => handleInputChange('last_name', e.target.value)}
                      placeholder="Enter last name"
                      size="sm"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm">Suffix</FormLabel>
                    <Input
                      value={formData.suffix}
                      onChange={(e) => handleInputChange('suffix', e.target.value)}
                      placeholder="Jr., Sr., III"
                      size="sm"
                    />
                  </FormControl>
                </HStack>

                {/* Contact Fields */}
                <FormControl isRequired>
                  <FormLabel fontSize="sm">Email</FormLabel>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter email address"
                    size="sm"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="sm">Phone Number</FormLabel>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Enter phone number"
                    size="sm"
                  />
                </FormControl>

                {/* Employee-specific fields */}
                {user.accountType === 'EMPLOYEE' && (
                  <>
                    {/* Role Meanings Note */}
                    <Alert status="info" borderRadius="md" size="sm">
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
                    <Alert status="warning" borderRadius="md" size="sm">
                      <AlertIcon />
                      <AlertDescription fontSize="xs">
                        The first role selected will be the default module shown upon login. Please select the primary role first.
                      </AlertDescription>
                    </Alert>

                    <FormControl isRequired>
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

                    {formData.roles.includes('DMS') && (
                      <FormControl isRequired>
                        <FormLabel fontSize="sm">Office Position</FormLabel>
                        <Select
                          value={formData.office_position}
                          onChange={(e) => handleInputChange('office_position', e.target.value)}
                          placeholder="Select office position"
                          size="sm"
                        >
                          {officePositions.map((position) => (
                            <option key={position} value={position}>
                              {position}
                            </option>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  </>
                )}
              </VStack>
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose} size="sm">
                Cancel
              </Button>
              <Button
                colorScheme="blue"
                onClick={handleSubmit}
                isLoading={isLoading}
                size="sm"
              >
                Update User
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default EditUserModal;

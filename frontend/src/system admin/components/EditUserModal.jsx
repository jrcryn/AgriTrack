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
  Checkbox,
  CheckboxGroup,
  Stack,
  useToast
} from '@chakra-ui/react';
import { useSystemAdminStore } from '../store/systemAdminDashboard.store';

const EditUserModal = ({ isOpen, onClose, user, onSuccess }) => {
  const { updateUserAccount } = useSystemAdminStore();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);

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
    }
  }, [user]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRolesChange = (selectedRoles) => {
    setFormData(prev => ({
      ...prev,
      roles: selectedRoles
    }));
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
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
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
                    <FormControl isRequired>
                      <FormLabel fontSize="sm">Roles</FormLabel>
                      <CheckboxGroup
                        value={formData.roles}
                        onChange={handleRolesChange}
                      >
                        <Stack spacing={2}>
                          <Checkbox value="DMS" colorScheme="blue">
                            DMS - Document Management Staff
                          </Checkbox>
                          <Checkbox value="DMM" colorScheme="blue">
                            DMM - Document Management Manager
                          </Checkbox>
                          <Checkbox value="MIS" colorScheme="orange">
                            MIS - Machineries Management Staff
                          </Checkbox>
                          <Checkbox value="MIM" colorScheme="orange">
                            MIM - Machineries Management Manager
                          </Checkbox>
                          <Checkbox value="HVCS" colorScheme="green">
                            HVCS - High-Value Crops Staff
                          </Checkbox>
                          <Checkbox value="HVCM" colorScheme="green">
                            HVCM - High-Value Crops Manager
                          </Checkbox>
                        </Stack>
                      </CheckboxGroup>
                    </FormControl>

                    {formData.roles.includes('DMS') && (
                      <FormControl isRequired>
                        <FormLabel fontSize="sm">Office Position (for DMS)</FormLabel>
                        <Select
                          value={formData.office_position}
                          onChange={(e) => handleInputChange('office_position', e.target.value)}
                          placeholder="Select office position"
                          size="sm"
                        >
                          <option value="CFS">CFS - City Fishery Section</option>
                          <option value="LPMS">LPMS - Livestock Poultry Management Section</option>
                          <option value="ANMS">ANMS - Agricultural Nursery Management Section</option>
                          <option value="RTSS">RTSS - Research Technology Support Section</option>
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

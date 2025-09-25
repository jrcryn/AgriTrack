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
  Icon,
  Image,
  useToast,
  Divider,
  Spinner,
  Stack,
  useBreakpointValue,
} from '@chakra-ui/react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useUserSettingsStore } from './userSettings.store';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../auth/store/authStore.js';

const ProfileSettings = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [show2FA, setShow2FA] = useState(false);
  const [qr, setQr] = useState('');
  const [secret, setSecret] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassoword] = useState(false);

  const toast = useToast();
  const {
    changeUserPassword,
    fetch2FASecret,
    isChangingPassword,
    isFetching2FASecret,
    error,
  } = useUserSettingsStore();

  const { user, availableRoles, switchRole, isLoading } = useAuthStore();
  //console.log(availableRoles);
  const navigate = useNavigate();
  const roleToHome = {
    HVCM: '/hvc/metrics',
    HVCS: '/hvc/metrics',
    MIS: '/machineries/metrics',
    DMS: '/doc-track/register-document',
    DMM: '/doc-track/metrics',
  };
  const roleLabel = (r) =>
    r === 'HVCM' || r === 'HVCS'
      ? 'High-Value Crops'
      : r === 'DMS' || r === 'DMM'
      ? 'Doc-Track'
      : r === 'MIS'
      ? 'Machineries'
      : r;
  const handleSwitchSubsystem = async (role) => {
    try {
      await switchRole(role);
      toast({
        title: 'Switched subsystem',
        description: roleLabel(role),
        status: 'success',
        duration: 2500,
        isClosable: true,
      });
      navigate(roleToHome[role] || '/');
    } catch (err) {
      toast({
        title: 'Error',
        description:
          err.response?.data?.message || 'Failed to switch subsystem.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const isStrongPassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: 'Error',
        description: 'All fields are required.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
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
    if (!isStrongPassword(newPassword)) {
      toast({
        title: 'Error',
        description:
          'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    try {
      const response = await changeUserPassword({ currentPassword, newPassword });
      toast({
        title: 'Success',
        description: response.message,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleShow2FA = async () => {
    setShow2FA(true);
    setQr('');
    setSecret('');
    try {
      const response = await fetch2FASecret({ password });
      setQr(response.qr);
      setSecret(response.secret);
      setPassword('');
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message,
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const stackDirection = useBreakpointValue({ base: 'column', md: 'row' });

  return (
    <Box p={4} maxW="6xl" mx="auto">
      <Text fontSize="sm" color="gray.500" mb={6}>
        Manage your password, two-factor authentication and available subsystems.
      </Text>
      <Stack direction={stackDirection} spacing={10} align="start">

      <VStack>

        <VStack align="stretch" flex={1} spacing={4} w="100%">
          <Heading size="md">Two-Factor Authentication (2FA)</Heading>
          <Text fontSize="sm" color="gray.500">
            View your 2FA QR code and secret for authenticator apps.
          </Text>
          <form onSubmit={e => { e.preventDefault(); handleShow2FA(); }}>
            <FormControl isRequired>
            <FormLabel>Enter Password to View 2FA</FormLabel>
            <InputGroup>
            <Input
              type={showPassword ? 'text' : 'password'}
              value={password}
              placeholder='Enter password'
              onChange={e => setPassword(e.target.value)}
              sx={{ '::-ms-reveal': { display: 'none' } }}
            />
              <InputRightElement>
                <Button variant="ghost" size="sm" onClick={() => setShowPassoword(v => !v)}>
                  <Icon as={showPassword ? FiEyeOff : FiEye} />
                </Button>
              </InputRightElement>
          </InputGroup>
          </FormControl>
          <Button
            mt={5}
            mb={5}
            width="100%"
            colorScheme="teal"
            onClick={handleShow2FA}
            isLoading={isFetching2FASecret}
            isDisabled={!password}
          >
            View 2FA QR Code & Secret
          </Button>
          </form>
          {show2FA && (
            <Box textAlign="center" mt={-2} mb={5} p={4} borderWidth="1px" borderRadius="md" borderColor="gray.200">
              {isFetching2FASecret ? (
                <Spinner size="lg" />
              ) : (
                <>
                  {qr && (
                    <Image src={qr} alt="2FA QR Code" mx="auto" boxSize="180px" mb={2} />
                  )}
                  {secret && (
                    <Text fontFamily="mono" fontWeight="bold" fontSize="lg" color="gray.700">
                      {secret}
                    </Text>
                  )}
                  {!qr && !secret && (
                    <Text color="red.500" fontSize="sm">No 2FA secret found.</Text>
                  )}
                </>
              )}
            </Box>
          )}
        </VStack>

        <Divider />

        <VStack as="form" align="stretch" mt={5} spacing={5} onSubmit={handlePasswordChange} flex={1} w="100%">
          <Heading size="md">Change Password</Heading>
          <Text fontSize="sm" color="gray.500">
            Change your account password regularly to enhance security.
          </Text>
          <FormControl isRequired>
            <FormLabel>Current Password</FormLabel>
            <InputGroup>
              <Input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                sx={{ '::-ms-reveal': { display: 'none' } }}
              />
              <InputRightElement>
                <Button variant="ghost" size="sm" onClick={() => setShowCurrent(v => !v)}>
                  <Icon as={showCurrent ? FiEyeOff : FiEye} />
                </Button>
              </InputRightElement>
            </InputGroup>
          </FormControl>
          <FormControl isRequired isInvalid={newPassword && !isStrongPassword(newPassword)}>
            <FormLabel>New Password</FormLabel>
            <InputGroup>
              <Input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                sx={{ '::-ms-reveal': { display: 'none' } }}
              />
              <InputRightElement>
                <Button variant="ghost" size="sm" onClick={() => setShowNew(v => !v)}>
                  <Icon as={showNew ? FiEyeOff : FiEye} />
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
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                sx={{ '::-ms-reveal': { display: 'none' } }}
              />
              <InputRightElement>
                <Button variant="ghost" size="sm" onClick={() => setShowConfirm(v => !v)}>
                  <Icon as={showConfirm ? FiEyeOff : FiEye} />
                </Button>
              </InputRightElement>
            </InputGroup>
            <FormErrorMessage>
              Passwords do not match.
            </FormErrorMessage>
          </FormControl>
          <Button
            colorScheme="blue"
            type="submit"
            isLoading={isChangingPassword}
            isDisabled={
              !currentPassword ||
              !newPassword ||
              !confirmPassword ||
              newPassword !== confirmPassword ||
              !isStrongPassword(newPassword)
            }
          >
            Change Password
          </Button>
        </VStack>

      </VStack>

        <Divider orientation={stackDirection === 'row' ? 'vertical' : 'horizontal'} h="auto" mb={-3}/>
        
        <VStack align="stretch" flex={1} spacing={4} w="100%">
          <Heading size="md">Switch Subsystem</Heading>
          <Text fontSize="sm" color="gray.500">
            Switch to another subsystem you have access to.
          </Text>
          <VStack align="stretch">
            {isLoading ? (
              <Box textAlign="center" mt={3}>
                <Spinner size="md" />
              </Box>
            ) : (
              <>
                {(availableRoles || [])
                  .filter(r => r.role !== user?.role)
                  .map(r => (
                    <Button
                      key={r.role}
                      onClick={() => handleSwitchSubsystem(r.role)}
                      colorScheme="blue"
                      justifyContent="flex-start"
                    >
                      {roleLabel(r.role)}
                    </Button>
                  ))
                }
              </>
            )}
            
            {(!availableRoles || availableRoles.filter(r => r.role !== user?.role).length === 0) && (
              <Text fontSize="sm" color="gray.500">No other subsystems available.</Text>
            )}
          </VStack>
        </VStack>
        
      </Stack>
    </Box>
  );
};

export default ProfileSettings;

import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import {
  IconButton,
  Box,
  CloseButton,
  Flex,
  HStack,
  VStack,
  Icon,
  Text,
  Drawer,
  DrawerContent,
  useDisclosure,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Divider,
  Image,
  Button,
  useBreakpointValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import {
  FiMenu,
  FiChevronDown,
  FiGrid,
  FiUsers,
  FiUserPlus,
  FiShield,
  FiFileText,
} from 'react-icons/fi';
import { FaDoorOpen } from 'react-icons/fa';
import { IoSettingsSharp } from 'react-icons/io5';
import Logo from '../images/Calamba_Seal.png';
import ProfileSettings from './profileSettings';

const allLinkItems = [
  { name: 'Dashboard', icon: FiGrid, path: '/system-admin/dashboard' },
  { name: 'User Management', icon: FiUsers, path: '/system-admin/users' },
  { name: 'Register Employee', icon: FiUserPlus, path: '/system-admin/register-employee' },
  { name: 'Register Admin', icon: FiShield, path: '/system-admin/register-admin' },
  { name: 'Action Logs', icon: FiFileText, path: '/system-admin/logs' },
];

const SidebarContent = ({ onClose, ...rest }) => {
  const navigate = useNavigate();
  const isMobile = useBreakpointValue({ base: true, md: false });

  const handleNavClick = () => {
    if (isMobile && onClose) onClose();
  };

  return (
    <Box
      bg="blue.900"
      bgGradient="linear(to-b, blue.900, blue.800)"
      w={{ base: 'full', md: '260px' }}
      pos={{ base: 'relative', md: 'fixed' }}
      h="100vh"
      overflowY="auto"
      {...rest}
    >
      {/* Logo Header */}
      <Box px="8" pb="5" pt="10" textAlign="center">
        <Text mt="2" fontSize="smaller" fontWeight="medium" color="white">
          AGRITRACK
        </Text>
        <Text fontSize="larger" fontWeight="bold" color="white">
          ADMINISTRATOR
        </Text>
      </Box>

      {/* Mobile Close Button */}
      <CloseButton
        display={{ base: 'flex', md: 'none' }}
        onClick={onClose}
        color="white"
        position="absolute"
        top="4"
        right="4"
      />

      {/* Navigation Items */}
      {allLinkItems.map((link) => (
        <NavItem
          key={link.name}
          icon={link.icon}
          path={link.path}
          onClick={handleNavClick}
        >
          {link.name}
        </NavItem>
      ))}

      <Divider my={4} borderColor="blue.700" />

      {/* Footer */}
      <Box px="4" pb="4" pt="2">
        <Text fontSize="xs" color="blue.200" textAlign="center">
          AgriTrack v1.0
        </Text>
      </Box>
    </Box>
  );
};

const NavItem = ({ icon, children, path, onClick, ...rest }) => {
  const location = useLocation();
  const isActive = location.pathname === path;

  return (
    <Box
      as={RouterLink}
      to={path}
      onClick={onClick}
      style={{ textDecoration: 'none' }}
      _focus={{ boxShadow: 'none' }}
    >
      <Flex
        align="center"
        p="4"
        mx="4"
        borderRadius="lg"
        role="group"
        cursor="pointer"
        bg={isActive ? 'white' : 'transparent'}
        color={isActive ? 'blue.900' : 'white'}
        _hover={{
          bg: 'white',
          color: 'blue.900',
        }}
        {...rest}
      >
        {icon && (
          <Icon
            mr="4"
            fontSize="20"
            color={isActive ? 'blue.900' : 'white'}
            _groupHover={{ color: 'blue.900' }}
            as={icon}
          />
        )}
        <Text flex="1" fontWeight="medium">{children}</Text>
      </Flex>
    </Box>
  );
};

const MobileNav = ({ onOpen, ...rest }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { isOpen: isSettingsOpen, onOpen: onSettingsOpen, onClose: onSettingsClose } = useDisclosure();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const navigate = useNavigate();

  const handleLogout = () => {
    // TODO: Implement logout logic
    navigate('/auth/login');
  };

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  });
  const currentDateTime = `${formattedDate} ${formattedTime}`;

  return (
    <Flex
      ml={{ base: 0, md: 260 }}
      px={{ base: 4, md: 4 }}
      height="55px"
      alignItems="center"
      bg="white"
      boxShadow="md"
      borderBottomWidth="1px"
      borderBottomColor="gray.200"
      justifyContent={{ base: 'space-between', md: 'flex-end' }}
      position="fixed"
      top={0}
      right={0}
      left={0}
      zIndex={10}
      {...rest}
    >
      <IconButton
        display={{ base: 'flex', md: 'none' }}
        onClick={onOpen}
        variant="outline"
        aria-label="open menu"
        icon={<FiMenu />}
        size="sm"
      />

      <HStack spacing={{ base: '2', md: '4' }}>
        <Text fontSize="sm">{currentDateTime}</Text>
        <Divider orientation="vertical" height="20px" borderColor="gray.400" />
        <Flex alignItems="center">
          <Menu>
            <MenuButton py={2} transition="none" _focus={{ boxShadow: 'none' }}>
              <HStack>
                <VStack
                  display={{ base: 'none', md: 'flex' }}
                  alignItems="flex-start"
                  spacing="1px"
                >
                  <Text fontSize="sm">System Administrator</Text>
                  <Text fontSize="xs" color="gray.600">
                    ADMIN
                  </Text>
                </VStack>
                <Box display="flex">
                  <FiChevronDown />
                </Box>
              </HStack>
            </MenuButton>

            <MenuList bg="white" borderColor="gray.200" boxShadow="md">
              <MenuItem as="button" onClick={onSettingsOpen} _focus={{ bg: 'blue.50' }}>
                <Icon as={IoSettingsSharp} mr={1.5} ml={2} />
                Settings
              </MenuItem>

              <MenuDivider mt="1" mb="1" />

              <MenuItem
                as="button"
                onClick={handleLogout}
                color="red.500"
                _focus={{ bg: 'blue.50' }}
              >
                <Icon as={FaDoorOpen} mr={1.5} ml={2} />
                Log out
              </MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </HStack>

      {/* Profile Settings Modal */}
      <Modal isOpen={isSettingsOpen} onClose={onSettingsClose} size="4xl" scrollBehavior="inside" motionPreset="none">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Settings</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <ProfileSettings />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

const SidebarHeaderSystemAdmin = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const location = useLocation();

  // Auto-close Drawer when route changes (mobile nav)
  useEffect(() => {
    if (isOpen) onClose();
  }, [location.pathname]);

  return (
    <Box>
      <SidebarContent onClose={onClose} display={{ base: 'none', md: 'block' }} />
      <Drawer
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
        size="full"
        motionPreset="none"
      >
        <DrawerContent>
          <SidebarContent onClose={onClose} />
        </DrawerContent>
      </Drawer>
      <MobileNav onOpen={onOpen} />
    </Box>
  );
};

export default SidebarHeaderSystemAdmin;

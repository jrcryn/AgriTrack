import React, { useState, useEffect } from 'react'
import {  Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import {
  IconButton,
  Avatar,
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
  MenuGroup, // added
  Divider,
  Image,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Link,
  useBreakpointValue,
} from '@chakra-ui/react'
import {
  FiGrid,
  FiDownload,
  FiUsers,
  FiChevronDown,
  FiMenu,
  FiInbox,
  FiClock,
  FiSend,
  FiArchive,
  FiBox,
  FiCalendar
} from 'react-icons/fi'
import { FaWpforms, FaUser, FaPowerOff, FaDoorOpen, FaBug  } from "react-icons/fa";
import { IoSettingsSharp } from "react-icons/io5";
import { Ticket, CornerDownLeft } from 'lucide-react';
import { IoDocumentAttachOutline } from "react-icons/io5";
import Logo from '../images/Calamba_Seal.png'
import { useAuthStore } from '../auth/store/authStore.js'
import ProfileSettings from './profileSettings.jsx';
import { useAdminDashboard as useDocTrackDashboard } from '../doc-track/store/adminDashboard.store.js';
import { useAdminDashboard as  useMachineriesDashboard } from '../machineries/store/adminDashboard.store.js';

const allLinkItems = [
  // high-value-crops
  { name: 'Metrics', icon: FiGrid, path : '/hvc/metrics', roles: ['HVCM', 'HVCS'] },
  { name: 'Supply and Market Profile Report', icon: FiDownload, path : '/hvc/hvc-sampr', roles: ['HVCM'] },
  { name: 'Production Report', icon: FiDownload, path : '/hvc/hvc-pr', roles: ['HVCM', 'HVCS'] },
  { name: 'New Responses', icon: FaWpforms, path : '/hvc/responses', roles: ['HVCM', 'HVCS'] },
  { name: 'Farmers', icon: FiUsers, path : '/hvc/farmers', roles: ['HVCM', 'HVCS'] },
  
  //doc-track
  { name: 'Dashboard', icon: FiGrid, path : '/doc-track/metrics', roles: ['DMM'] },
  { name: 'Produce Document', icon: IoDocumentAttachOutline, path : '/doc-track/register-document', roles: ['DMS', 'DMM'] },
  { name: 'Incoming', icon: FiInbox, path : '/doc-track/incoming', count: 8, roles: ['DMS', 'DMM'] },
  { name: 'Pending', icon: FiClock, path : '/doc-track/pending', count: 6, roles: ['DMS', 'DMM'] },
  { name: 'Forwarded', icon: FiSend, path : '/doc-track/outgoing', count: 4, roles: ['DMS', 'DMM'] },
  { name: 'Employees', icon: FiUsers, path : '/doc-track/employees', roles: ['DMM'] },

  //machineries
  { name: 'Dashboard', icon: FiGrid, path: '/machineries/metrics', roles: ['MIM'] },
  { name: 'Machinery Management', icon: FiBox, path: '/machineries/machine-inventory', roles: ['MIM', 'MIS'] },
  { name: 'Ticket Requests', icon: Ticket, path: '/machineries/ticket-requests', roles: ['MIS', 'MIM'] },
  { name: 'Calendar', icon: FiCalendar, path: '/machineries/weekly-schedules', roles: ['MIS', 'MIM'] },
  { name: 'Returns', icon: CornerDownLeft, path: '/machineries/trip-ticket-returns', roles: ['MIS', 'MIM'] },
  { name: 'Usage Report', icon: FiDownload, path: '/machineries/gen-reports', roles: ['MIM'] },
  { name: 'Operators', icon: FiUsers, path: '/machineries/operators', roles: ['MIM'] },
]

const SidebarContent = ({ onClose, ...rest }) => {

  const { user } = useAuthStore();
  const [ dashboardName, setDashboardName ] = useState('');
  const navigate = useNavigate();
  const LinkItems = allLinkItems.filter(link => link.roles.includes(user?.role));

  useEffect(() => {
      const roleMap = {
        DMS: 'DOC-TRACK',
        DMM: 'DOC-TRACK',
        MIS: 'MACHINERIES',
        MIM: 'MACHINERIES',
        HVCM: 'HIGH-VALUE CROPS',
        HVCS: 'HIGH-VALUE CROPS',
      };
      if (user?.role) {
        setDashboardName(roleMap[user.role] || '');
      }
    }, [user?.role]);

  const {
    forwardedDocuments,
    pendingDocuments,
    outgoingDocuments,
  } = useDocTrackDashboard();

  const { pendingExtensionCount, pendingIncidentReportsCount } = useMachineriesDashboard();

  const extensionCount = pendingExtensionCount?.data?.count ?? 0;
  const incidentReportsCount = pendingIncidentReportsCount?.data?.count ?? 0;

  const incomingCount = forwardedDocuments?.data?.totalCount ?? 0;
  const pendingCount = pendingDocuments?.data?.totalCount ?? 0;
  const outgoingCount = outgoingDocuments?.data?.totalCount ?? 0;



  // close drawer on mobile after clicking a link
  const isMobile = useBreakpointValue({ base: true, md: false });
  const handleNavClick = () => {
    if (isMobile && onClose) onClose();
  };

  return (
    <Box
      bg="black"
      w={{ base: 'full', md: '260px' }}
      // changed: make position responsive and enable vertical scroll
      pos={{ base: 'relative', md: 'fixed' }}
      h="100vh"
      overflowY="auto"
      {...rest}>
      {/* Logo Header */}
      <Box px="8" pb="5" pt="10" textAlign="center">
        <Image boxSize={'110px'} src={Logo} mx="auto" mb='3' />
        <Text mt="2" fontSize="smaller"  fontWeight="medium" color="white">
          CITY AGRI. SERVICES DEPT.
        </Text>
        <Text fontSize="larger"  fontWeight="bold" color="white">
          {dashboardName}
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
      {LinkItems.map((link) => (
        <NavItem 
          key={link.name} 
          icon={link.icon} 
          path={link.path} 
          count={
            link.name === 'Incoming' ? incomingCount :
            link.name === 'Pending' ? pendingCount :
            link.name === 'Forwarded' ? outgoingCount :
            link.name === 'Returns' ? extensionCount :
            link.name === 'Machinery Management' ? incidentReportsCount :
            undefined
          }
          linkName={link.name}
          onClick={handleNavClick} // added
        >
            
          {link.name}
        </NavItem>
      ))}

      <Divider my={4} borderColor="gray.600" />

      <Button 
        size={"sm"}  
        colorScheme="red" 
        px="10"
        mt={7}
        mb={7}
        display="block"
        mx="auto"
        onClick={() => { window.open('https://forms.gle/5o5nGY8DxE9Y3WvB8', '_blank') }}
      > 
      <Icon as={FaBug} mr={2}/>
        Report a Problem
      </Button>
    </Box>
  )
}

const NavItem = ({ icon, children, path, linkName, onClick, ...rest }) => {

  const location = useLocation();
  const isActive = location.pathname === path;
  
  const { count, ...otherProps } = rest;

  const getBadgeStyles = () => {
    switch(linkName) {
      case 'Incoming':
        return { bg: "green.500", color: "white" };
      case 'Pending':
        return { bg: "yellow.500", color: "white" };
      case 'Forwarded':
        return { bg: "red.500", color: "white" };
      case 'Returns':
        return { bg: "orange.500", color: "white" };
      case 'Machinery Management':
        return { bg: "purple.500", color: "white" };
      default:
        return { bg: "gray.500", color: "white" };
    }
  };

  const badgeStyles = getBadgeStyles();

  return (
    <Box 
      as={RouterLink} 
      to={path}
      onClick={onClick} // added
      style={{ textDecoration: 'none' }} 
      _focus={{ boxShadow: 'none' }}>
      <Flex
        align="center"
        p="4"
        mx="4"
        borderRadius="lg"
        role="group"
        cursor="pointer"
        bg={isActive ? 'white' : 'transparent'}
        color={isActive ? 'black' : 'white'}
        _hover={{
          bg: 'white',
          color: 'black',
        }}
        {...otherProps}>
        {icon && (
          <Icon 
            mr="4" 
            fontSize="20" 
            color={isActive ? 'black' : 'white'}
            _groupHover={{ color: 'black' }} 
            as={icon} />
        )}
        <Text flex="1">{children}</Text>
        {count !== undefined && count > 0 && (
          <Badge
            bg={badgeStyles.bg}
            color={badgeStyles.color}
            borderRadius="full"
            px="2"
            fontSize="0.8em"
          >
            {count}
          </Badge>
        )}
      </Flex>
    </Box>
  )
}

const MobileNav = ({ onOpen, ...rest }) => {
  // Update current time every second
  const [currentTime, setCurrentTime] = useState(new Date())
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [ roleName, setRoleName ] = useState('');

  const middle_name = user?.middle_name 
    ? `${user.middle_name.charAt(0).toUpperCase()}.` 
    : '';
  
  const suffix = user?.suffix ? user.suffix : '';

  const userName = <Text fontSize="sm">{user?.first_name} {middle_name} {user?.last_name} {suffix}</Text>
  const { isOpen, onOpen: onOpen1, onClose } = useDisclosure();

  const handleLogout = () => {
    logout();
  };

  useEffect(() => {
      const roleMap = {
        DMS: 'STAFF',
        DMM: 'MANAGER',
        MIS: 'STAFF',
        MIM: 'MANAGER',
        HVCM: 'MANAGER',
        HVCS: 'STAFF',
      };
      if (user?.role) {
        setRoleName(roleMap[user.role] || '');
      }
    }, [user?.role]); 
  
  // Format date as "Feb 16, 2024" and time as "10:45 AM"
  const formattedDate = currentTime.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  })
  const currentDateTime = `${formattedDate} ${formattedTime}`

  return (
    <>
    <Flex
      ml={{ base: 0, md: 260 }}
      px={{ base: 4, md: 4 }}
      height="55px" 
      alignItems="center"
      bg="white"
      boxShadow={'md'}
      borderBottomWidth="1px"
      borderBottomColor="gray.200"
      justifyContent={{ base: 'space-between', md: 'flex-end' }}
      position="fixed"
      top={0}
      right={0}
      left={0}
      zIndex={10}
    {...rest}>
      <IconButton
        display={{ base: 'flex', md: 'none' }}
        onClick={onOpen}
        variant="outline"
        aria-label="open menu"
        icon={<FiMenu />}
        size={"sm"}
      />
      {/* Removed the Logo text for mobile view */}
      <HStack spacing={{ base: '2', md: '4' }}>
        <Text fontSize="sm">{currentDateTime}</Text>
        <Divider orientation="vertical" height="20px" borderColor="gray.400" />
        <Flex alignItems="center">
          <Menu>

            <MenuButton py={2} transition="none" _focus={{ boxShadow: 'none' }}>
              <HStack>
                <VStack display={{ base: 'none', md: 'flex' }} alignItems="flex-start" spacing="1px">
                  <Text fontSize="sm">{userName}</Text>
                  <Text fontSize="xs" color="gray.600">
                    {roleName}
                  </Text>
                </VStack>
                <Box display="flex">
                  <FiChevronDown />
                </Box>
              </HStack>
            </MenuButton>

            <MenuList bg="white" borderColor="gray.200" boxShadow={'md'}>
              <MenuItem as="button" onClick={onOpen1} _focus={{ bg: 'blue.50' }}>
                <Icon as={IoSettingsSharp} mr={1.5} ml={2}/>
                Settings
              </MenuItem>

              <MenuDivider mt={'1'} mb={'1'}/>

              <MenuItem as="button" onClick={handleLogout} color={"red.500"} _focus={{ bg: 'blue.50' }}>
                <Icon as={FaDoorOpen} mr={1.5} ml={2}/>
                Log out
              </MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </HStack>
    </Flex>

    <Modal isOpen={isOpen} onClose={onClose} isCentered size={'4xl'} scrollBehavior={'inside'} closeOnOverlayClick={false}  motionPreset="none">
        <ModalOverlay />
        <ModalContent borderRadius="lg" overflow="hidden">
          <ModalHeader
            bg="blue.50" 
            borderBottomWidth="1px"
            borderColor="gray.200"
            py={4}
            display="flex" 
            alignItems="center"
          >
          <Icon as={IoSettingsSharp} mr={2} color={"blue.500"}/>
            System Settings
          </ModalHeader>

          <ModalBody>
            <ProfileSettings/>
          </ModalBody>

          <ModalFooter bg="gray.50" borderTopWidth="1px" borderColor="gray.200">
            <Button variant={'outline'} onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

const SidebarHeader = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const location = useLocation(); // added

  // auto-close Drawer when route changes (mobile nav)
  useEffect(() => {
    if (isOpen) onClose();
  }, [location.pathname]); // added

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
        motionPreset="none" // disable Drawer animation
      >
        <DrawerContent>
          <SidebarContent onClose={onClose} />
        </DrawerContent>
      </Drawer>
      <MobileNav onOpen={onOpen} />
    </Box>
  )
}

export default SidebarHeader

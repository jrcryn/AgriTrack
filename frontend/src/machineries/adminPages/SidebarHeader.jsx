import React, { useState, useEffect } from 'react'
import { Link as RouterLink, useLocation } from 'react-router-dom';
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
  Divider,
  Image
} from '@chakra-ui/react'
import { 
  FiGrid,          
  FiBox,          
  FiDownload,      
  FiPlusSquare,    
  FiRepeat,         
  FiMenu,
  FiChevronDown
} from 'react-icons/fi';
import Logo from '../../images/Calamba_Seal.png'

const LinkItems = [
  { name: 'Dashboard', icon: FiGrid, path: '/machineries/admin/dashboard' },
  { name: 'Machinery Inventory', icon: FiBox, path: '/machineries/admin/machine-inventory' },
  { name: 'Generate Report', icon: FiDownload, path: '/machineries/admin/gen-reports' },
];
const SidebarContent = ({ onClose, ...rest }) => {
  return (
    <Box
      transition="3s ease"
      bg="black"
      w={{ base: 'full', md: '260px' }}
      pos="fixed"
      h="full"
      {...rest}>
      {/* Logo Header */}
      <Box px="8" pb="5" pt="10" textAlign="center">
        <Image boxSize={'110px'} src={Logo} mx="auto" mb='3' />
        <Text mt="2" fontSize="smaller"  fontWeight="medium" color="white">
          CITY AGRI. SERVICES DEPT.
        </Text>
        <Text fontSize="larger"  fontWeight="bold" color="white">
          MACHINERIES
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
        <NavItem key={link.name} icon={link.icon} path={link.path}>
          {link.name}
        </NavItem>
      ))}
    </Box>
  )
}

const NavItem = ({ icon, children, path, ...rest }) => {

  const location = useLocation();
  const isActive = location.pathname === path;
  

  return (
    <Box 
      as={RouterLink} 
      to={path}
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
        {...rest}>
        {icon && (
          <Icon 
            mr="4" 
            fontSize="20" 
            color={isActive ? 'black' : 'white'}
            _groupHover={{ color: 'black' }} 
            as={icon} />
        )}
        {children}
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
      />
      {/* Removed the Logo text for mobile view */}
      <HStack spacing={{ base: '2', md: '4' }}>
        <Text fontSize="sm">{currentDateTime}</Text>
        <Divider orientation="vertical" height="20px" borderColor="gray.400" />
        <Flex alignItems="center">
          <Menu>
            <MenuButton py={2} transition="all 0.3s" _focus={{ boxShadow: 'none' }}>
              <HStack>
                <Avatar
                  size="sm"
                  src="https://images.unsplash.com/photo-1619946794135-5bc917a27793?ixlib=rb-0.3.5&q=80&fm=jpg&crop=faces&fit=crop&h=200&w=200&s=b616b2c5b373a80ffc9636ba24f7a4a9"
                />
                <VStack display={{ base: 'none', md: 'flex' }} alignItems="flex-start" spacing="1px" ml="2">
                  <Text fontSize="sm">Jerico Ryan Celestino</Text>
                  <Text fontSize="xs" color="gray.600">
                    Technician
                  </Text>
                </VStack>
                <Box display={{ base: 'none', md: 'flex' }}>
                  <FiChevronDown />
                </Box>
              </HStack>
            </MenuButton>
            <MenuList bg="white" borderColor="gray.200">
              <MenuItem>Profile Settings</MenuItem>
              <MenuDivider />
              <MenuItem>Sign out</MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </HStack>
    </Flex>
  )
}

const SidebarHeader = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()

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

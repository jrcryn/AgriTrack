import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  Flex,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Icon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
  IconButton,
  Tooltip
} from '@chakra-ui/react';
import { FiSearch, FiFilter, FiEdit2, FiLock, FiUnlock } from 'react-icons/fi';
import { FaArchive, FaPhone, FaUsers } from 'react-icons/fa';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data
  useEffect(() => {
    const mockUsers = [
      { 
        id: 1, 
        firstName: 'Juan', 
        lastName: 'Dela Cruz',
        middleName: 'Santos',
        email: 'juan.delacruz@agritrack.com',
        phone: '+63 912 345 6789',
        roles: ['HVC', 'DMS'],
        officePosition: 'CFS',
        accountType: 'EMPLOYEE',
        isLocked: false,
        isArchived: false,
        createdAt: '2024-01-15'
      },
      { 
        id: 2, 
        firstName: 'Maria', 
        lastName: 'Santos',
        middleName: 'Garcia',
        email: 'maria.santos@agritrack.com',
        phone: '+63 923 456 7890',
        roles: ['MACHINERIES'],
        officePosition: 'LPMS',
        accountType: 'EMPLOYEE',
        isLocked: false,
        isArchived: false,
        createdAt: '2024-02-20'
      },
      { 
        id: 3, 
        firstName: 'Admin', 
        lastName: 'User',
        middleName: '',
        email: 'admin@agritrack.com',
        phone: '+63 934 567 8901',
        roles: [],
        officePosition: null,
        accountType: 'SYSTEM_ADMIN',
        isLocked: false,
        isArchived: false,
        createdAt: '2023-12-01'
      },
      { 
        id: 4, 
        firstName: 'Pedro', 
        lastName: 'Reyes',
        middleName: 'Lopez',
        email: 'pedro.reyes@agritrack.com',
        phone: '+63 945 678 9012',
        roles: ['DOC_TRACK', 'HVC'],
        officePosition: 'ANMS',
        accountType: 'EMPLOYEE',
        isLocked: true,
        isArchived: false,
        createdAt: '2024-03-10'
      },
    ];
    setUsers(mockUsers);
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.roles.includes(filterRole);
    const matchesStatus = 
      filterStatus === 'all' ||
      (filterStatus === 'active' && !user.isLocked && !user.isArchived) ||
      (filterStatus === 'locked' && user.isLocked) ||
      (filterStatus === 'archived' && user.isArchived);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleEditUser = (user) => {
    console.log('Edit user:', user);
  };

  const handleLockToggle = (userId) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, isLocked: !user.isLocked } : user
    ));
  };

  const handleArchive = (userId) => {
    if (confirm('Are you sure you want to archive this user?')) {
      setUsers(users.map(user => 
        user.id === userId ? { ...user, isArchived: true } : user
      ));
    }
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      'HVC': 'green',
      'DMS': 'blue',
      'MACHINERIES': 'purple',
      'DOC_TRACK': 'orange'
    };
    return colors[role] || 'gray';
  };

  return (
    <Box p={6} minH="100vh">
      {/* Header */}
      <Box mb={6}>
        <Heading size="lg">User Management</Heading>
        <Text color="gray.600" fontSize="sm" mt={1}>Manage employee and system admin accounts</Text>
      </Box>

      {/* Filters */}
      <Box bg="white" border="1px" borderColor="gray.200" borderRadius="md" p={4} mb={4}>
        <Flex gap={4} direction={{ base: 'column', md: 'row' }}>
          {/* Search */}
          <InputGroup flex={1}>
            <InputLeftElement pointerEvents="none">
              <Icon as={FiSearch} color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>

          {/* Role Filter */}
          <Select 
            flex={1}
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            icon={<FiFilter />}
          >
            <option value="all">All Roles</option>
            <option value="HVC">HVC</option>
            <option value="DMS">DMS</option>
            <option value="MACHINERIES">Machineries</option>
            <option value="DOC_TRACK">Doc Track</option>
          </Select>

          {/* Status Filter */}
          <Select 
            flex={1}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            icon={<FiFilter />}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="locked">Locked</option>
            <option value="archived">Archived</option>
          </Select>
        </Flex>
      </Box>

      {/* Users Table */}
      <Box bg="white" border="1px" borderColor="gray.200" borderRadius="md" overflow="hidden">
        <TableContainer>
          <Table variant="simple" size="sm">
            <Thead bg="gray.50">
              <Tr>
                <Th fontSize="xs">Name</Th>
                <Th fontSize="xs">Contact</Th>
                <Th fontSize="xs">Roles</Th>
                <Th fontSize="xs">Position</Th>
                <Th fontSize="xs">Type</Th>
                <Th fontSize="xs">Status</Th>
                <Th fontSize="xs">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredUsers.map((user) => (
                <Tr key={user.id} _hover={{ bg: 'gray.50' }}>
                  <Td>
                    <Box>
                      <Text fontSize="sm" fontWeight="medium">
                        {user.firstName} {user.middleName && user.middleName[0] + '.'} {user.lastName}
                      </Text>
                      <Text fontSize="xs" color="gray.500">{user.email}</Text>
                    </Box>
                  </Td>
                  <Td>
                    <Text fontSize="xs">{user.phone}</Text>
                  </Td>
                  <Td>
                    <Flex flexWrap="wrap" gap={1}>
                      {user.roles.length > 0 ? (
                        user.roles.map((role) => (
                          <Badge
                            key={role}
                            colorScheme={getRoleBadgeColor(role)}
                            fontSize="xs"
                          >
                            {role}
                          </Badge>
                        ))
                      ) : (
                        <Text fontSize="xs" color="gray.400">-</Text>
                      )}
                    </Flex>
                  </Td>
                  <Td>
                    <Text fontSize="xs">{user.officePosition || '-'}</Text>
                  </Td>
                  <Td>
                    <Badge
                      colorScheme={user.accountType === 'SYSTEM_ADMIN' ? 'purple' : 'blue'}
                      fontSize="xs"
                    >
                      {user.accountType === 'SYSTEM_ADMIN' ? 'Admin' : 'Employee'}
                    </Badge>
                  </Td>
                  <Td>
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
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                      <Tooltip label="Edit">
                        <IconButton
                          size="sm"
                          icon={<FiEdit2 />}
                          colorScheme="blue"
                          variant="ghost"
                          onClick={() => handleEditUser(user)}
                        />
                      </Tooltip>
                      <Tooltip label={user.isLocked ? 'Unlock' : 'Lock'}>
                        <IconButton
                          size="sm"
                          icon={user.isLocked ? <FiUnlock /> : <FiLock />}
                          colorScheme={user.isLocked ? 'green' : 'orange'}
                          variant="ghost"
                          onClick={() => handleLockToggle(user.id)}
                          isDisabled={user.isArchived}
                        />
                      </Tooltip>
                      <Tooltip label="Archive">
                        <IconButton
                          size="sm"
                          icon={<FaArchive />}
                          colorScheme="red"
                          variant="ghost"
                          onClick={() => handleArchive(user.id)}
                          isDisabled={user.isArchived}
                        />
                      </Tooltip>
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>

        {filteredUsers.length === 0 && (
          <Flex direction="column" align="center" justify="center" py={12} color="gray.500">
            <Icon as={FaUsers} boxSize={12} mb={4} color="gray.400" />
            <Text>No users found</Text>
          </Flex>
        )}
      </Box>
    </Box>
  );
};

export default UserManagement;

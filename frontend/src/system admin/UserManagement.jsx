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
  Tooltip,
  Spinner,
  useToast
} from '@chakra-ui/react';
import { FiSearch, FiFilter, FiEdit2, FiLock, FiUnlock } from 'react-icons/fi';
import { FaArchive, FaPhone, FaUsers } from 'react-icons/fa';
import { useSystemAdminStore } from './store/systemAdminDashboard.store';

const UserManagement = () => {
  const {
    employeeAccounts,
    employeeAccountsLoading,
    employeeAccountsError,
    employeeAccountsPagination,
    fetchEmployeeAccounts,
    allUsers,
    fetchAllUsers,
    lockUserAccount,
    archiveUserAccount
  } = useSystemAdminStore();

  const toast = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch employee accounts
  useEffect(() => {
    fetchEmployeeAccounts({
      page: currentPage,
      limit: 50,
      search: searchTerm,
      role: filterRole,
      status: filterStatus
    });
  }, [currentPage, searchTerm, filterRole, filterStatus, fetchEmployeeAccounts]);

  // Also fetch all users (for system admins if needed)
  useEffect(() => {
    fetchAllUsers();
  }, [fetchAllUsers]);

  const handleEditUser = (user) => {
    console.log('Edit user:', user);
    // TODO: Implement edit user functionality
  };

  const handleLockToggle = async (userId, accountType, currentLockStatus) => {
    if (currentLockStatus) {
      // Unlock - this would need a separate endpoint
      toast({
        title: 'Info',
        description: 'Unlock functionality not yet implemented',
        status: 'info',
        duration: 3000,
        isClosable: true
      });
      return;
    }

    try {
      await lockUserAccount(userId, accountType);
      toast({
        title: 'Success',
        description: 'User account locked successfully',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
      // Refresh the list
      fetchEmployeeAccounts({
        page: currentPage,
        limit: 50,
        search: searchTerm,
        role: filterRole,
        status: filterStatus
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to lock user account',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    }
  };

  const handleArchive = async (userId, accountType) => {
    if (!window.confirm('Are you sure you want to archive this user?')) {
      return;
    }

    try {
      await archiveUserAccount(userId, accountType);
      toast({
        title: 'Success',
        description: 'User account archived successfully',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
      // Refresh the list
      fetchEmployeeAccounts({
        page: currentPage,
        limit: 50,
        search: searchTerm,
        role: filterRole,
        status: filterStatus
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to archive user account',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
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
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </InputGroup>

          {/* Role Filter */}
          <Select 
            flex={1}
            value={filterRole}
            onChange={(e) => {
              setFilterRole(e.target.value);
              setCurrentPage(1);
            }}
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
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
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
              {employeeAccountsLoading ? (
                <Tr>
                  <Td colSpan={7} textAlign="center" py={8}>
                    <Spinner size="md" color="blue.500" />
                    <Text fontSize="xs" color="gray.500" mt={2}>Loading users...</Text>
                  </Td>
                </Tr>
              ) : employeeAccountsError ? (
                <Tr>
                  <Td colSpan={7} textAlign="center" py={8}>
                    <Text fontSize="xs" color="red.500">{employeeAccountsError}</Text>
                  </Td>
                </Tr>
              ) : employeeAccounts.length === 0 ? (
                <Tr>
                  <Td colSpan={7} textAlign="center" py={8}>
                    <Icon as={FaUsers} boxSize={12} mb={4} color="gray.400" />
                    <Text fontSize="sm" color="gray.500">No users found</Text>
                  </Td>
                </Tr>
              ) : (
                employeeAccounts.map((user) => (
                  <Tr key={user._id} _hover={{ bg: 'gray.50' }}>
                    <Td>
                      <Box>
                        <Text fontSize="sm" fontWeight="medium">
                          {user.first_name} {user.middle_name && user.middle_name[0] + '.'} {user.last_name} {user.suffix || ''}
                        </Text>
                        <Text fontSize="xs" color="gray.500">{user.email}</Text>
                      </Box>
                    </Td>
                    <Td>
                      <Text fontSize="xs">{user.phone}</Text>
                    </Td>
                    <Td>
                      <Flex flexWrap="wrap" gap={1}>
                        {user.roles && user.roles.length > 0 ? (
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
                      <Text fontSize="xs">{user.office_position || '-'}</Text>
                    </Td>
                    <Td>
                      <Badge
                        colorScheme="blue"
                        fontSize="xs"
                      >
                        Employee
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
                            onClick={() => handleLockToggle(user._id, 'EMPLOYEE', user.isLocked)}
                            isDisabled={user.isArchived}
                          />
                        </Tooltip>
                        <Tooltip label="Archive">
                          <IconButton
                            size="sm"
                            icon={<FaArchive />}
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => handleArchive(user._id, 'EMPLOYEE')}
                            isDisabled={user.isArchived}
                          />
                        </Tooltip>
                      </HStack>
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </TableContainer>

      </Box>

      {/* Pagination */}
      {employeeAccountsPagination.totalPages > 1 && (
        <Flex
          justify="space-between"
          align="center"
          bg="white"
          border="1px"
          borderColor="gray.200"
          borderRadius="md"
          p={3}
          mt={4}
        >
          <Text fontSize="xs" color="gray.600">
            Page {employeeAccountsPagination.currentPage} of {employeeAccountsPagination.totalPages} 
            ({employeeAccountsPagination.totalEmployees} total)
          </Text>
          <HStack spacing={2}>
            <Button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              isDisabled={currentPage === 1 || employeeAccountsLoading}
              size="sm"
              variant="outline"
            >
              Previous
            </Button>
            <Button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, employeeAccountsPagination.totalPages))}
              isDisabled={currentPage === employeeAccountsPagination.totalPages || employeeAccountsLoading}
              size="sm"
              variant="outline"
            >
              Next
            </Button>
          </HStack>
        </Flex>
      )}
    </Box>
  );
};

export default UserManagement;

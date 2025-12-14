import { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  Select,
  Flex,
  Grid,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Icon,
  HStack,
  Spinner
} from '@chakra-ui/react';
import { FiFilter, FiDownload, FiCheckCircle, FiXCircle, FiAlertTriangle, FiInfo } from 'react-icons/fi';
import { useSystemAdminStore } from './store/systemAdminDashboard.store';

const ActionLogs = () => {
  const {
    actionLogs,
    actionLogsLoading,
    actionLogsError,
    actionLogsPagination,
    fetchActionLogs,
    allUsers,
    allUsersLoading,
    fetchAllUsers
  } = useSystemAdminStore();

  const [filterUser, setFilterUser] = useState('all');
  const [filterAction, setFilterAction] = useState('all');
  const [filterModule, setFilterModule] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 20;

  // Fetch users for dropdown
  useEffect(() => {
    fetchAllUsers();
  }, [fetchAllUsers]);

  // Fetch logs when filters or page change
  useEffect(() => {
    fetchActionLogs({
      page: currentPage,
      limit: logsPerPage,
      action: filterAction !== 'all' ? filterAction : '',
      module: filterModule !== 'all' ? filterModule : '',
      status: filterStatus !== 'all' ? filterStatus : '',
      userId: filterUser !== 'all' ? filterUser : ''
    });
  }, [currentPage, filterAction, filterModule, filterStatus, filterUser, fetchActionLogs]);

  const actionTypes = ['USER_REGISTER', 'USER_PASSWORD_CHANGED', 'USER_EMAIL_UPDATED', 'USER_ROLES_UPDATED', 'USER_ARCHIVED', 'USER_2FA_RESET', 'SYSTEM_ADMIN_REGISTER'];
  const modules = ['SYSTEM ADMIN', 'HVC', 'DMS', 'MACHINERIES', 'DOC_TRACK'];

  const currentLogs = actionLogs || [];
  const totalPages = actionLogsPagination.totalPages || 1;
  const totalLogs = actionLogsPagination.totalLogs || 0;
  const indexOfFirstLog = (currentPage - 1) * logsPerPage + 1;
  const indexOfLastLog = Math.min(currentPage * logsPerPage, totalLogs);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'SUCCESS':
        return FiCheckCircle;
      case 'FAILED':
        return FiXCircle;
      case 'WARNING':
        return FiAlertTriangle;
      default:
        return FiInfo;
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      SUCCESS: 'green.400',
      FAILED: 'red.400',
      WARNING: 'orange.400',
      INFO: 'blue.400'
    };
    return colors[status] || 'blue.400';
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUserName = (log) => {
    if (!log.userId) return 'Unknown User';
    const user = log.userId;
    const name = `${user.first_name || ''} ${user.middle_name || ''} ${user.last_name || ''} ${user.suffix || ''}`.trim();
    return name || user.email || 'Unknown User';
  };

  const handleExport = () => {
    // Mock export functionality
    alert('Exporting logs to CSV...');
  };

  return (
    <Box p={6} minH="100vh">
      {/* Header */}
      <Flex mb={6} justify="space-between" align="center">
        <Box>
          <Heading size="lg">Action Logs</Heading>
          <Text color="gray.600" fontSize="sm" mt={1}>Monitor and track all system activities</Text>
        </Box>
        <Button
          onClick={handleExport}
          size="sm"
          leftIcon={<Icon as={FiDownload} />}
        >
          Export
        </Button>
      </Flex>

      {/* Filters */}
      <Box bg="white" border="1px" borderColor="gray.200" borderRadius="md" p={4} mb={4}>
        <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap={4}>
          {/* User Filter */}
          <Select
            value={filterUser}
            onChange={(e) => {
              setFilterUser(e.target.value);
              setCurrentPage(1);
            }}
            icon={<FiFilter />}
            isDisabled={allUsersLoading}
          >
            <option value="all">All Users</option>
            {allUsersLoading ? (
              <option disabled>Loading users...</option>
            ) : (
              allUsers.map(user => (
                <option key={user._id} value={user._id}>
                  {user.displayName} ({user.accountType === 'SYSTEM_ADMIN' ? 'Admin' : 'Employee'})
                </option>
              ))
            )}
          </Select>

          {/* Action Filter */}
          <Select
            value={filterAction}
            onChange={(e) => {
              setFilterAction(e.target.value);
              setCurrentPage(1);
            }}
            icon={<FiFilter />}
          >
            <option value="all">All Actions</option>
            {actionTypes.map(action => (
              <option key={action} value={action}>{action}</option>
            ))}
          </Select>

          {/* Module Filter */}
          <Select
            value={filterModule}
            onChange={(e) => {
              setFilterModule(e.target.value);
              setCurrentPage(1);
            }}
            icon={<FiFilter />}
          >
            <option value="all">All Modules</option>
            {modules.map(module => (
              <option key={module} value={module}>{module}</option>
            ))}
          </Select>

          {/* Status Filter */}
          <Select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
            icon={<FiFilter />}
          >
            <option value="all">All Status</option>
            <option value="SUCCESS">Success</option>
            <option value="FAILED">Failed</option>
          </Select>
        </Grid>
      </Box>

      {/* Logs Table - Terminal Style */}
      <Box bg="black" borderRadius="md" overflow="hidden" mb={4} p={4}>
        <TableContainer>
          <Table 
          variant="unstyled" 
          size="xs" 
          sx={{
                'th, td': {
                borderBottom: 'none',
                },
            }}
          >
            <Thead>
              <Tr>
                <Th fontSize="2xs" color="gray.400" borderBottom="1px" borderColor="gray.700" textTransform="uppercase">Timestamp</Th>
                <Th fontSize="2xs" color="gray.400" borderBottom="1px" borderColor="gray.700" textTransform="uppercase">Status</Th>
                <Th fontSize="2xs" color="gray.400" borderBottom="1px" borderColor="gray.700" textTransform="uppercase">Module</Th>
                <Th fontSize="2xs" color="gray.400" borderBottom="1px" borderColor="gray.700" textTransform="uppercase">Description</Th>
                <Th fontSize="2xs" color="gray.400" borderBottom="1px" borderColor="gray.700" textTransform="uppercase">User</Th>
              </Tr>
            </Thead>
            <Tbody>
              {actionLogsLoading ? (
                <Tr>
                  <Td colSpan={5} textAlign="center" py={8}>
                    <Spinner size="md" color="cyan.400" />
                    <Text fontSize="xs" color="gray.400" mt={2} fontFamily="mono">Loading logs...</Text>
                  </Td>
                </Tr>
              ) : actionLogsError ? (
                <Tr>
                  <Td colSpan={5} textAlign="center" py={8}>
                    <Text fontSize="xs" color="red.400" fontFamily="mono">{actionLogsError}</Text>
                  </Td>
                </Tr>
              ) : currentLogs.length === 0 ? (
                <Tr>
                  <Td colSpan={5} textAlign="center" py={8}>
                    <Text fontSize="xs" color="gray.500" fontFamily="mono">No logs found</Text>
                  </Td>
                </Tr>
              ) : (
                currentLogs.map((log) => (
                  <Tr key={log._id} _hover={{ bg: 'gray.900' }}>
                    <Td borderBottom="1px" borderColor="gray.800" py={2}>
                      <Text fontSize="2xs" color="gray.300" fontFamily="mono">
                        {formatDate(log.createdAt)}
                      </Text>
                    </Td>
                    <Td borderBottom="1px" borderColor="gray.800" py={2}>
                      <HStack spacing={1}>
                        <Icon 
                          as={getStatusIcon(log.status)} 
                          color={getStatusColor(log.status)}
                          boxSize={3}
                        />
                        <Text 
                          fontSize="2xs" 
                          color={getStatusColor(log.status)}
                          fontWeight="bold"
                          fontFamily="mono"
                        >
                          {log.status}
                        </Text>
                      </HStack>
                    </Td>
                    <Td borderBottom="1px" borderColor="gray.800" py={2}>
                      <Text fontSize="2xs" color="cyan.400" fontFamily="mono">
                        {log.module}
                      </Text>
                    </Td>
                    <Td borderBottom="1px" borderColor="gray.800" py={2}>
                      <Text fontSize="2xs" color="gray.300" fontFamily="mono">
                        [{log.action.replace(/_/g, ' ')}] {log.description}
                      </Text>
                    </Td>
                    <Td borderBottom="1px" borderColor="gray.800" py={2}>
                      <Box>
                        <Text fontSize="2xs" color="yellow.400" fontFamily="mono">
                          {getUserName(log)}
                        </Text>
                        <Text fontSize="2xs" color="gray.500" fontFamily="mono">
                          {log.ip}
                        </Text>
                      </Box>
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </TableContainer>

      </Box>

      {/* Pagination */}
      {totalLogs > 0 && (
        <Flex
          justify="space-between"
          align="center"
          bg="white"
          border="1px"
          borderColor="gray.200"
          borderRadius="md"
          p={3}
        >
          <Text fontSize="xs" color="gray.600">
            {indexOfFirstLog}-{indexOfLastLog} of {totalLogs}
          </Text>
          <HStack spacing={2}>
            <Button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              isDisabled={currentPage === 1 || actionLogsLoading}
              size="sm"
              variant="outline"
            >
              Previous
            </Button>
            <Text fontSize="xs" px={2}>
              {currentPage}/{totalPages}
            </Text>
            <Button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              isDisabled={currentPage === totalPages || actionLogsLoading}
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

export default ActionLogs;

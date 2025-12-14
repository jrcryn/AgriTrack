import { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
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
  Badge,
  Icon,
  HStack
} from '@chakra-ui/react';
import { FiSearch, FiFilter, FiDownload, FiCalendar, FiCheckCircle, FiXCircle, FiAlertTriangle, FiInfo } from 'react-icons/fi';

const ActionLogs = () => {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterModule, setFilterModule] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 20;

  // Mock data
  useEffect(() => {
    const mockLogs = [
      {
        id: 1,
        action: 'USER_REGISTER',
        module: 'SYSTEM ADMIN',
        description: 'User registered: juan.delacruz@agritrack.com',
        status: 'SUCCESS',
        userId: 'admin123',
        userName: 'Admin User',
        timestamp: '2024-12-15T10:30:00',
        ipAddress: '192.168.1.100'
      },
      {
        id: 2,
        action: 'USER_PASSWORD_CHANGED',
        module: 'SYSTEM ADMIN',
        description: 'Password changed for user 67890',
        status: 'SUCCESS',
        userId: 'admin123',
        userName: 'Admin User',
        timestamp: '2024-12-15T09:45:00',
        ipAddress: '192.168.1.100'
      },
      {
        id: 3,
        action: 'USER_EMAIL_UPDATED',
        module: 'SYSTEM ADMIN',
        description: 'Email update error: User not found',
        status: 'FAILED',
        userId: 'admin456',
        userName: 'Maria Santos',
        timestamp: '2024-12-15T09:15:00',
        ipAddress: '192.168.1.105'
      },
      {
        id: 4,
        action: 'USER_ROLES_UPDATED',
        module: 'SYSTEM ADMIN',
        description: 'Roles updated for user 12345: HVC -> HVC, DMS',
        status: 'SUCCESS',
        userId: 'admin123',
        userName: 'Admin User',
        timestamp: '2024-12-15T08:30:00',
        ipAddress: '192.168.1.100'
      },
      {
        id: 5,
        action: 'USER_ARCHIVED',
        module: 'SYSTEM ADMIN',
        description: 'User archived: 54321',
        status: 'SUCCESS',
        userId: 'admin789',
        userName: 'Pedro Reyes',
        timestamp: '2024-12-14T16:20:00',
        ipAddress: '192.168.1.110'
      },
      {
        id: 6,
        action: 'USER_2FA_RESET',
        module: 'SYSTEM ADMIN',
        description: '2FA reset for user 98765',
        status: 'SUCCESS',
        userId: 'admin123',
        userName: 'Admin User',
        timestamp: '2024-12-14T15:10:00',
        ipAddress: '192.168.1.100'
      },
      {
        id: 7,
        action: 'SYSTEM_ADMIN_REGISTER',
        module: 'SYSTEM ADMIN',
        description: 'System admin registered: newadmin@agritrack.com',
        status: 'SUCCESS',
        userId: 'admin123',
        userName: 'Admin User',
        timestamp: '2024-12-14T14:00:00',
        ipAddress: '192.168.1.100'
      },
      {
        id: 8,
        action: 'USER_PHONE_UPDATED',
        module: 'SYSTEM ADMIN',
        description: 'Phone updated for user 11111: +63 912 345 6789 -> +63 923 456 7890',
        status: 'SUCCESS',
        userId: 'admin456',
        userName: 'Maria Santos',
        timestamp: '2024-12-14T13:30:00',
        ipAddress: '192.168.1.105'
      },
    ];
    setLogs(mockLogs);
  }, []);

  const actionTypes = ['USER_REGISTER', 'USER_PASSWORD_CHANGED', 'USER_EMAIL_UPDATED', 'USER_ROLES_UPDATED', 'USER_ARCHIVED', 'USER_2FA_RESET', 'SYSTEM_ADMIN_REGISTER'];
  const modules = ['SYSTEM ADMIN', 'HVC', 'DMS', 'MACHINERIES', 'DOC_TRACK'];

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = filterAction === 'all' || log.action === filterAction;
    const matchesModule = filterModule === 'all' || log.module === filterModule;
    const matchesStatus = filterStatus === 'all' || log.status === filterStatus;

    return matchesSearch && matchesAction && matchesModule && matchesStatus;
  });

  // Pagination
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

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
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
          {/* Search */}
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <Icon as={FiSearch} color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>

          {/* Action Filter */}
          <Select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
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
            onChange={(e) => setFilterModule(e.target.value)}
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
            onChange={(e) => setFilterStatus(e.target.value)}
            icon={<FiFilter />}
          >
            <option value="all">All Status</option>
            <option value="SUCCESS">Success</option>
            <option value="FAILED">Failed</option>
            <option value="WARNING">Warning</option>
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
              {currentLogs.map((log) => (
                <Tr key={log.id} _hover={{ bg: 'gray.900' }}>
                  <Td borderBottom="1px" borderColor="gray.800" py={2}>
                    <Text fontSize="2xs" color="gray.300" fontFamily="mono">
                      {formatDate(log.timestamp)}
                    </Text>
                  </Td>
                  <Td borderBottom="1px" borderColor="gray.800" py={2}>
                    <Text 
                      fontSize="2xs" 
                      color={getStatusColor(log.status)}
                      fontWeight="bold"
                      fontFamily="mono"
                    >
                      {log.status}
                    </Text>
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
                        {log.userName}
                      </Text>
                      <Text fontSize="2xs" color="gray.500" fontFamily="mono">
                        {log.ipAddress}
                      </Text>
                    </Box>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>

        {currentLogs.length === 0 && (
          <Flex direction="column" align="center" justify="center" py={12}>
            <Text color="gray.500" fontSize="sm" fontFamily="mono">No logs found</Text>
          </Flex>
        )}
      </Box>

      {/* Pagination */}
      {totalPages > 1 && (
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
            {indexOfFirstLog + 1}-{Math.min(indexOfLastLog, filteredLogs.length)} of {filteredLogs.length}
          </Text>
          <HStack spacing={2}>
            <Button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              isDisabled={currentPage === 1}
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
              isDisabled={currentPage === totalPages}
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

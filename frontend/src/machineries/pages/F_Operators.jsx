import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Flex,
  InputGroup,
  Input,
  InputRightElement,
  Button,
  Icon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  FormControl,
  FormLabel,
  Center,
  Spinner,
  TableContainer,
  Alert,
  AlertIcon,
  Tag,
  Tooltip,
  HStack,
  useToast,
} from '@chakra-ui/react';
import { FiSearch, FiInbox } from 'react-icons/fi';
import { FaUserCog, FaUserSlash, FaUserCheck, FaInfo } from 'react-icons/fa';
import { useAdminDashboard } from '../store/adminDashboard.store';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../auth/store/authStore';

const Operators = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [operatorAccountsPage, setOperatorAccountsPage] = useState(1);
  const toast = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const {
    operatorAccounts,
    isLoadingOperatorAccounts,
    operatorAccountsError,

    enableOperatorAccount,
    disableOperatorAccount,
    isEnablingDisablingOperatorAccount,
  } = useAdminDashboard(
    { operatorAccountsPage },
    { searchQuery }
  );

  // Reset to page 1 when search query changes
  useEffect(() => {
    setOperatorAccountsPage(1);
  }, [searchQuery]);

  const operatorAccountsList = operatorAccounts?.data?.operators || [];
  const operatorAccountsTotalPages = operatorAccounts?.data?.totalPages || 1;
  const operatorAccountsCurrentPage = operatorAccounts?.data?.currentPage || 1;
  const operatorAccountsTotalItems = operatorAccounts?.data?.totalCount || 0;

  const PaginationControls = ({ currentPage, setCurrentPage, totalPages, totalItems, colorScheme }) => (
    <Flex
      justifyContent="space-between"
      mt={4}
      alignItems="center"
      direction={{ base: "column", md: "row" }}
      gap={{ base: 3, md: 0 }}
      width={"100%"}
    >
      <Text color="gray.600" fontSize="md">
        Page {currentPage} of {totalPages || 1} ({totalItems} total)
      </Text>
      <Flex>
        <Button
          size="sm"
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          isDisabled={currentPage === 1}
          colorScheme={colorScheme}
          variant="outline"
          mr={2}
        >
          Previous
        </Button>
        <Button
          size="sm"
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          isDisabled={currentPage >= totalPages}
          colorScheme={colorScheme}
          variant="outline"
        >
          Next
        </Button>
      </Flex>
    </Flex>
  );

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (isActive) => {
    return isActive ? 'green' : 'red';
  };

  const getStatusText = (isActive) => {
    return isActive ? 'Active' : 'Disabled';
  };

  const handleEnableOperator = async (operatorId) => {
    try {
      await enableOperatorAccount( {operatorId: operatorId, employeeId: user.id} );
      
      toast({
        title: "Success",
        description: "Operator account has been enabled",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Refetch operator accounts
      await queryClient.invalidateQueries({ queryKey: ['operatorAccounts'] });
    } catch (error) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || error?.message || "Failed to enable operator account",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDisableOperator = async (operatorId) => {
    try {
      await disableOperatorAccount( {operatorId: operatorId, employeeId: user.id} );
      
      toast({
        title: "Success",
        description: "Operator account has been disabled",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Refetch operator accounts
      await queryClient.invalidateQueries({ queryKey: ['operatorAccounts'] });
    } catch (error) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || error?.message || "Failed to disable operator account",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box overflow="hidden" bg="white" p={5} minH="100vh">
      <Heading as="h1" size="xl" mb={2}>
        Operator Accounts
      </Heading>
      <Text color="gray.600" mb={5}>
        Manage operator accounts and their access to complete tickets.
      </Text>

      {/* Filter Section */}
      <Flex direction="column" mb={6} gap={4} p={4} bg="teal.50" borderRadius="md" boxShadow="sm">
        <Flex direction={{ base: "column", md: "row" }} gap={4} alignItems={{ base: "stretch", md: "flex-end" }}>
          {/* Search */}
          <FormControl flex="1">
            <FormLabel fontSize="sm" fontWeight="medium" display="flex" alignItems="center" gap={2}>
              <Icon as={FiSearch} color="teal.500" /> Search
            </FormLabel>
            <InputGroup>
              <Input
                placeholder="Search by name, username, or ID..."
                value={searchQuery}
                type="text"
                onChange={(e) => setSearchQuery(e.target.value)}
                bg="white"
                _focus={{ borderColor: "teal.400" }}
              />
              <InputRightElement>
                <Icon as={FiSearch} boxSize={5} />
              </InputRightElement>
            </InputGroup>
          </FormControl>
        </Flex>
      </Flex>

      {/* Operator Accounts Section */}
      <Box mb={8}>
        <Flex 
          justify="space-between" 
          align="center" 
          mb={4} 
          bg={'teal.50'} 
          p={3} 
          borderRadius="md" 
          borderLeftWidth="4px" 
          borderLeftColor={'teal.500'}
        >
          <Heading as="h2" size="md" display="flex" alignItems="center">
            <Icon as={FaUserCog} mr={2} color={'teal.500'} /> OPERATOR ACCOUNTS
          </Heading>
        </Flex>

        {/* Error Alert */}
        {operatorAccountsError && (
          <Alert status="error" mb={4} borderRadius="md">
            <AlertIcon />
            <Box>
              <Text fontWeight="medium">Error loading operator accounts</Text>
              <Text fontSize="sm">
                {operatorAccountsError?.response?.data?.message ||
                  operatorAccountsError?.message ||
                  "An error occurred while fetching operator accounts."}
              </Text>
            </Box>
          </Alert>
        )}

        {isLoadingOperatorAccounts ? (
          <Center p={10}>
            <Spinner size="lg" color={'teal.500'} />
          </Center>
        ) : operatorAccountsList.length > 0 ? (
          <Box overflowX="auto">
            <TableContainer>
              <Table variant="simple" size="md">
                <Thead bg="gray.50">
                  <Tr>
                    <Th>Name</Th>
                    <Th>Email</Th>
                    <Th>Phone</Th>
                    <Th>Status</Th>
                    <Th>Last Login</Th>
                    <Th>Date Created</Th>
                    <Th
                      position={{ base: 'static', md: 'sticky' }}
                      right={0}
                      bg="gray.50"
                      zIndex={{ base: 0, md: 1 }}
                      textAlign="center"
                      width="150px"
                    >
                      <Box display={{ base: 'none', md: 'block' }}>Scroll →</Box>
                      <Box display={{ base: 'block', md: 'none' }}>Actions</Box>
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {operatorAccountsList.map((operator) => {
                    const fullName = `${operator.first_name || ''} ${operator.middle_name || ''} ${operator.last_name || ''}`.trim();
                    return (
                      <Tr key={operator._id} fontSize="sm">
                        <Td fontWeight={'semibold'}>{fullName || '—'}</Td>
                        <Td>{operator.email || '—'}</Td>
                        <Td>{operator.phone || '—'}</Td>
                        <Td>
                          <Tag
                            colorScheme={getStatusColor(operator.isOperatorDisabled === false)}
                            size="sm"
                          >
                            {getStatusText(operator.isOperatorDisabled === false)}
                          </Tag>
                        </Td>
                        <Td>{formatDate(operator.lastLogin)}</Td>
                        <Td>{formatDate(operator.createdAt)}</Td>
                        <Td
                          isNumeric
                          position={{ base: 'static', md: 'sticky' }}
                          right={0}
                          zIndex={1}
                          bg="white"
                        >
                          <HStack spacing={2} justify="flex-end">
                            {operator.isOperatorDisabled === false ? (
                              <Tooltip label="Disable this operator account" placement="top" hasArrow>
                                <Button
                                  size="xs"
                                  colorScheme='red'
                                  leftIcon={<FaUserSlash />}
                                  onClick={() => handleDisableOperator(operator._id)}
                                  isLoading={isEnablingDisablingOperatorAccount}
                                  isDisabled={isEnablingDisablingOperatorAccount}
                                >
                                  Disable
                                </Button>
                              </Tooltip>
                            ) : (
                              <Tooltip label="Enable this operator account" placement="top" hasArrow>
                                <Button
                                  size="xs"
                                  colorScheme='green'
                                  leftIcon={<FaUserCheck />}
                                  onClick={() => handleEnableOperator(operator._id)}
                                  isLoading={isEnablingDisablingOperatorAccount}
                                  isDisabled={isEnablingDisablingOperatorAccount}
                                >
                                  Enable
                                </Button>
                              </Tooltip>
                            )}
                          </HStack>
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </TableContainer>
          </Box>
        ) : (
          <Center
            p={10}
            borderWidth="1px"
            borderRadius="md"
            borderStyle="dashed"
            borderColor="gray.300"
            flexDirection="column"
            gap={3}
          >
            <Icon as={FiInbox} boxSize={10} color="gray.400" />
            <Text color="gray.500" fontWeight="medium">
              No operator accounts found
            </Text>
            <Text fontSize="sm" color="gray.400">
              Try adjusting your search or check back later.
            </Text>
          </Center>
        )}

        <Flex justifyContent="space-between" alignItems="center" mt={4}>
          <PaginationControls
            currentPage={operatorAccountsCurrentPage}
            setCurrentPage={setOperatorAccountsPage}
            totalPages={operatorAccountsTotalPages}
            totalItems={operatorAccountsTotalItems}
            colorScheme='teal'
          />
        </Flex>
      </Box>
    </Box>
  );
};

export default Operators;
import React, { useMemo, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  Flex,
  Icon,
  FormControl,
  FormLabel,
  InputGroup,
  Input,
  InputRightElement,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
  Center,
  Spinner,
  Button,
  useDisclosure, // added
} from '@chakra-ui/react';
import { FiSearch, FiUsers } from 'react-icons/fi';
import { HiDocumentText } from 'react-icons/hi'; // added
import { useAdminDashboard } from '../store/adminDashboard.store';
import DocumentLifeCycleModal from '../../components/docLifeCyclePanel.jsx'; // added

const G_Staffs = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const {
    usersDocumentWorkload,
    isLoadingUsersDocumentWorkload,
    documentStatus,            // added
    isGettingDocumentStatus,   // added
  } = useAdminDashboard();

  const results = usersDocumentWorkload?.data || [];

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return results;
    return results.filter(r => {
      const name = `${r.first_name || ''} ${r.last_name || ''}`.toLowerCase();
      const pos = (r.office_position || r.role || '').toString().toLowerCase();
      return name.includes(q) || pos.includes(q);
    });
  }, [results, searchQuery]);

  // added: modal + selection state
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [loadingDocRef, setLoadingDocRef] = useState(null);

  const handleOpenManage = async (doc) => {
    try {
      setLoadingDocRef(doc.refNumber);
      const res = await documentStatus({ refNumber: doc.refNumber });
      setSelectedDoc(res.data);
      onOpen();
    } catch (e) {
      // optionally handle error/toast
    } finally {
      setLoadingDocRef(null);
    }
  };

  return (
    <Box overflow="hidden" bg="white" p={5} minH="100vh">
      <Heading as="h1" size="xl" mb={2}>
        Employees
      </Heading>
      <Text color="gray.600" mb={5}>
        View users, their active workload and reroute pending or incoming documents.
      </Text>

      {/* Filter Section */}
      <Flex direction="column" mb={6} gap={4} p={4} bg="blue.50" borderRadius="md" boxShadow="sm">
        <Flex direction={{ base: 'column', md: 'row' }} gap={4} alignItems={{ base: 'stretch', md: 'flex-end' }}>
          <FormControl flex="1">
            <FormLabel fontSize="sm" fontWeight="medium" display="flex" alignItems="center" gap={2}>
              <Icon as={FiSearch} color="blue.500" /> Search Staff
            </FormLabel>
            <InputGroup>
              <Input
                placeholder="Search by name or position..."
                value={searchQuery}
                type="text"
                onChange={(e) => setSearchQuery(e.target.value)}
                bg="white"
                _focus={{ borderColor: 'blue.400' }}
              />
              <InputRightElement>
                <Icon as={FiSearch} boxSize={5} />
              </InputRightElement>
            </InputGroup>
          </FormControl>
        </Flex>
      </Flex>

      {/* Staffs Table */}
      <Box mb={8}>
        <Flex justify="space-between" align="center" mb={4} bg="purple.50" p={3} borderRadius="md" borderLeftWidth="4px" borderLeftColor="purple.500">
          <Heading as="h2" size="md" display="flex" alignItems="center">
            <Icon as={FiUsers} mr={2} color="purple.600" /> STAFFS AND WORKLOAD
          </Heading>
        </Flex>

        {isLoadingUsersDocumentWorkload ? (
          <Center p={10}>
            <Spinner size="lg" color="purple.500" />
          </Center>
        ) : filtered.length > 0 ? (
          <Box overflowX="auto">
            <TableContainer>
              <Table variant="simple" size="md">
                <Thead bg="gray.50">
                  <Tr>
                    <Th>Staff</Th>
                    <Th>Position/Role</Th>
                    <Th isNumeric>Incoming</Th>
                    <Th isNumeric>Pending</Th>
                    <Th isNumeric>Total Active</Th>
                    <Th>Recent Docs</Th> {/* changed: replace Actions with Recent Docs */}
                  </Tr>
                </Thead>
                <Tbody>
                  {filtered.map((row) => {
                    const incomingDocs = row.incoming?.documents || [];
                    const pendingDocs = row.pending?.documents || [];
                    const recentDocs = [...incomingDocs, ...pendingDocs].slice(0, 5);
                    return (
                      <Tr key={row.userId} fontSize="sm">
                        <Td fontWeight="semibold">
                          {row.first_name} {row.middle_name} {row.last_name}
                        </Td>
                        <Td>{row.office_position || (row.role ? row.role[0].toUpperCase() + row.role.slice(1) : '—')}</Td>
                        <Td isNumeric>
                          <Badge colorScheme="green">{row.incoming?.count ?? 0}</Badge>
                        </Td>
                        <Td isNumeric>
                          <Badge colorScheme="yellow">{row.pending?.count ?? 0}</Badge>
                        </Td>
                        <Td isNumeric>
                          <Badge colorScheme="purple">{row.totalActive ?? ((row.incoming?.count || 0) + (row.pending?.count || 0))}</Badge>
                        </Td>
                        <Td>
                          {recentDocs.length === 0 ? (
                            <Text color="gray.500">No recent documents</Text>
                          ) : (
                            <Flex direction="column" gap={2}>
                              {recentDocs.map((doc) => (
                                <Flex key={doc._id} align="center" justify="space-between" gap={2}>
                                  <Flex direction="column">
                                    <Text fontWeight="medium">{doc.refNumber}</Text>
                                    <Text fontSize="xs" color="gray.600">{doc.documentName}</Text>
                                  </Flex>
                                  <Button
                                    size="xs"
                                    colorScheme="purple"
                                    leftIcon={<HiDocumentText />}
                                    onClick={() => handleOpenManage(doc)}
                                    isLoading={loadingDocRef === doc.refNumber && isGettingDocumentStatus}
                                  >
                                    Manage
                                  </Button>
                                </Flex>
                              ))}
                            </Flex>
                          )}
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
            <Icon as={FiUsers} boxSize={10} color="gray.400" />
            <Text color="gray.500" fontWeight="medium">
              No staffs found
            </Text>
            <Text fontSize="sm" color="gray.400">
              Try adjusting your search.
            </Text>
          </Center>
        )}
      </Box>

      {/* Lifecycle + Reroute Modal */}
      <DocumentLifeCycleModal
        isOpen={isOpen}
        onClose={onClose}
        document={selectedDoc}
        isPendingPage={false}
        isOutgoingPage={false}
        isProduceDocumentPage={false}
        isReleased={false}
        isArchived={false}
        isDocumentLogsPage={false}
        isStaffsPage={true} // enable reroute tab
      />
    </Box>
  );
};

export default G_Staffs;
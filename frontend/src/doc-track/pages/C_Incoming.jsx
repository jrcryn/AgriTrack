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
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  FormControl,
  FormLabel,
  Center,
  Spinner,
  TableContainer,
  useToast
} from '@chakra-ui/react';
import { FiSearch, FiInbox } from 'react-icons/fi';
import { RiFolderReceivedFill } from "react-icons/ri";

import { FaQrcode } from 'react-icons/fa';
import { useAuthStore } from '../../auth/store/authStore';
import { useAdminDashboard } from '../store/adminDashboard.store';
import { useQueryClient } from '@tanstack/react-query';


const C_Incoming = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [page, setPage] = useState(1);

  const { user } = useAuthStore();
  const toast = useToast();
  const queryClient = useQueryClient();

  const {
    forwardedDocuments,
    isLoadingForwardedDocuments,
    forwardedDocumentsError,
    receiveDocument,
  } = useAdminDashboard({ incomingPage: page }, { searchQuery }); // send search to backend

  // Reset to first page when search changes
  useEffect(() => { setPage(1); }, [searchQuery]);

  const priorities = ['All', 'Low', 'Medium', 'Urgent'];
  const [receivingDocId, setReceivingDocId] = useState(null);

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'Low': return 'green';
      case 'Medium': return 'blue';
      case 'Urgent': return 'red';
      default: return 'gray';
    }
  };

  const allDocs = forwardedDocuments?.data?.relevantDocs || [];
  const totalPages = forwardedDocuments?.data?.totalPages || 1;
  const currentPage = forwardedDocuments?.data?.currentPage || page;

  // Only filter by priority on client; backend handles text search
  const filterDocs = (priorityLabel) => {
    return allDocs.filter(doc => (priorityLabel === 'All' ? true : doc.priority === priorityLabel));
  };

  const handleReceive = async (docId) => {
    if (!user?.id) return;
    try {
      setReceivingDocId(docId);
      await receiveDocument({ registeredDocId: docId, userAccountId: user.id });
      toast({
        title: "Success",
        description: "Successfully marked as received.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['forwardedDocuments'] }),
        queryClient.invalidateQueries({ queryKey: ['pendingDocuments'] }),
        queryClient.invalidateQueries({ queryKey: ['outgoingDocuments'] }),
      ]);
    } catch (error) {
      toast({
        title: "Error receiving document",
        description: error.response?.data?.message || "Failed to receive document. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setReceivingDocId(null);
    }
  };

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
      <Flex spacing={2}>
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

  return (
    <Box overflow="hidden" bg="white" p={5} minH="100vh">
      <Heading as="h1" size="xl" mb={2}>
        Incoming Documents
      </Heading>
      <Text color="gray.600" mb={5}>
        View and manage all incoming documents that require processing.
      </Text>

      {/* Filter Section */}
      <Flex direction="column" mb={6} gap={4} p={4} bg="blue.50" borderRadius="md" boxShadow="sm">
        <Flex direction={{ base: "column", md: "row" }} gap={4} alignItems={{ base: "stretch", md: "flex-end" }}>
          {/* Reference Number Search */}
          <FormControl flex="1">
            <FormLabel fontSize="sm" fontWeight="medium" display="flex" alignItems="center" gap={2}>
              <Icon as={FiSearch} color="blue.500" /> Search
            </FormLabel>
            <InputGroup>
              <Input
                placeholder="Search by ref #, name, or code..."
                value={searchQuery}
                type="text" // changed
                onChange={(e) => setSearchQuery(e.target.value)}
                bg="white"
                _focus={{ borderColor: "blue.400" }}
              />
              <InputRightElement>
                <Icon as={FiSearch} boxSize={5} />
              </InputRightElement>
            </InputGroup>
          </FormControl>

          {/* QR Code Scan Button */}
          <Button
            bg="green.500"
            color={"white"}
            _hover={{ bg: "green.600" }}
            leftIcon={<FaQrcode />}
            size="md"
            alignSelf={{ base: "stretch", md: "flex-end" }}
            mt={{ base: 2, md: 0 }}
            // onClick={handleScanQR}
          >
            Scan QR Code
          </Button>
        </Flex>
      </Flex>

      {/* Documents Section */}
      <Box mb={8}>
        <Flex justify="space-between" align="center" mb={4} bg="green.50" p={3} borderRadius="md" borderLeftWidth="4px" borderLeftColor="green.500">
          <Heading as="h2" size="md" display="flex" alignItems="center">
            <Icon as={FiInbox} mr={2} color="green.600" /> INCOMING DOCUMENTS
          </Heading>
        </Flex>

        {/* Priority Tabs */}
        <Tabs colorScheme="green" variant="enclosed" index={activeTab} onChange={(index) => setActiveTab(index)} mb={4}>
          <TabList>
            {priorities.map((p) => <Tab key={p}>{p}</Tab>)}
          </TabList>

          <TabPanels>
            {priorities.map((priority) => {
              const docs = filterDocs(priority);
              const hasDocuments = docs.length > 0;
              return (
                <TabPanel key={priority} p={0} pt={4}>
                  {isLoadingForwardedDocuments ? (
                    <Center p={10}>
                      <Spinner size="lg" color="green.500" />
                    </Center>
                  ) : hasDocuments ? (
                    <Box overflowX="auto">
                      <TableContainer>
                        <Table variant="simple" size="md">
                          <Thead bg="gray.50">
                            <Tr>
                              <Th>Reference #</Th>
                              <Th>Title</Th>
                              <Th>Date Forwarded</Th>
                              <Th>From</Th>
                              <Th>Priority</Th>
                              <Th
                                position={{ base: 'static', md: 'sticky' }}
                                right={0}
                                bg="gray.50"
                                zIndex={{ base: 0, md: 1 }}
                                textAlign="center"
                                width="140px"
                              >
                                <Box display={{ base: 'none', md: 'block' }}>Scroll →</Box>
                                <Box display={{ base: 'block', md: 'none' }}>Actions</Box>
                              </Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {docs.map((doc) => {
                              const lastAction = doc.lastAction || (doc.lifeCycle?.[doc.lifeCycle.length - 1] ?? {});
                              const from = `${lastAction?.performedBy?.first_name || ''} ${lastAction?.performedBy?.last_name || ''}`.trim() || '—';
                              const receivedAt = lastAction?.timeStamp ? new Date(lastAction.timeStamp).toLocaleString() : '—';
                              return (
                                <Tr key={doc._id} fontSize="sm">
                                  <Td fontWeight="semibold">{doc.refNumber || '—'}</Td>
                                  <Td>{doc.documentName || '—'}</Td>
                                  <Td>{receivedAt}</Td>
                                  <Td>{from}</Td>
                                  <Td>
                                    <Badge colorScheme={getPriorityColor(doc.priority)}>{doc.priority || '—'}</Badge>
                                  </Td>
                                  <Td
                                    isNumeric
                                    position={{ base: 'static', md: 'sticky' }}
                                    right={0}
                                    zIndex={1}
                                    bg="white"
                                  >
                                    <Button
                                      size="sm"
                                      colorScheme="green"
                                      onClick={() => handleReceive(doc._id)}
                                      isLoading={receivingDocId === doc._id}
                                      leftIcon={<RiFolderReceivedFill />}
                                    >
                                      Receive 
                                    </Button>
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
                        No {priority !== 'All' ? priority + ' priority' : ''} incoming documents found
                      </Text>
                      <Text fontSize="sm" color="gray.400">
                        Documents will appear here once received in the system
                      </Text>
                    </Center>
                  )}
                </TabPanel>
              );
            })}
          </TabPanels>
        </Tabs>

        <Flex justifyContent="space-between" alignItems="center" mt={4}>
          <PaginationControls
            currentPage={currentPage}
            setCurrentPage={setPage}
            totalPages={totalPages}
            totalItems={forwardedDocuments?.data?.totalCount || 0}
            colorScheme="green"
          />
        </Flex>
      </Box>
    </Box>
  );
};

export default C_Incoming;
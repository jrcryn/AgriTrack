import React, { useEffect, useState } from 'react';
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
  Select,
  useDisclosure,
  Checkbox
} from '@chakra-ui/react';
import { FiSearch, FiInbox } from 'react-icons/fi';
import { LuLogs } from "react-icons/lu";
import { FaEye } from 'react-icons/fa';
import { TbFileShredder } from "react-icons/tb";

import { useAdminDashboard } from '../store/adminDashboard.store.js';
import TicketRequestPanel from '../../components/ticketRequestPanel.jsx';

const TicketRequests = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const [pendingPage, setPendingPage] = useState(1);
  const [ongoingPage, setOngoingPage] = useState(1);
  const [scheduledPage, setScheduledPage] = useState(1);
  const [declinedPage, setDeclinedPage] = useState(1);
  

  const [pageType, setPageType] = useState('pending'); // 'pending', 'ongoing', 'scheduled', 'declined'

  const {
    pendingTicketRequests,
    ongoingTicketRequests,
    scheduledTicketRequests,
    declinedTicketRequests,
    
    isLoadingPendingTicketRequests,
    isLoadingOngoingTicketRequests,
    isLoadingScheduledTicketRequests,
    isLoadingDeclinedTicketRequests,

    ongoingTicketRequestsError,
    scheduledTicketRequestsError,
    declinedTicketRequestsError,
    pendingTicketRequestsError
  } = useAdminDashboard(
    { pendingPage, ongoingPage, scheduledPage, declinedPage },
    { searchQuery }
  );

  useEffect(() => {
    setPendingPage(1);
    setScheduledPage(1);
    setDeclinedPage(1);
    setOngoingPage(1);
  }, [ searchQuery ]);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedTickets, setSelectedTickets] = useState([]);
  console.log(selectedTickets);

  const handleSelectTickets = (ticket) => {
    setSelectedTickets(prev =>
      prev.includes(ticket) ? prev.filter(t => t !== ticket) : [...prev, ticket]
    );
  };

  const pendingTickets = pendingTicketRequests?.data?.relevantTickets || [];
  const pendingTotalPages = pendingTicketRequests?.data?.totalPages || 1;
  const pendingCurrentPage = pendingTicketRequests?.data?.currentPage || 1;
  const pendingTotalItems = pendingTicketRequests?.data?.totalCount || 0;

  const scheduledTickets = scheduledTicketRequests?.data?.relevantTickets || [];
  const scheduledTotalPages = scheduledTicketRequests?.data?.totalPages || 1;
  const scheduledCurrentPage = scheduledTicketRequests?.data?.currentPage || 1;
  const scheduledTotalItems = scheduledTicketRequests?.data?.totalCount || 0;

  const ongoingTickets = ongoingTicketRequests?.data?.relevantTickets || [];
  const ongoingTotalPages = ongoingTicketRequests?.data?.totalPages || 1;
  const ongoingCurrentPage = ongoingTicketRequests?.data?.currentPage || 1;
  const ongoingTotalItems = ongoingTicketRequests?.data?.totalCount || 0;

  const declinedTickets = declinedTicketRequests?.data?.relevantTickets || [];
  const declinedTotalPages = declinedTicketRequests?.data?.totalPages || 1;
  const declinedCurrentPage = declinedTicketRequests?.data?.currentPage || 1;
  const declinedTotalItems = declinedTicketRequests?.data?.totalCount || 0;


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

  return (
    <Box overflow="hidden" bg="white" p={5} minH="100vh">
      <Heading as="h1" size="xl" mb={2}>
        Document Logs
      </Heading>
      <Text color="gray.600" mb={5}>
        View and manage pending, scheduled, ongoing and declined ticket requests.
      </Text>

      {/* Filter Section */}
      <Flex direction="column" mb={6} gap={4} p={4} bg="blue.50" borderRadius="md" boxShadow="sm">
        <Flex direction={{ base: "column", md: "row" }} gap={4} alignItems={{ base: "stretch", md: "flex-end" }}>
          {/* Search */}
          <FormControl flex="1">
            <FormLabel fontSize="sm" fontWeight="medium" display="flex" alignItems="center" gap={2}>
              <Icon as={FiSearch} color="blue.500" /> Search
            </FormLabel>
            <InputGroup>
              <Input
                placeholder="Search by ref #, name, or person..."
                value={searchQuery}
                type="text"
                onChange={(e) => setSearchQuery(e.target.value)}
                bg="white"
                _focus={{ borderColor: "blue.400" }}
              />
              <InputRightElement>
                <Icon as={FiSearch} boxSize={5} />
              </InputRightElement>
            </InputGroup>
          </FormControl>

          {/* Type Select */}
          <FormControl maxW={{ md: '260px' }}>
            <FormLabel fontSize="sm" fontWeight="medium">Request Ticket Status</FormLabel>
            <Select
              bg="white"
              value={pageType}
              onChange={(e) => setPageType(e.target.value)}
            >
              <option value="pending">Pending Tickets</option>
              <option value="scheduled">Scheduled Tickets</option>
              <option value="ongoing">Ongoing Tickets</option>
              <option value="declined">Declined Tickets</option>
            </Select>
          </FormControl>
        </Flex>
      </Flex>

      {/* Documents Section */}

      {pageType === 'pending' && (
        <>
        {/* Archived DOcument Section */}
        <Box mb={8}>
          <Flex justify="space-between" align="center" mb={4} bg={'orange.50'} p={3} borderRadius="md" borderLeftWidth="4px" borderLeftColor={'orange.500'}>
            <Heading as="h2" size="md" display="flex" alignItems="center">
              <Icon as={LuLogs} mr={2} color={'orange.500'} /> PENDING TICKETS
            </Heading>
            {selectedTickets.length > 0 && (
              <Button
                colorScheme='orange'
                onClick={onOpen}
                size={"sm"}
              >
                Manage Selected Tickets
              </Button>
            )}
          </Flex>

          {isLoadingPendingTicketRequests ? (
            <Center p={10}>
              <Spinner size="lg" color={'orange.500'} />
            </Center>
          ) : pendingTickets.length > 0 ? (
            <Box overflowX="auto">
              <TableContainer>
                <Table variant="simple" size="md">
                  <Thead bg="gray.50">
                    <Tr>
                      <Th></Th>
                      <Th>Reference #</Th>
                      <Th>Requestor Farmer</Th>
                      <Th>Farm Location</Th>
                      <Th>Requested Machine</Th>
                      <Th>Estimated Area</Th>
                      <Th>Date Requested</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {pendingTickets.map((ticket) => {
                      const date = ticket?.dateRequested ? new Date(ticket.dateRequested).toLocaleString() : '—';
                      const by = `${ticket?.requestorFarmer?.first_name || ''} ${ticket?.requestorFarmer?.surname || ''}`.trim() || '—';
                      return (   
                        <Tr key={ticket._id} fontSize="sm">
                          <Td>
                            <Checkbox
                              isChecked={selectedTickets.includes(ticket)}
                              onChange={() => handleSelectTickets(ticket)}
                            />
                          </Td>
                          <Td fontWeight={'semibold'}>{ticket.refNumber || '—'}</Td>
                          <Td>{by || '-'}</Td>
                          <Td>{ticket?.barangay || '-'}</Td>
                          <Td>{ticket?.requestedMachineType?.equipmentType || '-'}</Td>
                          <Td>{ticket?.estimatedArea || '-'}</Td>
                          <Td>{date}</Td>
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
                No pending tickets found
              </Text>
              <Text fontSize="sm" color="gray.400">
                Try adjusting your search.
              </Text>
            </Center>
          )}

          <Flex justifyContent="space-between" alignItems="center" mt={4}>
            <PaginationControls
              currentPage={pendingCurrentPage}
              setCurrentPage={setPendingPage}
              totalPages={pendingTotalPages}
              totalItems={pendingTotalItems}
              colorScheme='orange'
            />
          </Flex>
        </Box>
        </>
      )}
      
      {pageType === 'scheduled' && (
        <>
        {/* Scheduled TIckets */}
        <Box mb={8}>
          <Flex justify="space-between" align="center" mb={4} bg={'green.50'} p={3} borderRadius="md" borderLeftWidth="4px" borderLeftColor={'green.500'}>
            <Heading as="h2" size="md" display="flex" alignItems="center">
              <Icon as={LuLogs} mr={2} color={'green.500'} /> SCHEDULED TICKETS
            </Heading>
          </Flex>

          {isLoadingScheduledTicketRequests ? (
            <Center p={10}>
              <Spinner size="lg" color={'green.500'} />
            </Center>
          ) : scheduledTickets.length > 0 ? (
            <Box overflowX="auto">
              <TableContainer>
                <Table variant="simple" size="md">
                  <Thead bg="gray.50">
                    <Tr>
                      <Th>Reference #</Th>
                      <Th>Requestor Farmer</Th>
                      <Th>Farm Location</Th>
                      <Th>Requested Machine</Th>
                      <Th>Estimated Area</Th>
                      <Th>Date Requested</Th>
                      <Th
                        position={{ base: 'static', md: 'sticky' }}
                        right={0}
                        bg="gray.50"
                        zIndex={{ base: 0, md: 1 }}
                        textAlign="center"
                        width="120px"
                      >
                        <Box display={{ base: 'none', md: 'block' }}>Scroll →</Box>
                        <Box display={{ base: 'block', md: 'none' }}>Actions</Box>
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {scheduledTickets.map((ticket) => {
                      const date = ticket?.dateRequested ? new Date(ticket.dateRequested).toLocaleString() : '—';
                      const by = `${ticket?.requestorFarmer?.first_name || ''} ${ticket?.requestorFarmer?.surname || ''}`.trim() || '—';
                      return (   
                        <Tr key={ticket._id} fontSize="sm">
                          <Td fontWeight={'semibold'}>{ticket.refNumber || '—'}</Td>
                          <Td>{by || '-'}</Td>
                          <Td>{ticket?.barangay || '-'}</Td>
                          <Td>{ticket?.requestedMachineType?.equipmentType || '-'}</Td>
                          <Td>{ticket?.estimatedArea || '-'}</Td>
                          <Td>{date}</Td>
                          <Td
                            isNumeric
                            position={{ base: 'static', md: 'sticky' }}
                            right={0}
                            zIndex={1}
                            bg="white"
                          >
                            <Button
                              size="sm"
                              colorScheme='green'
                              leftIcon={<FaEye />}
                            >
                              Details
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
                No scheduled tickets found
              </Text>
              <Text fontSize="sm" color="gray.400">
                Try adjusting your search.
              </Text>
            </Center>
          )}

          <Flex justifyContent="space-between" alignItems="center" mt={4}>
            <PaginationControls
              currentPage={scheduledCurrentPage}
              setCurrentPage={setScheduledPage}
              totalPages={scheduledTotalPages}
              totalItems={scheduledTotalItems}
              colorScheme='green'
            />
          </Flex>
        </Box>
        </>
      )}

      {pageType === 'ongoing' && (
        <>
        {/* Ongoing Tickets */}
        <Box mb={8}>
          <Flex justify="space-between" align="center" mb={4} bg={'purple.50'} p={3} borderRadius="md" borderLeftWidth="4px" borderLeftColor={'purple.500'}>
            <Heading as="h2" size="md" display="flex" alignItems="center">
              <Icon as={LuLogs} mr={2} color={'purple.500'} /> ONGOING TICKETS
            </Heading>
          </Flex>

          {isLoadingOngoingTicketRequests ? (
            <Center p={10}>
              <Spinner size="lg" color={'purple.500'} />
            </Center>
          ) : ongoingTickets.length > 0 ? (
            <Box overflowX="auto">
              <TableContainer>
                <Table variant="simple" size="md">
                  <Thead bg="gray.50">
                    <Tr>
                      <Th>Reference #</Th>
                      <Th>Requestor Farmer</Th>
                      <Th>Farm Location</Th>
                      <Th>Requested Machine</Th>
                      <Th>Estimated Area</Th>
                      <Th>Date Requested</Th>
                      <Th
                        position={{ base: 'static', md: 'sticky' }}
                        right={0}
                        bg="gray.50"
                        zIndex={{ base: 0, md: 1 }}
                        textAlign="center"
                        width="120px"
                      >
                        <Box display={{ base: 'none', md: 'block' }}>Scroll →</Box>
                        <Box display={{ base: 'block', md: 'none' }}>Actions</Box>
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {ongoingTickets.map((ticket) => {
                      const date = ticket?.dateRequested ? new Date(ticket.dateRequested).toLocaleString() : '—';
                      const by = `${ticket?.requestorFarmer?.first_name || ''} ${ticket?.requestorFarmer?.surname || ''}`.trim() || '—';
                      return (
                        <Tr key={ticket._id} fontSize="sm">
                          <Td fontWeight={'semibold'}>{ticket.refNumber || '—'}</Td>
                          <Td>{by || '-'}</Td>
                          <Td>{ticket?.barangay || '-'}</Td>
                          <Td>{ticket?.requestedMachineType?.equipmentType || '-'}</Td>
                          <Td>{ticket?.estimatedArea || '-'}</Td>
                          <Td>{date}</Td>
                          <Td
                            isNumeric
                            position={{ base: 'static', md: 'sticky' }}
                            right={0}
                            zIndex={1}
                            bg="white"
                          >
                            <Button
                              size="sm"
                              colorScheme='purple'
                              leftIcon={<FaEye />}
                            >
                              Details
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
                No ongoing tickets found
              </Text>
              <Text fontSize="sm" color="gray.400">
                Try adjusting your search.
              </Text>
            </Center>
          )}

          <Flex justifyContent="space-between" alignItems="center" mt={4}>
            <PaginationControls
              currentPage={ongoingCurrentPage}
              setCurrentPage={setOngoingPage}
              totalPages={ongoingTotalPages}
              totalItems={ongoingTotalItems}
              colorScheme='purple'
            />
          </Flex>
        </Box>
        </>
      )}

      {pageType === 'declined' && (
        <>
        {/* Declined Tickets */}
        <Box mb={8}>
          <Flex justify="space-between" align="center" mb={4} bg={'red.50'} p={3} borderRadius="md" borderLeftWidth="4px" borderLeftColor={'red.500'}>
            <Heading as="h2" size="md" display="flex" alignItems="center">
              <Icon as={LuLogs} mr={2} color={'red.500'} /> DECLINED TICKETS
            </Heading>
          </Flex>

          {isLoadingDeclinedTicketRequests ? (
            <Center p={10}>
              <Spinner size="lg" color={'red.500'} />
            </Center>
          ) : declinedTickets.length > 0 ? (
            <Box overflowX="auto">
              <TableContainer>
                <Table variant="simple" size="md">
                  <Thead bg="gray.50">
                    <Tr>
                      <Th>Reference #</Th>
                      <Th>Requestor Farmer</Th>
                      <Th>Farm Location</Th>
                      <Th>Requested Machine</Th>
                      <Th>Estimated Area</Th>
                      <Th>Date Requested</Th>
                      <Th
                        position={{ base: 'static', md: 'sticky' }}
                        right={0}
                        bg="gray.50"
                        zIndex={{ base: 0, md: 1 }}
                        textAlign="center"
                        width="120px"
                      >
                        <Box display={{ base: 'none', md: 'block' }}>Scroll →</Box>
                        <Box display={{ base: 'block', md: 'none' }}>Actions</Box>
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {declinedTickets.map((ticket) => {
                      const date = ticket?.dateRequested ? new Date(ticket.dateRequested).toLocaleString() : '—';
                      const by = `${ticket?.requestorFarmer?.first_name || ''} ${ticket?.requestorFarmer?.surname || ''}`.trim() || '—';
                      return (   
                        <Tr key={ticket._id} fontSize="sm">
                          <Td fontWeight={'semibold'}>{ticket.refNumber || '—'}</Td>
                          <Td>{by || '-'}</Td>
                          <Td>{ticket?.barangay || '-'}</Td>
                          <Td>{ticket?.requestedMachineType?.equipmentType || '-'}</Td>
                          <Td>{ticket?.estimatedArea || '-'}</Td>
                          <Td>{date}</Td>
                          <Td
                            isNumeric
                            position={{ base: 'static', md: 'sticky' }}
                            right={0}
                            zIndex={1}
                            bg="white"
                          >
                            <Button
                              size="sm"
                              colorScheme='red'
                              leftIcon={<FaEye />}
                            >
                              Details
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
                No declined tickets found
              </Text>
              <Text fontSize="sm" color="gray.400">
                Try adjusting your search.
              </Text>
            </Center>
          )}

          <Flex justifyContent="space-between" alignItems="center" mt={4}>
            <PaginationControls
              currentPage={declinedCurrentPage}
              setCurrentPage={setDeclinedPage}
              totalPages={declinedTotalPages}
              totalItems={declinedTotalItems}
              colorScheme='red'
            />
          </Flex>
        </Box>
        </>
      )}

      <TicketRequestPanel
        isOpen={isOpen}
        onClose={onClose}
        selectedTickets={selectedTickets}
        isPendingPage={true}
        isDeclinedPage={false}
        isScheduledPage={false}
        isOngoingPage={false}
        selectedTicketsSetter={setSelectedTickets}
      />
    </Box>
  );
};

export default TicketRequests;
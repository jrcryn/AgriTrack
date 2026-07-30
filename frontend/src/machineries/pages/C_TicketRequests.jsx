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
  Checkbox,
  useToast, // Add import for toast
  Badge, // Add import for badge
  Tooltip,
  Spacer
} from '@chakra-ui/react';
import { FiSearch, FiInbox } from 'react-icons/fi';
import { LuLogs } from "react-icons/lu";
import { FaEye, FaLink, FaExternalLinkAlt } from 'react-icons/fa';

import { useAdminDashboard } from '../store/adminDashboard.store.js';
import TicketRequestPanel from '../../components/ticketRequestPanel.jsx';
import { useAuthStore } from '../../auth/store/authStore.js';

const TicketRequests = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const toast = useToast(); // Initialize toast
  const MAX_SELECTIONS = 5; // Set maximum number of ticket selections
  const { user } = useAuthStore();

  const [pendingPage, setPendingPage] = useState(1);
  const [ongoingPage, setOngoingPage] = useState(1);
  const [schedulesPage, setSchedulesPage] = useState(1);

  const [reopenScheduleId, setReopenScheduleId] = useState(null);

  
  const [pageType, setPageType] = useState(user?.role === 'MIM' ? 'pending' : 'scheduled'); // 'pending', 'ongoing', 'scheduled', 'declined'
  const [isViewingDetails, setIsViewingDetails] = useState(false)
  const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL;

  const {
    pendingTicketRequests,
    
    isLoadingPendingTicketRequests,

    pendingTicketRequestsError,

    plannedWeeklySchedules,
    isLoadingPlannedWeeklySchedules,
    plannedWeeklySchedulesError,

    inProgressWeeklySchedules,
    isLoadingInProgressWeeklySchedules,
    inProgressWeeklySchedulesError,
  } = useAdminDashboard(
    { pendingPage, schedulesPage },
    { searchQuery }
  );

  useEffect(() => {
    setPendingPage(1);
    setSchedulesPage(1);
  }, [ searchQuery ]);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [selectedWeeklySchedule, setSelectedWeeklySchedule] = useState(null);

  const handleSelectTickets = (ticket) => {
    setSelectedTickets(prev => {
      // If ticket is already selected, remove it
      if (prev.includes(ticket)) {
        return prev.filter(t => t !== ticket);
      }
      
      // If adding would exceed the limit, show toast and don't add
      if (prev.length >= MAX_SELECTIONS) {
        toast({
          title: "Selection limit reached",
          description: `You can only select up to ${MAX_SELECTIONS} tickets at once.`,
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
        return prev;
      }
      
      // Otherwise, add the ticket
      return [...prev, ticket];
    });
  };

  const handleRequestReopenSchedule = (id) => {
    setReopenScheduleId(id);
  };

  useEffect(() => {
    if (!reopenScheduleId) return;

    // Wait until either list finishes refetching
    if (isLoadingPlannedWeeklySchedules || isLoadingInProgressWeeklySchedules) return;

    const plannedList = plannedWeeklySchedules?.data?.relevantSchedules || [];
    const inProgressList = inProgressWeeklySchedules?.data?.relevantSchedules || [];

    const refreshedPlanned = plannedList.find(s => s._id === reopenScheduleId);
    const refreshedInProgress = inProgressList.find(s => s._id === reopenScheduleId);

    if (refreshedPlanned) {
      if (pageType !== 'scheduled') setPageType('scheduled');
      setSelectedWeeklySchedule(refreshedPlanned);
      setIsViewingDetails(false);
      onOpen();
      setReopenScheduleId(null);
      return;
    }

    if (refreshedInProgress) {
      if (pageType !== 'ongoing') setPageType('ongoing');
      setSelectedWeeklySchedule(refreshedInProgress);
      setIsViewingDetails(false);
      onOpen();
      setReopenScheduleId(null);
    }
  }, [ reopenScheduleId, isLoadingPlannedWeeklySchedules, isLoadingInProgressWeeklySchedules, plannedWeeklySchedules, inProgressWeeklySchedules, pageType ]);


  const pendingTickets = pendingTicketRequests?.data?.relevantTickets || [];
  const pendingTotalPages = pendingTicketRequests?.data?.totalPages || 1;
  const pendingCurrentPage = pendingTicketRequests?.data?.currentPage || 1;
  const pendingTotalItems = pendingTicketRequests?.data?.totalCount || 0;

  const plannedWeeklySchedulesList = plannedWeeklySchedules?.data?.relevantSchedules || [];
  const plannedSchedulesTotalPages = plannedWeeklySchedules?.data?.totalPages || 1;
  const plannedSchedulesCurrentPage = plannedWeeklySchedules?.data?.currentPage || 1;
  const plannedSchedulesTotalItems = plannedWeeklySchedules?.data?.totalCount || 0;

  const inProgressWeeklySchedulesList = inProgressWeeklySchedules?.data?.relevantSchedules || [];
  const inProgressSchedulesTotalPages = inProgressWeeklySchedules?.data?.totalPages || 1;
  const inProgressSchedulesCurrentPage = inProgressWeeklySchedules?.data?.currentPage || 1;
  const inProgressSchedulesTotalItems = inProgressWeeklySchedules?.data?.totalCount || 0;

  let isCompact = isViewingDetails || pageType === 'declined';
  let width = isCompact ? '2xl' : '6xl';
  let height = isCompact ? '300px' : '835px';

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
    if (!dateString) return 'Not assigned';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateWithTime = (dateString) => {
    if (!dateString) return 'Not assigned';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Box overflow="hidden" bg="white" p={5} minH="100vh">
      <Heading as="h1" size="xl" mb={2}>
        Ticket Requests
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
              {user?.role === 'MIM' && (
                <>
                  <option value="pending">Pending Tickets</option>
                  <option value="scheduled">Scheduled Tickets</option>
                  <option value="ongoing">Ongoing Tickets</option>
                  {/* <option value="declined">Declined Tickets</option> */}
                </>
              )}
              {user?.role !== 'MIM' && (
                <>
                  <option value="scheduled">Scheduled Tickets</option>
                  <option value="ongoing">Ongoing Tickets</option>
                </>
              )}
            </Select>
          </FormControl>
        </Flex>
      </Flex>

        {/* Search Section */}
        <Flex 
          direction={{ base: "column", md: "row" }} 
          mb={4} 
          p={4}
          bg="blue.50"
          borderRadius="md"
          alignItems={{ base: "flex-start", md: "center" }}
          gap={2}
        >

          <Button 
            colorScheme='blue' 
            size="sm" 
            width={{ base: "full", md: "auto" }} 
            onClick={() => {
              navigator.clipboard.writeText(`${FRONTEND_URL}/machineries/form/istcns`);
              toast({
                title: "Link Copied",
                description: "The form link has been copied to your clipboard.",
                status: "success",
                duration: 3000,
                isClosable: true,
              });
            }}
            >
            <Icon as={FaLink} mr={2}/>
            Copy Form Link
          </Button>

          <Button 
            colorScheme='blue' 
            size="sm" 
            width={{ base: "full", md: "auto" }} 
            onClick={() => { window.open(`${FRONTEND_URL}/machineries/form/istcns`, '_blank') }} 
            >
            <Icon as={FaExternalLinkAlt} mr={2}/>
            Open Form in New Tab
          </Button>

        </Flex>

      {/* Documents Section */}
      {pageType === 'pending' && (
        <>
        {/* Archived Document Section */}
        <Box mb={8}>
          <Flex justify="space-between" align="center" mb={4} bg={'orange.50'} p={3} borderRadius="md" borderLeftWidth="4px" borderLeftColor={'orange.500'}>
            <Heading as="h2" size="md" display="flex" alignItems="center">
              <Icon as={LuLogs} mr={2} color={'orange.500'} /> PENDING TICKETS
            </Heading>
            {selectedTickets.length > 1 && (
              <Button
                colorScheme='orange'
                onClick={() => {
                  onOpen();
                  setIsViewingDetails(false);
                }}
                size={"sm"}
              >
                Manage Selected Tickets ({selectedTickets.length})
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
                      <Th>
                        <Tooltip 
                          label={`Select up to ${MAX_SELECTIONS} tickets`}
                          placement="top"
                          hasArrow
                        >
                          Select
                        </Tooltip>
                      </Th>
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
                    {pendingTickets.map((ticket) => {
                      const by = `${ticket?.requestorFarmer?.first_name || ''} ${ticket?.requestorFarmer?.surname || ''}`.trim() || '—';
                      return (   
                        <Tr key={ticket._id} fontSize="sm" onClick={() => handleSelectTickets(ticket)} cursor="pointer" >
                          <Td>
                            <Checkbox
                              isChecked={selectedTickets.includes(ticket)}
                              onChange={(e) => {e.stopPropagation();  handleSelectTickets(ticket);}}
                              isDisabled={!selectedTickets.includes(ticket) && selectedTickets.length >= MAX_SELECTIONS}
                            />
                          </Td>
                          <Td fontWeight={'semibold'} >{ticket.refNumber || '—'}</Td>
                          <Td>{by || '-'}</Td>
                          <Td>{ticket?.barangay || '-'}</Td>
                          <Td>{ticket?.requestedMachineType?.equipmentType || '-'}</Td>
                          <Td>{ticket?.estimatedArea || '-'}</Td>
                          <Td>{formatDateWithTime(ticket?.dateRequested) || '-'}</Td>
                          <Td
                            isNumeric
                            position={{ base: 'static', md: 'sticky' }}
                            right={0}
                            zIndex={1}
                            bg="white"
                          >
                            <Button
                              size="xs"
                              colorScheme='orange'
                              leftIcon={<FaEye />}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTickets([ticket]);
                                setIsViewingDetails(true);
                                onOpen();
                              }}
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

          {isLoadingPlannedWeeklySchedules ? (
            <Center p={10}>
              <Spinner size="lg" color={'green.500'} />
            </Center>
          ) : plannedWeeklySchedulesList.length > 0 ? (
            <Box overflowX="auto">
              <TableContainer>
                <Table variant="simple" size="md">
                  <Thead bg="gray.50">
                    <Tr>
                      <Th>Reference #</Th>
                      <Th>Scheduled Tickets</Th>
                      <Th>Date Range</Th>
                      <Th>Scheduled Dates</Th>
                      <Th>Assigned Machine Units</Th>
                      <Th>Assigned Operators</Th>
                      <Th>Date Created</Th>
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
                    {plannedWeeklySchedulesList.map((schedule) => {
                      return (
                        <Tr key={schedule._id} fontSize="sm">
                          <Td fontWeight={'semibold'}>{schedule?.refNumber || '—'}</Td>

                          <Td> 
                            {schedule.ticketRequests.length === 0 ? (
                              <Text color="gray.500">No scheduled tickets</Text>
                            ) : (
                              <Flex direction="column" gap={2}>
                                {schedule.ticketRequests.map((ticket) => (
                                  <Flex key={ticket._id} align='center' justify="space-between" gap={2}>
                                    <Flex direction='column'>
                                      <Text fontWeight='medium'>{ticket.ticketDetails?.refNumber}</Text>
                                    </Flex>
                                  </Flex>
                                ))}
                              </Flex>
                            )}
                          </Td>
                            
                          <Td fontSize={'xs'}>
                            <Text>
                              From <Text as="span" fontWeight="semibold">{formatDate(schedule?.weekStart)}</Text> to{" "} <br></br>
                              <Text as="span" fontWeight="semibold">{formatDate(schedule?.weekEnd)}</Text>
                            </Text>
                          </Td>

                          <Td>
                            {schedule.ticketRequests.length === 0 ? (
                              <Text color="gray.500">No scheduled dates</Text>
                            ) : (
                              <Flex direction="column" gap={2}>
                                {schedule.ticketRequests.map((ticket) => (
                                  <Flex key={ticket._id} align='center' justify="space-between" gap={2}>
                                    <Flex direction='column'>
                                      {formatDate(ticket?.ticketDetails?.assignedDate)}
                                    </Flex>
                                  </Flex>
                                ))}
                              </Flex>
                            )}
                          </Td>

                          <Td fontSize={'xs'}>
                            {schedule.ticketRequests.length === 0 ? (
                              <Text color="gray.500">No assigned machine units</Text>
                            ) : (
                              <Flex direction="column" gap={2}>
                                {schedule.ticketRequests.map((ticket) => (
                                  <Flex key={ticket._id} align='center' justify="space-between" gap={2}>
                                    <Flex direction='column'>
                                      <Text>{ticket?.ticketDetails?.assignedMachineUnit?.unitNumber} - {ticket?.ticketDetails?.requestedMachineType?.equipmentType}</Text>
                                    </Flex>
                                  </Flex>
                                ))}
                              </Flex>
                            )}
                          </Td>

                          <Td>
                            {schedule.ticketRequests.length === 0 ? (
                              <Text color="gray.500">No assigned machine units</Text>
                            ) : (
                              <Flex direction="column" gap={2}>
                                {schedule.ticketRequests.map((ticket) => (
                                  <Flex key={ticket._id} align='center' justify="space-between" gap={2}>
                                    <Flex direction='column'>
                                      <Text>{ticket?.ticketDetails?.assignedOperator?.first_name} {ticket?.ticketDetails?.assignedOperator?.last_name}</Text>
                                    </Flex>
                                  </Flex>
                                ))}
                              </Flex>
                            )}
                          </Td>

                          <Td>{formatDateWithTime(schedule?.createdAt)}</Td>
                          <Td
                            isNumeric
                            position={{ base: 'static', md: 'sticky' }} 
                            right={0}
                            zIndex={1}
                            bg="white"
                          >
                            <Button
                              size="xs"
                              colorScheme='green'
                              leftIcon={<FaEye />}
                              onClick={() => {
                                setSelectedWeeklySchedule(schedule); 
                                setIsViewingDetails(false);
                                onOpen();
                              }}
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
              currentPage={plannedSchedulesCurrentPage}
              setCurrentPage={setSchedulesPage}
              totalPages={plannedSchedulesTotalPages}
              totalItems={plannedSchedulesTotalItems}
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

          {isLoadingInProgressWeeklySchedules ? (
            <Center p={10}>
              <Spinner size="lg" color={'purple.500'} />
            </Center>
          ) : inProgressWeeklySchedulesList.length > 0 ? (
            <Box overflowX="auto">
              <TableContainer>
                <Table variant="simple" size="md">
                  <Thead bg="gray.50">
                    <Tr>
                      <Th>Reference #</Th>
                      <Th>Scheduled Tickets</Th>
                      <Th>Date Range</Th>
                      <Th>Scheduled Dates</Th>
                      <Th>Assigned Machine Units</Th>
                      <Th>Assigned Operators</Th>
                      <Th>Date Created</Th>
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
                    {inProgressWeeklySchedulesList.map((schedule) => {
                      return (
                        <Tr key={schedule._id} fontSize="sm">
                          <Td fontWeight={'semibold'}>{schedule?.refNumber || '—'}</Td>

                          <Td> 
                            {schedule.ticketRequests.length === 0 ? (
                              <Text color="gray.500">No scheduled tickets</Text>
                            ) : (
                              <Flex direction="column" gap={2}>
                                {schedule.ticketRequests.map((ticket) => (
                                  <Flex key={ticket._id} align='center' justify="space-between" gap={2}>
                                    <Flex direction='column'>
                                      {ticket?.extensionRequestId ? (
                                        <Text fontWeight='medium' color={'orange.500'}>{ticket.extensionDetails?.refNumber}</Text>
                                      ) : (
                                        <Text fontWeight='medium'>{ticket.ticketDetails?.refNumber}</Text>
                                      )}
                                    </Flex>
                                  </Flex>
                                ))}
                              </Flex>
                            )}
                          </Td>
                            
                          <Td fontSize={'xs'}>
                            <Text>
                              From <Text as="span" fontWeight="semibold">{formatDate(schedule?.weekStart)}</Text> to{" "} <br></br>
                              <Text as="span" fontWeight="semibold">{formatDate(schedule?.weekEnd)}</Text>
                            </Text>
                          </Td>

                          <Td>
                            {schedule.ticketRequests.length === 0 ? (
                              <Text color="gray.500">No scheduled dates</Text>
                            ) : (
                              <Flex direction="column" gap={2}>
                                {schedule.ticketRequests.map((ticket) => (
                                  <Flex key={ticket._id} align='center' justify="space-between" gap={2}>
                                    <Flex direction='column'>
                                      {ticket?.extensionRequestId ? (
                                        <Text fontWeight='medium'>{formatDate(ticket.extensionDetails?.assignedDate)}</Text>
                                      ) : (
                                        <Text fontWeight='medium'>{formatDate(ticket?.ticketDetails?.assignedDate)}</Text>
                                      )}
                                    </Flex>
                                  </Flex>
                                ))}
                              </Flex>
                            )}
                          </Td>

                          <Td fontSize={'xs'}>
                            {schedule.ticketRequests.length === 0 ? (
                              <Text color="gray.500">No assigned machine units</Text>
                            ) : (
                              <Flex direction="column" gap={2}>
                                {schedule.ticketRequests.map((ticket) => (
                                  <Flex key={ticket._id} align='center' justify="space-between" gap={2}>
                                    <Flex direction='column'>
                                      {ticket?.extensionRequestId ? (
                                        <Text>{ticket.extensionDetails?.assignedMachineUnit?.unitNumber} - {ticket.extensionDetails?.requestedMachineType?.equipmentType}</Text>
                                      ) : (
                                        <Text>{ticket?.ticketDetails?.assignedMachineUnit?.unitNumber} - {ticket?.ticketDetails?.requestedMachineType?.equipmentType}</Text>
                                      )}
                                    </Flex>
                                  </Flex>
                                ))}
                              </Flex>
                            )}
                          </Td>

                          <Td>
                            {schedule.ticketRequests.length === 0 ? (
                              <Text color="gray.500">No assigned machine units</Text>
                            ) : (
                              <Flex direction="column" gap={2}>
                                {schedule.ticketRequests.map((ticket) => (
                                  <Flex key={ticket._id} align='center' justify="space-between" gap={2}>
                                    <Flex direction='column'>
                                      {ticket?.extensionRequestId ? (
                                        <Text>{ticket?.extensionDetails?.assignedOperator?.first_name} {ticket?.extensionDetails?.assignedOperator?.last_name}</Text>
                                      ) : (
                                        <Text>{ticket?.ticketDetails?.assignedOperator?.first_name} {ticket?.ticketDetails?.assignedOperator?.last_name}</Text>
                                      )}
                                    </Flex>
                                  </Flex>
                                ))}
                              </Flex>
                            )}
                          </Td>

                          <Td>{formatDateWithTime(schedule?.createdAt)}</Td>
                          <Td
                            isNumeric
                            position={{ base: 'static', md: 'sticky' }} 
                            right={0}
                            zIndex={1}
                            bg="white"
                          >
                            <Button
                              size="xs"
                              colorScheme='purple'
                              leftIcon={<FaEye />}
                              onClick={() => {
                                setSelectedWeeklySchedule(schedule); 
                                setIsViewingDetails(false);
                                onOpen();
                              }}
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
              currentPage={inProgressSchedulesCurrentPage}
              setCurrentPage={setOngoingPage}
              totalPages={inProgressSchedulesTotalPages}
              totalItems={inProgressSchedulesTotalItems}
              colorScheme='purple'
            />
          </Flex>
        </Box>
        </>
      )}

      <TicketRequestPanel
        isOpen={isOpen}
        onClose={() => {
          onClose();
          setSelectedTickets([]);
          setSelectedWeeklySchedule(null);
        }}
        selectedTickets={selectedTickets}
        selectedWeeklySchedule={selectedWeeklySchedule}
        pageType={pageType}
        selectedTicketsSetter={setSelectedTickets}
        selectedWeeklyScheduleSetter={setSelectedWeeklySchedule}
        width={width}
        height={height}
        isViewingDetails={isViewingDetails}
        onRequestReopenSchedule={handleRequestReopenSchedule}
      />
      
    </Box>
  );
};

export default TicketRequests;
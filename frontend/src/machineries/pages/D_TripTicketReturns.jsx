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
  useDisclosure,
} from '@chakra-ui/react';
import { FiSearch, FiInbox } from 'react-icons/fi';
import { LuLogs } from "react-icons/lu";
import { FaEye } from 'react-icons/fa';
import { useAuthStore } from '../../auth/store/authStore.js';

import { useAdminDashboard } from '../store/adminDashboard.store.js';
import OngoingTicketPanel from '../../components/ongoingTicketPanel.jsx';

const TripTicketReturns = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [ongoingPage, setOngoingPage] = useState(1);
  const [reopenScheduleId, setReopenScheduleId] = useState(null);
  const { user } = useAuthStore();

  const {
    inProgressWeeklySchedules,
    isLoadingInProgressWeeklySchedules,
    inProgressWeeklySchedulesError,
  } = useAdminDashboard(
    { ongoingPage },
    { searchQuery }
  );
  console.log(inProgressWeeklySchedules);
  useEffect(() => {
    setOngoingPage(1);
  }, [searchQuery]);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedWeeklySchedule, setSelectedWeeklySchedule] = useState(null);
  console.log(selectedWeeklySchedule);

  const inProgressWeeklySchedulesList = inProgressWeeklySchedules?.data?.relevantSchedules || [];
  const inProgressSchedulesTotalPages = inProgressWeeklySchedules?.data?.totalPages || 1;
  const inProgressSchedulesCurrentPage = inProgressWeeklySchedules?.data?.currentPage || 1;
  const inProgressSchedulesTotalItems = inProgressWeeklySchedules?.data?.totalCount || 0;

  // Filter schedules based on user role - staff only see schedules they're assigned to
  const filteredInProgressSchedules = user?.role === 'MIS' 
    ? inProgressWeeklySchedulesList.filter(schedule => 
        schedule.ticketRequests.some(ticket => 
          ticket?.ticketDetails?.assignedOperator?.assignedOperatorId === user?.id
        )
      )
    : inProgressWeeklySchedulesList;


  const filteredTotalItems = user?.role === 'MIS' 
    ? filteredInProgressSchedules.length 
    : inProgressSchedulesTotalItems;

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

  const handleRequestReopenSchedule = (id) => {
    setReopenScheduleId(id);
  };

  useEffect(() => {
    if (!reopenScheduleId) return;

    if (isLoadingInProgressWeeklySchedules) return;

    const inProgressList = inProgressWeeklySchedules?.data?.relevantSchedules || [];
    const refreshedInProgress = inProgressList.find(s => s._id === reopenScheduleId);

    if (refreshedInProgress) {
      setSelectedWeeklySchedule(refreshedInProgress);
      onOpen();
      setReopenScheduleId(null);
    }
  }, [reopenScheduleId, isLoadingInProgressWeeklySchedules, inProgressWeeklySchedules]);

  return (
    <Box overflow="hidden" bg="white" p={5} minH="100vh">
      <Heading as="h1" size="xl" mb={2}>
        Trip Ticket Returns
      </Heading>
      <Text color="gray.600" mb={5}>
        View ongoing schedules and create trip/return tickets for finished job orders.
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
        </Flex>
      </Flex>

      {/* Ongoing Schedules Section */}
      <Box mb={8}>
        <Flex justify="space-between" align="center" mb={4} bg={'purple.50'} p={3} borderRadius="md" borderLeftWidth="4px" borderLeftColor={'purple.500'}>
          <Heading as="h2" size="md" display="flex" alignItems="center">
            <Icon as={LuLogs} mr={2} color={'purple.500'} /> ONGOING SCHEDULES
          </Heading>
        </Flex>

        {isLoadingInProgressWeeklySchedules ? (
          <Center p={10}>
            <Spinner size="lg" color={'purple.500'} />
          </Center>
        ) : filteredInProgressSchedules.length > 0 ? (
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
                  {filteredInProgressSchedules.map((schedule) => {
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
                                    <Text>{ticket?.ticketDetails?.assignedMachineUnit?.plateNumber} - {ticket?.ticketDetails?.requestedMachineType?.equipmentType}</Text>
                                  </Flex>
                                </Flex>
                              ))}
                            </Flex>
                          )}
                        </Td>

                        <Td>
                          {schedule.ticketRequests.length === 0 ? (
                            <Text color="gray.500">No assigned operators</Text>
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
                            colorScheme='purple'
                            leftIcon={<FaEye />}
                            onClick={() => {
                              setSelectedWeeklySchedule(schedule); 
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
              No ongoing schedules found
            </Text>
            <Text fontSize="sm" color="gray.400">
              Try adjusting your search.
            </Text>
          </Center>
        )};

        <Flex justifyContent="space-between" alignItems="center" mt={4}>
          <PaginationControls
            currentPage={inProgressSchedulesCurrentPage}
            setCurrentPage={setOngoingPage}
            totalPages={inProgressSchedulesTotalPages}
            totalItems={filteredTotalItems}
            colorScheme='purple'
          />
        </Flex>
      </Box>

      <OngoingTicketPanel
        isOpen={isOpen}
        onClose={() => {
          onClose();
          setSelectedWeeklySchedule(null);
        }}
        selectedWeeklySchedule={selectedWeeklySchedule}
        onRequestReopenSchedule={handleRequestReopenSchedule}
      />
    </Box>
  );
}

export default TripTicketReturns;
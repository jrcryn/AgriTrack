import React from 'react'
import {
  Box,
  Heading,
  Text,
  Stack,
  Flex,
  Icon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Center,
  SimpleGrid,
  Tag,
  Badge,
  HStack,
  VStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
} from "@chakra-ui/react";
import {
  FaClipboardList,
  FaCalendarAlt,
  FaClock,
  FaCheckCircle,
  FaHourglass,
  FaMapMarkerAlt,
  FaUser,
  FaTractor,
} from "react-icons/fa";
import { useAdminDashboard } from '../store/adminDashboard.store';

const A_Metrics = () => {
  const {
    ticketStatusCounts,
    isLoadingTicketStatusCounts,
    ticketStatusCountsError,

    upcomingAndOngoingSchedules,
    isLoadingUpcomingAndOngoingSchedules,
    upcomingAndOngoingSchedulesError,
  } = useAdminDashboard();

  // Removed mock stats; use live data instead
  const counts = ticketStatusCounts?.data || {};
  const pendingCount = counts.pending ?? 0;
  const scheduledCount = counts.scheduled ?? 0;
  const ongoingCount = counts.ongoing ?? 0;
  const completedCount = counts.completed ?? 0;

  // Helpers
  const formatDate = (d) => {
    if (!d) return '—';
    const dt = new Date(d);
    return dt.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
  };
  const getStatusColor = (status) => {
    switch (status) {
      case "Scheduled":
      case "Planned":
        return "blue";
      case "In Progress":
        return "orange";
      case "Completed":
        return "green";
      default:
        return "gray";
    }
  };

  // Data for sections
  const upcoming = upcomingAndOngoingSchedules?.data?.upcoming ?? [];
  const ongoing = upcomingAndOngoingSchedules?.data?.ongoing ?? [];

  return (
    <Box overflow="hidden" bg="white" p={5} minH="100vh">
      <Heading as="h1" size="xl" mb={2} color="black">
        REQUESTS OVERVIEW
      </Heading>
      <Text color="gray.600" mb={5}>
        Overview of ticket requests from pending to ongoing.
      </Text>

      {/* Metrics Overview Section */}
      <Box mb={8}>
        <Flex
          justify="space-between"
          align="center"
          mb={4}
          bg="blue.50"
          p={3}
          borderRadius="md"
          borderLeftWidth="4px"
          borderLeftColor="blue.500"
        >
          <Heading as="h2" size="md" display="flex" alignItems="center">
            <Icon as={FaClipboardList} mr={2} color="blue.600" /> REQUEST COUNT
          </Heading>
        </Flex>

        {/* Error state */}
        {ticketStatusCountsError && (
          <Box mb={3} p={3} bg="red.50" borderWidth="1px" borderColor="red.200" borderRadius="md">
            <Text color="red.600" fontSize="sm">
              Failed to load ticket status counts: {ticketStatusCountsError?.message || 'Unknown error'}
            </Text>
          </Box>
        )}

        <Stack direction={{ base: "column", md: "row" }} spacing={4} w="full">
          {/* Total Pending Tickets */}
          <Box
            p={5}
            flex={1}
            borderRadius="md"
            boxShadow="sm"
            bg="white"
            borderWidth="1px"
            borderColor="gray.200"
          >
            <Stat>
              <StatLabel fontSize="md" display="flex" alignItems="center">
                <Icon as={FaClipboardList} mr={2} color="orange.500" /> TOTAL PENDING
              </StatLabel>
              {isLoadingTicketStatusCounts ? (
                <Center h="65px">
                  <Spinner size="lg" thickness="3px" color="orange.500" />
                </Center>
              ) : (
                <StatNumber fontSize="4xl">{pendingCount}</StatNumber>
              )}
              <StatHelpText>Awaiting assignment</StatHelpText>
            </Stat>
          </Box>

          {/* Scheduled Jobs */}
          <Box
            p={5}
            flex={1}
            borderRadius="md"
            boxShadow="sm"
            bg="white"
            borderWidth="1px"
            borderColor="gray.200"
          >
            <Stat>
              <StatLabel fontSize="md" display="flex" alignItems="center">
                <Icon as={FaCheckCircle} mr={2} color="green.500" /> TOTAL SCHEDULED
              </StatLabel>
              {isLoadingTicketStatusCounts ? (
                <Center h="65px">
                  <Spinner size="lg" thickness="3px" color="green.500" />
                </Center>
              ) : (
                <StatNumber fontSize="4xl">{scheduledCount}</StatNumber>
              )}
              <StatHelpText>Upcoming schedules</StatHelpText>
            </Stat>
          </Box>

          {/* Ongoing Jobs */}
          <Box
            p={5}
            flex={1}
            borderRadius="md"
            boxShadow="sm"
            bg="white"
            borderWidth="1px"
            borderColor="gray.200"
          >
            <Stat>
              <StatLabel fontSize="md" display="flex" alignItems="center">
                <Icon as={FaHourglass} mr={2} color="purple.500" /> TOTAL ONGOING
              </StatLabel>
              {isLoadingTicketStatusCounts ? (
                <Center h="65px">
                  <Spinner size="lg" thickness="3px" color="purple.500" />
                </Center>
              ) : (
                <StatNumber fontSize="4xl">{ongoingCount}</StatNumber>
              )}
              <StatHelpText>Currently active</StatHelpText>
            </Stat>
          </Box>

          {/* Completed */}
          <Box
            p={5}
            flex={1}
            borderRadius="md"
            boxShadow="sm"
            bg="white"
            borderWidth="1px"
            borderColor="gray.200"
          >
            <Stat>
              <StatLabel fontSize="md" display="flex" alignItems="center">
                <Icon as={FaClock} mr={2} color="green.500" /> COMPLETED
              </StatLabel>
              {isLoadingTicketStatusCounts ? (
                <Center h="65px">
                  <Spinner size="lg" thickness="3px" color="green.500" />
                </Center>
              ) : (
                <StatNumber fontSize="4xl">{completedCount}</StatNumber>
              )}
              <StatHelpText>Finished jobs</StatHelpText>
            </Stat>
          </Box>
        </Stack>
      </Box>

      {/* Upcoming and Active Reservations Section */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={4}>
        {/* Upcoming Schedules */}
        <Box>
          <Flex
            justify="space-between"
            align="center"
            mb={4}
            bg="blue.50"
            p={3}
            borderRadius="md"
            borderLeftWidth="4px"
            borderLeftColor="blue.500"
          >
            <Heading as="h2" size="md" display="flex" alignItems="center">
              <Icon as={FaCalendarAlt} mr={2} color="blue.600" /> UPCOMING SCHEDULES
            </Heading>
          </Flex>

          {upcomingAndOngoingSchedulesError && (
            <Box mb={3} p={3} bg="red.50" borderWidth="1px" borderColor="red.200" borderRadius="md">
              <Text color="red.600" fontSize="xs">
                Failed to load schedules: {upcomingAndOngoingSchedulesError?.message || 'Unknown error'}
              </Text>
            </Box>
          )}

          {isLoadingUpcomingAndOngoingSchedules ? (
            <Center h="200px">
              <Spinner size="lg" color="blue.500" />
            </Center>
          ) : upcoming.length === 0 ? (
            <Center h="200px">
              <Text color="gray.500" fontSize="xs">No upcoming schedules</Text>
            </Center>
          ) : (
            <Stack spacing={3}>
              {upcoming.map((schedule) => (
                <Box
                  key={schedule._id}
                  p={4}
                  bg="white"
                  borderWidth="1px"
                  borderColor="gray.200"
                  borderRadius="md"
                  boxShadow="sm"
                  _hover={{ boxShadow: "md", borderColor: "blue.300" }}
                  transition="all 0.2s"
                >
                  <VStack align="stretch" spacing={3}>
                    <Flex justify="space-between" align="center">
                      <HStack spacing={2}>
                        <Icon as={FaCalendarAlt} color="blue.500" />
                        <Text fontWeight="bold" fontSize="xs" color="blue.600">
                          {formatDate(schedule.weekStart)} — {formatDate(schedule.weekEnd)}
                        </Text>
                        <Badge colorScheme="blue" fontSize="xs">{schedule.refNumber}</Badge>
                      </HStack>
                      <Tag colorScheme={getStatusColor(schedule.status)} size="sm">
                        {schedule.status}
                      </Tag>
                    </Flex>

                    <Table size="sm" variant="simple">
                      <Thead>
                        <Tr>
                          <Th fontSize="xs">Date</Th>
                          <Th fontSize="xs">Location</Th>
                          <Th fontSize="xs">Farmer</Th>
                          <Th fontSize="xs">Machine Unit</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {(schedule.ticketRequests || []).map((tr) => {
                          const td = tr.ticketDetails;
                          const ed = tr.extensionDetails;
                          const barangay = td?.barangay || '—';
                          const farmer = td?.requestorFarmer
                            ? `${td.requestorFarmer.surname}, ${td.requestorFarmer.first_name}${td.requestorFarmer.middle_name ? ' ' + td.requestorFarmer.middle_name : ''}`
                            : '—';
                          // Compose "{unitNumber} - {equipmentType}"
                          const unitNumber = td?.assignedMachineUnit?.unitNumber ?? ed?.assignedMachineUnit?.unitNumber;
                          const equipmentType = td?.requestedMachineType?.equipmentType ?? ed?.requestedMachineType?.equipmentType;
                          const muLabel = unitNumber && equipmentType
                            ? `${unitNumber} - ${equipmentType}`
                            : (unitNumber || equipmentType || '—');

                          return (
                            <Tr key={(tr.ticketRequestId || tr.extensionRequestId) + String(tr.assignedDate)}>
                              <Td fontSize="xs">{formatDate(tr.assignedDate)}</Td>
                              <Td fontSize="xs">{barangay}</Td>
                              <Td fontSize="xs">{farmer}</Td>
                              <Td fontSize="xs">{muLabel}</Td>
                            </Tr>
                          );
                        })}
                      </Tbody>
                    </Table>
                  </VStack>
                </Box>
              ))}
            </Stack>
          )}
        </Box>

        {/* Ongoing Schedules */}
        <Box>
          <Flex
            justify="space-between"
            align="center"
            mb={4}
            bg="purple.50"
            p={3}
            borderRadius="md"
            borderLeftWidth="4px"
            borderLeftColor="purple.500"
          >
            <Heading as="h2" size="md" display="flex" alignItems="center">
              <Icon as={FaClock} mr={2} color="purple.600" /> ONGOING SCHEDULES
            </Heading>
          </Flex>

          {isLoadingUpcomingAndOngoingSchedules ? (
            <Center h="200px">
              <Spinner size="lg" color="purple.500" />
            </Center>
          ) : ongoing.length === 0 ? (
            <Center h="200px">
              <Text color="gray.500" fontSize="xs">No active schedules</Text>
            </Center>
          ) : (
            <Stack spacing={3}>
              {ongoing.map((schedule) => (
                <Box
                  key={schedule._id}
                  p={4}
                  bg="white"
                  borderWidth="1px"
                  borderColor="gray.200"
                  borderRadius="md"
                  boxShadow="sm"
                  _hover={{ boxShadow: "md", borderColor: "green.300" }}
                  transition="all 0.2s"
                >
                  <VStack align="stretch" spacing={3}>
                    <Flex justify="space-between" align="center">
                      <HStack spacing={2}>
                        <Icon as={FaCalendarAlt} color="green.500" />
                        <Text fontWeight="bold" fontSize="xs" color="green.600">
                          {formatDate(schedule.weekStart)} — {formatDate(schedule.weekEnd)}
                        </Text>
                        <Badge colorScheme="green" fontSize="xs">{schedule.refNumber}</Badge>
                      </HStack>
                      <Tag colorScheme={getStatusColor(schedule.status)} size="sm">
                        {schedule.status}
                      </Tag>
                    </Flex>

                    <Table size="sm" variant="simple">
                      <Thead>
                        <Tr>
                          <Th fontSize="xs">Date</Th>
                          <Th fontSize="xs">Location</Th>
                          <Th fontSize="xs">Farmer</Th>
                          <Th fontSize="xs">Machine Unit</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {(schedule.ticketRequests || []).map((tr) => {
                          const td = tr.ticketDetails;
                          const ed = tr.extensionDetails;
                          const barangay = td?.barangay || '—';
                          const farmer = td?.requestorFarmer
                            ? `${td.requestorFarmer.surname}, ${td.requestorFarmer.first_name}${td.requestorFarmer.middle_name ? ' ' + td.requestorFarmer.middle_name : ''}`
                            : '—';
                          // Compose "{unitNumber} - {equipmentType}"
                          const unitNumber = td?.assignedMachineUnit?.unitNumber ?? ed?.assignedMachineUnit?.unitNumber;
                          const equipmentType = td?.requestedMachineType?.equipmentType ?? ed?.requestedMachineType?.equipmentType;
                          const muLabel = unitNumber && equipmentType
                            ? `${unitNumber} - ${equipmentType}`
                            : (unitNumber || equipmentType || '—');

                          return (
                            <Tr key={(tr.ticketRequestId || tr.extensionRequestId) + String(tr.assignedDate)}>
                              <Td fontSize="xs">{formatDate(tr.assignedDate)}</Td>
                              <Td fontSize="xs">{barangay}</Td>
                              <Td fontSize="xs">{farmer}</Td>
                              <Td fontSize="xs">{muLabel}</Td>
                            </Tr>
                          );
                        })}
                      </Tbody>
                    </Table>
                  </VStack>
                </Box>
              ))}
            </Stack>
          )}
        </Box>
      </SimpleGrid>
    </Box>
  );
};

export default A_Metrics;
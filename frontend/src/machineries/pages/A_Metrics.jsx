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
    <Box overflow="hidden" bg="white" p={{ base: 3, md: 5 }} minH="100vh">
      <Heading 
        as="h1" 
        size={{ base: "lg", md: "xl" }} 
        mb={2} 
        color="black"
      >
        REQUESTS OVERVIEW
      </Heading>
      <Text 
        color="gray.600" 
        mb={{ base: 4, md: 5 }}
        fontSize={{ base: "sm", md: "md" }}
      >
        Overview of ticket requests from pending to ongoing.
      </Text>

      {/* Metrics Overview Section */}
      <Box mb={8}>
        <Flex
          justify="space-between"
          align="center"
          mb={4}
          bg="blue.50"
          p={{ base: 2, md: 3 }}
          borderRadius="md"
          borderLeftWidth="4px"
          borderLeftColor="blue.500"
        >
          <Heading 
            as="h2" 
            size={{ base: "sm", md: "md" }} 
            display="flex" 
            alignItems="center"
            flexWrap="wrap"
          >
            <Icon as={FaClipboardList} mr={2} color="blue.600" /> REQUEST COUNT
          </Heading>
        </Flex>

        {/* Error state */}
        {ticketStatusCountsError && (
          <Box mb={3} p={{ base: 2, md: 3 }} bg="red.50" borderWidth="1px" borderColor="red.200" borderRadius="md">
            <Text color="red.600" fontSize={{ base: "xs", md: "sm" }}>
              Failed to load ticket status counts: {ticketStatusCountsError?.message || 'Unknown error'}
            </Text>
          </Box>
        )}

        <SimpleGrid 
          columns={{ base: 1, sm: 2, lg: 4 }} 
          spacing={{ base: 3, md: 4 }} 
          w="full"
        >
          {/* Total Pending Tickets */}
          <Box
            p={{ base: 4, md: 5 }}
            borderRadius="md"
            boxShadow="sm"
            bg="white"
            borderWidth="1px"
            borderColor="gray.200"
          >
            <Stat>
              <StatLabel 
                fontSize={{ base: "sm", md: "md" }} 
                display="flex" 
                alignItems="center"
                mb={{ base: 2, md: 3 }}
              >
                <Icon as={FaClipboardList} mr={2} color="orange.500" /> 
                <Text as="span" noOfLines={1}>TOTAL PENDING</Text>
              </StatLabel>
              {isLoadingTicketStatusCounts ? (
                <Center h={{ base: "50px", md: "65px" }}>
                  <Spinner size={{ base: "md", md: "lg" }} thickness="3px" color="orange.500" />
                </Center>
              ) : (
                <StatNumber 
                  fontSize={{ base: "2xl", sm: "3xl", md: "4xl" }}
                  lineHeight="shorter"
                >
                  {pendingCount}
                </StatNumber>
              )}
              <StatHelpText fontSize={{ base: "xs", md: "sm" }} mt={{ base: 1, md: 2 }}>
                Awaiting assignment
              </StatHelpText>
            </Stat>
          </Box>

          {/* Scheduled Jobs */}
          <Box
            p={{ base: 4, md: 5 }}
            borderRadius="md"
            boxShadow="sm"
            bg="white"
            borderWidth="1px"
            borderColor="gray.200"
          >
            <Stat>
              <StatLabel 
                fontSize={{ base: "sm", md: "md" }} 
                display="flex" 
                alignItems="center"
                mb={{ base: 2, md: 3 }}
              >
                <Icon as={FaCheckCircle} mr={2} color="green.500" /> 
                <Text as="span" noOfLines={1}>TOTAL SCHEDULED</Text>
              </StatLabel>
              {isLoadingTicketStatusCounts ? (
                <Center h={{ base: "50px", md: "65px" }}>
                  <Spinner size={{ base: "md", md: "lg" }} thickness="3px" color="green.500" />
                </Center>
              ) : (
                <StatNumber 
                  fontSize={{ base: "2xl", sm: "3xl", md: "4xl" }}
                  lineHeight="shorter"
                >
                  {scheduledCount}
                </StatNumber>
              )}
              <StatHelpText fontSize={{ base: "xs", md: "sm" }} mt={{ base: 1, md: 2 }}>
                Upcoming schedules
              </StatHelpText>
            </Stat>
          </Box>

          {/* Ongoing Jobs */}
          <Box
            p={{ base: 4, md: 5 }}
            borderRadius="md"
            boxShadow="sm"
            bg="white"
            borderWidth="1px"
            borderColor="gray.200"
          >
            <Stat>
              <StatLabel 
                fontSize={{ base: "sm", md: "md" }} 
                display="flex" 
                alignItems="center"
                mb={{ base: 2, md: 3 }}
              >
                <Icon as={FaHourglass} mr={2} color="purple.500" /> 
                <Text as="span" noOfLines={1}>TOTAL ONGOING</Text>
              </StatLabel>
              {isLoadingTicketStatusCounts ? (
                <Center h={{ base: "50px", md: "65px" }}>
                  <Spinner size={{ base: "md", md: "lg" }} thickness="3px" color="purple.500" />
                </Center>
              ) : (
                <StatNumber 
                  fontSize={{ base: "2xl", sm: "3xl", md: "4xl" }}
                  lineHeight="shorter"
                >
                  {ongoingCount}
                </StatNumber>
              )}
              <StatHelpText fontSize={{ base: "xs", md: "sm" }} mt={{ base: 1, md: 2 }}>
                Currently active
              </StatHelpText>
            </Stat>
          </Box>

          {/* Completed */}
          <Box
            p={{ base: 4, md: 5 }}
            borderRadius="md"
            boxShadow="sm"
            bg="white"
            borderWidth="1px"
            borderColor="gray.200"
          >
            <Stat>
              <StatLabel 
                fontSize={{ base: "sm", md: "md" }} 
                display="flex" 
                alignItems="center"
                mb={{ base: 2, md: 3 }}
              >
                <Icon as={FaClock} mr={2} color="green.500" /> 
                <Text as="span" noOfLines={1}>COMPLETED</Text>
              </StatLabel>
              {isLoadingTicketStatusCounts ? (
                <Center h={{ base: "50px", md: "65px" }}>
                  <Spinner size={{ base: "md", md: "lg" }} thickness="3px" color="green.500" />
                </Center>
              ) : (
                <StatNumber 
                  fontSize={{ base: "2xl", sm: "3xl", md: "4xl" }}
                  lineHeight="shorter"
                >
                  {completedCount}
                </StatNumber>
              )}
              <StatHelpText fontSize={{ base: "xs", md: "sm" }} mt={{ base: 1, md: 2 }}>
                Finished jobs
              </StatHelpText>
            </Stat>
          </Box>
        </SimpleGrid>
      </Box>

      {/* Upcoming and Active Reservations Section */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 4, md: 6 }} mb={4}>
        {/* Upcoming Schedules */}
        <Box>
          <Flex
            justify="space-between"
            align="center"
            mb={4}
            bg="blue.50"
            p={{ base: 2, md: 3 }}
            borderRadius="md"
            borderLeftWidth="4px"
            borderLeftColor="blue.500"
          >
            <Heading 
              as="h2" 
              size={{ base: "sm", md: "md" }} 
              display="flex" 
              alignItems="center"
              flexWrap="wrap"
            >
              <Icon as={FaCalendarAlt} mr={2} color="blue.600" /> UPCOMING SCHEDULES
            </Heading>
          </Flex>

          {upcomingAndOngoingSchedulesError && (
            <Box mb={3} p={{ base: 2, md: 3 }} bg="red.50" borderWidth="1px" borderColor="red.200" borderRadius="md">
              <Text color="red.600" fontSize={{ base: "xs", md: "sm" }}>
                Failed to load schedules: {upcomingAndOngoingSchedulesError?.message || 'Unknown error'}
              </Text>
            </Box>
          )}

          {isLoadingUpcomingAndOngoingSchedules ? (
            <Center h={{ base: "150px", md: "200px" }}>
              <Spinner size={{ base: "md", md: "lg" }} color="blue.500" />
            </Center>
          ) : upcoming.length === 0 ? (
            <Center h={{ base: "150px", md: "200px" }}>
              <Text color="gray.500" fontSize={{ base: "xs", md: "sm" }}>No upcoming schedules</Text>
            </Center>
          ) : (
            <Stack spacing={{ base: 2, md: 3 }}>
              {upcoming.map((schedule) => (
                <Box
                  key={schedule._id}
                  p={{ base: 3, md: 4 }}
                  bg="white"
                  borderWidth="1px"
                  borderColor="gray.200"
                  borderRadius="md"
                  boxShadow="sm"
                >
                  <VStack align="stretch" spacing={{ base: 2, md: 3 }}>
                    <Flex 
                      justify="space-between" 
                      align="center"
                      direction={{ base: "column", sm: "row" }}
                      gap={{ base: 2, sm: 0 }}
                    >
                      <HStack spacing={2} flexWrap="wrap">
                        <Icon as={FaCalendarAlt} color="blue.500" boxSize={{ base: 3, md: 4 }} />
                        <Text 
                          fontWeight="bold" 
                          fontSize={{ base: "xs", md: "sm" }} 
                          color="blue.600"
                          noOfLines={1}
                        >
                          {formatDate(schedule.weekStart)} — {formatDate(schedule.weekEnd)}
                        </Text>
                        <Badge colorScheme="blue" fontSize={{ base: "2xs", md: "xs" }}>
                          {schedule.refNumber}
                        </Badge>
                      </HStack>
                      <Tag 
                        colorScheme={getStatusColor(schedule.status)} 
                        size={{ base: "xs", md: "sm" }}
                        fontSize={{ base: "2xs", md: "xs" }}
                      >
                        {schedule.status}
                      </Tag>
                    </Flex>

                    <Box overflowX="auto">
                      <Table size={{ base: "xs", md: "sm" }} variant="simple">
                        <Thead>
                          <Tr>
                            <Th fontSize={{ base: "2xs", md: "xs" }} py={{ base: 1, md: 2 }}>
                              Date
                            </Th>
                            <Th fontSize={{ base: "2xs", md: "xs" }} py={{ base: 1, md: 2 }}>
                              Location
                            </Th>
                            <Th fontSize={{ base: "2xs", md: "xs" }} py={{ base: 1, md: 2 }}>
                              Farmer
                            </Th>
                            <Th fontSize={{ base: "2xs", md: "xs" }} py={{ base: 1, md: 2 }}>
                              Machine Unit
                            </Th>
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
                                <Td fontSize={{ base: "2xs", md: "xs" }} py={{ base: 1, md: 2 }}>
                                  {formatDate(tr.assignedDate)}
                                </Td>
                                <Td fontSize={{ base: "2xs", md: "xs" }} py={{ base: 1, md: 2 }}>
                                  {barangay}
                                </Td>
                                <Td fontSize={{ base: "2xs", md: "xs" }} py={{ base: 1, md: 2 }}>
                                  {farmer}
                                </Td>
                                <Td fontSize={{ base: "2xs", md: "xs" }} py={{ base: 1, md: 2 }}>
                                  {muLabel}
                                </Td>
                              </Tr>
                            );
                          })}
                        </Tbody>
                      </Table>
                    </Box>
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
            p={{ base: 2, md: 3 }}
            borderRadius="md"
            borderLeftWidth="4px"
            borderLeftColor="purple.500"
          >
            <Heading 
              as="h2" 
              size={{ base: "sm", md: "md" }} 
              display="flex" 
              alignItems="center"
              flexWrap="wrap"
            >
              <Icon as={FaClock} mr={2} color="purple.600" /> ONGOING SCHEDULES
            </Heading>
          </Flex>

          {isLoadingUpcomingAndOngoingSchedules ? (
            <Center h={{ base: "150px", md: "200px" }}>
              <Spinner size={{ base: "md", md: "lg" }} color="purple.500" />
            </Center>
          ) : ongoing.length === 0 ? (
            <Center h={{ base: "150px", md: "200px" }}>
              <Text color="gray.500" fontSize={{ base: "xs", md: "sm" }}>No active schedules</Text>
            </Center>
          ) : (
            <Stack spacing={{ base: 2, md: 3 }}>
              {ongoing.map((schedule) => (
                <Box
                  key={schedule._id}
                  p={{ base: 3, md: 4 }}
                  bg="white"
                  borderWidth="1px"
                  borderColor="gray.200"
                  borderRadius="md"
                  boxShadow="sm"
                >
                  <VStack align="stretch" spacing={{ base: 2, md: 3 }}>
                    <Flex 
                      justify="space-between" 
                      align="center"
                      direction={{ base: "column", sm: "row" }}
                      gap={{ base: 2, sm: 0 }}
                    >
                      <HStack spacing={2} flexWrap="wrap">
                        <Icon as={FaCalendarAlt} color="green.500" boxSize={{ base: 3, md: 4 }} />
                        <Text 
                          fontWeight="bold" 
                          fontSize={{ base: "xs", md: "sm" }} 
                          color="green.600"
                          noOfLines={1}
                        >
                          {formatDate(schedule.weekStart)} — {formatDate(schedule.weekEnd)}
                        </Text>
                        <Badge colorScheme="green" fontSize={{ base: "2xs", md: "xs" }}>
                          {schedule.refNumber}
                        </Badge>
                      </HStack>
                      <Tag 
                        colorScheme={getStatusColor(schedule.status)} 
                        size={{ base: "xs", md: "sm" }}
                        fontSize={{ base: "2xs", md: "xs" }}
                      >
                        {schedule.status}
                      </Tag>
                    </Flex>

                    <Box overflowX="auto">
                      <Table size={{ base: "xs", md: "sm" }} variant="simple">
                        <Thead>
                          <Tr>
                            <Th fontSize={{ base: "2xs", md: "xs" }} py={{ base: 1, md: 2 }}>
                              Date
                            </Th>
                            <Th fontSize={{ base: "2xs", md: "xs" }} py={{ base: 1, md: 2 }}>
                              Location
                            </Th>
                            <Th fontSize={{ base: "2xs", md: "xs" }} py={{ base: 1, md: 2 }}>
                              Farmer
                            </Th>
                            <Th fontSize={{ base: "2xs", md: "xs" }} py={{ base: 1, md: 2 }}>
                              Machine Unit
                            </Th>
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
                                <Td fontSize={{ base: "2xs", md: "xs" }} py={{ base: 1, md: 2 }}>
                                  {formatDate(tr.assignedDate)}
                                </Td>
                                <Td fontSize={{ base: "2xs", md: "xs" }} py={{ base: 1, md: 2 }}>
                                  {barangay}
                                </Td>
                                <Td fontSize={{ base: "2xs", md: "xs" }} py={{ base: 1, md: 2 }}>
                                  {farmer}
                                </Td>
                                <Td fontSize={{ base: "2xs", md: "xs" }} py={{ base: 1, md: 2 }}>
                                  {muLabel}
                                </Td>
                              </Tr>
                            );
                          })}
                        </Tbody>
                      </Table>
                    </Box>
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
import React, { useState, useEffect, useMemo } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  Box, VStack, Text, Heading, Divider, SimpleGrid, Badge, Flex, Button, Tabs, TabList, TabPanels, Tab, TabPanel,
  FormControl, FormLabel, Input, Select, useToast, Table, Thead, Tbody, Tr, Th, Td,
  Switch, NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper,
  Tooltip, Icon, HStack, Stack, useDisclosure, InputGroup, InputLeftElement
} from '@chakra-ui/react';

import { CalendarIcon, CheckCircleIcon, CloseIcon, InfoIcon, WarningIcon } from "@chakra-ui/icons";
import { FaCog, FaTools, FaUser, FaCalendarAlt } from "react-icons/fa";
import { IoIosRemoveCircle } from "react-icons/io";
import { GiFarmTractor } from "react-icons/gi";
import { GoAlertFill } from "react-icons/go";

import { useAdminDashboard } from '../machineries/store/adminDashboard.store.js';
import { useAuthStore } from '../auth/store/authStore.js';
import { useQueryClient } from '@tanstack/react-query';
import AddTicketPanel from './addTicketPanel.jsx';
import { assign } from 'lodash';

// Status badge styles
const statusStyles = {
  "Pending": { color: "yellow", icon: <InfoIcon /> },
  "Scheduled": { color: "blue", icon: <CalendarIcon /> },
  "Ongoing": { color: "green", icon: <CheckCircleIcon /> },
  "Declined": { color: "red", icon: <CloseIcon /> },
};

const TicketRequestPanel = ({
  isOpen,
  onClose,
  selectedTickets = [],
  selectedWeeklySchedule = null,
  pageType, 
  isViewingDetails,
  selectedTicketsSetter,
  width,
  height,
  onRequestReopenSchedule
}) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  // Derive boolean flags from pageType
  const isPendingPage = pageType === 'pending';
  const isScheduledPage = pageType === 'scheduled';
  const isOngoingPage = pageType === 'ongoing';
  // Schedule creation state
  const [scheduleData, setScheduleData] = useState({
    weekStart: '',
    weekEnd: '',
    tickets: []
  });

  const [ticketUpdateData, setTicketUpdateData] = useState({
    scheduleId: null,
    tickets: []
  });

  // Add state for initial ticket data to detect changes
  const [initialTicketData, setInitialTicketData] = useState([]);

  const {
    operatorsList,
    isLoadingOperatorsList,
    operatorsListError,
    
    createWeeklySchedule,
    isCreatingWeeklySchedule,

    removeFromSchedule,
    isRemovingFromSchedule,
    
    moveToSchedule,
    isMovingToSchedule,

    getMachineryUnitsForDropDownByType,
    getOperatorsListByMachineType,

    declineTicketRequests,
    isDecliningTicketRequests,

    updateWeeklySchedule,
    isUpdatingWeeklySchedule,
    undeclineTicketRequest,           
    isUndecliningTicketRequest,
    
    occupiedDatesForScheduling,
    isLoadingOccupiedDatesForScheduling,
    occupiedDatesForSchedulingError,
    operatorAssignedNumbers,
    isLoadingOperatorAssignedNumbers,
    operatorAssignedNumbersError
  } = useAdminDashboard();

  const [selectedTicketForRemoval, setSelectedTicketForRemoval] = useState(null);
  const [declineReason, setDeclineReason] = useState('');
  const [unitsByType, setUnitsByType] = useState({}); // Map of units per machineryTypeId
  const [operatorsByType, setOperatorsByType] = useState({}); // Map of operators per machineryTypeId


  const { isOpen: isOpenRemoveModal, onOpen: onOpenRemoveModal, onClose: onCloseRemoveModal } = useDisclosure();

  // add tickets modal disclosure
  const { isOpen: isOpenAddModal, onOpen: onOpenAddModal, onClose: onCloseAddModal } = useDisclosure();

  // Initialize tickets for scheduling
  useEffect(() => {
    if (selectedTickets.length > 0 && isOpen) {
      // Initialize the schedule data with selected tickets
      const initializedTickets = selectedTickets.map(ticket => ({
        ticketId: ticket._id,
        assignedDate: '',
        assignedOperatorId: '',
        assignedMachineUnitId: ''
      }));
      
      setScheduleData(prev => ({
        ...prev,
        tickets: initializedTickets
      }));
    }
  }, [selectedTickets, isOpen]);

  // Fetch units for each unique requestedMachineType in scheduled tickets
  useEffect(() => {
    if (!isOpen || !selectedWeeklySchedule?.ticketRequests) return;

    const uniqueTypeIds = Array.from(
      new Set(
        selectedWeeklySchedule.ticketRequests
          .map(tr => tr.ticketDetails?.requestedMachineType?.requestedMachineTypeId)
          .filter(Boolean)
      )
    );

    uniqueTypeIds.forEach(async (typeId) => {
      if (unitsByType[typeId]) return;
      try {
        const res = await getMachineryUnitsForDropDownByType(typeId);
        setUnitsByType(prev => ({ ...prev, [typeId]: res?.data || [] }));
      } catch (e) {
      }
    });
  }, [selectedWeeklySchedule, isOpen]);

  //initialize scheduled tickets for updating 
  useEffect(() => {
    if (selectedWeeklySchedule && isOpen) {
      // Initialize the schedule update data with the selected schedule's tickets
      const initializedTickets = selectedWeeklySchedule.ticketRequests.map(ticket => ({
        ticketId: ticket.ticketRequestId,
        assignedDate: ticket.assignedDate ? new Date(ticket.assignedDate).toISOString().split('T')[0] : '', // Format to YYYY-MM-DD for date input
        assignedOperatorId: ticket.ticketDetails?.assignedOperator?.assignedOperatorId || '', 
        assignedMachineUnitId: ticket.ticketDetails?.assignedMachineUnit?.assignedMachineUnitId || ''
      }));
      
      setTicketUpdateData({
        scheduleId: selectedWeeklySchedule._id,
        tickets: initializedTickets
      });

      // Set initial data for change detection
      setInitialTicketData(initializedTickets);
    }
  }, [selectedWeeklySchedule, isOpen]);

  // Fetch units for each unique requestedMachineType when selection changes
  useEffect(() => {
    if (!isOpen || selectedTickets.length === 0) return;

    const uniqueTypeIds = Array.from(
      new Set(
        selectedTickets
          .map(t => t?.requestedMachineType?.requestedMachineTypeId)
          .filter(Boolean)
      )
    );

    uniqueTypeIds.forEach(async (typeId) => {
      if (unitsByType[typeId]) return;
      try {
        const res = await getMachineryUnitsForDropDownByType(typeId);
        setUnitsByType(prev => ({ ...prev, [typeId]: res?.data || [] }));
      } catch (e) {
      }
    });
  }, [selectedTickets, isOpen]);

  // Fetch operators for each unique requestedMachineType when selection changes (for pending page)
  useEffect(() => {
    if (!isOpen || selectedTickets.length === 0 || !isPendingPage) return;

    const uniqueTypeIds = Array.from(
      new Set(
        selectedTickets
          .map(t => t?.requestedMachineType?.requestedMachineTypeId)
          .filter(Boolean)
      )
    );

    uniqueTypeIds.forEach(async (typeId) => {
      if (operatorsByType[typeId]) return;
      try {
        const res = await getOperatorsListByMachineType(typeId);
        setOperatorsByType(prev => ({ ...prev, [typeId]: res?.data || [] }));
      } catch (e) {
      }
    });
  }, [selectedTickets, isOpen, isPendingPage]); 

  // Update a specific ticket in the schedule, pag gagawa ng schedule yung
  const updateTicketInSchedule = (ticketId, field, value) => {
    setScheduleData(prev => ({
      ...prev,
      tickets: prev.tickets.map(ticket => 
        ticket.ticketId === ticketId ? { ...ticket, [field]: value } : ticket
      )
    }));
  };

  const updateTicketInUpdateData = (ticketId, field, value) => {
    setTicketUpdateData(prev => ({
      ...prev,
      tickets: prev.tickets.map(ticket => 
        ticket.ticketId === ticketId ? { ...ticket, [field]: value } : ticket
      )
    }));
  };

  const handleCreateSchedule = async () => {
    // Validate required fields
    if (!scheduleData.weekStart || !scheduleData.weekEnd) {
      toast({
        title: "Missing fields",
        description: "Please select start and end dates for the week",
        status: "warning",
        duration: 4000,
        isClosable: true
      });
      return;
    }

    // Make sure all tickets have assigned dates, operators, and machines
    const incompleteTickets = scheduleData.tickets.filter(
      ticket => !ticket.assignedDate || !ticket.assignedOperatorId || !ticket.assignedMachineUnitId
    );
    
    if (incompleteTickets.length > 0) {
      toast({
        title: "Incomplete ticket assignments",
        description: `${incompleteTickets.length} ticket(s) are missing date, operator, or machinery assignments`,
        status: "warning",
        duration: 4000,
        isClosable: true
      });
      return;
    }

    try {
      const response = await createWeeklySchedule(scheduleData);
      
      toast({
        title: "Success",
        description: response.message || "Weekly schedule created successfully",
        status: "success",
        duration: 5000,
        isClosable: true
      });
      
      // Reset form and close modal
      setScheduleData({
        weekStart: '',
        weekEnd: '',
        tickets: []
      });
      
      onClose();
      
      // Invalidate queries to refresh data
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['inProgressWeeklySchedules'] }),
        queryClient.invalidateQueries({ queryKey: ['plannedWeeklySchedules'] }),
        queryClient.invalidateQueries({ queryKey: ['pendingTicketRequests'] })
      ]);
      
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create weekly schedule",
        status: "error",
        duration: 5000,
        isClosable: true
      });
    }
  };

  const handleRemoveFromSchedule = async (ticketRequestId) => {

    if (user?.role !== 'MIM') {
      toast({
        title: "Permission denied",
        description: "You do not have permission to update the schedule.",
        status: "warning",
        duration: 4000,
        isClosable: true
      });
      return;
    }

    try {
      const response = await removeFromSchedule(ticketRequestId);
      
      toast({
        title: "Success",
        description: response.message || "Ticket removed from schedule",
        status: "success",
        duration: 5000,
        isClosable: true
      });

      // Close modal and refresh data
      setSelectedTicketForRemoval(null);
      onCloseRemoveModal();
      onClose();
      
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['plannedWeeklySchedules'] }),
        queryClient.invalidateQueries({ queryKey: ['inProgressWeeklySchedules'] }),
      ]);

      // Ask parent to reopen with fresh data
      onRequestReopenSchedule?.(selectedWeeklySchedule?._id);
      
      
    } catch (error) {
      setSelectedTicketForRemoval(null);
      onCloseRemoveModal();
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to remove ticket from schedule",
        status: "error",
        duration: 5000,
        isClosable: true
      });
    }
  };

  
  const handleUpdateSchedule = async () => {

    if (user?.role !== 'MIM') {
      toast({
        title: "Permission denied",
        description: "You do not have permission to update the schedule.",
        status: "warning",
        duration: 4000,
        isClosable: true
      });
      return;
    }
    // Filter to only changed tickets
    const changedTickets = ticketUpdateData.tickets.filter((current, index) => {
      const initial = initialTicketData[index];
      if (!initial) return true; // If no initial data, consider it changed
      
      return (
        current.assignedDate !== initial.assignedDate ||
        current.assignedOperatorId !== initial.assignedOperatorId ||
        current.assignedMachineUnitId !== initial.assignedMachineUnitId
      );
    });

    if (changedTickets.length === 0) {
      toast({
        title: "No changes detected",
        description: "Please make changes before updating.",
        status: "info",
        duration: 4000,
        isClosable: true
      });
      return;
    }

    // Validate only changed tickets - all fields must be filled
    const incompleteTickets = changedTickets.filter(
      ticket => !ticket.assignedDate || !ticket.assignedOperatorId || !ticket.assignedMachineUnitId
    );
    
    if (incompleteTickets.length > 0) {
      toast({
        title: "Incomplete ticket assignments",
        description: `${incompleteTickets.length} ticket(s) are missing date, operator, or machinery assignments.`,
        status: "warning",
        duration: 4000,
        isClosable: true
      });
      return;
    }

    try {
      const response = await updateWeeklySchedule({
        scheduleId: ticketUpdateData.scheduleId,
        tickets: changedTickets
      });
      
      toast({
        title: "Success",
        description: response.message || "Weekly schedule updated successfully",
        status: "success",
        duration: 5000,
        isClosable: true
      });
      
      onClose();
      
      // Invalidate queries to refresh data
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['plannedWeeklySchedules'] }),
        queryClient.invalidateQueries({ queryKey: ['inProgressWeeklySchedules'] }),
      ]);

      onRequestReopenSchedule?.(selectedWeeklySchedule?._id);

    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update weekly schedule",
        status: "error",
        duration: 5000,
        isClosable: true
      });
    }
  };

  // Format date for display
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

  const ticketDetailsSection = (
    <Box>
      {selectedTickets.length > 0 ? (
        <VStack spacing={3} align="stretch">
          {selectedTickets.map((ticket, index) => (
            <Box key={ticket._id}>
              {index > 0 && <Divider my={2} borderWidth="1px" borderColor="gray.200" />}
              
              <Heading size="sm" mb={1} mt={2} fontSize="sm">
                <Badge colorScheme={statusStyles[ticket.status]?.color || "gray"} mr={1}>
                  {ticket.status}
                </Badge>
                Ticket #{index + 1}: {ticket.refNumber}
              </Heading>
              
              <Box bg="gray.50" p={2} mb={-2} borderRadius="md">
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={1}>
                  <Box>
                    <Text fontWeight="bold" fontSize="sm" color="gray.600">Farmer</Text>
                    <Text fontSize="sm">{`${ticket.requestorFarmer?.first_name || ''} ${ticket.requestorFarmer?.middle_name || ''} ${ticket.requestorFarmer?.surname || ''}`}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" fontSize="sm" color="gray.600">Farmer ID</Text>
                    <Text fontSize="sm">{ticket.requestorFarmer?.farmerId || 'N/A'}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" fontSize="sm" color="gray.600">Requested Machine</Text>
                    <Text fontSize="sm">{ticket.requestedMachineType?.equipmentType || 'N/A'}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" fontSize="sm" color="gray.600">Farm Location</Text>
                    <Text fontSize="sm">{ticket.barangay}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" fontSize="sm" color="gray.600">Estimated Area</Text>
                    <Text fontSize="sm">{ticket.estimatedArea} hectares</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" fontSize="sm" color="gray.600">Date Requested</Text>
                    <Text fontSize="sm">{formatDate(ticket.dateRequested)}</Text>
                  </Box>
                </SimpleGrid>
              </Box>
              
              {ticket.status === 'Declined' && (
                <Box bg="red.50" p={2} borderRadius="md" mt={5}>
                  <Heading size="sm" mb={1} fontSize="sm">Decline Details</Heading>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={1}>
                    <Box>
                      <Text fontWeight="bold" fontSize="sm" color="gray.600">Decline Reason</Text>
                      <Text fontSize="sm">{ticket.declineReason || 'N/A'}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" fontSize="sm" color="gray.600">Declined By</Text>
                      <Text fontSize="sm">
                        {ticket.declinedBy.first_name} {ticket.declinedBy.last_name} {ticket.declinedBy.suffix || ''}
                      </Text>
                    </Box>
                  </SimpleGrid>
                </Box>
              )}
            </Box>
          ))}
        </VStack>
      ) : (
        <VStack spacing={4} align="center" py={4}>
          <Text color="gray.600" fontSize="sm">No tickets selected to view detailed information.</Text>
        </VStack>
      )}
    </Box>
  );

  // Compute if there are changes
  const hasChanges = useMemo(() => {
    if (ticketUpdateData.tickets.length !== initialTicketData.length) return false;
    return ticketUpdateData.tickets.some((current, index) => {
      const initial = initialTicketData[index];
      return (
        current.ticketId !== initial.ticketId ||
        current.assignedDate !== initial.assignedDate ||
        current.assignedOperatorId !== initial.assignedOperatorId ||
        current.assignedMachineUnitId !== initial.assignedMachineUnitId
      );
    });
  }, [ticketUpdateData.tickets, initialTicketData]);


  return (
    <>
    <Modal isOpen={isOpen} onClose={onClose} size={width} closeOnOverlayClick={false} scrollBehavior="inside" isCentered motionPreset='none' blockScrollOnMount={false}>
      <ModalOverlay />
      <ModalContent borderRadius="md" overflow="hidden">
        {/* Header styling based on page context */}

        {isViewingDetails && (
          <ModalHeader bg="yellow.50" borderBottomWidth="1px" borderColor="gray.200" display="flex" alignItems="center">
            <GiFarmTractor style={{ marginRight: 12, color: '#eab308' }} />
            Ticket Request Detail
          </ModalHeader>
        )}
        

        {isPendingPage && !isViewingDetails && (
          <ModalHeader bg="yellow.50" borderBottomWidth="1px" borderColor="gray.200" display="flex" alignItems="center">
            <GiFarmTractor style={{ marginRight: 12, color: '#eab308' }} />
            Manage Pending Ticket Requests
          </ModalHeader>
        )}
        
        {isScheduledPage && !isViewingDetails && (
          user?.role === 'MIM' ? (
            <ModalHeader bg="green.50" borderBottomWidth="1px" borderColor="gray.200" display="flex" alignItems="center">
              <FaCalendarAlt style={{ marginRight: 12, color: 'green' }} />
              Manage Scheduled Tickets
            </ModalHeader>
          ) : (
            <ModalHeader bg="green.50" borderBottomWidth="1px" borderColor="gray.200" display="flex" alignItems="center">
              <FaCalendarAlt style={{ marginRight: 12, color: 'green' }} />
              View Scheduled Tickets
            </ModalHeader>
          )
        )}
        
        {isOngoingPage && !isViewingDetails && (
          user?.role === 'MIM' ? (
            <ModalHeader bg="purple.50" borderBottomWidth="1px" borderColor="gray.200" display="flex" alignItems="center">
              <FaCalendarAlt style={{ marginRight: 12, color: 'purple' }} />
              Manage Ongoing Tickets
            </ModalHeader>
          ) : (
            <ModalHeader bg="purple.50" borderBottomWidth="1px" borderColor="gray.200" display="flex" alignItems="center">
              <FaCalendarAlt style={{ marginRight: 12, color: 'purple' }} />
              View Ongoing Tickets
            </ModalHeader>
          )

        )}


        <ModalBody py={6}>
          {isPendingPage && isViewingDetails && selectedTickets.length === 1 ? (
            <>
              <Tabs colorScheme="red" variant="enclosed">
                <TabList>
                  <Tab>Ticket Details</Tab>
                </TabList>
                <TabPanels>
                  <TabPanel px={0} pt={4} pb={0}>
                    {ticketDetailsSection}
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </>
          ) : isPendingPage && selectedTickets.length > 0 ? (
            <>
              <Tabs colorScheme="yellow" variant="enclosed">
                    <TabList>
                      <Tab>Create Weekly Schedule</Tab>
                      <Tab>Ticket Details</Tab>
                    </TabList>
                    <TabPanels>
                      <TabPanel px={0} pt={4} pb={0}>
                        <VStack spacing={4} align="stretch">
                          <Box bg="blue.50" p={3} borderRadius="md" mb={2}>
                            <Text fontSize="sm" color="blue.700">
                              Create a weekly schedule for the selected ticket requests.
                            </Text>
                          </Box>
                          
                          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                            <FormControl isRequired>
                              <FormLabel>Start Day</FormLabel>
                              <Input
                                type="date"
                                value={scheduleData.weekStart}
                                onChange={(e) => setScheduleData({...scheduleData, weekStart: e.target.value})}
                                min={new Date().toISOString().split("T")[0]}
                              />
                            </FormControl>
                            
                            <FormControl isRequired>
                              <FormLabel>End Day</FormLabel>
                              <Input
                                type="date"
                                value={scheduleData.weekEnd}
                                onChange={(e) => setScheduleData({...scheduleData, weekEnd: e.target.value})}
                                min={new Date().toISOString().split("T")[0]}
                              />
                            </FormControl>
                          </SimpleGrid>
                          
                          {/* Display Occupied Dates */}
                            {isLoadingOccupiedDatesForScheduling ? (
                            <Box bg="gray.50" p={3} borderRadius="md">
                                <Text fontSize="sm" color="gray.600">Loading occupied dates...</Text>
                            </Box>
                            ) : occupiedDatesForSchedulingError ? (
                            <Box bg="red.50" p={3} borderRadius="md">
                                <Text fontSize="sm" color="red.600">Error loading occupied dates</Text>
                            </Box>
                            ) : occupiedDatesForScheduling?.data?.occupiedWeeks?.length > 0 ? (
                            <Box bg="orange.50" p={3} borderRadius="md" borderLeft="4px solid" borderLeftColor="orange.400">
                                <Text fontSize="sm" fontWeight="bold" color="orange.700" mb={2}>
                                Exisitng Week Ranges ({occupiedDatesForScheduling.data.count}):
                                </Text>
                                <VStack align="stretch" spacing={1}>
                                {occupiedDatesForScheduling.data.occupiedWeeks.map((week, index) => (
                                    <Text key={index} fontSize="sm" color="orange.600">
                                    • {formatDate(week.weekStart)} to {formatDate(week.weekEnd)}
                                    </Text>
                                ))}
                                </VStack>
                            </Box>
                            ) : (
                            <Box bg="green.50" p={3} borderRadius="md">
                                <Text fontSize="sm" color="green.700">No occupied weeks found</Text>
                            </Box>
                            )}

                          {/* Display Operator Assignment Numbers */}
                            {isLoadingOperatorAssignedNumbers ? (
                            <Box bg="gray.50" p={3} borderRadius="md">
                                <Text fontSize="sm" color="gray.600">Loading operator assignments...</Text>
                            </Box>
                            ) : operatorAssignedNumbersError ? (
                            <Box bg="red.50" p={3} borderRadius="md">
                                <Text fontSize="sm" color="red.600">Error loading operator assignments</Text>
                            </Box>
                            ) : operatorAssignedNumbers?.data?.operators?.length > 0 ? (
                            <Box bg="blue.50" p={3} borderRadius="md" borderLeft="4px solid" borderLeftColor="blue.400">
                                <Text fontSize="sm" fontWeight="bold" color="blue.700" mb={2}>
                                Operator Workload ({operatorAssignedNumbers.data.totalOperators} operators, {operatorAssignedNumbers.data.totalActiveAssignments} total active assignments):
                                </Text>
                                <VStack align="stretch" spacing={1}>
                                {operatorAssignedNumbers.data.operators.slice(0, 5).map((operator, index) => (
                                    <Text key={operator.operatorId || index} fontSize="sm" color="blue.600">
                                    • {operator.operatorDetails?.first_name || ''} {operator.operatorDetails?.last_name || ''}: {operator.activeAssignments} active assignment{operator.activeAssignments !== 1 ? 's' : ''}
                                    {operator.isOperatorDisabled && (
                                        <Badge colorScheme="red" ml={2} fontSize="xs">Disabled</Badge>
                                    )}
                                    </Text>
                                ))}
                                {operatorAssignedNumbers.data.operators.length > 5 && (
                                    <Text fontSize="xs" color="blue.500" fontStyle="italic">
                                    ... and {operatorAssignedNumbers.data.operators.length - 5} more operator{operatorAssignedNumbers.data.operators.length - 5 !== 1 ? 's' : ''}
                                    </Text>
                                )}
                                </VStack>
                            </Box>
                            ) : (
                            <Box bg="green.50" p={3} borderRadius="md">
                                <Text fontSize="sm" color="green.700">No operator assignments found</Text>
                            </Box>
                            )}

                          <Divider my={3} />
                          
                          <Heading size="sm">Selected Tickets</Heading>
                          <Box overflowX="auto">
                            <Table variant="simple" size="sm">
                              <Thead bg="gray.50">
                                <Tr fontSize={'xs'}>
                                    <Th width={'120px'}>Reference #</Th>
                                    <Th>Requestor Farmer</Th>
                                    <Th>Farm Location</Th>
                                    <Th width={'150px'}>Machine Type</Th>
                                    <Th width={'100px'}>Estimated Area (ha)</Th>
                                    <Th>Assigned Date</Th>
                                    <Th width={'170px'}>Assigned Operator</Th>
                                    <Th width={'120px'}>Machine Unit</Th>
                                  </Tr>
                              </Thead>
                              <Tbody>
                                {scheduleData.tickets.map((ticketData) => {
                                  const ticket = selectedTickets.find(t => t._id === ticketData.ticketId);
                                  const typeId = ticket?.requestedMachineType?.requestedMachineTypeId;
                                  const unitsForType = (typeId && unitsByType[typeId]) ? unitsByType[typeId] : [];
                                  const operatorsForType = (typeId && operatorsByType[typeId]) ? operatorsByType[typeId] : [];
                                  const isLoadingOperatorsForType = typeId && !operatorsByType[typeId];
                                  return (
                                    <Tr key={ticketData.ticketId}>
                                      <Td fontWeight={'semibold'} fontSize={'xs'}>{ticket?.refNumber}</Td>
                                      <Td fontSize={'xs'}>{`${ticket?.requestorFarmer?.first_name} ${ticket?.requestorFarmer?.surname}`}</Td>
                                      <Td fontSize={'xs'}>{ticket?.barangay}</Td>
                                      <Td fontSize={'xs'}>{ticket?.requestedMachineType?.equipmentType}</Td>
                                      <Td fontSize={'xs'}>{ticket?.estimatedArea}</Td>
                                      <Td fontSize={'xs'}>
                                        <Input
                                          type="date"
                                          value={ticketData.assignedDate}
                                          onChange={(e) => updateTicketInSchedule(
                                            ticketData.ticketId, 
                                            'assignedDate', 
                                            e.target.value
                                          )}  
                                          min={scheduleData.weekStart || undefined}
                                          max={scheduleData.weekEnd || undefined}
                                          size={'xs'}
                                          isDisabled={!scheduleData.weekStart || !scheduleData.weekEnd}
                                        />
                                      </Td>
                                      <Td>
                                        <Select
                                          placeholder={isLoadingOperatorsForType ? "Loading operators..." : "Select operator"}
                                          value={ticketData.assignedOperatorId}
                                          onChange={(e) => updateTicketInSchedule(
                                            ticketData.ticketId,
                                            'assignedOperatorId',
                                            e.target.value
                                          )}
                                          isDisabled={isLoadingOperatorsForType || !ticketData.assignedDate || !typeId}
                                          size={'xs'}
                                        >
                                          {operatorsForType.map(op => (
                                            <option key={op._id} value={op._id}>
                                              {`${op.first_name} ${op.last_name}`}
                                            </option>
                                          ))}
                                        </Select>
                                      </Td>
                                      <Td>
                                        <Select
                                          placeholder="Select machine"
                                          value={ticketData.assignedMachineUnitId}
                                          onChange={(e) => updateTicketInSchedule(
                                            ticketData.ticketId,
                                            'assignedMachineUnitId',
                                            e.target.value
                                          )}
                                          isDisabled={!typeId || !unitsByType[typeId] || !ticketData.assignedOperatorId}
                                          size={'xs'}
                                        >
                                          {unitsForType.map(unit => (
                                            <option key={unit._id} value={unit._id}>
                                              {unit.unitNumber} - {unit.machineryTypeId?.equipmentType}
                                            </option>
                                          ))}
                                        </Select>
                                      </Td>
                                    </Tr>
                                  );
                                })}
                              </Tbody>
                            </Table>
                          </Box>
                          
                          <Flex justify="flex-end" mt={3}>
                            <Button
                              colorScheme="blue"
                              leftIcon={<FaCalendarAlt />}
                              onClick={handleCreateSchedule}
                              isLoading={isCreatingWeeklySchedule}
                              isDisabled={
                                !scheduleData.weekStart || 
                                !scheduleData.weekEnd || 
                                scheduleData.tickets.some(t => 
                                  !t.assignedDate || 
                                  !t.assignedOperatorId || 
                                  !t.assignedMachineUnitId
                                )
                              }
                            >
                              Create Weekly Schedule
                            </Button>
                          </Flex>
                        </VStack>
                      </TabPanel>

                      {/* <TabPanel px={0} pt={4} pb={0}>
                        <Box bg="red.50" p={3} borderRadius="md" mb={3} borderLeft="4px solid" borderLeftColor="red.400">
                          <Text fontSize="sm" color="red.600">
                            Declining will move the selected tickets to Declined. This action will notify the requester.
                          </Text>
                        </Box>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                          <FormControl isRequired gridColumn={{ md: 'span 2' }}>
                            <FormLabel>Reason for Decline</FormLabel>
                            <Input
                              placeholder="Provide a clear reason for declining"
                              value={declineReason}
                              onChange={(e) => setDeclineReason(e.target.value)}
                            />
                          </FormControl>
                        </SimpleGrid>
                        <Flex justify="space-between" align="center" mt={4}>
                          <Text fontSize="sm" color="gray.600">
                            Selected tickets: {selectedTickets.length}
                          </Text>
                          <Button
                            colorScheme="red"
                            onClick={handleDeclineTickets}
                            isLoading={isDecliningTicketRequests}
                            isDisabled={!declineReason.trim() || selectedTickets.length === 0}
                          >
                            Decline Selected Tickets
                          </Button>
                        </Flex>
                      </TabPanel> */}
                      
                      <TabPanel px={0} pt={4} pb={0}>
                        {ticketDetailsSection}
                      </TabPanel>
                    </TabPanels>
              </Tabs>
            </>
          ) : isScheduledPage && selectedWeeklySchedule ? (
            <>
              <Tabs colorScheme="green" variant="enclosed">
                    <TabList>
                      <Tab>Manage Schedule</Tab>
                    </TabList>
                    <TabPanels>

                      <TabPanel px={0} pt={4} pb={0}>
                        <Box overflowX="auto">
                          <Box bg="blue.50" p={4} borderRadius="md" mb={4}>
                            <Heading size="sm" mb={3}>Weekly Schedule Details</Heading>
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                              <Box>
                                <Text fontWeight="bold" fontSize="sm" color="gray.600">Reference Number</Text>
                                <Text fontSize="md">{selectedWeeklySchedule?.refNumber || 'N/A'}</Text>
                              </Box>
                              <Box>
                                <Text fontWeight="bold" fontSize="sm" color="gray.600">Status</Text>
                                <Badge colorScheme={'green'}>
                                  {selectedWeeklySchedule?.status}
                                </Badge>
                              </Box>
                              <Box>
                                <Text fontWeight="bold" fontSize="sm" color="gray.600">Date Range</Text>
                                  <Text as="span" fontWeight="semibold">{formatDate(selectedWeeklySchedule?.weekStart)}</Text> to{" "}
                                  <Text as="span" fontWeight="semibold">{formatDate(selectedWeeklySchedule?.weekEnd)}</Text>
                              </Box>
                              {selectedWeeklySchedule.createdAt && (
                                <Box>
                                  <Text fontWeight="bold" fontSize="sm" color="gray.600">Date Created</Text>
                                  <Text fontSize="md">{formatDate(selectedWeeklySchedule?.createdAt)}</Text>
                                </Box>
                              )}
                              <Box>
                                <Text fontWeight="bold" fontSize="sm" color="gray.600">Total Scheduled Tickets</Text>
                                <Text fontSize="md">{selectedWeeklySchedule?.ticketRequests?.length}</Text>
                              </Box>
                            </SimpleGrid>
                          </Box>
                          
                          <Divider my={3} />
                          
                          <Heading size="sm" mb={3}>Scheduled Tickets</Heading>
                            <Box overflowX="auto">
                              <Table variant="simple" size="sm">
                                <Thead bg="gray.50">
                                  <Tr fontSize={'xs'}>
                                    <Th width={'120px'}>Reference #</Th>
                                    <Th>Requestor Farmer</Th>
                                    <Th>Farm Location</Th>
                                    <Th width={'150px'}>Machine Type</Th>
                                    <Th width={'100px'}>Estimated Area (ha)</Th>
                                    <Th>Assigned Date</Th>
                                    <Th width={'170px'}>Assigned Operator</Th>
                                    <Th width={'120px'}>Machine Unit</Th>
                                    {user?.role === 'MIM' && <Th></Th>}
                                  </Tr>
                                </Thead>
                                <Tbody>
                                  {selectedWeeklySchedule.ticketRequests.map((tr, index) => {
                                    const ticket = tr.ticketDetails;
                                    if (!ticket) return null;
                                    
                                    const updateTicket = ticketUpdateData.tickets.find(t => t.ticketId === tr.ticketRequestId);
                                    const typeId = ticket?.requestedMachineType?.requestedMachineTypeId;
                                    const unitsForType = (typeId && unitsByType[typeId]) ? unitsByType[typeId] : [];
                                    
                                    // Sort operators: current first
                                    const sortedOperators = [...(operatorsList?.data || [])].sort((a, b) => {
                                      if (a._id === updateTicket?.assignedOperatorId) return -1;
                                      if (b._id === updateTicket?.assignedOperatorId) return 1;
                                      return 0;
                                    });

                                    // Sort machines: current first
                                    const sortedUnits = [...unitsForType].sort((a, b) => {
                                      if (a._id === updateTicket?.assignedMachineUnitId) return -1;
                                      if (b._id === updateTicket?.assignedMachineUnitId) return 1;
                                      return 0;
                                    });
                                    
                                    return (
                                      <Tr key={tr.ticketRequestId}>
                                        <Td fontWeight="semibold" fontSize={'xs'}>{ticket.refNumber}</Td>
                                        <Td fontSize={'xs'}>{`${ticket.requestorFarmer?.first_name} ${ticket.requestorFarmer?.surname}`}</Td>
                                        <Td fontSize={'xs'}>{ticket.barangay}</Td>
                                        <Td fontSize={'xs'}>{ticket.requestedMachineType?.equipmentType}</Td>
                                        <Td fontSize={'xs'}>{ticket.estimatedArea}</Td>
                                        <Td>
                                          {user?.role === 'MIM' ? (
                                            <Input
                                              type="date"
                                              size="xs"
                                              value={updateTicket?.assignedDate || ''}
                                              onChange={(e) => updateTicketInUpdateData(
                                                tr.ticketRequestId, 
                                                'assignedDate', 
                                                e.target.value
                                              )}  
                                              min={selectedWeeklySchedule.weekStart || undefined}
                                              max={selectedWeeklySchedule.weekEnd || undefined}
                                            />
                                          ) : (
                                            <Text fontSize={'xs'}>{formatDate(ticket.assignedDate) || '-'}</Text>
                                          )}
                                        </Td>
                                        <Td>
                                          {user?.role === 'MIM' ? (
                                            <Select
                                              size="xs"
                                              placeholder={tr.assignedOperator}
                                              value={updateTicket?.assignedOperatorId || ''}
                                              onChange={(e) => updateTicketInUpdateData(
                                                tr.ticketRequestId,
                                                'assignedOperatorId',
                                                e.target.value
                                              )}
                                              isDisabled={isLoadingOperatorsList}
                                            >
                                              {sortedOperators.map(op => (
                                                <option key={op._id} value={op._id}>
                                                  {`${op.first_name} ${op.last_name}`}
                                                </option>
                                              ))}
                                            </Select>
                                          ) : (
                                            <Text fontSize={'xs'}>{ticket.assignedOperator?.first_name || '-'} {ticket.assignedOperator?.last_name || ''}</Text>
                                          )}
                                        </Td>
                                        <Td>
                                          {user?.role === 'MIM' ? (
                                            <Select
                                              size="xs"
                                              placeholder={tr.assignedMachineUnit} 
                                              value={updateTicket?.assignedMachineUnitId || ''}
                                              onChange={(e) => updateTicketInUpdateData(
                                                tr.ticketRequestId,
                                                'assignedMachineUnitId',
                                                e.target.value
                                              )}
                                              isDisabled={!typeId || !unitsForType.length}
                                            >
                                              {sortedUnits.map(unit => (
                                                <option key={unit._id} value={unit._id}>
                                                  {unit.unitNumber} - {unit.machineryTypeId?.equipmentType}
                                                </option>
                                              ))}
                                            </Select>
                                          ) : (
                                            <Text fontSize={'xs'}>{ticket.assignedMachineUnit?.unitNumber || '-'}</Text>
                                          )}
                                        </Td>
                                        {user?.role === 'MIM' && (
                                          <Td>
                                            <Button
                                              colorScheme='red'
                                              size={'xs'}
                                              mr={5}
                                              onClick={() => {onOpenRemoveModal(); setSelectedTicketForRemoval(tr.ticketRequestId)}}
                                            >
                                              <IoIosRemoveCircle />
                                            </Button>
                                          </Td>
                                        )}
                                      </Tr>
                                    );
                                  })}
                                </Tbody>
                              </Table>
                            </Box>
                        </Box>
                        {user?.role === 'MIM' && selectedWeeklySchedule?.ticketRequests?.length < 5 && (
                          <Flex justify="flex-end" mt={7}>
                            <Button
                              colorScheme="blue"
                              onClick={onOpenAddModal}
                              size={'md'}
                            >
                              Add Ticket/s
                            </Button>
                          </Flex>
                        )}
                        
                      </TabPanel>

                    </TabPanels>
              </Tabs>
            </>
          ) : isOngoingPage && selectedWeeklySchedule ? (
            <>
              <Tabs colorScheme="purple" variant="enclosed">
                <TabList>
                  <Tab>Manage Ongoing Schedule</Tab>
                </TabList>
                <TabPanels>
                  <TabPanel px={0} pt={4} pb={0}>
                    <Box overflowX="auto">
                      <Box bg="purple.50" p={4} borderRadius="md" mb={4}>
                        <Heading size="sm" mb={3}>Weekly Schedule Details</Heading>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                          <Box>
                            <Text fontWeight="bold" fontSize="sm" color="gray.600">Reference Number</Text>
                            <Text fontSize="md">{selectedWeeklySchedule?.refNumber || 'N/A'}</Text>
                          </Box>
                          <Box>
                            <Text fontWeight="bold" fontSize="sm" color="gray.600">Status</Text>
                            <Badge colorScheme={'purple'}>
                              {selectedWeeklySchedule?.status}
                            </Badge>
                          </Box>
                          <Box>
                            <Text fontWeight="bold" fontSize="sm" color="gray.600">Date Range</Text>
                              <Text as="span" fontWeight="semibold">{formatDate(selectedWeeklySchedule?.weekStart)}</Text> to{" "}
                              <Text as="span" fontWeight="semibold">{formatDate(selectedWeeklySchedule?.weekEnd)}</Text>
                          </Box>
                          {selectedWeeklySchedule.createdAt && (
                            <Box>
                              <Text fontWeight="bold" fontSize="sm" color="gray.600">Date Created</Text>
                              <Text fontSize="md">{formatDate(selectedWeeklySchedule?.createdAt)}</Text>
                            </Box>
                          )}
                          <Box>
                            <Text fontWeight="bold" fontSize="sm" color="gray.600">Total Scheduled Tickets</Text>
                            <Text fontSize="md">{selectedWeeklySchedule?.ticketRequests?.length}</Text>
                          </Box>
                        </SimpleGrid>
                      </Box>
                      
                      <Divider my={3} />
                      
                      <Heading size="sm" mb={3}>Scheduled Tickets</Heading>
                      <Box overflowX="auto">
                        <Table variant="simple" size="sm">
                          <Thead bg="gray.50">
                            <Tr fontSize={'xs'}>
                              <Th width={'120px'}>Reference #</Th>
                              <Th>Requestor Farmer</Th>
                              <Th>Farm Location</Th>
                              <Th width={'150px'}>Machine Type</Th>
                              <Th width={'100px'}>Estimated Area (ha)</Th>
                              <Th>Assigned Date</Th>
                              <Th width={'170px'}>Assigned Operator</Th>
                              <Th width={'120px'}>Machine Unit</Th>
                              {user?.role === 'MIM' && (
                                <Th></Th>
                              )}
                            </Tr>
                          </Thead>
                          <Tbody>
                            {selectedWeeklySchedule.ticketRequests.map((tr) => {
                              // Show extension ticket if present, else regular ticket
                              const ticket = tr.extensionRequestId ? tr.extensionDetails : tr.ticketDetails;
                              if (!ticket) return null;
                              
                              const updateTicket = ticketUpdateData.tickets.find(t => t.ticketId === tr.ticketRequestId);
                              const typeId = ticket?.requestedMachineType?.requestedMachineTypeId;
                              const unitsForType = (typeId && unitsByType[typeId]) ? unitsByType[typeId] : [];
                              
                              // Sort operators: current first
                              const sortedOperators = [...(operatorsList?.data || [])].sort((a, b) => {
                                if (a._id === updateTicket?.assignedOperatorId) return -1;
                                if (b._id === updateTicket?.assignedOperatorId) return 1;
                                return 0;
                              });

                              // Sort machines: current first
                              const sortedUnits = [...unitsForType].sort((a, b) => {
                                if (a._id === updateTicket?.assignedMachineUnitId) return -1;
                                if (b._id === updateTicket?.assignedMachineUnitId) return 1;
                                return 0;
                              });
                              
                              return (
                                <Tr key={tr.ticketRequestId || tr._id}>
                                  <Td fontWeight="semibold" fontSize={'xs'}>{ticket.refNumber}</Td>
                                  <Td fontSize={'xs'}>
                                    {ticket.requestorFarmer
                                      ? `${ticket.requestorFarmer?.first_name} ${ticket.requestorFarmer?.surname}`
                                      : <Text>|    |</Text>}
                                  </Td>
                                  <Td fontSize={'xs'}>
                                    {ticket.barangay || <Text>|    |</Text>}
                                  </Td>
                                  <Td fontSize={'xs'}>
                                    <Text>{ticket.requestedMachineType?.equipmentType || '—'}</Text>
                                  </Td>
                                  <Td fontSize={'xs'}>
                                    {ticket.estimatedArea
                                      ? `${ticket?.estimatedArea || '-'}` 
                                      : <Text>{ticket?.remainingArea || '-'}</Text>
                                      }
                                  </Td>
                                  <Td fontSize={'xs'}>
                                    {ticket.disabledForEditing === true ? (
                                      <>
                                        {formatDate(ticket.assignedDate) || '-'}
                                      </>
                                    ) : (
                                      <>
                                        <Input
                                          type="date"
                                          size="xs"
                                          value={updateTicket?.assignedDate || ''}
                                          onChange={(e) => updateTicketInUpdateData(
                                            tr.ticketRequestId, 
                                            'assignedDate', 
                                            e.target.value
                                          )}  
                                          min={selectedWeeklySchedule.weekStart || undefined}
                                          max={selectedWeeklySchedule.weekEnd || undefined}
                                        />
                                      </>
                                    )}
                                  </Td>
                                  <Td fontSize={'xs'}>
                                    {ticket.disabledForEditing === true ? (
                                      <>
                                        {ticket.assignedOperator.first_name || '-'} {ticket.assignedOperator.last_name}
                                      </>
                                    ) : (
                                      <>
                                        <Select
                                          size="xs"
                                          placeholder={tr.assignedOperator} //needs changing !!!!
                                          value={updateTicket?.assignedOperatorId || ''}
                                          onChange={(e) => updateTicketInUpdateData(
                                            tr.ticketRequestId,
                                            'assignedOperatorId',
                                            e.target.value
                                          )}
                                          isDisabled={isLoadingOperatorsList}
                                        >
                                          {sortedOperators.map(op => (
                                            <option key={op._id} value={op._id}>
                                              {`${op.first_name} ${op.last_name}`}
                                            </option>
                                          ))}
                                        </Select>
                                      </>
                                    )}
                                  </Td>
                                    <Td fontSize={'xs'}>
                                      {ticket.disabledForEditing === true ? (
                                        <>
                                          {ticket?.assignedMachineUnit?.unitNumber}
                                        </>
                                      ) : (
                                        <>
                                          <Select
                                            size="xs"
                                            placeholder={tr.assignedMachineUnit} 
                                            value={updateTicket?.assignedMachineUnitId || ''}
                                            onChange={(e) => updateTicketInUpdateData(
                                              tr.ticketRequestId,
                                              'assignedMachineUnitId',
                                              e.target.value
                                            )}
                                            isDisabled={!typeId || !unitsForType.length}
                                          >
                                            {sortedUnits.map(unit => (
                                              <option key={unit._id} value={unit._id}>
                                                {unit.unitNumber} - {unit.machineryTypeId?.equipmentType}
                                              </option>
                                            ))}
                                          </Select>
                                        </>
                                      )}
                                    </Td>
                                    {user?.role === 'MIM' && (
                                      <Td>
                                      <Button
                                      colorScheme='red'
                                      size={'xs'}
                                      mr={5}
                                      onClick={() => {onOpenRemoveModal(); setSelectedTicketForRemoval(tr.ticketRequestId)}}
                                      isDisabled={ticket.disabledForEditing}
                                    >
                                      <IoIosRemoveCircle />
                                    </Button>
                                    </Td>
                                    )}
                                </Tr>
                              );
                            })}
                          </Tbody>
                        </Table>
                      </Box>
                    </Box>
                    {selectedWeeklySchedule?.ticketRequests?.length < 5 && (
                      user?.role === 'MIM' && (
                        <Flex justify="flex-end" mt={7}>
                        <Button
                          colorScheme="blue"
                          onClick={onOpenAddModal}
                          size={'md'}
                        >
                          Add Ticket/s
                        </Button>
                      </Flex>
                      )
                    )}
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </>
          ) : (
              <VStack spacing={4} align="center" py={4}>
                <Text color="gray.600" fontSize="sm">No ticket/s or weekly schedule selected to manage.</Text>
              </VStack>
          )}
        </ModalBody>

        <ModalFooter bg="gray.50" borderTopWidth="1px" borderColor="gray.200">
          
          <Button variant="outline" onClick={() => {
            onClose()
            setScheduleData({
              weekStart: '',
              weekEnd: '',
              tickets: []
            })

            selectedTicketsSetter([]);
          }} size="md">
            Close
          </Button>

          {hasChanges && (
            <Button
              colorScheme="blue"
              onClick={handleUpdateSchedule}
              isLoading={isUpdatingWeeklySchedule}
              ml={3}
              >
                Update Schedule
            </Button>
          )}

        </ModalFooter>
      </ModalContent>
    </Modal>

    {/* Add Ticket Request/s Modal */}
    <AddTicketPanel
      isOpen={isOpenAddModal}
      onClose={onCloseAddModal}
      selectedWeeklySchedule={selectedWeeklySchedule}
      onRequestReopenSchedule={onRequestReopenSchedule}
      onCloseParent={onClose}
    />

    {/* Remove Confirmation Modal */}
    <Modal isOpen={isOpenRemoveModal} size="xs" onClose={onCloseRemoveModal} closeOnOverlayClick={false} scrollBehavior="inside" isCentered  motionPreset="none">
        <ModalOverlay/>
        <ModalContent borderRadius="lg" overflow="hidden">
          <ModalHeader
            bg="yellow.50" 
            borderBottomWidth="1px"
            borderColor="gray.200"
            py={4}
            display="flex" 
            alignItems="center"
          >
            <Icon as={GoAlertFill} mr={2} color="yellow.500" />
            Confirm Removal
          </ModalHeader>

          <ModalFooter bg="gray.50" borderTopWidth="1px" borderColor="gray.200">
            <Button 
              variant="outline" 
              mr={3} 
              onClick={() => {setSelectedTicketForRemoval(null); onCloseRemoveModal()}}
              size="md"
              _hover={{ bg: "gray.100" }}
            >
              Cancel
            </Button>
            <Button 
                colorScheme="red"
                onClick={() => handleRemoveFromSchedule(selectedTicketForRemoval)}
                isLoading={isRemovingFromSchedule}
                size="md"
                _hover={{ boxShadow: "md", bg: "red.600" }}
            >
              Remove
            </Button>
          </ModalFooter>
        </ModalContent>
    </Modal>
    </>
  );
};

export default TicketRequestPanel;
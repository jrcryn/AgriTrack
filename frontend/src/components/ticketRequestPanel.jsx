import React, { useState, useEffect } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  Box, VStack, Text, Heading, Divider, SimpleGrid, Badge, Flex, Button, Tabs, TabList, TabPanels, Tab, TabPanel,
  FormControl, FormLabel, Input, Select, useToast, Table, Thead, Tbody, Tr, Th, Td,
  Switch, NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper,
  Tooltip, Icon, HStack, Stack, useDisclosure, Checkbox, InputGroup, InputLeftElement
} from '@chakra-ui/react';

import { CalendarIcon, CheckCircleIcon, CloseIcon, InfoIcon, WarningIcon } from "@chakra-ui/icons";
import { FaCog, FaTools, FaUser, FaCalendarAlt } from "react-icons/fa";
import { IoIosRemoveCircle } from "react-icons/io";
import { GiFarmTractor } from "react-icons/gi";
import { GoAlertFill } from "react-icons/go";

import { useAdminDashboard } from '../machineries/store/adminDashboard.store.js';
import { useAuthStore } from '../auth/store/authStore.js';
import { useQueryClient } from '@tanstack/react-query';

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
  const isDeclinedPage = pageType === 'declined';
  console.log(pageType)

  // Schedule creation state
  const [scheduleData, setScheduleData] = useState({
    weekStart: '',
    weekEnd: '',
    tickets: []
  });

  // NEW: pagination for Add Ticket modal
  const [addModalPendingPage, setAddModalPendingPage] = useState(1);

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

    declineTicketRequests,
    isDecliningTicketRequests,

    // pending tickets used in Add Ticket Request/s modal
    pendingTicketRequests,
    isLoadingPendingTicketRequests
  } = useAdminDashboard(
    // NEW: drive pending tickets with modal pagination
    { pendingPage: addModalPendingPage },
    {}
  );

  const [selectedTicketForRemoval, setSelectedTicketForRemoval] = useState(null);
  const [declineReason, setDeclineReason] = useState('');
  const [unitsByType, setUnitsByType] = useState({}); // Map of units per machineryTypeId


  const { isOpen: isOpenRemoveModal, onOpen: onOpenRemoveModal, onClose: onCloseRemoveModal } = useDisclosure();

  // NEW: add tickets modal disclosure
  const { isOpen: isOpenAddModal, onOpen: onOpenAddModal, onClose: onCloseAddModal } = useDisclosure();

  // NEW: selection state for tickets being added to an existing schedule
  const [addTicketsData, setAddTicketsData] = useState([]); // [{ ticketId, assignedDate, assignedOperatorId, assignedMachineUnitId }]

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
        // optional: handle error per type
        // console.error('Failed to load units for type', typeId, e);
      }
    });
  }, [selectedTickets, isOpen]); 

  // NEW: Fetch units for selected tickets in Add modal as their types appear
  useEffect(() => {
    if (!isOpenAddModal || addTicketsData.length === 0) return;

    const scheduledIds = new Set((selectedWeeklySchedule?.ticketRequests || []).map(tr => tr.ticketRequestId));
    const allPending = pendingTicketRequests?.data?.relevantTickets || [];
    const filteredPending = allPending.filter(t => !scheduledIds.has(t._id));
    const ticketMap = new Map(filteredPending.map(t => [t._id, t]));

    const uniqueTypeIds = Array.from(
      new Set(
        addTicketsData
          .map(sel => ticketMap.get(sel.ticketId)?.requestedMachineType?.requestedMachineTypeId)
          .filter(Boolean)
      )
    );

    uniqueTypeIds.forEach(async (typeId) => {
      if (unitsByType[typeId]) return;
      try {
        const res = await getMachineryUnitsForDropDownByType(typeId);
        setUnitsByType(prev => ({ ...prev, [typeId]: res?.data || [] }));
      } catch (e) {
        // silent
      }
    });
  }, [isOpenAddModal, addTicketsData, pendingTicketRequests, selectedWeeklySchedule]);

  // Update a specific ticket in the schedule, pag gagawa ng schedule yung
  const updateTicketInSchedule = (ticketId, field, value) => {
    setScheduleData(prev => ({
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
        queryClient.invalidateQueries({ queryKey: ['pendingTicketRequests'] }),
        queryClient.invalidateQueries({ queryKey: ['weeklySchedules'] })
      ]);
      
    } catch (error) {
      console.error('Error creating weekly schedule:', error);
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
    try {
      const response = await removeFromSchedule(ticketRequestId);
      
      toast({
        title: "Success",
        description: response.message || "Ticket removed from schedule",
        status: "success",
        duration: 5000,
        isClosable: true
      });

      const scheduleId = selectedWeeklySchedule?._id;

      // Close modal and refresh data
      setSelectedTicketForRemoval(null);
      onCloseRemoveModal();
      onClose();
      
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['pendingTicketRequests'] }),
        queryClient.invalidateQueries({ queryKey: ['weeklySchedules'] })
      ]);

      // Ask parent to reopen with fresh data
      onRequestReopenSchedule?.(scheduleId);
      
      
    } catch (error) {
      console.error('Error removing ticket from schedule:', error);
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

  const handleDeclineTickets = async () => {
    if (!selectedTickets?.length) {
      toast({
        title: "No tickets selected",
        description: "Select at least one ticket to decline.",
        status: "warning",
        duration: 4000,
        isClosable: true
      });
      return;
    }
    if (!declineReason.trim()) {
      toast({
        title: "Missing reason",
        description: "Provide a reason for declining the selected tickets.",
        status: "warning",
        duration: 4000,
        isClosable: true
      });
      return;
    }
    try {
      await declineTicketRequests({
        tickets: selectedTickets.map(t => t._id),
        reason: declineReason.trim(),
        employeeId: user?.id
      });
      toast({
        title: "Success",
        description: `${selectedTickets.length} ticket(s) declined successfully.`,
        status: "success",
        duration: 5000,
        isClosable: true
      });
      setDeclineReason('');
      onClose();
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['pendingTicketRequests'] }),
        queryClient.invalidateQueries({ queryKey: ['declinedTicketRequests'] })
      ]);
    } catch (error) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to decline selected tickets.",
        status: "error",
        duration: 5000,
        isClosable: true
      });
    }
  };

  const handleMoveTicketToSchedule = (targetScheduleId, ticket) => {

  };

  // NEW: helpers for Add modal
  const scheduleCapacity = 5;
  const currentScheduledCount = selectedWeeklySchedule?.ticketRequests?.length || 0;
  const remainingQuota = Math.max(0, scheduleCapacity - currentScheduledCount);

  const allPending = pendingTicketRequests?.data?.relevantTickets || [];
  const alreadyScheduledIds = new Set((selectedWeeklySchedule?.ticketRequests || []).map(tr => tr.ticketRequestId));
  const selectablePending = allPending.filter(t => !alreadyScheduledIds.has(t._id));

  // NEW: modal pagination meta
  const modalPendingCurrentPage = pendingTicketRequests?.data?.currentPage || 1;
  const modalPendingTotalPages = pendingTicketRequests?.data?.totalPages || 1;
  const modalPendingTotalItems = pendingTicketRequests?.data?.totalCount || 0;

  const isSelectedForAdd = (ticketId) => addTicketsData.some(t => t.ticketId === ticketId);

  const toggleAddSelection = (ticket) => {
    setAddTicketsData(prev => {
      const exists = prev.some(t => t.ticketId === ticket._id);
      if (exists) {
        return prev.filter(t => t.ticketId !== ticket._id);
      }
      if (prev.length >= remainingQuota) {
        toast({
          title: "Selection limit reached",
          description: `You can only add up to ${remainingQuota} more ticket(s) to this schedule.`,
          status: "warning",
          duration: 3000,
          isClosable: true
        });
        return prev;
      }
      return [
        ...prev,
        { ticketId: ticket._id, assignedDate: '', assignedOperatorId: '', assignedMachineUnitId: '' }
      ];
    });
  };

  const updateAddTicket = (ticketId, field, value) => {
    setAddTicketsData(prev =>
      prev.map(t => (t.ticketId === ticketId ? { ...t, [field]: value } : t))
    );
  };

  const handleAddTicketsToSchedule = async () => {
    if (!selectedWeeklySchedule?._id) return;

    if (addTicketsData.length === 0) {
      toast({
        title: "No tickets selected",
        description: "Select at least one pending ticket to add.",
        status: "warning",
        duration: 3000,
        isClosable: true
      });
      return;
    }

    // Validate fields and date within schedule range
    const ws = selectedWeeklySchedule?.weekStart ? new Date(selectedWeeklySchedule.weekStart) : null;
    const we = selectedWeeklySchedule?.weekEnd ? new Date(selectedWeeklySchedule.weekEnd) : null;

    const incomplete = addTicketsData.filter(
      t => !t.assignedDate || !t.assignedOperatorId || !t.assignedMachineUnitId
    );

    if (incomplete.length > 0) {
      toast({
        title: "Incomplete assignments",
        description: "Please assign date, operator and machine unit for all selected tickets.",
        status: "warning",
        duration: 4000,
        isClosable: true
      });
      return;
    }

    const outOfRange = addTicketsData.filter(t => {
      if (!ws || !we) return false;
      const d = new Date(t.assignedDate);
      return d < ws || d > we;
    });

    if (outOfRange.length > 0) {
      toast({
        title: "Date out of range",
        description: "Assigned dates must be within this schedule's start and end dates.",
        status: "warning",
        duration: 4000,
        isClosable: true
      });
      return;
    }

    try {
      // Attempt batch move
      await moveToSchedule({
        weeklyScheduleId: selectedWeeklySchedule._id,
        tickets: addTicketsData
      });

      toast({
        title: "Tickets added",
        description: `${addTicketsData.length} ticket(s) added to the schedule.`,
        status: "success",
        duration: 5000,
        isClosable: true
      });

      const scheduleId = selectedWeeklySchedule._id;

      setAddTicketsData([]);
      onCloseAddModal();
      onClose();

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['pendingTicketRequests'] }),
        queryClient.invalidateQueries({ queryKey: ['weeklySchedules'] })
      ]);

      onRequestReopenSchedule?.(scheduleId);
    } catch (error) {
      toast({
        title: "Failed to add tickets",
        description: error?.response?.data?.message || "Unable to add tickets to the schedule.",
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
              
              {(ticket.status === 'Scheduled' || ticket.status === 'Ongoing') && (
                <Box bg="blue.50" p={2} borderRadius="md" mt={1}>
                  <Heading size="sm" mb={1} fontSize="sm">Schedule Details</Heading>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={1}>
                    <Box>
                      <Text fontWeight="bold" fontSize="sm" color="gray.600">Assigned Date</Text>
                      <Text fontSize="sm">{formatDate(ticket.assignedDate)}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" fontSize="sm" color="gray.600">Operator</Text>
                      <Text fontSize="sm">{ticket.assignedOperator ? 
                        `${ticket.assignedOperator.first_name} ${ticket.assignedOperator.last_name}` : 
                        'Not assigned'}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" fontSize="sm" color="gray.600">Machine Unit</Text>
                      <Text fontSize="sm">{ticket.assignedMachineUnit ? 
                        `${ticket.assignedMachineUnit.plateNumber} - ${ticket.assignedMachineUnit.engineBrand}` : 
                        'Not assigned'}</Text>
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

  return (
    <>
    <Modal isOpen={isOpen} onClose={onClose} size={width} closeOnOverlayClick={false} scrollBehavior="inside" isCentered motionPreset='none'>
      <ModalOverlay />
      <ModalContent borderRadius="md" overflow="hidden" minHeight={{ base: 'auto', md: height }}>
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
          <ModalHeader bg="blue.50" borderBottomWidth="1px" borderColor="gray.200" display="flex" alignItems="center">
            <FaCalendarAlt style={{ marginRight: 12, color: '#3182ce' }} />
            Manage Scheduled Tickets
          </ModalHeader>
        )}
        
        {isOngoingPage && !isViewingDetails && (
          <ModalHeader bg="green.50" borderBottomWidth="1px" borderColor="gray.200" display="flex" alignItems="center">
            <FaTools style={{ marginRight: 12, color: '#38a169' }} />
            Ongoing Ticket Details
          </ModalHeader>
        )}
        
        {isDeclinedPage && !isViewingDetails && (
          <ModalHeader bg="red.50" borderBottomWidth="1px" borderColor="gray.200" display="flex" alignItems="center">
            <CloseIcon style={{ marginRight: 12, color: '#e53e3e' }} />
            Declined Ticket Details
          </ModalHeader>
        )}

        <ModalBody py={6}>
          {isViewingDetails ? (
            <>{ticketDetailsSection}</>
          ) : isPendingPage && selectedTickets.length > 0 ? (
            <>
              <Tabs colorScheme="yellow" variant="enclosed">
                    <TabList>
                      <Tab>Create Weekly Schedule</Tab>
                      <Tab>Decline Tickets</Tab>
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
                              <FormLabel>Week Start</FormLabel>
                              <Input
                                type="date"
                                value={scheduleData.weekStart}
                                onChange={(e) => setScheduleData({...scheduleData, weekStart: e.target.value})}
                              />
                            </FormControl>
                            
                            <FormControl isRequired>
                              <FormLabel>Week End</FormLabel>
                              <Input
                                type="date"
                                value={scheduleData.weekEnd}
                                onChange={(e) => setScheduleData({...scheduleData, weekEnd: e.target.value})}
                              />
                            </FormControl>
                          </SimpleGrid>
                          
                          <Divider my={3} />
                          
                          <Heading size="sm">Selected Tickets</Heading>
                          <Box overflowX="auto">
                            <Table variant="simple" size="sm">
                              <Thead>
                                <Tr>
                                  <Th>Reference #</Th>
                                  <Th>Farmer</Th>
                                  <Th>Machine Type</Th>
                                  <Th>Assigned Date</Th>
                                  <Th>Operator</Th>
                                  <Th>Machine Unit</Th>
                                </Tr>
                              </Thead>
                              <Tbody>
                                {scheduleData.tickets.map((ticketData) => {
                                  const ticket = selectedTickets.find(t => t._id === ticketData.ticketId);
                                  const typeId = ticket?.requestedMachineType?.requestedMachineTypeId;
                                  const unitsForType = (typeId && unitsByType[typeId]) ? unitsByType[typeId] : [];
                                  return (
                                    <Tr key={ticketData.ticketId}>
                                      <Td fontWeight={'semibold'}>{ticket?.refNumber}</Td>
                                      <Td>{`${ticket?.requestorFarmer?.first_name} ${ticket?.requestorFarmer?.surname}`}</Td>
                                      <Td>{ticket?.requestedMachineType?.equipmentType}</Td>
                                      <Td>
                                        <Input
                                          type="date"
                                          size="sm"
                                          value={ticketData.assignedDate}
                                          onChange={(e) => updateTicketInSchedule(
                                            ticketData.ticketId, 
                                            'assignedDate', 
                                            e.target.value
                                          )}  
                                          min={scheduleData.weekStart || undefined}
                                          max={scheduleData.weekEnd || undefined}
                                        />
                                      </Td>
                                      <Td>
                                        <Select
                                          size="sm"
                                          placeholder="Select operator"
                                          value={ticketData.assignedOperatorId}
                                          onChange={(e) => updateTicketInSchedule(
                                            ticketData.ticketId,
                                            'assignedOperatorId',
                                            e.target.value
                                          )}
                                          isDisabled={isLoadingOperatorsList}
                                        >
                                          {operatorsList?.data?.map(op => (
                                            <option key={op._id} value={op._id}>
                                              {`${op.first_name} ${op.last_name}`}
                                            </option>
                                          ))}
                                        </Select>
                                      </Td>
                                      <Td>
                                        <Select
                                          size="sm"
                                          placeholder="Select machine"
                                          value={ticketData.assignedMachineUnitId}
                                          onChange={(e) => updateTicketInSchedule(
                                            ticketData.ticketId,
                                            'assignedMachineUnitId',
                                            e.target.value
                                          )}
                                          isDisabled={!typeId || !unitsByType[typeId]}
                                        >
                                          {unitsForType.map(unit => (
                                            <option key={unit._id} value={unit._id}>
                                              {unit.plateNumber} - {unit.machineryTypeId?.equipmentType}
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

                      <TabPanel px={0} pt={4} pb={0}>
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
                      </TabPanel>
                      
                      <TabPanel px={0} pt={4} pb={0}>
                        {ticketDetailsSection}
                      </TabPanel>
                    </TabPanels>
              </Tabs>
            </>
          ) : isScheduledPage && selectedWeeklySchedule ? (
            <>
              <Tabs colorScheme="blue" variant="enclosed">
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
                                <Text fontWeight="bold" fontSize="sm" color="gray.600">Week Start</Text>
                                <Text fontSize="md">{formatDate(selectedWeeklySchedule?.weekStart)}</Text>
                              </Box>
                              <Box>
                                <Text fontWeight="bold" fontSize="sm" color="gray.600">Week End</Text>
                                <Text fontSize="md">{formatDate(selectedWeeklySchedule?.weekEnd)}</Text>
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
                              <Tr>
                                <Th>Reference #</Th>
                                <Th>Farmer</Th>
                                <Th>Barangay</Th>
                                <Th>Machine</Th>
                                <Th>Estimated Area (ha)</Th>
                                <Th>Assigned Date</Th>
                                <Th>Machine Unit</Th>
                                <Th>Operator</Th>
                                <Th></Th>
                              </Tr>
                            </Thead>
                            <Tbody>
                              {selectedWeeklySchedule.ticketRequests.map(tr => {
                                const ticket = tr.ticketDetails;
                                if (!ticket) return null;
                                
                                return (
                                  <Tr key={tr.ticketRequestId}>
                                    <Td fontWeight="semibold">{ticket.refNumber}</Td>
                                    <Td>{`${ticket.requestorFarmer?.first_name} ${ticket.requestorFarmer?.surname}`}</Td>
                                    <Td>{ticket.barangay}</Td>
                                    <Td>{ticket.requestedMachineType?.equipmentType}</Td>
                                    <Td>{ticket.estimatedArea}</Td>
                                    <Td>{formatDate(tr.assignedDate)}</Td>
                                    <Td>{ticket.assignedMachineUnit?.plateNumber}</Td>
                                    <Td>{`${ticket.assignedOperator?.first_name} ${ticket.assignedOperator?.last_name}`}</Td>
                                    <Td>
                                      <Button
                                        colorScheme='red'
                                        size={'xs'}
                                        mr={5}
                                        onClick={() => {onOpenRemoveModal(); setSelectedTicketForRemoval(tr.ticketRequestId)}}
                                      >
                                        <IoIosRemoveCircle  />
                                      </Button>
                                    </Td>
                                  </Tr>
                                );
                              })}
                            </Tbody>
                          </Table>
                          </Box>
                        </Box>
                        {selectedWeeklySchedule?.ticketRequests?.length < 5 && (
                          <Flex justify="flex-end" mt={7}>
                            <Button
                              colorScheme="blue"
                              onClick={() => { setAddModalPendingPage(1); onOpenAddModal(); }} // NEW: reset page on open
                            >
                              Add Ticket Request/s
                            </Button>
                          </Flex>
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
        </ModalFooter>
      </ModalContent>
    </Modal>

    {/* Add Ticket Request/s Modal */}
    <Modal
      isOpen={isOpenAddModal}
      onClose={() => { setAddTicketsData([]); setAddModalPendingPage(1); onCloseAddModal(); }} // NEW: reset page on close
      size="6xl"
      closeOnOverlayClick={false}
      scrollBehavior="inside"
      isCentered
      motionPreset="none"
    >
      <ModalOverlay />
      <ModalContent borderRadius="lg" overflow="hidden">
        <ModalHeader
          bg="blue.50"
          borderBottomWidth="1px"
          borderColor="gray.200"
          py={4}
          display="flex"
          alignItems="center"
        >
          <Icon as={FaCalendarAlt} mr={2} color="blue.600" />
          Add Ticket Request/s to Schedule
        </ModalHeader>
        <ModalBody>
          <Box bg="blue.50" p={3} borderRadius="md" mb={4}>
            <Text fontSize="sm" color="blue.700">
              Select up to {remainingQuota} pending ticket(s) to add to this weekly schedule. Assign date, operator, and machine unit for each.
            </Text>
          </Box>

          <Box overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead bg="gray.50">
                <Tr>
                  <Th>Select</Th>
                  <Th>Reference #</Th>
                  <Th>Farmer</Th>
                  <Th>Machine Type</Th>
                  <Th>Assigned Date</Th>
                  <Th>Operator</Th>
                  <Th>Machine Unit</Th>
                </Tr>
              </Thead>
              <Tbody>
                {isLoadingPendingTicketRequests ? (
                  <Tr>
                    <Td colSpan={7}>
                      <Flex align="center" justify="center" py={6}>
                        <Text color="gray.600">Loading pending tickets...</Text>
                      </Flex>
                    </Td>
                  </Tr>
                ) : selectablePending.length === 0 ? (
                  <Tr>
                    <Td colSpan={7}>
                      <Flex align="center" justify="center" py={6}>
                        <Text color="gray.600">No pending tickets available to add.</Text>
                      </Flex>
                    </Td>
                  </Tr>
                ) : (
                  selectablePending.map((ticket) => {
                    const selected = isSelectedForAdd(ticket._id);
                    const selectedRow = addTicketsData.find(t => t.ticketId === ticket._id);
                    const typeId = ticket?.requestedMachineType?.requestedMachineTypeId;
                    const unitsForType = (typeId && unitsByType[typeId]) ? unitsByType[typeId] : [];
                    return (
                      <Tr key={ticket._id}>
                        <Td>
                          <Checkbox
                            isChecked={selected}
                            onChange={() => toggleAddSelection(ticket)}
                            isDisabled={!selected && addTicketsData.length >= remainingQuota}
                          />
                        </Td>
                        <Td fontWeight="semibold">{ticket.refNumber}</Td>
                        <Td>{`${ticket?.requestorFarmer?.first_name || ''} ${ticket?.requestorFarmer?.surname || ''}`}</Td>
                        <Td>{ticket?.requestedMachineType?.equipmentType || '-'}</Td>
                        <Td>
                          <Input
                            type="date"
                            size="sm"
                            value={selectedRow?.assignedDate || ''}
                            onChange={(e) => updateAddTicket(ticket._id, 'assignedDate', e.target.value)}
                            min={selectedWeeklySchedule?.weekStart || undefined}
                            max={selectedWeeklySchedule?.weekEnd || undefined}
                            isDisabled={!selected}
                          />
                        </Td>
                        <Td>
                          <Select
                            size="sm"
                            placeholder="Select operator"
                            value={selectedRow?.assignedOperatorId || ''}
                            onChange={(e) => updateAddTicket(ticket._id, 'assignedOperatorId', e.target.value)}
                            isDisabled={!selected || isLoadingOperatorsList}
                          >
                            {operatorsList?.data?.map(op => (
                              <option key={op._id} value={op._id}>
                                {`${op.first_name} ${op.last_name}`}
                              </option>
                            ))}
                          </Select>
                        </Td>
                        <Td>
                          <Select
                            size="sm"
                            placeholder="Select machine"
                            value={selectedRow?.assignedMachineUnitId || ''}
                            onChange={(e) => updateAddTicket(ticket._id, 'assignedMachineUnitId', e.target.value)}
                            isDisabled={!selected || !typeId}
                          >
                            {unitsForType.map(unit => (
                              <option key={unit._id} value={unit._id}>
                                {unit.plateNumber} - {unit.machineryTypeId?.equipmentType}
                              </option>
                            ))}
                          </Select>
                        </Td>
                      </Tr>
                    );
                  })
                )}
              </Tbody>
            </Table>
          </Box>

          {/* NEW: Pagination controls (copied style from ticket page) */}
          <Flex justifyContent="space-between" alignItems="center" mt={4}>
            <Text color="gray.600" fontSize="sm">
              Page {modalPendingCurrentPage} of {modalPendingTotalPages || 1} ({modalPendingTotalItems} total)
            </Text>
            <Flex>
              <Button
                size="sm"
                onClick={() => setAddModalPendingPage(Math.max(1, addModalPendingPage - 1))}
                isDisabled={addModalPendingPage === 1}
                colorScheme="blue"
                variant="outline"
                mr={2}
              >
                Previous
              </Button>
              <Button
                size="sm"
                onClick={() => setAddModalPendingPage(Math.min(modalPendingTotalPages, addModalPendingPage + 1))}
                isDisabled={addModalPendingPage >= modalPendingTotalPages}
                colorScheme="blue"
                variant="outline"
              >
                Next
              </Button>
            </Flex>
          </Flex>
        </ModalBody>
        <ModalFooter bg="gray.50" borderTopWidth="1px" borderColor="gray.200">
          <Button
            variant="outline"
            mr={3}
            onClick={() => { setAddTicketsData([]); setAddModalPendingPage(1); onCloseAddModal(); }}
            size="md"
          >
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleAddTicketsToSchedule}
            isLoading={isMovingToSchedule}
            size="md"
            isDisabled={
              addTicketsData.length === 0 ||
              addTicketsData.some(t => !t.assignedDate || !t.assignedOperatorId || !t.assignedMachineUnitId)
            }
          >
            Add to Schedule
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>

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
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
import { GiFarmTractor } from "react-icons/gi";

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
  isPendingPage,
  isScheduledPage,
  isOngoingPage,
  isDeclinedPage,

  selectedTicketsSetter
}) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState(0);

  // Schedule creation state
  const [scheduleData, setScheduleData] = useState({
    weekStart: '',
    weekEnd: '',
    tickets: []
  });

  console.log(scheduleData)

  const {
    machineryUnitsForDropDown,
    isLoadingMachineryUnitsForDropDown,
    machineryUnitsForDropDownError,
    
    operatorsList,
    isLoadingOperatorsList,
    operatorsListError,
    
    submitTicketRequest,
    isSubmittingTicketRequest,
    
    createWeeklySchedule,
    isCreatingWeeklySchedule,

    removeFromSchedule,
    isRemovingFromSchedule,
    
    moveToSchedule,
    isMovingToSchedule
  } = useAdminDashboard();

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

  // Update a specific ticket in the schedule
  const updateTicketInSchedule = (ticketId, field, value) => {
    setScheduleData(prev => ({
      ...prev,
      tickets: prev.tickets.map(ticket => 
        ticket.ticketId === ticketId ? { ...ticket, [field]: value } : ticket
      )
    }));
  };

  // Handle submit for creating a weekly schedule
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
        queryClient.invalidateQueries({ queryKey: ['scheduledTicketRequests'] })
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

  // Handle removing a ticket from schedule
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
      
      // Close modal and refresh data
      onClose();
      
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['pendingTicketRequests'] }),
        queryClient.invalidateQueries({ queryKey: ['scheduledTicketRequests'] })
      ]);
      
    } catch (error) {
      console.error('Error removing ticket from schedule:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to remove ticket from schedule",
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

  const [size, setSize] = useState('');

  useEffect(() => {
    if (isPendingPage || isScheduledPage || isOngoingPage || isDeclinedPage) {
      setSize('6xl');
    } else {
      setSize('2xl');
    }
  }, [isPendingPage, isScheduledPage, isOngoingPage, isDeclinedPage]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={size} closeOnOverlayClick={false} scrollBehavior="inside" isCentered>
      <ModalOverlay />
      <ModalContent borderRadius="md" overflow="hidden">
        {/* Header styling based on page context */}

        { !isPendingPage && !isScheduledPage && !isOngoingPage && !isDeclinedPage && (
          <ModalHeader bg="yellow.50" borderBottomWidth="1px" borderColor="gray.200" display="flex" alignItems="center">
            <GiFarmTractor style={{ marginRight: 12, color: '#eab308' }} />
            Ticket Request Detail
          </ModalHeader>
        )}
        

        {isPendingPage && (
          <ModalHeader bg="yellow.50" borderBottomWidth="1px" borderColor="gray.200" display="flex" alignItems="center">
            <GiFarmTractor style={{ marginRight: 12, color: '#eab308' }} />
            Manage Pending Ticket Requests
          </ModalHeader>
        )}
        
        {isScheduledPage && (
          <ModalHeader bg="blue.50" borderBottomWidth="1px" borderColor="gray.200" display="flex" alignItems="center">
            <FaCalendarAlt style={{ marginRight: 12, color: '#3182ce' }} />
            Manage Scheduled Tickets
          </ModalHeader>
        )}
        
        {isOngoingPage && (
          <ModalHeader bg="green.50" borderBottomWidth="1px" borderColor="gray.200" display="flex" alignItems="center">
            <FaTools style={{ marginRight: 12, color: '#38a169' }} />
            Ongoing Ticket Details
          </ModalHeader>
        )}
        
        {isDeclinedPage && (
          <ModalHeader bg="red.50" borderBottomWidth="1px" borderColor="gray.200" display="flex" alignItems="center">
            <CloseIcon style={{ marginRight: 12, color: '#e53e3e' }} />
            Declined Ticket Details
          </ModalHeader>
        )}

        <ModalBody py={6}>
          {selectedTickets.length === 0 ? (
            <VStack spacing={4} align="center" py={6}>
              <Text color="gray.600">No tickets selected. Please select tickets to manage.</Text>
            </VStack>
          ) : (
            <Tabs 
              index={activeTab} 
              onChange={setActiveTab} 
              colorScheme={
                isPendingPage ? "yellow" : 
                isScheduledPage ? "blue" : 
                isOngoingPage ? "green" : 
                "red"
              }
              variant="enclosed"
            >
              <TabList>
                {isPendingPage && <Tab>Create Weekly Schedule</Tab>}
                {isScheduledPage && <Tab>Manage Schedule</Tab>}
                <Tab>Ticket Details</Tab>
              </TabList>
              
              <TabPanels>
                {/* Tab Panel for Creating Weekly Schedule */}
                {isPendingPage && (
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
                                      isDisabled={isLoadingMachineryUnitsForDropDown}
                                    >
                                      {machineryUnitsForDropDown?.data?.map(unit => (
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
                )}
                
                {/* Tab Panel for Managing Scheduled Tickets */}
                {isScheduledPage && (
                  <TabPanel px={0} pt={4} pb={0}>
                    <VStack spacing={4} align="stretch">
                      <Box bg="blue.50" p={3} borderRadius="md" mb={2}>
                        <Text fontSize="sm" color="blue.700">
                          Manage scheduled tickets. You can remove tickets from the schedule.
                        </Text>
                      </Box>
                      
                      <Box overflowX="auto">
                        <Table variant="simple" size="sm">
                          <Thead>
                            <Tr>
                              <Th>Reference</Th>
                              <Th>Farmer</Th>
                              <Th>Machine Type</Th>
                              <Th>Assigned Date</Th>
                              <Th>Operator</Th>
                              <Th>Actions</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {selectedTickets.map((ticket) => (
                              <Tr key={ticket._id}>
                                <Td>{ticket.refNumber}</Td>
                                <Td>{`${ticket?.requestorFarmer?.first_name} ${ticket?.requestorFarmer?.surname}`}</Td>
                                <Td>{ticket?.requestedMachineType?.equipmentType}</Td>
                                <Td>{formatDate(ticket.assignedDate)}</Td>
                                <Td>{`${ticket?.assignedOperator?.first_name || ''} ${ticket?.assignedOperator?.last_name || ''}`}</Td>
                                <Td>
                                  <Button
                                    colorScheme="red"
                                    size="xs"
                                    onClick={() => handleRemoveFromSchedule(ticket._id)}
                                    isLoading={isRemovingFromSchedule}
                                  >
                                    Remove
                                  </Button>
                                </Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </Box>
                    </VStack>
                  </TabPanel>
                )}
                
                {/* Tab Panel for Ticket Details */}
                <TabPanel px={0} pt={2} pb={0}>
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
                                <Text fontWeight="bold" fontSize="sm" color="gray.600">Barangay</Text>
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
                            <>
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
                            </>
                          )}
                        </Box>
                      ))}
                    </VStack>
                  ) : (
                    <VStack spacing={4} align="center" py={4}>
                      <Text color="gray.600" fontSize="sm">No tickets selected to view detailed information.</Text>
                    </VStack>
                  )}
                </TabPanel>
              </TabPanels>
            </Tabs>
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
  );
};

export default TicketRequestPanel;
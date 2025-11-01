import React, { useState, useEffect, useMemo } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  Box, VStack, Text, Heading, Divider, SimpleGrid, Badge, Flex, Button, Tabs, TabList, TabPanels, Tab, TabPanel,
  FormControl, FormLabel, Input, Select, useToast, Table, Thead, Tbody, Tr, Th, Td,
  useDisclosure, Icon
} from '@chakra-ui/react';

import { FaCalendarAlt } from "react-icons/fa";
import { IoIosRemoveCircle } from "react-icons/io";
import { GoAlertFill } from "react-icons/go";

import { useAdminDashboard } from '../machineries/store/adminDashboard.store.js';
import { useQueryClient } from '@tanstack/react-query';
import AddTicketPanel from './addTicketPanel.jsx';

const OngoingTicketPanel = ({
  isOpen,
  onClose,
  selectedWeeklySchedule = null,
  onRequestReopenSchedule
}) => {
  const toast = useToast();
  const queryClient = useQueryClient();

  const [ticketUpdateData, setTicketUpdateData] = useState({
    scheduleId: null,
    tickets: []
  });

  const [initialTicketData, setInitialTicketData] = useState([]);
  const [selectedTicketForRemoval, setSelectedTicketForRemoval] = useState(null);
  const [unitsByType, setUnitsByType] = useState({});

  const {
    operatorsList,
    isLoadingOperatorsList,
    
    removeFromSchedule,
    isRemovingFromSchedule,
    
    getMachineryUnitsForDropDownByType,
    
    updateWeeklySchedule,
    isUpdatingWeeklySchedule
  } = useAdminDashboard();

  const { isOpen: isOpenRemoveModal, onOpen: onOpenRemoveModal, onClose: onCloseRemoveModal } = useDisclosure();
  const { isOpen: isOpenAddModal, onOpen: onOpenAddModal, onClose: onCloseAddModal } = useDisclosure();

  // Fetch units for each unique requestedMachineType
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
        console.error('Failed to load units for type', typeId, e);
      }
    });
  }, [selectedWeeklySchedule, isOpen]);

  // Initialize scheduled tickets for updating
  useEffect(() => {
    if (selectedWeeklySchedule && isOpen) {
      const initializedTickets = selectedWeeklySchedule.ticketRequests.map(ticket => ({
        ticketId: ticket.ticketRequestId,
        assignedDate: ticket.assignedDate ? new Date(ticket.assignedDate).toISOString().split('T')[0] : '',
        assignedOperatorId: ticket.ticketDetails?.assignedOperator?.assignedOperatorId || '', 
        assignedMachineUnitId: ticket.ticketDetails?.assignedMachineUnit?.assignedMachineUnitId || ''
      }));
      
      setTicketUpdateData({
        scheduleId: selectedWeeklySchedule._id,
        tickets: initializedTickets
      });

      setInitialTicketData(initializedTickets);
    }
  }, [selectedWeeklySchedule, isOpen]);

  const updateTicketInUpdateData = (ticketId, field, value) => {
    setTicketUpdateData(prev => ({
      ...prev,
      tickets: prev.tickets.map(ticket => 
        ticket.ticketId === ticketId ? { ...ticket, [field]: value } : ticket
      )
    }));
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

      setSelectedTicketForRemoval(null);
      onCloseRemoveModal();
      onClose();
      
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['inProgressWeeklySchedules'] }),
      ]);

      onRequestReopenSchedule?.(selectedWeeklySchedule?._id);
      
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

  const handleUpdateSchedule = async () => {
    const changedTickets = ticketUpdateData.tickets.filter((current, index) => {
      const initial = initialTicketData[index];
      if (!initial) return true;
      
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
      
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['inProgressWeeklySchedules'] }),
      ]);

      onRequestReopenSchedule?.(selectedWeeklySchedule?._id);

    } catch (error) {
      console.error('Error updating weekly schedule:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update weekly schedule",
        status: "error",
        duration: 5000,
        isClosable: true
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not assigned';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

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
      <Modal isOpen={isOpen} onClose={onClose} size="6xl" closeOnOverlayClick={false} scrollBehavior="inside" isCentered motionPreset='none'>
        <ModalOverlay />
        <ModalContent borderRadius="md" overflow="hidden" minHeight={{ base: 'auto', md: '835px' }}>
          <ModalHeader bg="purple.50" borderBottomWidth="1px" borderColor="gray.200" display="flex" alignItems="center">
            <FaCalendarAlt style={{ marginRight: 12, color: 'purple' }} />
            Manage Ongoing Schedule
          </ModalHeader>

          <ModalBody py={6}>
            {selectedWeeklySchedule ? (
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
                              <Th></Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {selectedWeeklySchedule.ticketRequests.map((tr) => {
                              const ticket = tr.ticketDetails;
                              if (!ticket) return null;
                              
                              const updateTicket = ticketUpdateData.tickets.find(t => t.ticketId === tr.ticketRequestId);
                              const typeId = ticket?.requestedMachineType?.requestedMachineTypeId;
                              const unitsForType = (typeId && unitsByType[typeId]) ? unitsByType[typeId] : [];
                              
                              const sortedOperators = [...(operatorsList?.data || [])].sort((a, b) => {
                                if (a._id === updateTicket?.assignedOperatorId) return -1;
                                if (b._id === updateTicket?.assignedOperatorId) return 1;
                                return 0;
                              });

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
                                      </>
                                    )}
                                  </Td>
                                  <Td fontSize={'xs'}>
                                    {ticket.disabledForEditing === true ? (
                                      <>
                                        {ticket.assignedMachineUnit.plateNumber}
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
                                              {unit.plateNumber} - {unit.machineryTypeId?.equipmentType}
                                            </option>
                                          ))}
                                        </Select>
                                      </>
                                    )}
                                  </Td>
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
            ) : (
              <VStack spacing={4} align="center" py={4}>
                <Text color="gray.600" fontSize="sm">No weekly schedule selected to manage.</Text>
              </VStack>
            )}
          </ModalBody>

          <ModalFooter bg="gray.50" borderTopWidth="1px" borderColor="gray.200">
            <Button variant="outline" onClick={onClose} size="md">
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
      <Modal isOpen={isOpenRemoveModal} size="xs" onClose={onCloseRemoveModal} closeOnOverlayClick={false} scrollBehavior="inside" isCentered motionPreset="none">
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

export default OngoingTicketPanel;

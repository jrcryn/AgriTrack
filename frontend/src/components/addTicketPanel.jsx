import React, { useEffect, useState } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  Box, Text, Flex, Button, Table, Thead, Tbody, Tr, Th, Td,
  Select, Input, Checkbox, Center, Spinner, Icon, useToast
} from '@chakra-ui/react';
import { FaCalendarAlt } from 'react-icons/fa';
import { useQueryClient } from '@tanstack/react-query';
import { useAdminDashboard } from '../machineries/store/adminDashboard.store.js';

const AddTicketPanel = ({
  isOpen,
  onClose,
  selectedWeeklySchedule,
  onRequestReopenSchedule,
  onCloseParent
}) => {
  const toast = useToast();
  const queryClient = useQueryClient();

  // Pagination for pending tickets in modal
  const [addModalPendingPage, setAddModalPendingPage] = useState(1);

  const {
    operatorsList,
    isLoadingOperatorsList,
    getMachineryUnitsForDropDownByType,
    
    moveToSchedule,
    isMovingToSchedule,
    pendingTicketRequests,
    isLoadingPendingTicketRequests
  } = useAdminDashboard(
    { pendingPage: addModalPendingPage },
    {}
  );

  // Local selection state
  const [addTicketsData, setAddTicketsData] = useState([]); // [{ ticketId, assignedDate, assignedOperatorId, assignedMachineUnitId }]
  const [unitsByType, setUnitsByType] = useState({}); // typeId -> units
  console.log('Add Tickets Data:', addTicketsData);
  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setAddModalPendingPage(1);
      setAddTicketsData([]);
      setUnitsByType({});
    }
  }, [isOpen]);

  // Schedule capacity and remaining slots
  const scheduleCapacity = 5;
  const currentScheduledCount = selectedWeeklySchedule?.ticketRequests?.length || 0;
  const remainingQuota = Math.max(0, scheduleCapacity - currentScheduledCount);

  // Build selectable pending list excluding already scheduled IDs
  const allPending = pendingTicketRequests?.data?.relevantTickets || [];
  const alreadyScheduledIds = new Set((selectedWeeklySchedule?.ticketRequests || []).map(tr => tr.ticketRequestId));
  const selectablePending = allPending.filter(t => !alreadyScheduledIds.has(t._id));

  // Pagination meta
  const modalPendingCurrentPage = pendingTicketRequests?.data?.currentPage || 1;
  const modalPendingTotalPages = pendingTicketRequests?.data?.totalPages || 1;
  const modalPendingTotalItems = pendingTicketRequests?.data?.totalCount || 0;

  // Fetch units for selected tickets' machine types
  useEffect(() => {
    if (!isOpen || addTicketsData.length === 0) return;

    const ticketMap = new Map(selectablePending.map(t => [t._id, t]));
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
      } catch {
        // silent
      }
    });
  }, [isOpen, addTicketsData, selectablePending, getMachineryUnitsForDropDownByType, unitsByType]);

  const isSelectedForAdd = (ticketId) => addTicketsData.some(t => t.ticketId === ticketId);

  const toggleAddSelection = (ticket) => {
    setAddTicketsData(prev => {
      const exists = prev.some(t => t.ticketId === ticket._id);
      if (exists) {
        return prev.filter(t => t.ticketId !== ticket._id);
      }
      if (prev.length >= remainingQuota) {
        toast({
          title: 'Selection limit reached',
          description: `You can only add up to ${remainingQuota} more ticket(s) to this schedule.`,
          status: 'warning',
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
        title: 'No tickets selected',
        description: 'Select at least one pending ticket to add.',
        status: 'warning',
        duration: 3000,
        isClosable: true
      });
      return;
    }

    // Validate required fields
    const incomplete = addTicketsData.filter(
      t => !t.assignedDate || !t.assignedOperatorId || !t.assignedMachineUnitId
    );
    if (incomplete.length > 0) {
      toast({
        title: 'Incomplete assignments',
        description: 'Please assign date, operator and machine unit for all selected tickets.',
        status: 'warning',
        duration: 4000,
        isClosable: true
      });
      return;
    }

    // Validate dates within range
    const ws = selectedWeeklySchedule?.weekStart ? new Date(selectedWeeklySchedule.weekStart) : null;
    const we = selectedWeeklySchedule?.weekEnd ? new Date(selectedWeeklySchedule.weekEnd) : null;
    const outOfRange = addTicketsData.some(t => {
      if (!ws || !we) return false;
      const d = new Date(t.assignedDate);
      return d < ws || d > we;
    });
    if (outOfRange) {
      toast({
        title: "Date out of range",
        description: "Assigned dates must be within this schedule's start and end dates.",
        status: 'warning',
        duration: 4000,
        isClosable: true
      });
      return;
    }

    try {
      await moveToSchedule({
        targetScheduleId: selectedWeeklySchedule._id,
        tickets: addTicketsData
      });

      toast({
        title: 'Tickets added',
        description: `${addTicketsData.length} ticket(s) added to the schedule.`,
        status: 'success',
        duration: 5000,
        isClosable: true
      });

      const scheduleId = selectedWeeklySchedule._id;

      setAddTicketsData([]);
      onClose();
      onCloseParent?.();

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['pendingTicketRequests'] }),
        queryClient.invalidateQueries({ queryKey: ['weeklySchedules'] })
      ]);

      onRequestReopenSchedule?.(scheduleId);
    } catch (error) {
      toast({
        title: 'Failed to add tickets',
        description: error?.response?.data?.message || 'Unable to add tickets to the schedule.',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    }
  };

  const takenDates = selectedWeeklySchedule?.ticketRequests?.map(td => new Date(td.assignedDate).toISOString().split('T')[0]);

  console.log('Taken Dates in Schedule:', takenDates);
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => { setAddTicketsData([]); setAddModalPendingPage(1); onClose(); }}
      size="6xl"
      closeOnOverlayClick={false}
      scrollBehavior="inside"
      isCentered
      motionPreset="none"
    >
      <ModalOverlay />
      <ModalContent borderRadius="lg" overflow="hidden" minHeight={{ base: 'auto', md: '80vh' }}>
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
        <ModalBody py={6}>
          <Box bg="blue.50" p={3} borderRadius="md" mb={4}>
            <Text fontSize="sm" color="blue.700">
              Select up to {remainingQuota} pending ticket(s) to add to this weekly schedule. Assign date, operator, and machine unit for each.
            </Text>
          </Box>

          <Box overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead bg="gray.50">
                <Tr fontSize={'xs'}>
                  <Th width={'10px'}>Select</Th>
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
                {isLoadingPendingTicketRequests ? (
                  <Tr>
                    <Td colSpan={7}>
                      <Center p={10}>
                        <Spinner size="lg" color="blue.500" />
                      </Center>
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
                      <Tr key={ticket._id} onClick={() => {toggleAddSelection(ticket)}} fontSize="sm" cursor='pointer'>
                        <Td>
                          <Checkbox
                            isChecked={selected}
                            onChange={(e) => {e.stopPropagation(); toggleAddSelection(ticket);}}
                            isDisabled={!selected && addTicketsData.length >= remainingQuota}
                          />
                        </Td>
                        <Td fontWeight="semibold" fontSize={'xs'}>{ticket.refNumber}</Td>
                        <Td fontSize={'xs'}>{`${ticket?.requestorFarmer?.first_name || '-'} ${ticket?.requestorFarmer?.surname || '-'}`}</Td>
                        <Td fontSize={'xs'}>{ticket?.barangay || '-'}</Td>
                        <Td fontSize={'xs'}>{ticket?.requestedMachineType?.equipmentType || '-'}</Td>
                        <Td fontSize={'xs'}>{ticket?.estimatedArea || '-'}</Td>
                        <Td onClick={(e) => {e.stopPropagation();}}>
                          <Input
                            type="date"
                            size="xs"
                            value={selectedRow?.assignedDate || ''}
                            onChange={(e) => {
                              const selectedDate = e.target.value;
                              if (takenDates.includes(selectedDate)) {
                                // Date is taken: show warning, clear the input, and don't update state
                                toast({
                                  title: 'Date unavailable',
                                  description: 'This date is already assigned in the schedule. Please choose another.',
                                  status: 'warning',
                                  duration: 5000,
                                  isClosable: true
                                });
                                updateAddTicket(ticket._id, 'assignedDate', ''); // Clear the field
                              } else {
                                // Date is available: proceed with update
                                updateAddTicket(ticket._id, 'assignedDate', selectedDate);
                              }
                            }}
                            min={
                              selectedWeeklySchedule?.weekStart
                                ? new Date(selectedWeeklySchedule.weekStart).toISOString().split('T')[0]
                                : undefined
                            }
                            max={
                              selectedWeeklySchedule?.weekEnd
                                ? new Date(selectedWeeklySchedule.weekEnd).toISOString().split('T')[0]
                                : undefined
                            }
                            isDisabled={!selected}
                            onClick={(e) => {e.stopPropagation();}}
                          />
                        </Td>
                        <Td onClick={(e) => {e.stopPropagation();}}>
                          <Select
                            size="xs"
                            placeholder="Select operator"
                            value={selectedRow?.assignedOperatorId || ''}
                            onChange={(e) => updateAddTicket(ticket._id, 'assignedOperatorId', e.target.value)}
                            isDisabled={!selected || isLoadingOperatorsList}
                            onClick={(e) => {e.stopPropagation();}}
                          >
                            {operatorsList?.data?.map(op => (
                              <option key={op._id} value={op._id}>
                                {`${op.first_name} ${op.last_name}`}
                              </option>
                            ))}
                          </Select>
                        </Td>
                        <Td onClick={(e) => {e.stopPropagation();}}>
                          <Select
                            size="xs"
                            placeholder="Select machine"
                            value={selectedRow?.assignedMachineUnitId || ''}
                            onChange={(e) => updateAddTicket(ticket._id, 'assignedMachineUnitId', e.target.value)}
                            isDisabled={!selected || !typeId}
                            onClick={(e) => {e.stopPropagation();}}
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

          {/* Pagination controls */}
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
            onClick={() => { setAddTicketsData([]); setAddModalPendingPage(1); onClose(); }}
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
  );
};

export default AddTicketPanel;

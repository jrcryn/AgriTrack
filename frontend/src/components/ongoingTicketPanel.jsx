import React, { useState, useEffect, useMemo } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  Box, VStack, Text, Heading, Divider, SimpleGrid, Badge, Flex, Button, Tabs, TabList, TabPanels, Tab, TabPanel,
  FormControl, FormLabel, Input, Select, useToast, Table, Thead, Tbody, Tr, Th, Td,
  useDisclosure, Icon
} from '@chakra-ui/react';

import { FaCalendarAlt } from "react-icons/fa";

import { useAdminDashboard } from '../machineries/store/adminDashboard.store.js';
import { useQueryClient } from '@tanstack/react-query';
import ReturnTicketPanel from './returnTicketPanel.jsx';
import TicketRequestCompletedDetailsPanel from './ticketRequestCompletedDetailsPanel.jsx';
import { useAuthStore } from '../auth/store/authStore.js';

const OngoingTicketPanel = ({
  isOpen,
  onClose,
  selectedWeeklySchedule = null,
  onRequestReopenSchedule
}) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { isOpen: isOpenReturnModal, onOpen: onOpenReturnModal, onClose: onCloseReturnModal } = useDisclosure();
  const [selectedTicketForReturn, setSelectedTicketForReturn] = useState(null);
  
  const { isOpen: isOpenCompletedDetails, onOpen: onOpenCompletedDetails, onClose: onCloseCompletedDetails } = useDisclosure();
  const [selectedCompletedTicket, setSelectedCompletedTicket] = useState(null);
  const [isExtensionTicket, setIsExtensionTicket] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      // Reset return modal state when parent closes
      if (isOpenReturnModal) {
        onCloseReturnModal();
        setSelectedTicketForReturn(null);
      }
      if (isOpenCompletedDetails) {
        onCloseCompletedDetails();
        setSelectedCompletedTicket(null);
      }
    }
  }, [isOpen]);

  const handleOpenReturnModal = (ticket) => {
    setSelectedTicketForReturn(ticket);
    // Use setTimeout to ensure state is set before opening
    setTimeout(() => {
      onOpenReturnModal();
    }, 0);
  };

  const handleCloseReturnModal = () => {
    onCloseReturnModal();
    // Clear selection after modal animation completes
    setTimeout(() => {
      setSelectedTicketForReturn(null);
    }, 200);
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

  const isToday = (dateString) => {
    if (!dateString) return false;
    const today = new Date();
    const assignedDate = new Date(dateString);
    return today.toDateString() === assignedDate.toDateString();
  };

  const isTodayOrPast = (dateString) => {
    if (!dateString) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const assignedDate = new Date(dateString);
    assignedDate.setHours(0, 0, 0, 0);
    return assignedDate <= today;
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="6xl" closeOnOverlayClick={false} scrollBehavior="inside" isCentered motionPreset='none' blockScrollOnMount={false}>
        <ModalOverlay />
        <ModalContent borderRadius="md" overflow="hidden">
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
                              <Th width={'120px'}>Assigned Date</Th>
                              <Th width={'170px'}>Assigned Operator</Th>
                              <Th width={'120px'}>Machine Unit</Th>
                              <Th></Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {selectedWeeklySchedule.ticketRequests.map((tr) => {
                              // Show extension ticket if present, else regular ticket
                              const ticket = tr.extensionRequestId ? tr.extensionDetails : tr.ticketDetails;
                              const hasExtensionRequest = tr.extensionRequestId ? true : (ticket.extensionNeeded === true);
                              const rowBgColor = ticket.status === 'Completed' ? 'green.100' : ticket.status === 'Partially Completed' ? 'orange.100' : null;

                              return (
                                <Tr key={tr.ticketRequestId || tr._id} bgColor={rowBgColor}>
                                  <Td fontWeight="semibold" fontSize={'xs'}>
                                    {/* Remove orange color for extension tickets */}
                                    <Text>{ticket.refNumber}</Text>
                                  </Td>
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
                                    <Text>{formatDate(ticket.assignedDate) || '-'}</Text>
                                  </Td>
                                  <Td fontSize={'xs'}>
                                    {ticket.assignedOperator
                                      ? <Text>{`${ticket.assignedOperator?.first_name || '-'} ${ticket.assignedOperator?.last_name || ''}`}</Text>
                                      : '-'}
                                  </Td>
                                  <Td fontSize={'xs'}>
                                    {/* Remove orange color for extension tickets */}
                                    <Text>{ticket.assignedMachineUnit?.unitNumber || '-'}</Text>
                                  </Td>
                                  <Td>
                                    {/* Extension ticket: show Update only if not completed, View Details only if completed */}
                                    {hasExtensionRequest ? (
                                      (ticket.status === 'Completed' || ticket.status === 'Partially Completed') ? (
                                        <Button
                                          size={'xs'}
                                          colorScheme={tr.ticketDetails?.incidentReport ? 'red' : 'green'}
                                          ml={1}
                                          onClick={() => {
                                            setSelectedCompletedTicket(ticket);
                                            onOpenCompletedDetails();
                                            setIsExtensionTicket(tr.extensionRequestId ? true : false);

                                          }}
                                        >
                                          View Details
                                        </Button>
                                      ) : (
                                        <Button
                                          colorScheme='yellow'
                                          size={'xs'}
                                          mr={2}
                                          onClick={() => {
                                            handleOpenReturnModal(ticket);
                                            setIsExtensionTicket(tr.extensionRequestId ? true : false);
                                          }}
                                          isDisabled={ticket.disabledForEditing === false || !isTodayOrPast(ticket.assignedDate)}
                                        >
                                          Update Ticket
                                        </Button>
                                      )
                                    ) : (
                                      // Regular ticket: show View Details only if completed, else Update
                                      ticket.status === 'Completed' ? (
                                        <Button
                                          size={'xs'}
                                          colorScheme={ticket.incidentReport ? 'red' : 'green'}
                                          ml={1}
                                          onClick={() => {
                                            setSelectedCompletedTicket(ticket);
                                            onOpenCompletedDetails();
                                          }}
                                        >
                                          View Details
                                        </Button>
                                      ) : (
                                        <Button
                                          colorScheme='yellow'
                                          size={'xs'}
                                          mr={5}
                                          onClick={() => {
                                            handleOpenReturnModal(ticket);
                                          }}
                                          isDisabled={ticket.disabledForEditing === false || !isTodayOrPast(ticket.assignedDate)}
                                        >
                                          Update Ticket
                                        </Button>
                                      )
                                    )}
                                  </Td>
                                </Tr>
                              );
                            })}
                          </Tbody>
                        </Table>
                      </Box>
                    </Box>
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
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Return Ticket Modal */}
      <ReturnTicketPanel
        isOpen={isOpenReturnModal}
        onClose={handleCloseReturnModal}
        selectedTicket={selectedTicketForReturn}
        scheduleId={selectedWeeklySchedule?._id}
        onRequestReopenSchedule={onRequestReopenSchedule}
        isExtensionTicket={isExtensionTicket}
      />

      {/* Completed Ticket Details Modal */}
      <TicketRequestCompletedDetailsPanel
        isOpen={isOpenCompletedDetails}
        onClose={() => {
          onCloseCompletedDetails();
          setTimeout(() => setSelectedCompletedTicket(null), 200);
        }}
        selectedTicket={selectedCompletedTicket}
        isExtensionTicket={isExtensionTicket}
      />
    </>
  );
};

export default OngoingTicketPanel;

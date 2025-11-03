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

const OngoingTicketPanel = ({
  isOpen,
  onClose,
  selectedWeeklySchedule = null,
  onRequestReopenSchedule
}) => {
  const toast = useToast();
  const queryClient = useQueryClient();

  const { isOpen: isOpenReturnModal, onOpen: onOpenReturnModal, onClose: onCloseReturnModal } = useDisclosure();
  const [selectedTicketForReturn, setSelectedTicketForReturn] = useState(null);
  
  const { isOpen: isOpenCompletedDetails, onOpen: onOpenCompletedDetails, onClose: onCloseCompletedDetails } = useDisclosure();
  const [selectedCompletedTicket, setSelectedCompletedTicket] = useState(null);

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
                              const ticket = tr.ticketDetails;
                              return (
                                <Tr key={tr.ticketRequestId} bgColor={ticket.status === 'Completed' ? 'green.100' : null}>
                                  <Td fontWeight="semibold" fontSize={'xs'} >{ticket.refNumber}</Td>
                                  <Td fontSize={'xs'}>{`${ticket.requestorFarmer?.first_name} ${ticket.requestorFarmer?.surname}`}</Td>
                                  <Td fontSize={'xs'}>{ticket.barangay}</Td>
                                  <Td fontSize={'xs'}>{ticket.requestedMachineType?.equipmentType}</Td>
                                  <Td fontSize={'xs'}>{ticket.estimatedArea}</Td>
                                  <Td fontSize={'xs'}>
                                    {formatDate(ticket.assignedDate) || '-'}
                                  </Td>
                                  <Td fontSize={'xs'}>
                                    {ticket.assignedOperator?.first_name || '-'} {ticket.assignedOperator?.last_name || ''}
                                  </Td>
                                  <Td fontSize={'xs'}>
                                    {ticket.assignedMachineUnit?.plateNumber || '-'}
                                  </Td>
                                  <Td>
                                    {ticket.status === 'Completed' ? (
                                      <>
                                      <Badge colorScheme='green' fontSize='10px' pl={4} borderRadius='md'>
                                        Completed
                                      </Badge>
                                      <Button 
                                        size={'xs'} 
                                        colorScheme='green' 
                                        ml={1}
                                        onClick={() => {
                                          setSelectedCompletedTicket(ticket);
                                          onOpenCompletedDetails();
                                        }}
                                      >
                                        View Details
                                      </Button>
                                      </>
                                    ) : (
                                      <Button
                                        colorScheme='yellow'
                                        size={'xs'}
                                        mr={5}
                                        onClick={() => {
                                          handleOpenReturnModal(ticket);
                                        }}
                                        isDisabled={ticket.disabledForEditing === false}
                                      >
                                        Update Ticket
                                      </Button>
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
      />

      {/* Completed Ticket Details Modal */}
      <TicketRequestCompletedDetailsPanel
        isOpen={isOpenCompletedDetails}
        onClose={() => {
          onCloseCompletedDetails();
          setTimeout(() => setSelectedCompletedTicket(null), 200);
        }}
        selectedTicket={selectedCompletedTicket}
      />
    </>
  );
};

export default OngoingTicketPanel;

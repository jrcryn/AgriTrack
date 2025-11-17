import React, { useState, useEffect } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  Box, VStack, Text, Heading, SimpleGrid, Badge, Button, Divider, AspectRatio, HStack, Alert, AlertIcon,
  Table, Thead, Tbody, Tr, Th, Td, Select, Input, Textarea, useToast
} from '@chakra-ui/react';
import { FaCheckCircle } from "react-icons/fa";
import { useAuthStore } from '../auth/store/authStore.js';
import { useAdminDashboard } from '../machineries/store/adminDashboard.store.js';

const TicketRequestCompletedDetailsPanel = ({ 
    isOpen, 
    onClose, 
    selectedTicket
 }) => {

  const { user } = useAuthStore();
  const toast = useToast();
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);
  const [selectedExtension, setSelectedExtension] = useState(null);
  const [unitsByType, setUnitsByType] = useState({});
  const [declineReason, setDeclineReason] = useState('');
  const [extensionUpdateData, setExtensionUpdateData] = useState({
    assignedOperatorId: '',
    assignedMachineUnitId: ''
  });

  const {
    operatorsList,
    isLoadingOperatorsList,
    getMachineryUnitsForDropDownByType,

    approveExtensionRequest,
    isApprovingExtensionRequest,
    declineExtensionRequest,
    isDecliningExtensionRequest,
  } = useAdminDashboard();

  const formatDate = (dateString) => {
    if (!dateString) return 'Not assigned';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Convert uc?id= format to thumbnail format for better compatibility
  const getImageUrl = (url) => {
    if (!url) return null;
    
    // Extract file ID from the URL
    const match = url.match(/[?&]id=([^&]+)/);
    if (match && match[1]) {
      const fileId = match[1];
      // Use thumbnail format which works better for embedding
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
    }
    
    return url;
  };

  //helper handler para i reasy yung data
  const handleApproveExtension = (extension, index) => {
    // Next day relative to the ticket's original assigned date
    const base = selectedTicket?.assignedDate ? new Date(selectedTicket.assignedDate) : new Date();
    const next = new Date(base);
    next.setDate(base.getDate() + 1);
    const nextFormatted = next.toISOString().split('T')[0];

    setSelectedExtension(extension);
    setExtensionUpdateData({
      assignedOperatorId: extension.assignedOperator?._id || '',
      assignedMachineUnitId: extension.assignedMachineUnit?._id || '',
      assignedDate: nextFormatted // read-only, for display only
    });
    setIsApproveModalOpen(true);
  };


  //handler for confirm approve
  const handleConfirmApprove = async () => {
    if (!selectedTicket || !selectedExtension) return;
    try {
      await approveExtensionRequest({
        ticketRequestId: selectedTicket._id,
        extensionTicketId: selectedExtension._id,
        employeeId: user?.id,
        assignedOperatorId: extensionUpdateData.assignedOperatorId,
        assignedMachineUnitId: extensionUpdateData.assignedMachineUnitId,
      });
      toast({
        title: 'Extension approved',
        description: 'The extension request has been scheduled.',
        status: 'success',
        duration: 4000,
        isClosable: true,
      });
      onApproveModalClose();
      onClose();
    } catch (e) {
      toast({
        title: 'Failed to approve extension',
        description: e?.response?.data?.message || e?.message || 'Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      console.error('Failed to approve extension:', e);
    }
  };

  const handleDeclineExtension = (extension, index) => {
    setSelectedExtension(extension);
    setIsDeclineModalOpen(true);
  };

  const onApproveModalClose = () => {
    setIsApproveModalOpen(false);
    setSelectedExtension(null);
    setExtensionUpdateData({
      assignedOperatorId: '',
      assignedMachineUnitId: '',
      assignedDate: ''
    });
  };

  const onDeclineModalClose = () => {
    setIsDeclineModalOpen(false);
    setSelectedExtension(null);
    setDeclineReason('');
  };

  const handleConfirmDecline = async () => {
    if (!selectedTicket || !selectedExtension || !declineReason.trim()) return;
    try {
      await declineExtensionRequest({
        ticketRequestId: selectedTicket._id,
        extensionTicketId: selectedExtension._id,
        employeeId: user?._id,
        declineReason: declineReason.trim(),
      });
      toast({
        title: 'Extension declined',
        description: 'The extension request has been removed and the parent ticket completed.',
        status: 'success',
        duration: 4000,
        isClosable: true,
      });
      onDeclineModalClose();
      onClose();
    } catch (e) {
      toast({
        title: 'Failed to decline extension',
        description: e?.response?.data?.message || e?.message || 'Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      console.error('Failed to decline extension:', e);
    }
  };

  // Fetch units for the selected extension's machine type
  useEffect(() => {
    if (!selectedExtension || !isApproveModalOpen) return;

    const typeId = selectedTicket?.requestedMachineType?.requestedMachineTypeId;
    if (!typeId || unitsByType[typeId]) return;

    const fetchUnits = async () => {
      try {
        const res = await getMachineryUnitsForDropDownByType(typeId);
        setUnitsByType(prev => ({ ...prev, [typeId]: res?.data || [] }));
      } catch (e) {
        console.error('Failed to load units for type', typeId, e);
      }
    };

    fetchUnits();
  }, [selectedExtension, isApproveModalOpen, selectedTicket]);

  return (
    <>
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" closeOnOverlayClick={false} scrollBehavior="inside" isCentered motionPreset='none'>
      <ModalOverlay />
      <ModalContent borderRadius="md" overflow="hidden">
        {selectedTicket?.extensionNeeded === true ? (
          <ModalHeader bg="green.50" borderBottomWidth="1px" borderColor="gray.200" display="flex" alignItems="center">
            <FaCheckCircle style={{ marginRight: 12, color: 'green' }} />
            Partially Completed Ticket Details
          </ModalHeader>
        ) : (
          <ModalHeader bg="green.50" borderBottomWidth="1px" borderColor="gray.200" display="flex" alignItems="center">
            <FaCheckCircle style={{ marginRight: 12, color: 'green' }} />
            Completed Ticket Details
          </ModalHeader>
        )}
        

        <ModalBody py={6}>
          {selectedTicket ? (
            <VStack spacing={6} align="stretch">
              {/* Ticket Information */}
              <Box bg="green.50" p={4} borderRadius="md">
                <Heading size="sm" mb={3}>Ticket Information</Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                  <Box>
                    <Text fontWeight="bold" fontSize="sm" color="gray.600">Reference Number</Text>
                    <Text fontSize="md">{selectedTicket.refNumber || 'N/A'}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" fontSize="sm" color="gray.600">Status</Text>
                    <Badge colorScheme="green">{selectedTicket.status}</Badge>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" fontSize="sm" color="gray.600">Requestor Farmer</Text>
                    <Text fontSize="md">
                      {selectedTicket.requestorFarmer?.first_name} {selectedTicket.requestorFarmer?.surname}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" fontSize="sm" color="gray.600">Farm Location</Text>
                    <Text fontSize="md">{selectedTicket.barangay}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" fontSize="sm" color="gray.600">Machine Type</Text>
                    <Text fontSize="md">{selectedTicket.requestedMachineType?.equipmentType}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" fontSize="sm" color="gray.600">Estimated Area</Text>
                    <Text fontSize="md">{selectedTicket.estimatedArea} ha</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" fontSize="sm" color="gray.600">Assigned Date</Text>
                    <Text fontSize="md">{formatDate(selectedTicket.assignedDate)}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" fontSize="sm" color="gray.600">Completed Date</Text>
                    <Text fontSize="md">{formatDate(selectedTicket.completedDate || selectedTicket.updatedAt)}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" fontSize="sm" color="gray.600">Assigned Operator</Text>
                    <Text fontSize="md">
                      {selectedTicket.assignedOperator?.first_name} {selectedTicket.assignedOperator?.last_name}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" fontSize="sm" color="gray.600">Machine Unit</Text>
                    <Text fontSize="md">{selectedTicket.assignedMachineUnit?.unitNumber}</Text>
                  </Box>
                </SimpleGrid>
              </Box>

              <Divider />

              {/* Extension Tickets Section */}
              {selectedTicket?.extensionNeeded && selectedTicket?.extensionTickets && selectedTicket?.extensionTickets.length > 0 && (
                <>
                  <Box>
                    <Heading size="sm" mb={4}>Extension Requests</Heading>
                    <VStack spacing={4} align="stretch">
                      {selectedTicket.extensionTickets.map((extension, index) => {
                        //const isLatest = index === selectedTicket.extensionTickets.length - 1;
                        const Status = extension.status;
                        const isAdmin = user?.role === 'MIM';
                        
                        return (
                          <Box key={extension._id || index} bg="orange.50" p={4} borderRadius="md" borderWidth="1px" borderColor="orange.200">
                            <Heading size="xs" mb={3} color="orange.700">Extension #{index + 1}</Heading>
                            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                              {/* Column 1: Reference Number and Status */}
                              <Box>
                                <Text fontWeight="bold" fontSize="xs" color="gray.600">Reference Number</Text>
                                <Text fontSize="xs" mb={2}>{extension.refNumber || 'N/A'}</Text>
                                <Text fontWeight="bold" fontSize="xs" color="gray.600">Status</Text>
                                <Badge colorScheme="orange" fontSize="xs">{extension.status}</Badge>
                              </Box>
                              
                              {/* Column 2: Area Serviced and Remaining Area */}
                              <Box>
                                <Text fontWeight="bold" fontSize="xs" color="gray.600">Area Serviced</Text>
                                <Text fontSize="xs" mb={2}>{extension.areaServiced} ha</Text>
                                <Text fontWeight="bold" fontSize="xs" color="gray.600">Remaining Area</Text>
                                <Text fontSize="xs">{extension.remainingArea} ha</Text>
                              </Box>
                              
                              {/* Column 3: Extension Reason */}
                              <Box>
                                <Text fontWeight="bold" fontSize="xs" color="gray.600">Extension Reason</Text>
                                <Text fontSize="xs">{extension.extensionReason || 'N/A'}</Text>
                              </Box>
                            </SimpleGrid>
                            
                            {/* Additional fields if assigned */}
                            {(extension.assignedDate || extension.assignedOperator?.first_name || extension.assignedMachineUnit?.plateNumber) && (
                              <>
                                <Divider my={3} />
                                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3}>
                                  {extension.assignedDate && (
                                    <Box>
                                      <Text fontWeight="bold" fontSize="xs" color="gray.600">Assigned Date</Text>
                                      <Text fontSize="xs">{formatDate(extension.assignedDate)}</Text>
                                    </Box>
                                  )}
                                  {extension.assignedOperator?.first_name && (
                                    <Box>
                                      <Text fontWeight="bold" fontSize="xs" color="gray.600">Assigned Operator</Text>
                                      <Text fontSize="xs">
                                        {extension.assignedOperator.first_name} {extension.assignedOperator.last_name}
                                      </Text>
                                    </Box>
                                  )}
                                  {extension.assignedMachineUnit?.plateNumber && (
                                    <Box>
                                      <Text fontWeight="bold" fontSize="xs" color="gray.600">Machine Unit</Text>
                                      <Text fontSize="xs">{extension.assignedMachineUnit.plateNumber}</Text>
                                    </Box>
                                  )}
                                </SimpleGrid>
                              </>
                            )}

                                {isAdmin ? (
                                  <HStack spacing={3} justify="flex-end">
                                    <Button
                                      size="sm"
                                      colorScheme="red"
                                      onClick={() => handleDeclineExtension(extension, index)}
                                    >
                                      Decline
                                    </Button>
                                    <Button
                                      size="sm"
                                      colorScheme="green"
                                      onClick={() => handleApproveExtension(extension, index)}
                                    >
                                      Approve
                                    </Button>
                                  </HStack>
                                ) : (
                                  <Alert status="info" borderRadius="md" mt={3} variant="left-accent">
                                    <AlertIcon />
                                    <Text fontSize="sm">Waiting for managers' response</Text>
                                  </Alert>
                                )}
                          </Box>
                        );
                      })}
                    </VStack>
                  </Box>

                  <Divider />
                </>
              )}

              {/* Proof Images Section */}
              <Box>
                <Heading size="sm" mb={4}>Completion Proof</Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  {/* Selfie Proof */}
                  <Box>
                    <Text fontWeight="bold" fontSize="sm" color="gray.600" mb={2}>
                      Selfie Proof
                    </Text>
                    {selectedTicket.completionProof?.proofImageUrl ? (
                      <AspectRatio ratio={4 / 3} borderRadius="md" overflow="hidden" border="1px" borderColor="gray.200">
                        <Box
                          as="img"
                          src={getImageUrl(selectedTicket.completionProof.proofImageUrl)}
                          alt="Selfie Proof"
                          objectFit="cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #f7fafc;"><span style="color: #718096;">Image not available</span></div>';
                          }}
                        />
                      </AspectRatio>
                    ) : (
                      <Box
                        bg="gray.100"
                        borderRadius="md"
                        p={8}
                        textAlign="center"
                        border="1px"
                        borderColor="gray.200"
                      >
                        <Text color="gray.500">No selfie proof available</Text>
                      </Box>
                    )}
                    {selectedTicket.completionProof?.proofImageUrl && (
                      <Button
                        as="a"
                        href={selectedTicket.completionProof.proofImageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="sm"
                        colorScheme="blue"
                        variant="link"
                        mt={2}
                      >
                        Open on another tab
                      </Button>
                    )}
                  </Box>

                  {/* Farmer Signature */}
                  <Box>
                    <Text fontWeight="bold" fontSize="sm" color="gray.600" mb={2}>
                      Farmer Signature
                    </Text>
                    {selectedTicket.completionProof?.signatureUrl ? (
                      <AspectRatio ratio={4 / 3} borderRadius="md" overflow="hidden" border="1px" borderColor="gray.200">
                        <Box
                          as="img"
                          src={getImageUrl(selectedTicket.completionProof.signatureUrl)}
                          alt="Farmer Signature"
                          objectFit="cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #f7fafc;"><span style="color: #718096;">Image not available</span></div>';
                          }}
                        />
                      </AspectRatio>
                    ) : (
                      <Box
                        bg="gray.100"
                        borderRadius="md"
                        p={8}
                        textAlign="center"
                        border="1px"
                        borderColor="gray.200"
                      >
                        <Text color="gray.500">No farmer signature available</Text>
                      </Box>
                    )}
                    {selectedTicket.completionProof?.signatureUrl && (
                      <Button
                        as="a"
                        href={selectedTicket.completionProof.signatureUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="sm"
                        colorScheme="blue"
                        variant="link"
                        mt={2}
                      >
                        Open on another tab
                      </Button>
                    )}
                  </Box>
                </SimpleGrid>
              </Box>

              {/* Additional Notes if available */}
              {(selectedTicket.remarks || (selectedTicket.extensionNeeded && selectedTicket.extensionTickets?.[0]?.extensionReason)) && (
                <>
                  <Divider />
                  <Box>
                    <Text fontWeight="bold" fontSize="sm" color="gray.600" mb={2}>
                      {selectedTicket.extensionNeeded ? 'Extension Reason' : 'Completion Notes'}
                    </Text>
                    <Box bg="gray.50" p={3} borderRadius="md">
                      <Text fontSize="sm">
                        {selectedTicket.extensionNeeded 
                          ? (selectedTicket.extensionTickets?.[0]?.extensionReason || 'No extension reason provided')
                          : selectedTicket.remarks
                        }
                      </Text>
                    </Box>
                  </Box>
                </>
              )}
            </VStack>
          ) : (
            <VStack spacing={4} align="center" py={8}>
              <Text color="gray.600" fontSize="sm">No ticket selected</Text>
            </VStack>
          )}
        </ModalBody>

        <ModalFooter bg="gray.50" borderTopWidth="1px" borderColor="gray.200">
          <Button variant={'outline'} onClick={onClose} size="md">
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>

    {/* Approve Extension Modal */}
    <Modal isOpen={isApproveModalOpen} onClose={onApproveModalClose} size="5xl" isCentered motionPreset='none'>
      <ModalOverlay />
      <ModalContent borderRadius="md" overflow="hidden">
        <ModalHeader bg="green.50" borderBottomWidth="1px" borderColor="gray.200">
          Approve Extension Request
        </ModalHeader>
        <ModalBody py={6}>
          <VStack spacing={4} align="stretch">
            <Text fontSize="sm" fontWeight="medium">
              Are you sure you want to approve this extension request?
            </Text>
            
            <Box bg="blue.50" p={3} borderRadius="md">
              <Text fontSize="sm" fontWeight="bold" mb={2} color="blue.700">
                Schedule Impact:
              </Text>
              <VStack align="stretch" spacing={2} pl={2}>
                <Text fontSize="sm">
                  • If there are currently <Text as="span" fontWeight="bold">5 scheduled tickets</Text>, 
                  the last ticket in the schedule will be moved back to "Pending" to make room for this extension request.
                </Text>
                <Text fontSize="sm">
                  • If there are <Text as="span" fontWeight="bold">4 or fewer scheduled tickets</Text>, 
                  this extension request will be added to the next available schedule slot.
                </Text>
                <Text fontSize="sm" fontWeight="medium" color="blue.700">
                  • All upcoming scheduled tickets will be automatically adjusted based on these changes.
                </Text>
              </VStack>
            </Box>

            {selectedExtension && (
              <>
                <Divider />
                <Heading size="sm" mb={2}>Extension Ticket Details</Heading>
                <Box overflowX="auto">
                  <Table variant="simple" size="sm">
                    <Thead bg="gray.50">
                      <Tr>
                        <Th>Reference #</Th>
                        <Th>Requestor Farmer</Th>
                        <Th>Farm Location</Th>
                        <Th>Machine Type</Th>
                        <Th>Remaining Area (ha)</Th>
                        <Th>Assigned Date</Th>
                        <Th>Assigned Operator</Th>
                        <Th>Machine Unit</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      <Tr>
                        <Td fontWeight="semibold" fontSize="xs">{selectedExtension.refNumber}</Td>
                        <Td fontSize="xs">
                          {`${selectedTicket?.requestorFarmer?.first_name || ''} ${selectedTicket?.requestorFarmer?.surname || ''}`}
                        </Td>
                        <Td fontSize="xs">{selectedTicket?.barangay || 'N/A'}</Td>
                        <Td fontSize="xs">{selectedTicket?.requestedMachineType?.equipmentType || 'N/A'}</Td>
                        <Td fontSize="xs">{selectedExtension.remainingArea}</Td>
                        <Td fontSize="xs">
                          <Input
                            type="date"
                            size="xs"
                            value={extensionUpdateData.assignedDate}
                            isReadOnly
                            bg="gray.100"
                            cursor="not-allowed"
                          />
                        </Td>
                        <Td>
                          <Select
                            size="xs"
                            placeholder="Select operator"
                            value={extensionUpdateData.assignedOperatorId}
                            onChange={(e) => setExtensionUpdateData(prev => ({
                              ...prev,
                              assignedOperatorId: e.target.value
                            }))}
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
                            size="xs"
                            placeholder="Select machine"
                            value={extensionUpdateData.assignedMachineUnitId}
                            onChange={(e) => setExtensionUpdateData(prev => ({
                              ...prev,
                              assignedMachineUnitId: e.target.value
                            }))}
                            isDisabled={!selectedTicket?.requestedMachineType?.requestedMachineTypeId || !unitsByType[selectedTicket?.requestedMachineType?.requestedMachineTypeId]}
                          >
                            {(unitsByType[selectedTicket?.requestedMachineType?.requestedMachineTypeId] || []).map(unit => (
                              <option key={unit._id} value={unit._id}>
                                {unit.plateNumber} - {unit.machineryTypeId?.equipmentType}
                              </option>
                            ))}
                          </Select>
                        </Td>
                      </Tr>
                    </Tbody>
                  </Table>
                </Box>
              </>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter bg="gray.50" borderTopWidth="1px" borderColor="gray.200">
          <Button variant="outline" mr={3} onClick={onApproveModalClose}>
            Cancel
          </Button>
          <Button 
            colorScheme="green"
            isDisabled={!extensionUpdateData.assignedOperatorId || !extensionUpdateData.assignedMachineUnitId}
            isLoading={isApprovingExtensionRequest}
            onClick={handleConfirmApprove}
          >
            Confirm Approval
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>

    {/* Decline Extension Modal */}
    <Modal isOpen={isDeclineModalOpen} onClose={onDeclineModalClose} size="md" isCentered motionPreset='none'>
      <ModalOverlay />
      <ModalContent borderRadius="md" overflow="hidden">
        <ModalHeader bg="red.50" borderBottomWidth="1px" borderColor="gray.200">
          Decline Extension Request
        </ModalHeader>
        <ModalBody py={6}>
          <VStack spacing={4} align="stretch">
            <Text fontSize="sm" fontWeight="medium">
              Are you sure you want to decline this extension request?
            </Text>
            
            <Box bg="orange.50" p={3} borderRadius="md" borderWidth="1px" borderColor="orange.200">
              <Text fontSize="sm" fontWeight="bold" mb={2} color="orange.700">
                Impact of Declining:
              </Text>
              <VStack align="stretch" spacing={2} pl={2}>
                <Text fontSize="sm">
                  • The parent ticket will be <Text as="span" fontWeight="bold">forced to completed status</Text>
                </Text>
                <Text fontSize="sm">
                  • This extension request will be removed.
                </Text>
                <Text fontSize="sm">
                  • The remaining area ({selectedExtension?.remainingArea || 0} ha) will not be serviced
                </Text>
                <Text fontSize="sm" fontWeight="medium" color="orange.700">
                  • The weekly schedule will continue as is without any adjustments
                </Text>
              </VStack>
            </Box>

            {selectedExtension && (
              <Box bg="gray.50" p={3} borderRadius="md">
                <Text fontSize="xs" fontWeight="bold" mb={1} color="gray.600">Extension Details:</Text>
                <Text fontSize="xs">Ref: {selectedExtension.refNumber}</Text>
                <Text fontSize="xs">Area Serviced: {selectedExtension.areaServiced} ha</Text>
                <Text fontSize="xs">Remaining Area: {selectedExtension.remainingArea} ha</Text>
              </Box>
            )}

            <Box>
              <Text fontSize="sm" fontWeight="bold" mb={2} color="gray.700">
                Reason for Declining <Text as="span" color="red.500">*</Text>
              </Text>
              <Textarea
                placeholder="Please provide a reason for declining this extension request..."
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                size="sm"
                rows={4}
                resize="vertical"
                borderRadius={5}
              />
            </Box>

            <Alert status="warning" borderRadius="md" variant="left-accent">
              <AlertIcon />
              <Text fontSize="xs">This action cannot be undone</Text>
            </Alert>
          </VStack>
        </ModalBody>
        <ModalFooter bg="gray.50" borderTopWidth="1px" borderColor="gray.200">
          <Button variant="outline" mr={3} onClick={onDeclineModalClose}>
            Cancel
          </Button>
          <Button 
            colorScheme="red"
            isDisabled={!declineReason.trim()}
            isLoading={isDecliningExtensionRequest}
            onClick={handleConfirmDecline}
          >
            Confirm Decline
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
    </>
  );
};

export default TicketRequestCompletedDetailsPanel;
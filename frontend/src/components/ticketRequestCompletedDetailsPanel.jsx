import React from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  Box, VStack, Text, Heading, SimpleGrid, Badge, Button, Divider, AspectRatio, HStack
} from '@chakra-ui/react';
import { FaCheckCircle } from "react-icons/fa";

const TicketRequestCompletedDetailsPanel = ({ 
    isOpen, 
    onClose, 
    selectedTicket
 }) => {

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

  const handleApproveExtension = (extension, index) => {
    // TODO: Implement approve extension logic
    console.log('Approve extension:', extension);
  };

  const handleDeclineExtension = (extension, index) => {
    // TODO: Implement decline extension logic
    console.log('Decline extension:', extension);
  };

  return (
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
                    <Text fontSize="md">{selectedTicket.assignedMachineUnit?.plateNumber}</Text>
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
                        const isLatest = index === selectedTicket.extensionTickets.length - 1;
                        const isPending = extension.status === 'Pending';
                        
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

                            {/* Action Buttons for Latest Pending Extension */}
                            {isLatest && isPending && (
                              <>
                                
                                <HStack spacing={3} justify="flex-end">
                                  <Button
                                    size="sm"
                                    colorScheme="red"
                                    //variant="outline"
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
                              </>
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
              {selectedTicket.completionNotes && (
                <>
                  <Divider />
                  <Box>
                    <Text fontWeight="bold" fontSize="sm" color="gray.600" mb={2}>
                      Completion Notes
                    </Text>
                    <Box bg="gray.50" p={3} borderRadius="md">
                      <Text fontSize="sm">{selectedTicket.completionNotes}</Text>
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
  );
};

export default TicketRequestCompletedDetailsPanel;
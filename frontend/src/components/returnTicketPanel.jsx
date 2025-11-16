import React, { useState, useRef, useEffect } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  Box, VStack, Text, Heading, SimpleGrid, Badge, Flex, Button,
  FormControl, FormLabel, Input, useToast, Icon, Image, HStack,
  Alert, AlertIcon, AlertTitle, AlertDescription, Center, Switch, NumberInput, NumberInputField, Textarea,
  useDisclosure,
} from '@chakra-ui/react';
import { FaCheckCircle, FaCamera, FaSignature } from "react-icons/fa";
import { CloseIcon, WarningIcon } from '@chakra-ui/icons';
import SignatureCanvas from 'react-signature-canvas';
import { useAdminDashboard } from '../machineries/store/adminDashboard.store.js';
import { useQueryClient } from '@tanstack/react-query';
import { add } from 'lodash';

const ReturnTicketPanel = ({
  isOpen,
  onClose,
  selectedTicket = null,
  onRequestReopenSchedule,
  scheduleId
}) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const signatureRef = useRef(null);
  const canvasContainerRef = useRef(null);
  
  const [proofImage, setProofImage] = useState(null);
  const [proofImagePreview, setProofImagePreview] = useState(null);
  const [signature, setSignature] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 200 });

  const { isOpen: isOpenCompletionWarning, onOpen: onOpenCompletionWarning, onClose: onCloseCompletionWarning } = useDisclosure();

  const [additionalInfoData, setAdditionalInfoData] = useState({
    extensionRequest: false, 
    areaServiced: '', 
    remainingArea: '',
    remarks: ''
  });
  console.log('additionalInfoData:', additionalInfoData);
  const {
    setTicketToComplete,
    isSettingTicketToComplete
  } = useAdminDashboard();

  // Calculate canvas size based on container width
  useEffect(() => {
    const updateCanvasSize = () => {
      if (canvasContainerRef.current) {
        const containerWidth = canvasContainerRef.current.offsetWidth;
        setCanvasSize({
          width: containerWidth - 16, // Subtract padding
          height: 200
        });
      }
    };

    if (isOpen) {
      // Increase delay to ensure modal is fully rendered
      setTimeout(updateCanvasSize, 150);
    }
    window.addEventListener('resize', updateCanvasSize);
    
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [isOpen]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file",
          status: "error",
          duration: 3000,
          isClosable: true
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Image size should not exceed 5MB",
          status: "error",
          duration: 3000,
          isClosable: true
        });
        return;
      }

      setProofImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearImage = () => {
    setProofImage(null);
    setProofImagePreview(null);
  };

  const handleClearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
      setSignature(null);
    }
  };

  const handleSaveSignature = () => {
    if (signatureRef.current && !signatureRef.current.isEmpty()) {
      const signatureData = signatureRef.current.toDataURL();
      setSignature(signatureData);
      
      // Disable the canvas after saving
      if (signatureRef.current) {
        signatureRef.current.off();
      }
      
      toast({
        title: "Signature saved",
        description: "Farmer signature has been captured",
        status: "success",
        duration: 2000,
        isClosable: true
      });
    } else {
      toast({
        title: "Empty signature",
        description: "Please provide a signature before saving",
        status: "warning",
        duration: 3000,
        isClosable: true
      });
    }
  };
  
  const handleSubmit = async () => {
    // Validate required fields
    if (!proofImage) {
      toast({
        title: "Missing proof image",
        description: "Please upload a selfie proof image",
        status: "warning",
        duration: 3000,
        isClosable: true
      });
      return;
    }

    if (!signature) {
      toast({
        title: "Missing signature",
        description: "Please capture farmer's signature",
        status: "warning",
        duration: 3000,
        isClosable: true
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert signature data URL to blob
      const signatureBlob = await fetch(signature).then(r => r.blob());
      const signatureFile = new File([signatureBlob], `signature_${selectedTicket.refNumber}.png`, { type: 'image/png' });

      // Create FormData
      const formData = new FormData();
      formData.append('ticketRequestId', selectedTicket._id);
      formData.append('proofImage', proofImage);
      formData.append('signature', signatureFile);
      formData.append('operatorId', selectedTicket.assignedOperator.assignedOperatorId);
      
      // Add extension data if requesting extension
      if (additionalInfoData.extensionRequest) {
        formData.append('extensionRequest', 'true');
        formData.append('areaServiced', additionalInfoData.areaServiced);
        formData.append('remainingArea', additionalInfoData.remainingArea);
      }
      
      // Add remarks if provided
      if (additionalInfoData.remarks.trim()) {
        formData.append('remarks', additionalInfoData.remarks.trim());
      }

      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(key, { name: value.name, size: value.size, type: value.type });
        } else {
          console.log(key, value);
        }
      }

      const response = await setTicketToComplete(formData);

      toast({
        title: "Success",
        description: response.message || "Ticket marked as completed successfully",
        status: "success",
        duration: 5000,
        isClosable: true
      });

      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ['inProgressWeeklySchedules'] });

      onRequestReopenSchedule?.(scheduleId);

      handleClose();
    } catch (error) {
      console.error('Error submitting ticket completion:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to submit ticket completion",
        status: "error",
        duration: 5000,
        isClosable: true
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setProofImage(null);
    setProofImagePreview(null);
    setSignature(null);
    setAdditionalInfoData({
      extensionRequest: false, 
      areaServiced: '', 
      remainingArea: '',
      remarks: ''
    });
    if (signatureRef.current) {
      signatureRef.current.clear();
      signatureRef.current.on(); // Re-enable canvas on close
    }
    onClose();
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
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      size="4xl" 
      closeOnOverlayClick={false} 
      scrollBehavior="inside" 
      isCentered 
      motionPreset='none'
      blockScrollOnMount={false}
      returnFocusOnClose={false}
    >
      <ModalOverlay />
      <ModalContent borderRadius="md" overflow="hidden">
        <ModalHeader bg="green.50" borderBottomWidth="1px" borderColor="gray.200" display="flex" alignItems="center">
          <FaCheckCircle style={{ marginRight: 12, color: '#38a169' }} />
          Mark Ticket as Completed
        </ModalHeader>

        <ModalBody py={6}>
          {selectedTicket ? (
            <VStack spacing={6} align="stretch">
              {/* Alert Info */}
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle fontSize="sm">Completion Requirements</AlertTitle>
                  <AlertDescription fontSize="sm">
                    Please upload a selfie proof image and capture the farmer's signature to complete or ask for an extension for this ticket.
                  </AlertDescription>
                </Box>
              </Alert>

              {/* Ticket Details Section */}
              <Box bg="purple.50" p={4} borderRadius="md">
                <Heading size="sm" mb={3}>Ticket Details</Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                  <Box>
                    <Text fontWeight="bold" fontSize="sm" color="gray.600">Reference Number</Text>
                    <Text fontSize="md">{selectedTicket?.refNumber || 'N/A'}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" fontSize="sm" color="gray.600">Status</Text>
                    <Badge colorScheme="purple">{selectedTicket?.status || 'N/A'}</Badge>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" fontSize="sm" color="gray.600">Farmer</Text>
                    <Text fontSize="md">
                      {`${selectedTicket?.requestorFarmer?.first_name || ''} ${selectedTicket?.requestorFarmer?.surname || ''}`}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" fontSize="sm" color="gray.600">Farm Location</Text>
                    <Text fontSize="md">{selectedTicket?.barangay || 'N/A'}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" fontSize="sm" color="gray.600">Estimated Area</Text>
                    <Text fontSize="md">{selectedTicket?.estimatedArea || 'N/A'}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" fontSize="sm" color="gray.600">Machine Type</Text>
                    <Text fontSize="md">{selectedTicket?.requestedMachineType?.equipmentType || 'N/A'}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" fontSize="sm" color="gray.600">Assigned Date</Text>
                    <Text fontSize="md">{formatDate(selectedTicket?.assignedDate)}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" fontSize="sm" color="gray.600">Assigned Operator</Text>
                    <Text fontSize="md">
                      {`${selectedTicket?.assignedOperator?.first_name || ''} ${selectedTicket?.assignedOperator?.last_name || ''}`}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" fontSize="sm" color="gray.600">Machine Unit</Text>
                    <Text fontSize="md">{selectedTicket?.assignedMachineUnit?.plateNumber || 'N/A'}</Text>
                  </Box>
                </SimpleGrid>
              </Box>

              {/* Proof Image Upload Section */}
              <Box>
                <FormControl isRequired>
                  <FormLabel display="flex" alignItems="center" gap={2}>
                    <Icon as={FaCamera} color="blue.500" />
                    Selfie Proof Image
                  </FormLabel>
                  <Text fontSize="sm" color="gray.600" mb={2}>
                    Upload a clear photo showing the completed work
                  </Text>
                  
                  {!proofImagePreview ? (
                    <Box
                      borderWidth={2}
                      borderStyle="dashed"
                      borderColor="gray.300"
                      borderRadius="md"
                      p={6}
                      textAlign="center"
                      bg="gray.50"
                      position="relative"
                      cursor="pointer"
                      _hover={{ borderColor: "blue.400", bg: "blue.50" }}
                      onClick={() => document.getElementById('proof-image-input').click()}
                    >
                      <Input
                        id="proof-image-input"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        display="none"
                      />
                      <Icon as={FaCamera} boxSize={10} color="gray.400" mb={2} />
                      <Text color="gray.600" fontWeight="medium">
                        Click to upload or drag and drop
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        PNG, JPG, JPEG (max 5MB)
                      </Text>
                    </Box>
                  ) : (
                    <Box position="relative" borderRadius="md" overflow="hidden" borderWidth={1} borderColor="gray.200">
                      <Image
                        src={proofImagePreview}
                        alt="Proof preview"
                        maxH="300px"
                        w="100%"
                        objectFit="contain"
                        bg="gray.100"
                      />
                      <Button
                        position="absolute"
                        top={2}
                        right={2}
                        size="sm"
                        colorScheme="red"
                        leftIcon={<CloseIcon />}
                        onClick={handleClearImage}
                      >
                        Remove
                      </Button>
                    </Box>
                  )}
                </FormControl>
              </Box>

              {/* Signature Section */}
              <Box>
                <FormControl isRequired>
                  <FormLabel display="flex" alignItems="center" gap={2}>
                    <Icon as={FaSignature} color="purple.500" />
                    Farmer Signature
                  </FormLabel>
                  <Text fontSize="sm" color="gray.600" mb={2}>
                    Ask the farmer to sign below to confirm completion
                  </Text>
                  
                  <Box
                    ref={canvasContainerRef}
                    borderWidth={2}
                    borderColor={signature ? "green.400" : "gray.300"}
                    borderRadius="md"
                    bg="white"
                    p={2}
                    position="relative"
                  >
                    <Box
                      borderWidth={1}
                      borderColor="gray.200"
                      borderRadius="md"
                      overflow="hidden"
                      position="relative"
                    >
                      <SignatureCanvas
                        ref={signatureRef}
                        canvasProps={{
                          width: canvasSize.width,
                          height: canvasSize.height,
                          style: {
                            display: 'block',
                            touchAction: 'none',
                            opacity: signature ? 0.5 : 1,
                            pointerEvents: signature ? 'none' : 'auto'
                          }
                        }}
                        backgroundColor="white"
                      />
                      {signature && (
                        <Box
                          position="absolute"
                          top={0}
                          left={0}
                          right={0}
                          bottom={0}
                          bg="transparent"
                          pointerEvents="none"
                        />
                      )}
                    </Box>
                    
                    <HStack mt={2} spacing={2}>
                      <Button
                        size="sm"
                        colorScheme="blue"
                        onClick={handleSaveSignature}
                        leftIcon={<FaSignature />}
                        isDisabled={signature !== null}
                      >
                        Save Signature
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          handleClearSignature();
                          // Re-enable canvas when clearing
                          if (signatureRef.current) {
                            signatureRef.current.on();
                          }
                        }}
                      >
                        Clear
                      </Button>
                    </HStack>

                    {signature && (
                      <Alert status="success" mt={2} borderRadius="md">
                        <AlertIcon />
                        <Text fontSize="sm">Signature captured successfully</Text>
                      </Alert>
                    )}
                  </Box>
                </FormControl>
              </Box>

              <Box>
                <Flex alignItems="center" mb={additionalInfoData.extensionRequest ? 4 : 0}>
                  <Text fontWeight="bold" mr={2}>Request Extension for Unfinished Work</Text>
                  <Switch
                    isChecked={additionalInfoData.extensionRequest}
                    onChange={(e) =>
                      setAdditionalInfoData(d => ({ 
                        ...d, 
                        extensionRequest: e.target.checked, 
                        areaServiced: '', 
                        remainingArea: '' 
                      }))
                    }
                    colorScheme="orange"
                  />
                </Flex>

                {additionalInfoData.extensionRequest && (
                  <Box mt={4} p={4} bg="orange.50" borderRadius="md" borderWidth={1} borderColor="orange.200">
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <FormControl isRequired>
                        <FormLabel fontSize="sm">Area Serviced (ha)</FormLabel>
                        <NumberInput
                          value={additionalInfoData.areaServiced}
                          onChange={(valueString) =>
                            setAdditionalInfoData(d => ({ ...d, areaServiced: valueString }))
                          }
                          type="number"
                          min="0"
                          step="1"
                          bg='white'
                          onWheel={(e) => e.target.blur()}
                          onKeyDown={(e) => {
                            if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                              e.preventDefault();
                            }
                          }}
                          inputMode="numeric"
                        >
                          <NumberInputField placeholder="Enter area serviced" />
                        </NumberInput>
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel fontSize="sm">Remaining Area (ha)</FormLabel>
                        <NumberInput
                          value={additionalInfoData.remainingArea}
                          onChange={(valueString) =>
                            setAdditionalInfoData(d => ({ ...d, remainingArea: valueString }))
                          }
                          type="number"
                          min="0"
                          step="1"
                          bg='white'
                          onWheel={(e) => e.target.blur()}
                          onKeyDown={(e) => {
                            if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                              e.preventDefault();
                            }
                          }}
                          inputMode="numeric"
                        >
                          <NumberInputField placeholder="Enter remaining area" />
                        </NumberInput>
                      </FormControl>
                    </SimpleGrid>

                    <Alert status="info" mt={3} borderRadius="md" size="sm">
                      <AlertIcon />
                      <Text fontSize="xs">
                        Extension request will be submitted for admin approval along with the completion proof.
                      </Text>
                    </Alert>
                  </Box>
                )}
              </Box>

              {/* Remarks Section */}
              <Box>
                <FormControl>
                  <FormLabel fontWeight="bold">
                    Remarks / Additional Notes
                  </FormLabel>
                  <Text fontSize="sm" color="gray.600" mb={2}>
                    {additionalInfoData.extensionRequest 
                      ? "Provide reason for extension request, machine status, or any other relevant information"
                      : "Add any relevant notes about the ticket completion (optional)"}
                  </Text>
                  <Textarea
                    value={additionalInfoData.remarks}
                    onChange={(e) =>
                      setAdditionalInfoData(d => ({ ...d, remarks: e.target.value }))
                    }
                    placeholder={
                      additionalInfoData.extensionRequest
                        ? "e.g., Machine breakdown, weather conditions, additional area discovered, etc."
                        : "e.g., Completed ahead of schedule, farmer was satisfied, minor issues encountered, etc."
                    }
                    rows={4}
                    bg="white"
                    resize="vertical"
                  />
                </FormControl>
              </Box>
            </VStack>
          ) : (
            <Center py={8}>
              <Text color="gray.500">No ticket selected</Text>
            </Center>
          )}
        </ModalBody>

        <ModalFooter bg="gray.50" borderTopWidth="1px" borderColor="gray.200">
          <Button variant="outline" onClick={handleClose} size="md" mr={3}>
            Cancel
          </Button>
          <Button
            colorScheme={additionalInfoData.extensionRequest ? "orange" : "green"}
            onClick={handleSubmit}
            isLoading={isSubmitting || isSettingTicketToComplete}
            isDisabled={!proofImage || !signature || (additionalInfoData.extensionRequest && (!additionalInfoData.areaServiced || !additionalInfoData.remainingArea))}
            size="md"
          >
            {additionalInfoData.extensionRequest ? 'Request Extension' : 'Mark as Completed'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
    
    <Modal isOpen={isOpenCompletionWarning} onClose={onCloseCompletionWarning} size="md" isCentered>
      <ModalOverlay bg="blackAlpha.600" />
      <ModalContent>
        <ModalHeader bg="orange.500" color="white" display="flex" alignItems="center" gap={2}>
          <WarningIcon />
          Operator Assignment Warning
        </ModalHeader>
        <ModalBody py={6}>
          <VStack spacing={4} align="stretch">
            <Alert status="warning" borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle fontSize="md">You are not the assigned operator</AlertTitle>
                <AlertDescription fontSize="sm">
                  This action will be recorded and visible to management.
                </AlertDescription>
              </Box>
            </Alert>

            <Box bg="gray.50" p={4} borderRadius="md">
              <VStack spacing={2} align="stretch">
                <Flex justify="space-between">
                  <Text fontWeight="bold" fontSize="sm" color="gray.600">Your Name:</Text>
                  <Text fontSize="sm">{}</Text>
                </Flex>
                <Flex justify="space-between">
                  <Text fontWeight="bold" fontSize="sm" color="gray.600">Assigned Operator:</Text>
                  <Text fontSize="sm" color="orange.600" fontWeight="medium">
                    {}
                  </Text>
                </Flex>
              </VStack>
            </Box>

            <Alert status="info" borderRadius="md" variant="left-accent">
              <AlertIcon />
              <Text fontSize="sm">
                Your manager will be able to see who completed this ticket and when it was submitted.
              </Text>
            </Alert>

            <Text fontSize="sm" color="gray.600" textAlign="center">
              Are you sure you want to proceed with marking this ticket as completed?
            </Text>
          </VStack>
        </ModalBody>
        <ModalFooter bg="gray.50">
          <Button variant="outline" onClick={onClose} mr={3}>
            Cancel
          </Button>
          <Button colorScheme="orange">
            Yes, I Understand
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
    </>
  );
};

export default ReturnTicketPanel;

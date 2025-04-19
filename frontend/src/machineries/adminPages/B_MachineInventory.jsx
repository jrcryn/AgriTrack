import React, { useState, useEffect } from 'react';
import {
  Box,
  Link,
  Heading,
  Text,
  Flex,
  Input,
  Select,
  Icon,
  SimpleGrid,
  FormControl,
  FormLabel,
  InputGroup,
  InputRightElement,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  TagLabel,
  Tag,
  HStack,
  TableContainer,
  Spinner,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Textarea,
  VStack,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  IconButton,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  Tooltip,
  useToast,
  Tab, 
  TabList,
  TabPanels,
  TabPanel,
  Tabs,
  Tfoot
} from "@chakra-ui/react";
import { useQueryClient } from '@tanstack/react-query';

import { FaSearch, FaMapMarkerAlt, FaPlus, FaExchangeAlt, FaTractor, FaTrash, FaAddressCard  } from "react-icons/fa";
import { useAdminDashboard } from "../store/adminDashboard.store";
import Barangays from "../../components/barangays.js";

// New Machinery Modal component
const NewMachineryModal = ({ isOpen, onClose }) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { createMachineriesUnit, isCreatingMachineryUnit } = useAdminDashboard();
  
  // Form state
  const [unitName, setUnitName] = useState('');
  const [remarks, setRemarks] = useState('');
  const [barangayAllocations, setBarangayAllocations] = useState([]);

  // Barangay selection state
  const [selectedBarangay, setSelectedBarangay] = useState('');
  const [functionalUnits, setFunctionalUnits] = useState(0);
  const [nonFunctionalUnits, setNonFunctionalUnits] = useState(0);

  // Reset form
  const resetForm = () => {
    setUnitName('');
    setRemarks('');
    setBarangayAllocations([]);
    setSelectedBarangay('');
    setFunctionalUnits(0);
    setNonFunctionalUnits(0);
  };

  // Close handler with reset
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Get remaining barangays that haven't been allocated
  const remainingBarangays = Barangays.filter(
    barangay => !barangayAllocations.some(alloc => alloc.barangay === barangay)
  );

  // Add barangay allocation
  const handleAddAllocation = () => {
    // Validate
    if (!selectedBarangay) {
      toast({
        title: "Validation Error",
        description: "Please select a barangay",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (functionalUnits === 0 && nonFunctionalUnits === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one functional or non-functional unit",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Add allocation
    setBarangayAllocations([
      ...barangayAllocations,
      {
        barangay: selectedBarangay,
        functional_units: functionalUnits,
        non_functional_units: nonFunctionalUnits
      }
    ]);

    // Reset allocation inputs
    setSelectedBarangay('');
    setFunctionalUnits(0);
    setNonFunctionalUnits(0);
  };

  // Remove allocation
  const handleRemoveAllocation = (index) => {
    setBarangayAllocations(barangayAllocations.filter((_, i) => i !== index));
  };

  // Submit form
  const handleSubmit = async () => {
    // Validate form
    if (!unitName.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a machinery unit name",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (barangayAllocations.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one barangay allocation",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      // Create machinery unit
      const response = await createMachineriesUnit({
        unit_name: unitName.trim(),
        remarks: remarks.trim(),
        barangay_allocations: barangayAllocations
      });

      queryClient.invalidateQueries(['machineryUnits']);


      // Show success toast
      toast({
        title: "Machinery created",
        description:  response.message|| `${unitName} has been added to inventory`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      // Close modal and reset form
      handleClose();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to create machinery unit",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="2xl" closeOnOverlayClick={false} scrollBehavior="inside" motionPreset="none">
      <ModalOverlay />
      <ModalContent borderRadius="md" overflow="hidden" boxShadow="lg">
        <ModalHeader bg="white" borderBottomWidth="1px" borderColor="gray.200" display="flex" alignItems="center" py={4}>
          <Icon as={FaTractor} mr={2} color="blue.500" />
          Add New Machinery Unit
        </ModalHeader>
        
        <ModalBody py={6}>          
          <VStack spacing={6} align="stretch">
            {/* Machinery Details Section */}
            <Box 
              p={5} 
              borderRadius="md" 
              borderWidth="1px" 
              borderColor="gray.200" 
              bg="white"
              boxShadow="sm"
            >
              <Heading as="h3" size="md" mb={4} color="blue.600" fontWeight="600">
                <HStack>
                  <Icon as={FaTractor} />
                  <Text>Machinery Details</Text>
                </HStack>
              </Heading>
              
              {/* Unit Name */}
              <FormControl isRequired mb={4}>
                <FormLabel fontWeight="medium">Machinery Unit Name</FormLabel>
                <Input 
                  placeholder="e.g. Hand Tractor, Rice Harvester" 
                  value={unitName}
                  onChange={(e) => setUnitName(e.target.value)}
                  borderColor="gray.300"
                  _focus={{ borderColor: "blue.400" }}
                />
              </FormControl>
              
              {/* Remarks */}
              <FormControl>
                <FormLabel fontWeight="medium">Remarks</FormLabel>
                <Textarea 
                  placeholder="Additional information about this machinery unit" 
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={3}
                  borderColor="gray.300"
                  _focus={{ borderColor: "blue.400" }}
                />
              </FormControl>
            </Box>
            
            {/* Barangay Allocations Section */}
            <Box 
              p={5} 
              borderRadius="md" 
              borderWidth="1px" 
              borderColor="gray.200" 
              bg="white"
              boxShadow="sm"
            >
              <Heading as="h3" size="md" mb={4} color="blue.600" fontWeight="600">
                <HStack>
                  <Icon as={FaMapMarkerAlt} />
                  <Text>Barangay Allocations</Text>
                </HStack>
              </Heading>
              
              {/* Current Allocations */}
              {barangayAllocations.length > 0 ? (
                <Box mb={4} borderWidth="1px" borderRadius="md">
                  <Table size="sm" variant="simple">
                    <Thead bg="gray.50">
                      <Tr>
                        <Th>Barangay</Th>
                        <Th isNumeric>Functional</Th>
                        <Th isNumeric>Non-functional</Th>
                        <Th width="50px"></Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {barangayAllocations.map((allocation, index) => (
                        <Tr key={index}>
                          <Td fontWeight="medium">{allocation.barangay}</Td>
                          <Td isNumeric>
                            <Tag colorScheme="green" size="sm">{allocation.functional_units}</Tag>
                          </Td>
                          <Td isNumeric>
                            <Tag colorScheme="red" size="sm">{allocation.non_functional_units}</Tag>
                          </Td>
                          <Td>
                            <IconButton
                              icon={<FaTrash />}
                              size="xs"
                              colorScheme="red"
                              variant="ghost"
                              onClick={() => handleRemoveAllocation(index)}
                              aria-label="Remove allocation"
                            />
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              ) : (
                <Alert status="info" mb={4} borderRadius="md">
                  <AlertIcon />
                  No allocations added yet. Add at least one barangay allocation.
                </Alert>
              )}
              
              {/* Add New Allocation */}
              <Box 
                borderWidth="1px" 
                borderRadius="md" 
                p={4} 
                bg="gray.50"
                mt={4}
              >
                <Heading size="xs" mb={3} fontWeight="600">Add Allocation</Heading>
                
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3}>
                  {/* Barangay Select */}
                  <FormControl isRequired>
                    <FormLabel fontSize="xs" fontWeight="medium">Barangay</FormLabel>
                    <Select 
                      placeholder="Select barangay" 
                      size="sm"
                      value={selectedBarangay}
                      onChange={(e) => setSelectedBarangay(e.target.value)}
                      isDisabled={remainingBarangays.length === 0}
                      borderColor="gray.300"
                      _focus={{ borderColor: "blue.400" }}
                    >
                      {remainingBarangays.map((barangay) => (
                        <option key={barangay} value={barangay}>
                          {barangay}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                  
                  {/* Functional Units */}
                  <FormControl>
                    <FormLabel fontSize="xs" fontWeight="medium">Functional Units</FormLabel>
                    <NumberInput 
                      size="sm" 
                      min={0} 
                      value={functionalUnits}
                      onChange={(_, value) => setFunctionalUnits(value)}
                      borderColor="gray.300"
                    >
                      <NumberInputField _focus={{ borderColor: "blue.400" }} />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                  
                  {/* Non-Functional Units */}
                  <FormControl>
                    <FormLabel fontSize="xs" fontWeight="medium">Non-Functional Units</FormLabel>
                    <NumberInput 
                      size="sm" 
                      min={0}
                      value={nonFunctionalUnits}
                      onChange={(_, value) => setNonFunctionalUnits(value)}
                      borderColor="gray.300"
                    >
                      <NumberInputField _focus={{ borderColor: "blue.400" }} />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                </SimpleGrid>
                
                <Button
                  mt={3}
                  size="sm"
                  leftIcon={<Icon as={FaPlus} />}
                  colorScheme="blue"
                  isDisabled={!selectedBarangay}
                  onClick={handleAddAllocation}
                  fontWeight="500"
                  boxShadow="sm"
                  _hover={{ boxShadow: "md" }}
                >
                  Add Allocation
                </Button>
              </Box>
            </Box>
          </VStack>
        </ModalBody>
        
        <ModalFooter bg="gray.50" borderTopWidth="1px" borderColor="gray.200" py={4}>
          <Button 
            variant="outline" 
            mr={3} 
            onClick={handleClose}
            size="md"
            _hover={{ bg: "gray.100" }}
          >
            Cancel
          </Button>
          <Button 
            colorScheme="blue" 
            onClick={handleSubmit}
            isLoading={isCreatingMachineryUnit}
            isDisabled={barangayAllocations.length === 0 || !unitName}
            size="md"
            fontWeight="500"
            boxShadow="sm"
            _hover={{ boxShadow: "md", bg: "blue.600" }}
          >
            Save Machinery Unit
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const ViewMachineryModal = ({ isOpen, onClose, machine }) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { 
    updateMachineriesUnit, 
    isUpdatingMachineryUnit, 
    addMachineryUnits, 
    isAddingMachineryUnits,
    deleteMachineryUnit,
    isDeletingMachineryUnit,
    updateMachineryNameAndRemarks,
  } = useAdminDashboard();
  
  const { isOpen: isDeleteModalOpen, onOpen: openDeleteModal, onClose: closeDeleteModal } = useDisclosure();

  // Tab state
  const [activeTab, setActiveTab] = useState("details");
  
  // Transfer state
  const [transferFrom, setTransferFrom] = useState("");
  const [transferTo, setTransferTo] = useState("");
  const [transferUnitType, setTransferUnitType] = useState("functional_units");
  const [transferUnitCount, setTransferUnitCount] = useState(1);
  
  // Add units state
  const [addToBarangay, setAddToBarangay] = useState("");
  const [addFunctionalUnits, setAddFunctionalUnits] = useState(0);
  const [addNonFunctionalUnits, setAddNonFunctionalUnits] = useState(0);

  const [updatedName, setUpdatedName] = useState("");
  const [updatedRemarks, setUpdatedRemarks] = useState("");


  useEffect(() => {
    if (machine) {
      setUpdatedName(machine.unit_name || "");
      setUpdatedRemarks(machine.remarks || "");
    }
  }, [machine]);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Reset form when machine or visibility changes
  useEffect(() => {
    if (machine && machine.barangay_allocations.length > 0) {
      setTransferFrom(machine.barangay_allocations[0].barangay);
    }
    setTransferTo("");
    setTransferUnitType("functional_units");
    setTransferUnitCount(1);
    setAddToBarangay("");
    setAddFunctionalUnits(0);
    setAddNonFunctionalUnits(0);
    setShowDeleteConfirm(false);
    setActiveTab("details");
  }, [machine, isOpen]);
  
  if (!machine) return null;
  
  // Calculate totals
  const totals = machine.barangay_allocations.reduce(
    (acc, allocation) => {
      const functional = allocation.functional_units || 0;
      const nonFunctional = allocation.non_functional_units || 0;
      return {
        functional: acc.functional + functional,
        nonFunctional: acc.nonFunctional + nonFunctional,
        total: acc.total + functional + nonFunctional
      };
    },
    { functional: 0, nonFunctional: 0, total: 0 }
  );
  
  // Get available source barangays (those that have units)
  const availableSourceBarangays = machine.barangay_allocations.filter(
    allocation => {
      if (transferUnitType === "functional_units") {
        return (allocation.functional_units || 0) > 0;
      } else {
        return (allocation.non_functional_units || 0) > 0;
      }
    }
  ).map(allocation => allocation.barangay);
  
  // Get available destination barangays (all except the source)
  const availableDestBarangays = transferFrom 
    ? [...Barangays.filter(b => b !== transferFrom), ...machine.barangay_allocations
        .filter(alloc => alloc.barangay !== transferFrom)
        .map(alloc => alloc.barangay)]
        .filter((value, index, self) => self.indexOf(value) === index) // unique values
    : [];
  
  // Get unallocated barangays for adding units
  const allocatedBarangays = machine.barangay_allocations.map(a => a.barangay);
  const unallocatedBarangays = Barangays.filter(b => !allocatedBarangays.includes(b));
  
  // Get max units that can be transferred
  const getMaxTransferUnits = () => {
    const sourceAllocation = machine.barangay_allocations.find(
      alloc => alloc.barangay === transferFrom
    );
    
    if (!sourceAllocation) return 0;
    
    return transferUnitType === "functional_units" 
      ? (sourceAllocation.functional_units || 0)
      : (sourceAllocation.non_functional_units || 0);
  };
  
  // Handle transfer submission
  const handleTransferUnits = async () => {
    if (!transferFrom || !transferTo || transferUnitCount <= 0) {
      toast({
        title: "Validation Error",
        description: "Please complete all required fields",
        status: "error",
        duration: 3000,
        isClosable: true
      });
      return;
    }
    
    const maxUnits = getMaxTransferUnits();
    if (transferUnitCount > maxUnits) {
      toast({
        title: "Validation Error",
        description: `Cannot transfer more than ${maxUnits} units`,
        status: "error",
        duration: 3000,
        isClosable: true
      });
      return;
    }
    
    try {
      const response = await updateMachineriesUnit({
        machineryId: machine._id,
        transferFrom,
        transferTo,
        unitType: transferUnitType,
        unitCount: transferUnitCount
      });
      
      // Invalidate and refetch queries after successful transfer (para mabago yung details sa modal without having to close it first.)
      queryClient.invalidateQueries(['machineryUnits']);


      toast({
        title: "Transfer Successful",
        description: response.message || `Successfully transferred ${transferUnitCount} ${transferUnitType === "functional_units" ? "functional" : "non-functional"} units from ${transferFrom} to ${transferTo}`,
        status: "success",
        duration: 5000,
        isClosable: true
      });
      
      // Reset transfer form
      setTransferTo("");
      setTransferUnitCount(1);

    } catch (error) {
      toast({
        title: "Transfer Failed",
        description: error.message || "Failed to transfer units",
        status: "error",
        duration: 5000,
        isClosable: true
      });
    }
  };
  
  // Handle adding units submission
  const handleAddUnits = async () => {
    if (!addToBarangay || (addFunctionalUnits === 0 && addNonFunctionalUnits === 0)) {
      toast({
        title: "Validation Error",
        description: "Please select a barangay and add at least one unit",
        status: "error",
        duration: 3000,
        isClosable: true
      });
      return;
    }
    
    try {
      // Find if the barangay already has an allocation
      const existingAllocation = machine.barangay_allocations.find(
        allocation => allocation.barangay === addToBarangay
      );
      
      let updatedAllocations;
      
      if (existingAllocation) {
        // Update existing allocation
        updatedAllocations = machine.barangay_allocations.map(allocation => {
          if (allocation.barangay === addToBarangay) {
            return {
              ...allocation,
              functional_units: (allocation.functional_units || 0) + addFunctionalUnits,
              non_functional_units: (allocation.non_functional_units || 0) + addNonFunctionalUnits
            };
          }
          return allocation;
        });
      } else {
        // Add new allocation
        updatedAllocations = [
          ...machine.barangay_allocations,
          {
            barangay: addToBarangay,
            functional_units: addFunctionalUnits,
            non_functional_units: addNonFunctionalUnits
          }
        ];
      }
      
      // We'll use the updateMachineryUnit function with a different structure
      // This is a workaround since we don't have a dedicated "add units" endpoint
      const response = await addMachineryUnits({
        machineryId: machine._id,
        barangay: addToBarangay,
        functionalUnits: addFunctionalUnits,
        nonFunctionalUnits: addNonFunctionalUnits
      });
      
      queryClient.invalidateQueries(['machineryUnits']);


      toast({
        title: "Units Added",
        description:  response.message || `Successfully added units to ${addToBarangay}`,
        status: "success",
        duration: 5000,
        isClosable: true
      });
      
      // Reset form
      setAddToBarangay("");
      setAddFunctionalUnits(0);
      setAddNonFunctionalUnits(0);
    } catch (error) {
      toast({
        title: "Failed to Add Units",
        description: error.message || "An error occurred",
        status: "error",
        duration: 5000,
        isClosable: true
      });
    }
  };

  //handle deleting machine units
  const handleDelete = async () => {
    try {
      const response = await deleteMachineryUnit({ machineryId: machine._id });
      
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries(['machineryUnits']);
      
      // Show success message
      toast({
        title: "Machinery Deleted",
        description: response.message || `${machine.unit_name} has been permanently removed`,
        status: "success",
        duration: 5000,
        isClosable: true
      });
      
      // Close the modal
      onClose();
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: error.message || "An error occurred while deleting",
        status: "error",
        duration: 5000,
        isClosable: true
      });
    }
  };

  const handleUpdateNameAndRemarks = async () => {
    if (!updatedName.trim() && !updatedRemarks.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide either a name or remarks",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
  
    try {
      // Create an update object with only fields that should be updated
      const updateData = {
        machineryId: machine._id,
      };
  
      // Only include unit_name if it's not empty
      if (updatedName.trim()) {
        updateData.unit_name = updatedName.trim();
      } else {
        // If no name is provided, use the existing name
        updateData.unit_name = machine.unit_name;
      }
  
      // Always include remarks (can be empty string to clear remarks)
      updateData.remarks = updatedRemarks.trim();
  
      const response = await updateMachineryNameAndRemarks(updateData);
      queryClient.invalidateQueries(['machineryUnits']);
  
      onClose();

      toast({
        title: "Machinery Updated",
        description: response.message || "Machinery details have been updated",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: error.message || "An error occurred while updating",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside" motionPreset="none" closeOnOverlayClick={false}>
      <ModalOverlay />
      <ModalContent borderRadius="md" overflow="hidden" boxShadow="lg" height={"1000px"} >
        <ModalHeader bg="white" borderBottomWidth="1px" borderColor="gray.200" display="flex" alignItems="center" py={4}>
          <Icon as={FaTractor} mr={2} color="blue.500" />
          {machine.unit_name}
        </ModalHeader>
        
        <ModalBody py={4}>
          <Tabs variant="enclosed" colorScheme="blue" onChange={(index) => setActiveTab(["details", "transfer", "add"][index])}>
            <TabList mb={4}>
              <Tab fontWeight="medium">Details</Tab>
              <Tab fontWeight="medium">Transfer Units</Tab>
              <Tab fontWeight="medium">Add Units</Tab>
              <Tab fontWeight="medium">More</Tab>
            </TabList>
            
            <TabPanels>
              {/* Details Tab */}
              <TabPanel p={0}>
                <VStack spacing={6} align="stretch">
                  {/* Machinery Details Section */}
                  <Box 
                    p={5} 
                    borderRadius="md" 
                    borderWidth="1px" 
                    borderColor="gray.200" 
                    bg="white"
                    boxShadow="sm"
                  >
                    <Heading as="h3" size="md" mb={4} color="blue.600" fontWeight="600">
                      <HStack>
                        <Icon as={FaTractor} />
                        <Text>Machinery Details</Text>
                      </HStack>
                    </Heading>
                    
                    <SimpleGrid columns={{base: 1, md: 2}} spacing={4} mb={3}>
                      <Box>
                        <Text fontWeight="medium" color="gray.600">Total Units</Text>
                        <Text fontSize="xl" fontWeight="bold">{totals.total}</Text>
                      </Box>
                      <Box>
                        <Text fontWeight="medium" color="gray.600">Status</Text>
                        <HStack mt={1} spacing={3}>
                          <Tag colorScheme="green" size="md">
                            <TagLabel>{totals.functional} Functional</TagLabel>
                          </Tag>
                          <Tag colorScheme="red" size="md">
                            <TagLabel>{totals.nonFunctional} Non-functional</TagLabel>
                          </Tag>
                        </HStack>
                      </Box>
                    </SimpleGrid>
                    
                    {machine.remarks && (
                      <Box mt={4}>
                        <Text fontWeight="medium" mb={1} color="gray.600">Remarks</Text>
                        <Text p={3} bg="gray.50" borderRadius="md" borderWidth="1px" borderColor="gray.200">
                          {machine.remarks || "No remarks available"}
                        </Text>
                      </Box>
                    )}
                  </Box>
                  
                  {/* Barangay Allocations */}
                  <Box 
                    p={5} 
                    borderRadius="md" 
                    borderWidth="1px" 
                    borderColor="gray.200" 
                    bg="white"
                    boxShadow="sm"
                  >
                    <Heading as="h3" size="md" mb={4} color="blue.600" fontWeight="600">
                      <HStack>
                        <Icon as={FaMapMarkerAlt} />
                        <Text>Barangay Allocations</Text>
                      </HStack>
                    </Heading>
                    
                    {/* Mobile-friendly table with horizontal scroll */}
                    <Box overflowX="auto">
                      <Table size="sm" variant="simple">
                        <Thead bg="gray.50">
                          <Tr>
                            <Th>Barangay</Th>
                            <Th isNumeric>Functional</Th>
                            <Th isNumeric>Non-functional</Th>
                            <Th isNumeric>Total</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {machine.barangay_allocations.map((allocation, index) => {
                            const functional = allocation.functional_units || 0;
                            const nonFunctional = allocation.non_functional_units || 0;
                            const total = functional + nonFunctional;
                            
                            return (
                              <Tr key={index}>
                                <Td fontWeight="sm">{allocation.barangay}</Td>
                                <Td isNumeric>
                                  <Tag colorScheme="green" size="sm">{functional}</Tag>
                                </Td>
                                <Td isNumeric>
                                  <Tag colorScheme="red" size="sm" >{nonFunctional}</Tag>
                                </Td>
                                <Td fontWeight="semibold" fontSize="xs" isNumeric >{total}</Td>
                              </Tr>
                            );
                          })}
                        </Tbody>
                        <Tfoot bg="gray.50">
                          <Tr>
                            <Th>Total</Th>
                            <Th isNumeric>
                              <Tag colorScheme="green" size="sm">{totals.functional}</Tag>
                            </Th>
                            <Th isNumeric>
                              <Tag colorScheme="red" size="sm">{totals.nonFunctional}</Tag>
                            </Th>
                            <Th fontWeight="bold" fontSize={"xs"} textAlign={"right"}>{totals.total}</Th>
                          </Tr>
                        </Tfoot>
                      </Table>
                    </Box>
                  </Box>
                </VStack>
              </TabPanel>
              
              {/* Transfer Units Tab */}
              <TabPanel p={0}>
                <VStack spacing={6} align="stretch">
                  <Box 
                    p={5} 
                    borderRadius="md" 
                    borderWidth="1px" 
                    borderColor="gray.200" 
                    bg="white"
                    boxShadow="sm"
                  >
                    <Heading as="h3" size="md" mb={4} color="blue.600" fontWeight="600">
                      <HStack>
                        <Icon as={FaExchangeAlt} />
                        <Text>Transfer Units</Text>
                      </HStack>
                    </Heading>
                    
                    <Alert status="info" mb={4} borderRadius="md" fontSize="sm">
                      <AlertIcon />
                      Transfer existing units from one barangay to another
                    </Alert>
                    
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      {/* Source Barangay */}
                      <FormControl isRequired>
                        <FormLabel fontWeight="medium">From Barangay</FormLabel>
                        <Select 
                          value={transferFrom}
                          onChange={(e) => {
                            setTransferFrom(e.target.value);
                            // Reset unit count when source changes
                            setTransferUnitCount(1);
                          }}
                          placeholder="Select source barangay"
                          isDisabled={availableSourceBarangays.length === 0}
                        >
                          {availableSourceBarangays.map((barangay) => (
                            <option key={barangay} value={barangay}>
                              {barangay}
                            </option>
                          ))}
                        </Select>
                        {availableSourceBarangays.length === 0 && (
                          <Text mt={1} fontSize="sm" color="red.500">
                            No barangays with {transferUnitType === "functional_units" ? "functional" : "non-functional"} units available
                          </Text>
                        )}
                      </FormControl>
                      
                      {/* Destination Barangay */}
                      <FormControl isRequired>
                        <FormLabel fontWeight="medium">To Barangay</FormLabel>
                        <Select 
                          value={transferTo}
                          onChange={(e) => setTransferTo(e.target.value)}
                          placeholder="Select destination barangay"
                          isDisabled={!transferFrom}
                        >
                          {availableDestBarangays.map((barangay) => (
                            <option key={barangay} value={barangay}>
                              {barangay}
                            </option>
                          ))}
                        </Select>
                      </FormControl>
                      
                      {/* Unit Type */}
                      <FormControl isRequired>
                        <FormLabel fontWeight="medium">Unit Type</FormLabel>
                        <Select 
                          value={transferUnitType}
                          onChange={(e) => {
                            setTransferUnitType(e.target.value);
                            // Reset source when unit type changes
                            setTransferFrom("");
                            setTransferUnitCount(1);
                          }}
                        >
                          <option value="functional_units">Functional Units</option>
                          <option value="non_functional_units">Non-functional Units</option>
                        </Select>
                      </FormControl>
                      
                      {/* Unit Count */}
                      <FormControl isRequired>
                        <FormLabel fontWeight="medium">Number of Units</FormLabel>
                        <NumberInput
                          min={1}
                          max={getMaxTransferUnits()}
                          value={transferUnitCount}
                          onChange={(_, value) => setTransferUnitCount(value)}
                          isDisabled={!transferFrom}
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                        {transferFrom && (
                          <Text mt={1} fontSize="sm" color="blue.600">
                            Max: {getMaxTransferUnits()} units available
                          </Text>
                        )}
                      </FormControl>
                    </SimpleGrid>
                    
                    <Button
                      mt={6}
                      colorScheme="blue"
                      leftIcon={<Icon as={FaExchangeAlt} />}
                      onClick={handleTransferUnits}
                      isLoading={isUpdatingMachineryUnit}
                      isDisabled={!transferFrom || !transferTo || transferUnitCount <= 0}
                      fontWeight="500"
                      width="full"
                    >
                      Transfer Units
                    </Button>
                  </Box>
                </VStack>
              </TabPanel>
              
              {/* Add Units Tab */}
              <TabPanel p={0}>
                <VStack spacing={6} align="stretch">
                  <Box 
                    p={5} 
                    borderRadius="md" 
                    borderWidth="1px" 
                    borderColor="gray.200" 
                    bg="white"
                    boxShadow="sm"
                  >
                    <Heading as="h3" size="md" mb={4} color="blue.600" fontWeight="600">
                      <HStack>
                        <Icon as={FaPlus} />
                        <Text>Add Units</Text>
                      </HStack>
                    </Heading>
                    
                    <Alert status="info" mb={4} borderRadius="md" fontSize="sm">
                      <AlertIcon />
                      Add new units to an existing barangay or allocate to a new barangay
                    </Alert>
                    
                    <FormControl isRequired mb={4}>
                      <FormLabel fontWeight="medium">Barangay</FormLabel>
                      <Select 
                        value={addToBarangay}
                        onChange={(e) => setAddToBarangay(e.target.value)}
                        placeholder="Select barangay"
                      >
                        <optgroup label="Existing Allocations">
                          {allocatedBarangays.map((barangay) => (
                            <option key={barangay} value={barangay}>
                              {barangay} (Existing)
                            </option>
                          ))}
                        </optgroup>
                        {unallocatedBarangays.length > 0 && (
                          <optgroup label="New Allocations">
                            {unallocatedBarangays.map((barangay) => (
                              <option key={barangay} value={barangay}>
                                {barangay} (New)
                              </option>
                            ))}
                          </optgroup>
                        )}
                      </Select>
                    </FormControl>
                    
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      {/* Functional Units */}
                      <FormControl>
                        <FormLabel fontWeight="medium">Functional Units</FormLabel>
                        <NumberInput
                          min={0}
                          value={addFunctionalUnits}
                          onChange={(_, value) => setAddFunctionalUnits(value)}
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </FormControl>
                      
                      {/* Non-Functional Units */}
                      <FormControl>
                        <FormLabel fontWeight="medium">Non-functional Units</FormLabel>
                        <NumberInput
                          min={0}
                          value={addNonFunctionalUnits}
                          onChange={(_, value) => setAddNonFunctionalUnits(value)}
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </FormControl>
                    </SimpleGrid>
                    
                    <Button
                      mt={6}
                      colorScheme="blue"
                      leftIcon={<Icon as={FaPlus} />}
                      onClick={handleAddUnits}
                      isLoading={isAddingMachineryUnits}
                      isDisabled={!addToBarangay || (addFunctionalUnits === 0 && addNonFunctionalUnits === 0)}
                      fontWeight="500"
                      width="full"
                    >
                      Add Units
                    </Button>
                  </Box>
                </VStack>
              </TabPanel>

              {/* More tab Panel */}
              <TabPanel p={0}>
                <VStack spacing={6} align="stretch">

                  <Box
                    p={5}
                    borderRadius="md"
                    borderWidth="1px"
                    boxShadow="sm"
                  >
                    <Heading as="h3" size="md" mb={4} color={"blue.600"} fontWeight="600">
                      <HStack>
                        <Icon as={FaAddressCard} />
                        <Text>Name and Remarks</Text>
                      </HStack>
                    </Heading>

                    <Alert status="info" mb={4} borderRadius="md" fontSize="sm">
                      <AlertIcon />
                      Update the name and remarks of this machinery unit
                    </Alert>

                    <FormControl mb={3} isRequired>
                      <FormLabel fontWeight="medium">Machinery Name</FormLabel>
                      <Input
                        value={updatedName}
                        placeholder="Enter machinery name"
                        onChange={(e) => setUpdatedName(e.target.value)}
                      />
                    </FormControl>

                    <FormControl mb={3}>
                      <FormLabel fontWeight="medium">Remarks</FormLabel>
                      <Textarea
                        value={updatedRemarks}
                        placeholder="Enter remarks (optional)"
                        onChange={(e) => setUpdatedRemarks(e.target.value)}
                        rows={3}
                      />
                    </FormControl>

                    <Button
                      colorScheme="blue"
                      onClick={handleUpdateNameAndRemarks}
                      isLoading={isUpdatingMachineryUnit}
                      isDisabled={
                        (updatedName.trim() === (machine?.unit_name || "") && 
                        updatedRemarks.trim() === (machine?.remarks || "")) || 
                        (!updatedName.trim() && !updatedRemarks.trim())
                      }
                      width={"100%"}
                    >
                      Save
                    </Button>
                  </Box>
                  
                  <Box 
                    p={5} 
                    borderRadius="md" 
                    borderWidth="1px" 
                    borderColor="red.200" 
                    bg="red.50"
                    boxShadow="sm"
                  >
                    <Heading as="h3" size="md" mb={4} color="red.600" fontWeight="600">
                      <HStack>
                        <Icon as={FaTrash} />
                        <Text>Danger Zone</Text>
                      </HStack>
                    </Heading>
                    
                    <Alert status="warning" mb={4} borderRadius="md">
                      <AlertIcon />
                      <Box flex="1">
                        <AlertTitle mb={1}>Warning: This action cannot be undone</AlertTitle>

                      </Box>
                    </Alert>
                    
                    <Box 
                      p={4} 
                      borderWidth="1px" 
                      borderColor="red.300" 
                      borderRadius="md"
                      bg="white"
                    >
                      <Text fontWeight="medium" mb={1}>
                        Delete "{machine.unit_name}"
                      </Text>

                      <Text fontSize="sm" mb={3}>
                          Deleting this machinery will permanently remove it from the system, including all associated allocation records and data.
                      </Text>

                      
                      
                        <Button
                          leftIcon={<Icon as={FaTrash} />}
                          colorScheme="red"
                          variant="outline"
                          size="md"
                          onClick={openDeleteModal}
                        >
                          Delete this machinery
                        </Button>
                    </Box>
                  </Box>
                    



                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>
        
        <ModalFooter bg="gray.50" borderTopWidth="1px" borderColor="gray.200" py={4}>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>


      {/* Modal for confirming machine deletion */}
      <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal} isCentered size="sm" motionPreset='none'>
        <ModalOverlay />
        <ModalContent borderRadius="md" overflow="hidden" boxShadow="lg">
          <Box borderWidth="1px" borderColor="red.200" p={5} borderRadius="md" bg="red.50">
            <Heading size="md" color="red.600" mb={4}>Delete Confirmation</Heading>
            <Text fontWeight="medium" mb={4}>
              Are you sure you want to delete this machinery?
            </Text>
            <HStack spacing={3} justifyContent="flex-end">
              <Button
                size="md"
                onClick={closeDeleteModal}
                variant={"outline"}
              >
                Cancel
              </Button>
              <Button
                colorScheme="red"
                size="md"
                isLoading={isDeletingMachineryUnit}
                onClick={() => {
                  handleDelete();
                  closeDeleteModal();
                }}
              >
                Yes, delete permanently
              </Button>
            </HStack>
          </Box>
        </ModalContent>
      </Modal> 
    </Modal>
    
  );
};

const MachineryInventory = () => {
  // State for filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBarangay, setSelectedBarangay] = useState('');

  //state for opening mchinery edit modal
  const [selectedMachine, setSelectedMachine] = useState(null);

  
  // Modal control
  const { isOpen: isNewModalOpen, onOpen: openNewModal, onClose: closeNewModal } = useDisclosure();
  const { isOpen: isDetailsModalOpen, onOpen: openDetailsModal, onClose: closeDetailsModal } = useDisclosure();

  
  // Get data from store
  const { 
    machineryUnits,
    isLoading,
    error
  } = useAdminDashboard();

  // handle for clikcing a specific machinery unit
  const handleMachineClick = (unit) => {
    setSelectedMachine(unit);
    openDetailsModal();
  }

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Filter machinery units based on search query
  const filteredMachineryUnits = machineryUnits.filter(unit => {
    return unit.unit_name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Calculate totals for a unit
  const calculateTotals = (unit) => {
    return unit.barangay_allocations.reduce(
      (totals, allocation) => {
        const functionalCount = allocation.functional_units || 0;
        const nonFunctionalCount = allocation.non_functional_units || 0;
        
        return {
          functional: totals.functional + functionalCount,
          nonFunctional: totals.nonFunctional + nonFunctionalCount,
          total: totals.total + functionalCount + nonFunctionalCount
        };
      },
      { functional: 0, nonFunctional: 0, total: 0 }
    );
  };

  // Format unit name for display, adding line breaks for long names
  const formatUnitName = (name) => {
    // Filter out any empty strings caused by extra spaces
    const words = name.split(' ').filter(word => word.trim() !== '');
    if (words.length <= 3) return name;
    
    // Group words into chunks of 3
    const chunks = [];
    for (let i = 0; i < words.length; i += 3) {
      chunks.push(words.slice(i, i + 3).join(' '));
    }
    
    // Use a Box container so each chunk renders on its own line
    return (
      <Box>
        {chunks.map((chunk, index) => (
          <Text as="div" key={index} lineHeight="tight">
            {chunk}
          </Text>
        ))}
      </Box>
    );
  };


  // Render label with line breaks for multi-word strings
  const renderLabel = (label) => {
    const words = label.split(" ");
    return (
      <>
        {words.map((word, idx) => (
          <Text key={idx} as="span" display="block">
            {word}
          </Text>
        ))}
      </>
    );
  };

  //column widths for machineru, units, functional, non-functional
  const getColumnWidth = (type) => {
    switch(type) {
      case "machinery": return "150px";
      case "units": return "50px";
      case "functional": return "80px";
      case "nonFunctional": return "100px";
      case "barangay": return "100px";
      default: return "100px";
    }
  };

  return (
    <Box 
      overflow="hidden" 
      p={5} 
      minH="100vh"
    >
      {/* New Machinery Modal */}
      <NewMachineryModal isOpen={isNewModalOpen} onClose={closeNewModal} />
      <ViewMachineryModal isOpen={isDetailsModalOpen} onClose={closeDetailsModal} machine={selectedMachine} />
      
      {/* Header */}
      <Heading as="h1" size="xl" mb={2} color="black">
        Machinery Inventory
      </Heading>
      <Text color="gray.600" mb={5} >
        View and manage all agricultural machinery units available in Calamba City. Click the MACHINE NAME to view options.
      </Text>
      
      {/* Filter Box */}
      <Box
        mb={6}
        p={4}
        bgColor="blue.50"
        borderRadius="lg"
      >
        {/* All controls in a single row */}
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4} alignItems="flex-end">
          {/* Search Bar */}
          <FormControl>
            <FormLabel fontSize="sm" fontWeight="medium" display="flex" alignItems="center" gap={2} mb={2}>
              <Icon as={FaSearch} color="blue.500" /> Search
            </FormLabel>
            <InputGroup size="md">
              <Input 
                placeholder="Search by machine name..." 
                value={searchQuery}
                onChange={handleSearchChange}
                bg="white"
                _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px blue.400" }}
              />
              <InputRightElement pointerEvents="none">
                <Icon as={FaSearch} color="gray.400" />
              </InputRightElement>
            </InputGroup>
          </FormControl>

          {/* Barangay Filter */}
          <FormControl>
            <FormLabel fontSize="sm" fontWeight="medium" display="flex" alignItems="center" gap={2} mb={2}> 
              <Icon as={FaMapMarkerAlt} color="blue.500" /> Barangay
            </FormLabel>
            <Select
              placeholder="All Barangays"
              value={selectedBarangay}
              onChange={(e) => setSelectedBarangay(e.target.value)}
              bg="white"
              size="md"
            >
              {Barangays.map((barangay) => (
                <option key={barangay} value={barangay}>
                  {barangay}
                </option>
              ))}
            </Select>
          </FormControl>

          <SimpleGrid columns={{ base: 1, sm: 1, md: 1 }} spacing={4} mt={4}>
            {/* New Machinery Button */}
              <Button 
                leftIcon={<Icon as={FaPlus} />} 
                colorScheme="blue" 
                size="md" 
                h="40px"
                mt={{ base: 0, md: "auto" }}
                onClick={openNewModal}
              >
                Add New Machinery
              </Button>
          </SimpleGrid>
        </SimpleGrid>
      </Box>
      
      <Box mb={8}>
        <Flex
          justify="space-between" 
          align="center" 
          mb={4}
          bg="blue.50"
          p={3}
          borderRadius="md"
          borderLeftWidth="4px"
          borderLeftColor="blue.500"
        >
          <Heading as="h2" size="md" display="flex" alignItems="center">
            <Icon as={FaTractor}  mr={2} color="blue.600" /> FARM MACHINERIES
          </Heading>
        </Flex>

        {/*Machineries Table*/}
        {isLoading ? (
          <Flex justifyContent="center" alignItems="center" minH="200px">
            <Spinner size="lg" color="blue.500" thickness="3px" />
            <Text ml={5}>Loading machineries...</Text>
          </Flex>
        ) : filteredMachineryUnits.length > 0 ? (
          <Box overflowX="auto" border="1px solid" borderColor="gray.200">
            <TableContainer>
              <Table variant="simple" size="xs" tableLayout="fixed" w="auto">
                {/* Table Header */}
                <Thead borderBottom="2px solid" borderColor="gray.300">
                  <Tr>
                    <Th 
                      px={2} py={1} 
                      fontSize="2xs" 
                      textTransform="uppercase" 
                      borderRight="1px solid" 
                      borderColor="green.300" 
                      textAlign={"center"} 
                      bg={"green.100"}
                    >
                      Machinery
                    </Th>
                    <Th 
                      px={2} py={1} 
                      fontSize="2xs" 
                      textTransform="uppercase" 
                      borderRight="1px solid" 
                      borderColor="green.300" 
                      textAlign={"center"} 
                      bg={"green.100"}
                      width={getColumnWidth("units")}
                      maxW={getColumnWidth("units")}
                    >
                      Units
                    </Th>
                    <Th 
                      px={2} py={1} 
                      fontSize="2xs" 
                      textTransform="uppercase" 
                      borderRight="1px solid" 
                      borderColor="green.300" 
                      textAlign={"center"} 
                      bg={"green.100"}
                      width={getColumnWidth("functional")}
                      maxW={getColumnWidth("functional")}
                    >
                      Functional
                    </Th>
                    <Th 
                      px={2} py={1} 
                      fontSize="2xs" 
                      textTransform="uppercase" 
                      borderRight="1px solid" 
                      borderColor="green.300" 
                      textAlign={"center"} 
                      bg={"green.100"}
                      width={getColumnWidth("nonFunctional")}
                      maxW={getColumnWidth("nonFunctional")}
                    >
                      <Text>Non-</Text>
                      <Text>Functional</Text>
                    </Th>
                    {selectedBarangay ? (
                      // Only show the selected barangay column
                      <Th
                        key={selectedBarangay}
                        px={2}
                        py={1}
                        bg={"orange.100"}
                        fontSize="2xs"
                        textTransform="uppercase"
                        borderRight="1px solid"
                        borderColor="orange.300"
                        width={getColumnWidth("barangay")}
                        maxW={getColumnWidth("barangay")}
                        textAlign="center"
                        whiteSpace="normal"
                      >
                        <Tooltip label={selectedBarangay} placement="top">
                          <Box>
                            {renderLabel(selectedBarangay)}
                          </Box>
                        </Tooltip>
                      </Th>
                    ) : (
                      // Table Header ng Barangays (dynamic)
                      Barangays.map((barangay) => (
                        <Th
                          key={barangay}
                          px={2}
                          py={1}
                          bg={"orange.100"}
                          fontSize="2xs"
                          textTransform="uppercase"
                          borderRight="1px solid"
                          borderColor="orange.300"
                          width={getColumnWidth("barangay")}
                          maxW={getColumnWidth("barangay")}
                          textAlign="center"
                          whiteSpace="normal"
                        >
                          <Tooltip label={barangay} placement="top">
                            <Box>
                              {renderLabel(barangay)}
                            </Box>
                          </Tooltip>
                        </Th>
                      ))
                    )}
                  </Tr>
                </Thead>

                <Tbody>
                  {filteredMachineryUnits.map((unit) => {
                    const totals = calculateTotals(unit);
                    
                    return (
                      <Tr key={unit._id}>
                        {/* Machinery name */}
                        <Td 
                          borderRight="1px solid" 
                          borderColor="gray.300" 
                          fontSize="xs" 
                          px={2} py={1}
                        >
                          <Link
                            display="block"
                            textColor="blue.600" 
                            fontWeight="medium"
                            onClick={() => handleMachineClick(unit)}
                            _hover={{ 
                              textDecoration: "underline", 
                              color: "blue.800" 
                            }}
                            aria-label={`View details for ${unit.unit_name}`}
                          >
                            {formatUnitName(unit.unit_name)}
                          </Link>
                        </Td>
                        
                        {/* Total Units */}
                        <Td borderRight="1px solid" borderColor="gray.300" fontSize="xs" px={2} py={1} fontWeight={"medium"} textAlign={"center"}>
                          {totals.total}
                        </Td>
                        
                        {/* Functional Units */}
                        <Td borderRight="1px solid" borderColor="gray.300" fontSize="xs" px={2} py={1} fontWeight={"medium"} textAlign="center">
                          <Tag size="sm" variant="subtle" colorScheme="green">
                            <TagLabel>{totals.functional}</TagLabel>
                          </Tag>
                        </Td>
                        
                        {/* Non-Functional Units */}
                        <Td borderRight="1px solid" borderColor="gray.300" fontSize="xs" px={2} py={1} fontWeight={"medium"} textAlign="center">
                          <Tag size="sm" variant="subtle" colorScheme="red">
                            <TagLabel>{totals.nonFunctional}</TagLabel>
                          </Tag>
                        </Td>
                        
                        {/* Barangay Allocations */}
                        {selectedBarangay ? (
                          (() => {
                            // Find allocation for selected barangay
                            const allocation = unit.barangay_allocations.find(
                              (alloc) => alloc.barangay === selectedBarangay
                            );
                            
                            // If no allocation found, return empty cell
                            if (!allocation) {
                              return (
                                <Td 
                                  key={selectedBarangay} 
                                  borderRight="1px solid" 
                                  borderColor="gray.300"
                                  textAlign="center"
                                  px={2}
                                  py={1}
                                >
                                  -
                                </Td>
                              );
                            }
                            
                            // If both functional and non-functional units are 0, show dash
                            const functionalUnits = allocation.functional_units || 0;
                            const nonFunctionalUnits = allocation.non_functional_units || 0;
                            
                            if (functionalUnits === 0 && nonFunctionalUnits === 0) {
                              return (
                                <Td 
                                  key={selectedBarangay} 
                                  borderRight="1px solid" 
                                  borderColor="gray.300"
                                  textAlign="center"
                                  px={2}
                                  py={1}
                                >
                                  -
                                </Td>
                              );
                            }
                            
                            // Show allocation details if there are units
                            return (
                              <Td 
                                key={selectedBarangay} 
                                borderRight="1px solid" 
                                borderColor="gray.300"
                                textAlign="center"
                                px={1}
                                py={1}
                                fontSize="sm"
                              >
                                <HStack spacing={1} justify="center">
                                  <Tag size="sm" variant="subtle" colorScheme="green">
                                    <TagLabel>{functionalUnits}</TagLabel>
                                  </Tag>
                                  <Text>/</Text>
                                  <Tag size="sm" variant="subtle" colorScheme="red">
                                    <TagLabel>{nonFunctionalUnits}</TagLabel>
                                  </Tag>
                                </HStack>
                              </Td>
                            );
                          })()
                        ) : (
                          // When no filter is selected, show all barangay columns
                          Barangays.map((barangay) => {
                            // Find allocation for this barangay
                            const allocation = unit.barangay_allocations.find(
                              (alloc) => alloc.barangay === barangay
                            );
                            
                            // If no allocation found, return empty cell
                            if (!allocation) {
                              return (
                                <Td 
                                  key={barangay} 
                                  borderRight="1px solid" 
                                  borderColor="gray.300"
                                  textAlign="center"
                                  px={2}
                                  py={1}
                                >
                                  -
                                </Td>
                              );
                            }
                            
                            // If both functional and non-functional units are 0, show dash
                            const functionalUnits = allocation.functional_units || 0;
                            const nonFunctionalUnits = allocation.non_functional_units || 0;
                            
                            if (functionalUnits === 0 && nonFunctionalUnits === 0) {
                              return (
                                <Td 
                                  key={barangay} 
                                  borderRight="1px solid" 
                                  borderColor="gray.300"
                                  textAlign="center"
                                  px={2}
                                  py={1}
                                >
                                  -
                                </Td>
                              );
                            }
                            
                            // Show allocation details if there are units
                            return (
                              <Td 
                                key={barangay} 
                                borderRight="1px solid" 
                                borderColor="gray.300"
                                textAlign="center"
                                px={1}
                                py={1}
                                fontSize="xs"
                              >
                                <HStack spacing={1} justify="center">
                                  <Tag size="sm" variant="subtle" colorScheme="green">
                                    <TagLabel>{functionalUnits}</TagLabel>
                                  </Tag>
                                  <Text>/</Text>
                                  <Tag size="sm" variant="subtle" colorScheme="red">
                                    <TagLabel>{nonFunctionalUnits}</TagLabel>
                                  </Tag>
                                </HStack>
                              </Td>
                            );
                          })
                        )}
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </TableContainer>
          </Box>
        ) : (
          <Flex 
            justifyContent="center" 
            alignItems="center"
            mt={20}
            minH="200px"
            border="1px dashed"
            borderColor="gray.300"
            borderRadius="md"
            direction="column"
            p={6}
          >
            <Icon as={FaTractor} color="gray.400" boxSize={10} mb={4} />
            <Text color="gray.500" fontSize="lg" mb={2}>No machineries found</Text>
            <Text color="gray.400" fontSize="sm">Try adjusting your search criteria</Text>
          </Flex>
        )}
      </Box>
    </Box>
  );
};

export default MachineryInventory;
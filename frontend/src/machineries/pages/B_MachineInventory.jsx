import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Text,
  Stack,
  Flex,
  Icon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Center,
  Spinner,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tag,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
  TableContainer,
  InputGroup,
  Input,
  InputRightElement,
  FormControl,
  HStack,
  Tooltip,
  Select,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  SimpleGrid,
  Divider,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  FormLabel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  RadioGroup,
  Radio,
} from "@chakra-ui/react";
import {
  FaTractor,
  FaTools,
  FaCheckCircle,
  FaExclamationTriangle,
  FaEye,
  FaSearch,
  FaInfo,
  FaPlus
} from "react-icons/fa";
import { useAdminDashboard } from "../store/adminDashboard.store";
import { useAuthStore } from "../../auth/store/authStore";
import { useQueryClient } from '@tanstack/react-query';

const B_MachineInventory = () => {
  const [selectedYear] = useState(new Date().getFullYear());
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [machineUnitsPage, setMachineUnitsPage] = useState(1);

  const {
    machineUnits,
    isLoadingMachineUnits,
    machineUnitsError,

    machineOverview,
    isLoadingMachineOverview,
    machineOverviewError,

    updateMachineryUnitStatus,
    isUpdatingMachineryUnitStatus,

    machineTypes,
    isLoadingMachineTypes,
    machineTypesError,

    createMachineryType,
    isCreatingMachineryType,
    createMachineryUnit,
    isCreatingMachineryUnit
  } = useAdminDashboard({ machineUnitsPage }, { searchQuery });

  const getOverviewStats = () => {
    if (!machineOverview?.data) {
      return {
        totalMachines: 0,
        functional: 0,
        underRepair: 0,
        retired: 0,
      };
    }

    return {
      totalMachines: machineOverview.data.totalMachines || 0,
      functional: machineOverview.data.functional || 0,
      underRepair: machineOverview.data.underRepair || 0,
      retired: machineOverview.data.retired || 0,
    };
  };

  const stats = getOverviewStats();

  // Reset to page 1 when search query changes
  useEffect(() => {
    setMachineUnitsPage(1);
  }, [searchQuery]);

  // Get status color helper
  const getStatusColor = (status) => {
    switch (status) {
      case "Available":
        return "green";
      case "In Use":
        return "blue";
      case "Under Repair":
        return "orange";
      case "Retired":
        return "gray";
      case "Not for Use":
        return "red";
      default:
        return "gray";
    }
  };

  // Get condition color helper
  const getConditionColor = (condition) => {
    return condition === "Functional" ? "green" : "red";
  };

  // Filter machine units based on search query
  const filterMachineUnits = () => {
    if (!machineUnits?.data?.machineTypesWithUnits) return [];

    const hasQuery = Boolean(searchQuery.trim());
    const q = searchQuery.toLowerCase().trim();

    const matchesUnit = (type, unit) => {
      const matchesQuery =
        !hasQuery ||
        unit.unitNumber?.toLowerCase().includes(q) ||
        type.equipmentType?.toLowerCase().includes(q) ||
        type.ownerName?.toLowerCase().includes(q) ||
        unit.engineBrand?.toLowerCase().includes(q) ||
        unit.engineHorsepower?.toLowerCase().includes(q) ||
        unit.location?.toLowerCase().includes(q) ||
        unit.status?.toLowerCase().includes(q) ||
        unit.condition?.toLowerCase().includes(q);

      const matchesStatus = statusFilter === "all" || unit.status === statusFilter;

      return matchesQuery && matchesStatus;
    };

    return machineUnits.data.machineTypesWithUnits
      .map((type) => ({
        ...type,
        machineUnits: type.machineUnits?.filter((unit) => matchesUnit(type, unit)),
      }))
      .filter((type) => type.machineUnits && type.machineUnits.length > 0);
  };

  const filteredMachineUnits = filterMachineUnits();
  
  console.log(filteredMachineUnits);
  const { user } = useAuthStore();
  const toast = useToast();
  const queryClient = useQueryClient();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedUnit, setSelectedUnit] = useState(null);

  const { isOpen: isOpenUpdateStatus, onOpen: onOpenUpdateStatus, onClose: onCloseUpdateStatus } = useDisclosure();
  const [statusUpdateData, setStatusUpdateData] = useState({
    status: '',
    condition: '',
    reason: '',
  });

  const handleUpdateStatus = async () => {
    if (!selectedUnit?._id || !user?.id || !statusUpdateData.status || !statusUpdateData.condition || !statusUpdateData.reason.trim()) {
      toast({
        title: "Error",
        description: "Missing required information",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      await updateMachineryUnitStatus({
        machineryUnitId: selectedUnit._id,
        employeeId: user.id,
        newStatus: statusUpdateData.status,
        newCondition: statusUpdateData.condition,
        reason: statusUpdateData.reason,
      });

      toast({
        title: "Success",
        description: "Machine unit status updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['machineUnits'] }),
        queryClient.invalidateQueries({ queryKey: ['machineOverview'] }),
      ]);

      // Close modals and reset state
      onCloseUpdateStatus();
      onClose();
      setStatusUpdateData({ status: '', condition: '', reason: '' });
      setSelectedUnit(null);

    } catch (error) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || error?.message || "Failed to update machine unit status",
        status: "error",
        duration: 10000,
        isClosable: true,
      });
    }
  };

  const { isOpen: isOpenRegister, onOpen: onOpenRegister, onClose: onCloseRegister } = useDisclosure();
  const [activeTab, setActiveTab] = useState(0);

  // State for creating machine type
  const [machineTypeData, setMachineTypeData] = useState({
    equipmentType: '',
    ownerName: '',
    ownerType: '',
    ratedCapacity: '',
  });

  // State for adding machine unit
  const [machineUnitData, setMachineUnitData] = useState({
    machineryTypeId: '',
    unitNumber: '',
    engineBrand: '',
    engineHorsepower: '',
    modeOfAcquisition: '',
    otherModeOfAcquisition: '', 
    costOfAcquisition: '',
    yearAcquired: '',
  });

  const resetMachineTypeForm = () => {
    setMachineTypeData({
      equipmentType: '',
      ownerName: '',
      ownerType: '',
      ratedCapacity: '',
    });
  };

  const resetMachineUnitForm = () => {
    setMachineUnitData({
      machineryTypeId: '',
      unitNumber: '',
      engineBrand: '',
      engineHorsepower: '',
      modeOfAcquisition: '',
      otherModeOfAcquisition: '', 
      costOfAcquisition: '',
      yearAcquired: '',
    });
  };

  const handleCreateMachineType = async () => {
    try {
      const result = await createMachineryType(machineTypeData);
      
      toast({
        title: "Success",
        description: result.message || "Machine type created successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Invalidate and refetch queries
      await queryClient.invalidateQueries({ queryKey: ['machineTypes'] });
      
      // Reset form and close modal
      resetMachineTypeForm();
      onCloseRegister();
      
    } catch (error) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || error?.message || "Failed to create machine type",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleAddMachineUnit = async () => {
    try {
      const result = await createMachineryUnit(machineUnitData);
      
      toast({
        title: "Success",
        description: result.message || "Machine unit added successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Invalidate and refetch queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['machineUnits'] }),
        queryClient.invalidateQueries({ queryKey: ['machineOverview'] }),
      ]);
      
      // Reset form and close modal
      resetMachineUnitForm();
      onCloseRegister();
      
    } catch (error) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || error?.message || "Failed to add machine unit",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Pagination data
  const machineUnitsTotalPages = machineUnits?.data?.totalPages || 1;
  const machineUnitsCurrentPage = machineUnits?.data?.currentPage || 1;
  const machineUnitsTotalItems = machineUnits?.data?.totalCount || 0;

  // Pagination Controls Component
  const PaginationControls = ({ currentPage, setCurrentPage, totalPages, totalItems, colorScheme }) => (
    <Flex
      justifyContent="space-between"
      mt={4}
      alignItems="center"
      direction={{ base: "column", md: "row" }}
      gap={{ base: 3, md: 0 }}
      width={"100%"}
    >
      <Text color="gray.600" fontSize="md">
        Page {currentPage} of {totalPages || 1} ({totalItems} total)
      </Text>
      <Flex>
        <Button
          size="sm"
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          isDisabled={currentPage === 1}
          colorScheme={colorScheme}
          variant="outline"
          mr={2}
        >
          Previous
        </Button>
        <Button
          size="sm"
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          isDisabled={currentPage >= totalPages}
          colorScheme={colorScheme}
          variant="outline"
        >
          Next
        </Button>
      </Flex>
    </Flex>
  );

  return (
    <>
    <Box overflow="hidden" bg="white" p={5} minH="100vh">
      <Heading as="h1" size="xl" mb={2} color="black">
        Machinery Inventory
      </Heading>
      <Text color="gray.600" mb={5}>
        Overview of agricultural machinery assets and their operational status.
      </Text>

      {/* Inventory Data Cards */}
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
            <Icon as={FaTractor} mr={2} color="blue.600" /> MACHINE OVERVIEW
          </Heading>
        </Flex>

        {/* Error Alert for Machine Overview */}
        {machineOverviewError && (
          <Alert status="error" mb={4}>
            <AlertIcon />
            <Box>
              <AlertTitle>Error loading machine overview</AlertTitle>
              <AlertDescription>
                {machineOverviewError?.response?.data?.message ||
                  machineOverviewError?.message ||
                  "An error occurred while fetching machine overview."}
              </AlertDescription>
            </Box>
          </Alert>
        )}

        <Stack direction={{ base: "column", md: "row" }} spacing={4} w="full">
          {/* Total Machines */}
          <Box
            p={5}
            flex={1}
            borderRadius="md"
            boxShadow="sm"
            bg="white"
            borderWidth="1px"
            borderColor="gray.200"
          >
            <Stat>
              <StatLabel fontSize="md" display="flex" alignItems="center">
                <Icon as={FaTractor} mr={2} color="blue.500" /> Total Machines
              </StatLabel>
              {isLoadingMachineOverview ? (
                <Center h="65px">
                  <Spinner size="lg" thickness="3px" color="blue.500" />
                </Center>
              ) : (
                <StatNumber fontSize="4xl">{stats.totalMachines}</StatNumber>
              )}
              <StatHelpText>{selectedYear}</StatHelpText>
            </Stat>
          </Box>

          {/* Functional Machines */}
          <Box
            p={5}
            flex={1}
            borderRadius="md"
            boxShadow="sm"
            bg="white"
            borderWidth="1px"
            borderColor="gray.200"
          >
            <Stat>
              <StatLabel fontSize="md" display="flex" alignItems="center">
                <Icon as={FaCheckCircle} mr={2} color="green.500" /> Functional
              </StatLabel>
              {isLoadingMachineOverview ? (
                <Center h="65px">
                  <Spinner size="lg" thickness="3px" color="green.500" />
                </Center>
              ) : (
                <StatNumber fontSize="4xl">{stats.functional}</StatNumber>
              )}
              <StatHelpText>In good condition</StatHelpText>
            </Stat>
          </Box>

          {/* Under Repair */}
          <Box
            p={5}
            flex={1}
            borderRadius="md"
            boxShadow="sm"
            bg="white"
            borderWidth="1px"
            borderColor="gray.200"
          >
            <Stat>
              <StatLabel fontSize="md" display="flex" alignItems="center">
                <Icon as={FaExclamationTriangle} mr={2} color="orange.500" /> Under Repair
              </StatLabel>
              {isLoadingMachineOverview ? (
                <Center h="65px">
                  <Spinner size="lg" thickness="3px" color="orange.500" />
                </Center>
              ) : (
                <StatNumber fontSize="4xl">{stats.underRepair}</StatNumber>
              )}
              <StatHelpText>Maintenance ongoing</StatHelpText>
            </Stat>
          </Box>

          {/* Retired Machines */}
          <Box
            p={5}
            flex={1}
            borderRadius="md"
            boxShadow="sm"
            bg="white"
            borderWidth="1px"
            borderColor="gray.200"
          >
            <Stat>
              <StatLabel fontSize="md" display="flex" alignItems="center">
                <Icon as={FaTools} mr={2} color="gray.500" /> Retired
              </StatLabel>
              {isLoadingMachineOverview ? (
                <Center h="65px">
                  <Spinner size="lg" thickness="3px" color="gray.500" />
                </Center>
              ) : (
                <StatNumber fontSize="4xl">{stats.retired}</StatNumber>
              )}
              <StatHelpText>Out of service</StatHelpText>
            </Stat>
          </Box>
        </Stack>
      </Box>
      
      {/* Search / Filters Bar (adapted from provided snippet) */}
      <Box 
        mb={6}
        p={4}
        bg="orange.50"
        borderRadius="md"
        boxShadow="sm"
      >
        <Flex 
          direction={{ base: "column", lg: "row" }} 
          gap={4}
          align={{ base: "stretch", lg: "flex-end" }}
        >
          {/* General Search */}
          <Box flex={{ base: "1", lg: "2" }}>
            <HStack spacing={2} mb={2} justifyContent="flex-start">
              <Icon as={FaSearch} color="orange.500" />
              <Text fontWeight="medium" fontSize={'sm'}>
                Search by:{" "}
                <Tooltip label="Wrong spelling and extra spaces may give no results." placement="bottom" hasArrow>
                  <span>(<Icon as={FaInfo} color="orange.500" boxSize={3} />)</span>
                </Tooltip>
              </Text>
            </HStack>
            <InputGroup>
              <Input
                placeholder="Unit #, Equipment, Owner, Brand, Location, Status..."
                bg="white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                _focus={{ borderColor: "orange.400" }}
              />
              <InputRightElement pointerEvents="none">
                <FaSearch color="gray.300" />
              </InputRightElement>
            </InputGroup>
          </Box>

          {/* Status Filter */}
          <FormControl width={{ base: "100%", lg: "auto" }} minW={{ lg: "220px" }}>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              bg="white"
              size="md"
              height="40px"
            >
              <option value="all">All Statuses</option>
              <option value="Available">Available</option>
              <option value="In Use">In Use</option>
              <option value="Under Repair">Under Repair</option>
              <option value="Retired">Retired</option>
              <option value="Not for Use">Not for Use</option>
            </Select>
          </FormControl>

          {/* Register Machine Button */}
          <Button
            colorScheme="orange"
            size="md"
            height="40px"
            width={{ base: "100%", lg: "auto" }}
            flexShrink={0}
            onClick={onOpenRegister}
            leftIcon={<FaPlus />}
          >
            Register Machine
          </Button>
        </Flex>
      </Box>

      {/* Machine Units Table */}
      <Box mb={4}>
        <Flex
          justify="space-between"
          align="center"
          mb={4}
          bg="orange.50"
          p={3}
          borderRadius="md"
          borderLeftWidth="4px"
          borderLeftColor="orange.500"
        >
          <Heading as="h2" size="md" display="flex" alignItems="center">
            <Icon as={FaTractor} mr={2} color="orange.600" /> MACHINE UNITS
          </Heading>
        </Flex>

        <Box>
          {isLoadingMachineUnits ? (
            <Center h="200px">
              <Spinner size="xl" thickness="4px" color="blue.500" />
            </Center>
          ) : machineUnitsError ? (
            <Alert status="error">
              <AlertIcon />
              <Box>
                <AlertTitle>Error loading machine units</AlertTitle>
                <AlertDescription>
                  {machineUnitsError?.response?.data?.message ||
                    machineUnitsError?.message ||
                    "An error occurred while fetching machine units."}
                </AlertDescription>
              </Box>
            </Alert>
          ) : !filteredMachineUnits?.length ? (
            <Center h="200px">
              <Text color="gray.500" fontSize="lg">
                {searchQuery ? "No machine units found matching your search" : "No machine units found"}
              </Text>
            </Center>
          ) : (
            <Box overflowX="auto">
              <TableContainer>
                <Table variant="simple">
                  <Thead bg="gray.50">
                    <Tr>
                      <Th textAlign={'center'}>Unit Number</Th>
                      <Th>Equipment Type</Th>
                      <Th>Owner</Th>
                      <Th>Engine Brand</Th>
                      <Th>Horsepower</Th>
                      <Th>Status</Th>
                      <Th>Condition</Th>
                      <Th
                        position={{ base: 'static', md: 'sticky' }}
                        right={0}
                        bg="gray.50"
                        zIndex={{ base: 0, md: 1 }}
                        textAlign="center"
                        width="120px"
                      >
                        <Box display={{ base: 'none', md: 'block' }}>Scroll →</Box>
                        <Box display={{ base: 'block', md: 'none' }}>Actions</Box>
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredMachineUnits.map((type) =>
                      type.machineUnits?.map((unit) => (
                        <Tr key={unit._id} _hover={{ bg: "gray.50" }}>
                          <Td fontWeight="semibold" fontSize={'sm'} textAlign={'center'}>{unit.unitNumber}</Td>
                          <Td fontSize={'sm'}>{type.equipmentType}</Td>
                          <Td fontSize={'sm'}>{type.ownerName}</Td>
                          <Td fontSize={'sm'}>{unit.engineBrand || "N/A"}</Td>
                          <Td fontSize={'sm'}>{unit.engineHorsepower}</Td>
                          <Td>
                            <Tag
                              colorScheme={getStatusColor(unit.status)}
                              size="sm"
                            >
                              {unit.status}
                            </Tag>
                          </Td>
                          <Td>
                            <Tag
                              colorScheme={getConditionColor(unit.condition)}
                              size="sm"
                            >
                              {unit.condition}
                            </Tag>
                          </Td>
                          <Td
                            isNumeric
                            position={{ base: 'static', md: 'sticky' }}
                            right={0}
                            zIndex={1}
                            bg="white"
                          >
                            <Button
                              size="xs"
                              colorScheme='orange'
                              leftIcon={<FaEye />}
                              onClick={() => {
                                // open modal with full unit details
                                setSelectedUnit({
                                  ...unit,
                                  equipmentType: type.equipmentType,
                                  ownerName: type.ownerName,
                                  ratedCapacity: type.ratedCapacity,
                                  ownerType: type.ownerType,
                                });
                                onOpen();
                              }}
                            >
                              Details
                            </Button>
                          </Td>
                        </Tr>
                      ))
                    )}
                  </Tbody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </Box>
        <Box>
        {/* Pagination Controls */}
        <Flex justifyContent="space-between" alignItems="center" mt={4}>
          <PaginationControls
            currentPage={machineUnitsCurrentPage}
            setCurrentPage={setMachineUnitsPage}
            totalPages={machineUnitsTotalPages}
            totalItems={machineUnitsTotalItems}
            colorScheme="orange"
          />
        </Flex>
      </Box>
      </Box>
    </Box>

    {/* Machine Unit Details Modal */}
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setSelectedUnit(null);
        onClose();
      }}
      size="2xl"
      closeOnOverlayClick={false}
      scrollBehavior="inside"
      isCentered
      motionPreset="none"
      blockScrollOnMount={false}
    >
      <ModalOverlay />
      <ModalContent borderRadius="lg" overflow="hidden">
        <ModalHeader
          bg="orange.50"
          borderBottomWidth="1px"
          borderColor="gray.200"
          py={4}
          display="flex"
          alignItems="center"
        >
          <Icon as={FaTractor} mr={2} color="orange.500" />
          Machine Unit Details
        </ModalHeader>
        
        <ModalBody py={6}>
          {!selectedUnit ? (
            <Center py={8}>
              <Spinner size="xl" thickness="4px" color="orange.500" />
            </Center>
          ) : (
            <Stack spacing={4}>
              {/* Basic Information Section */}
              <Box>
                <Heading size="sm" mb={3} color="gray.700">
                  Basic Information
                </Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                  <Box>
                    <Text fontSize="xs" color="gray.500" fontWeight="medium">Unit Number</Text>
                    <Text fontWeight="semibold" fontSize="md">{selectedUnit.unitNumber || "N/A"}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.500" fontWeight="medium">Equipment Type</Text>
                    <Text fontWeight="semibold" fontSize="md">{selectedUnit.equipmentType || "N/A"}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.500" fontWeight="medium">Owner Name</Text>
                    <Text fontWeight="semibold" fontSize="md">{selectedUnit.ownerName || "N/A"}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.500" fontWeight="medium">Owner Type</Text>
                    <Text fontWeight="semibold" fontSize="md">{selectedUnit.ownerType || "N/A"}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.500" fontWeight="medium">Engine Brand</Text>
                    <Text fontWeight="semibold" fontSize="md">{selectedUnit.engineBrand || "N/A"}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.500" fontWeight="medium">Horsepower</Text>
                    <Text fontWeight="semibold" fontSize="md">{selectedUnit.engineHorsepower || "N/A"}</Text>
                  </Box>
                </SimpleGrid>
              </Box>

              <Divider />

              {/* Acquisition Information Section */}
              <Box>
                <Heading size="sm" mb={3} color="gray.700">
                  Acquisition Information
                </Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                  <Box>
                    <Text fontSize="xs" color="gray.500" fontWeight="medium">Mode of Acquisition</Text>
                    <Text fontWeight="semibold" fontSize="md">{selectedUnit.modeOfAcquisition || "N/A"}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.500" fontWeight="medium">Cost of Acquisition</Text>
                    <Text fontWeight="semibold" fontSize="md">{selectedUnit.costOfAcquisition || "N/A"}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.500" fontWeight="medium">Year Acquired</Text>
                    <Text fontWeight="semibold" fontSize="md">{selectedUnit.yearAcquired || "N/A"}</Text>
                  </Box>
                </SimpleGrid>
              </Box>

              <Divider />

              {/* Status & Condition Section */}
              <Box>
                <Heading size="sm" mb={3} color="gray.700">
                  Status & Condition
                </Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                  <Box>
                    <Text fontSize="xs" color="gray.500" fontWeight="medium">Condition</Text>
                    <Tag
                      colorScheme={getConditionColor(selectedUnit.condition)}
                      size="md"
                      mt={1}
                    >
                      {selectedUnit.condition || "N/A"}
                    </Tag>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.500" fontWeight="medium">Status</Text>
                    <Tag
                      colorScheme={getStatusColor(selectedUnit.status)}
                      size="md"
                      mt={1}
                    >
                      {selectedUnit.status || "N/A"}
                    </Tag>
                  </Box>
                  {selectedUnit.remarks && (
                    <Box gridColumn={{ md: "span 2" }}>
                      <Text fontSize="xs" color="gray.500" fontWeight="medium">Remarks</Text>
                      <Text fontWeight="semibold" fontSize="md">{selectedUnit.remarks}</Text>
                    </Box>
                  )}
                </SimpleGrid>
              </Box>

              <Divider />

              {/* Timestamps Section */}
              <Box>
                <Heading size="sm" mb={3} color="gray.700">
                  Record Information
                </Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                  <Box>
                    <Text fontSize="xs" color="gray.500" fontWeight="medium">Registered At</Text>
                    <Text fontWeight="semibold" fontSize="sm">
                      {selectedUnit.createdAt ? new Date(selectedUnit.createdAt).toLocaleString() : "N/A"}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.500" fontWeight="medium">Last Updated</Text>
                    <Text fontWeight="semibold" fontSize="sm">
                      {selectedUnit.updatedAt ? new Date(selectedUnit.updatedAt).toLocaleString() : "N/A"}
                    </Text>
                  </Box>
                </SimpleGrid>
              </Box>

              {/* Status History Section */}
              {selectedUnit.statusHistory && selectedUnit.statusHistory.length > 0 && (
                <>
                  <Divider />
                  <Box>
                    <Heading size="sm" mb={3} color="gray.700">
                      Status History
                    </Heading>
                    <Stack spacing={2}>
                      {selectedUnit.statusHistory.map((h, idx) => (
                        <Box
                          key={idx}
                          borderWidth="1px"
                          borderColor="gray.200"
                          borderRadius="md"
                          p={3}
                          bg="gray.50"
                        >
                          <Flex justify="space-between" align="center" mb={2}>
                            <Box>
                              <Text fontSize="xs" color="gray.500" fontWeight="medium">Status</Text>
                              <Tag
                                colorScheme={getStatusColor(h.status)}
                                size="sm"
                                mt={1}
                              >
                                {h.status}
                              </Tag>
                            </Box>
                            <Box textAlign="right">
                              <Text fontSize="xs" color="gray.500" fontWeight="medium">Changed At</Text>
                              <Text fontWeight="semibold" fontSize="sm">
                                {h.changedAt ? new Date(h.changedAt).toLocaleString() : "N/A"}
                              </Text>
                            </Box>
                          </Flex>
                          {h.reason && (
                            <Box mt={2} pt={2} borderTopWidth="1px" borderColor="gray.200">
                              <Text fontSize="xs" color="gray.500" fontWeight="medium">Reason</Text>
                              <Text fontSize="sm" mt={1}>{h.reason}</Text>
                            </Box>
                          )}
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                </>
              )}
            </Stack>
          )}
        </ModalBody>
        
        <ModalFooter
          bg="gray.50"
          borderTopWidth="1px"
          borderColor="gray.200"
          py={4}
        >

          <Button
            variant="outline"
            onClick={() => {
              setSelectedUnit(null);
              onClose();
            }}
            size="md"
            _hover={{ bg: "gray.100" }}
          >
            Close
          </Button>

          <Button
            colorScheme="orange"
            onClick={() => {
              setStatusUpdateData({
                status: selectedUnit?.status || '',
                condition: selectedUnit?.condition || '',
                reason: '',
              });
              onOpenUpdateStatus();
            }}
            size="md"
            ml={3}
          >
            Update Status
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>

    {/* Update Status Modal */}
    <Modal
      isOpen={isOpenUpdateStatus}
      onClose={() => {
        setStatusUpdateData({ status: '', condition: '', reason: '' });
        onCloseUpdateStatus();
      }}
      size="md"
      closeOnOverlayClick={false}
      isCentered
      motionPreset="none"
      blockScrollOnMount={false}
      scrollBehavior="inside"
    >
      <ModalOverlay />
      <ModalContent borderRadius="lg" overflow="hidden">
        <ModalHeader
          bg="orange.50"
          borderBottomWidth="1px"
          borderColor="gray.200"
          py={4}
          display="flex"
          alignItems="center"
        >
          <Icon as={FaTools} mr={2} color="orange.500" />
          Update Machine Status
        </ModalHeader>
        
        <ModalBody py={6}>
          <Stack spacing={4}>
            {/* Unit Info */}
            <Box
              p={3}
              bg="gray.50"
              borderRadius="md"
              borderWidth="1px"
              borderColor="gray.200"
            >
              <Text fontSize="xs" color="gray.500" fontWeight="medium">Unit Number</Text>
              <Text fontWeight="bold" fontSize="lg">{selectedUnit?.unitNumber || "N/A"}</Text>
              <Text fontSize="sm" color="gray.600" mt={1}>
                {selectedUnit?.equipmentType || "N/A"}
              </Text>
            </Box>

            {/* Current Status Display */}
            <Box>
              <Text fontSize="xs" color="gray.500" fontWeight="medium" mb={2}>Current Status</Text>
              <Flex gap={2}>
                <Tag
                  colorScheme={getStatusColor(selectedUnit?.status)}
                  size="md"
                >
                  {selectedUnit?.status || "N/A"}
                </Tag>
                <Tag
                  colorScheme={getConditionColor(selectedUnit?.condition)}
                  size="md"
                >
                  {selectedUnit?.condition || "N/A"}
                </Tag>
              </Flex>
            </Box>

            <Divider />

            {/* Status Dropdown */}
            <FormControl isRequired>
              <Text fontSize="sm" fontWeight="medium" mb={2}>
                New Status
              </Text>
              <Select
                placeholder="Select status"
                value={statusUpdateData.status}
                onChange={(e) => setStatusUpdateData({ ...statusUpdateData, status: e.target.value })}
                bg="white"
              >
                <option value="Available">Available</option>
                <option value="In Use">In Use</option>
                <option value="Under Repair">Under Repair</option>
                <option value="Retired">Retired</option>
                <option value="Not for Use">Not for Use</option>
              </Select>
            </FormControl>

            {/* Condition Dropdown */}
            <FormControl isRequired>
              <Text fontSize="sm" fontWeight="medium" mb={2}>
                Condition
              </Text>
              <Select
                placeholder="Select condition"
                value={statusUpdateData.condition}
                onChange={(e) => setStatusUpdateData({ ...statusUpdateData, condition: e.target.value })}
                bg="white"
              >
                <option value="Functional">Functional</option>
                <option value="Non-Functional">Non-Functional</option>
              </Select>
            </FormControl>

            {/* Reason Textarea */}
            <FormControl isRequired>
              <Text fontSize="sm" fontWeight="medium" mb={2}>
                Reason for Change
              </Text>
              <Input
                as="textarea"
                placeholder="Enter reason for status change..."
                value={statusUpdateData.reason}
                onChange={(e) => setStatusUpdateData({ ...statusUpdateData, reason: e.target.value })}
                bg="white"
                minH="100px"
                resize="vertical"
              />
              <Text fontSize="xs" color="gray.500" mt={1}>
                Provide a brief explanation for this status change
              </Text>
            </FormControl>

            {/* Warning for Retired status */}
            {statusUpdateData.status === 'Retired' && (
              <Alert status="warning" borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle fontSize="sm">Retiring Machine</AlertTitle>
                  <AlertDescription fontSize="xs">
                    This will mark the machine as retired and it will no longer be available for assignments.
                  </AlertDescription>
                </Box>
              </Alert>
            )}
          </Stack>
        </ModalBody>
        
        <ModalFooter
          bg="gray.50"
          borderTopWidth="1px"
          borderColor="gray.200"
          py={4}
          gap={2}
        >
          <Button
            variant="outline"
            onClick={() => {
              setStatusUpdateData({ status: '', condition: '', reason: '' });
              onCloseUpdateStatus();
            }}
            size="md"
            _hover={{ bg: "gray.100" }}
          >
            Cancel
          </Button>
          <Button
            colorScheme="orange"
            onClick={handleUpdateStatus}
            size="md"
            isLoading={isUpdatingMachineryUnitStatus}
            isDisabled={
              !statusUpdateData.status || 
              !statusUpdateData.condition || 
              !statusUpdateData.reason.trim() ||
              isUpdatingMachineryUnitStatus
            }
          >
            Update Status
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>

    {/* Register Machine Modal */}
    <Modal
      isOpen={isOpenRegister}
      onClose={() => {
        resetMachineTypeForm();
        resetMachineUnitForm();
        setActiveTab(0);
        onCloseRegister();
      }}
      size="3xl"
      closeOnOverlayClick={false}
      scrollBehavior="inside"
      isCentered
      motionPreset="none"
      blockScrollOnMount={false}
    >
      <ModalOverlay />
      <ModalContent borderRadius="lg" overflow="hidden">
        <ModalHeader
          bg="orange.50"
          borderBottomWidth="1px"
          borderColor="gray.200"
          py={4}
          display="flex"
          alignItems="center"
        >
          <Icon as={FaPlus} mr={2} color="orange.500" />
          Register Machine
        </ModalHeader>
        
        <ModalBody py={6}>
          <Tabs
            index={activeTab}
            onChange={(index) => setActiveTab(index)}
            colorScheme="orange"
            variant="enclosed"
          >
            <TabList>
              <Tab>Create Machine Type</Tab>
              <Tab>Add Machine Unit</Tab>
            </TabList>

            <TabPanels>
              {/* Create Machine Type Tab */}
              <TabPanel px={0} pt={6}>
                <Stack spacing={4}>
                  <Alert status="info" borderRadius="md" variant="left-accent">
                    <AlertIcon />
                    <Box>
                      <AlertTitle fontSize="sm">Create Machine Type First</AlertTitle>
                      <AlertDescription fontSize="xs">
                        Before adding machine units, you need to create a machine type (e.g., Tractor, Harvester).
                      </AlertDescription>
                    </Box>
                  </Alert>

                  <Alert status="warning" borderRadius="md" variant="left-accent">
                    <AlertIcon />
                    <Box>
                      <AlertTitle fontSize="sm">Fields Won't Be Editable After</AlertTitle>
                      <AlertDescription fontSize="xs">
                        After finishing, fields cannot be changed later. It would require administrative intervention to modify. Please double-check your entries.
                      </AlertDescription>
                    </Box>
                  </Alert>

                  {/* Equipment Type */}
                  <FormControl isRequired>
                    <FormLabel fontSize="sm" fontWeight="medium">
                      Equipment Type
                    </FormLabel>
                    <Input
                      placeholder="e.g., Tractor, Harvester, Cultivator"
                      value={machineTypeData.equipmentType}
                      onChange={(e) => setMachineTypeData({ ...machineTypeData, equipmentType: e.target.value })}
                      bg="white"
                    />
                  </FormControl>

                  {/* Owner Name */}
                  <FormControl isRequired>
                    <FormLabel fontSize="sm" fontWeight="medium">
                      Owner Name
                    </FormLabel>
                    <Input
                      placeholder="e.g., DAR, Municipality, Office Name"
                      value={machineTypeData.ownerName}
                      onChange={(e) => setMachineTypeData({ ...machineTypeData, ownerName: e.target.value })}
                      bg="white"
                    />
                  </FormControl>

                  {/* Owner Type */}
                  <FormControl isRequired>
                    <FormLabel fontSize="sm" fontWeight="medium">
                      Owner Type
                    </FormLabel>
                    <RadioGroup
                      value={machineTypeData.ownerType}
                      onChange={(value) => setMachineTypeData({ ...machineTypeData, ownerType: value })}
                    >
                      <Stack direction="row" spacing={4}>
                        <Radio value="Government">Government</Radio>
                      </Stack>
                    </RadioGroup>
                  </FormControl>

                  {/* Rated Capacity */}
                  <FormControl isRequired>
                    <FormLabel fontSize="sm" fontWeight="medium">
                      Rated Capacity
                    </FormLabel>
                    <Input
                      placeholder="e.g., 50 HP, 100 HP"
                      value={machineTypeData.ratedCapacity}
                      onChange={(e) => setMachineTypeData({ ...machineTypeData, ratedCapacity: e.target.value })}
                      bg="white"
                    />
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      Enter the capacity or power rating of the equipment
                    </Text>
                  </FormControl>
                </Stack>
              </TabPanel>

              {/* Add Machine Unit Tab */}
              <TabPanel px={0} pt={6}>
                <Stack spacing={4}>
                  <Alert status="info" borderRadius="md" variant="left-accent">
                    <AlertIcon />
                    <Box>
                      <AlertTitle fontSize="sm">Add Machine Unit</AlertTitle>
                      <AlertDescription fontSize="xs">
                        Add individual machine units to an existing machine type.
                      </AlertDescription>
                    </Box>
                  </Alert>

                  <Alert status="warning" borderRadius="md" variant="left-accent">
                    <AlertIcon />
                    <Box>
                      <AlertTitle fontSize="sm">Fields Won't Be Editable After</AlertTitle>
                      <AlertDescription fontSize="xs">
                        After finishing, fields cannot be changed later. It would require administrative intervention to modify. Please double-check your entries.
                      </AlertDescription>
                    </Box>
                  </Alert>

                  {/* Machine Type Selection */}
                  <FormControl isRequired>
                    <FormLabel fontSize="sm" fontWeight="medium">
                      Machine Type
                    </FormLabel>
                    <Select
                      placeholder="Select machine type"
                      value={machineUnitData.machineryTypeId}
                      onChange={(e) => setMachineUnitData({ ...machineUnitData, machineryTypeId: e.target.value })}
                      bg="white"
                    >
                      {isLoadingMachineTypes ? (
                        <option disabled>Loading...</option>
                      ) : machineTypes?.data?.map((type) => (
                        <option key={type._id} value={type._id}>
                          {type.equipmentType} - {type.ownerName}
                        </option>
                      ))}
                    </Select>
                  </FormControl>

                  <Divider />

                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    {/* Unit Number */}
                    <FormControl isRequired>
                      <FormLabel fontSize="sm" fontWeight="medium">
                        Unit Number
                      </FormLabel>
                      <Input
                        placeholder="e.g., 1"
                        value={machineUnitData.unitNumber}
                        onChange={(e) => setMachineUnitData({ ...machineUnitData, unitNumber: e.target.value })}
                        bg="white"
                      />
                    </FormControl>

                    {/* Engine Brand */}
                    <FormControl>
                      <FormLabel fontSize="sm" fontWeight="medium">
                        Engine Brand
                      </FormLabel>
                      <Input
                        placeholder="e.g., Kubota, Yanmar"
                        value={machineUnitData.engineBrand}
                        onChange={(e) => setMachineUnitData({ ...machineUnitData, engineBrand: e.target.value })}
                        bg="white"
                      />
                    </FormControl>

                    {/* Engine Horsepower */}
                    <FormControl>
                      <FormLabel fontSize="sm" fontWeight="medium">
                        Engine Horsepower
                      </FormLabel>
                      <Input
                        placeholder="e.g., 50hp"
                        value={machineUnitData.engineHorsepower}
                        onChange={(e) => setMachineUnitData({ ...machineUnitData, engineHorsepower: e.target.value })}
                        min={0}
                        bg="white"
                      />
                    </FormControl>

                    {/* Year Acquired */}
                    <FormControl>
                      <FormLabel fontSize="sm" fontWeight="medium">
                        Year Acquired
                      </FormLabel>
                      <Input
                        type="number"
                        placeholder="e.g., 2023"
                        value={machineUnitData.yearAcquired}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Only allow up to 4 digits
                          if (value.length <= 4) {
                            setMachineUnitData({ ...machineUnitData, yearAcquired: value });
                          }
                        }}
                        onWheel={(e) => e.target.blur()}
                        min={1900}
                        max={new Date().getFullYear()}
                        maxLength={4}
                        bg="white"
                       
                      />
                    </FormControl>
                  </SimpleGrid>

                  <Divider />

                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    {/* Mode of Acquisition */}
                    <FormControl>
                      <FormLabel fontSize="sm" fontWeight="medium">
                        Mode of Acquisition
                      </FormLabel>
                      <Select
                        placeholder="Select mode"
                        value={machineUnitData.modeOfAcquisition}
                        onChange={(e) => setMachineUnitData({ ...machineUnitData, modeOfAcquisition: e.target.value })}
                        bg="white"
                      >
                        <option value="Grant">Grant</option>
                        <option value="Loan">Loan</option>
                        <option value="Cash">Cash</option>
                        <option value="Counterpart">Counterpart</option>
                        <option value="Others">Others</option>
                      </Select>
                    </FormControl>

                    {/* Specify Other Mode - Fixed */}
                    {machineUnitData.modeOfAcquisition === 'Others' && (
                      <FormControl isRequired>
                        <FormLabel fontSize="sm" fontWeight="medium">
                          Specify Other Mode
                        </FormLabel>
                        <Input
                          placeholder="Specify other mode"
                          value={machineUnitData.otherModeOfAcquisition}
                          onChange={(e) => setMachineUnitData({ ...machineUnitData, otherModeOfAcquisition: e.target.value })}
                          bg="white"
                        />
                      </FormControl>
                    )}

                    {/* Cost of Acquisition */}
                    <FormControl>
                      <FormLabel fontSize="sm" fontWeight="medium">
                        Cost of Acquisition
                      </FormLabel>
                      <Input
                        type="number"
                        placeholder="e.g., 500000"
                        value={machineUnitData.costOfAcquisition}
                        onChange={(e) => setMachineUnitData({ ...machineUnitData, costOfAcquisition: e.target.value })}
                        min={0}
                        bg="white"
                      />
                    </FormControl>
                  </SimpleGrid>
                </Stack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>
        
        <ModalFooter
          bg="gray.50"
          borderTopWidth="1px"
          borderColor="gray.200"
          py={4}
          gap={2}
        >
          <Button
            variant="outline"
            onClick={() => {
              resetMachineTypeForm();
              resetMachineUnitForm();
              setActiveTab(0);
              onCloseRegister();
            }}
            size="md"
            _hover={{ bg: "gray.100" }}
          >
            Cancel
          </Button>
          
          {activeTab === 0 ? (
            <Button
              colorScheme="orange"
              onClick={handleCreateMachineType}
              size="md"
              isLoading={isCreatingMachineryType}
              isDisabled={
                !machineTypeData.equipmentType ||
                !machineTypeData.ownerName ||
                !machineTypeData.ownerType ||
                !machineTypeData.ratedCapacity ||
                isCreatingMachineryType
              }
              leftIcon={<FaPlus />}
            >
              Create Machine Type
            </Button>
          ) : (
            <Button
              colorScheme="orange"
              onClick={handleAddMachineUnit}
              size="md"
              isLoading={isCreatingMachineryUnit}
              isDisabled={
                !machineUnitData.machineryTypeId ||
                !machineUnitData.unitNumber ||
                isCreatingMachineryUnit
              }
              leftIcon={<FaPlus />}
            >
              Add Machine Unit
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
    </>
  );
}

export default B_MachineInventory;
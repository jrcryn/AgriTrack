import React, { useState, useEffect, useMemo } from "react";
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
  RadioGroup,
  Radio,
  Checkbox,
  Textarea,
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
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { FaListCheck } from "react-icons/fa6";
import { FaStickyNote } from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL;


const B_MachineInventory = () => {
  const [selectedYear] = useState(new Date().getFullYear());
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [machineUnitsPage, setMachineUnitsPage] = useState(1);
  const [previousCountsPage, setPreviousCountsPage] = useState(1);

  // Modal disclosures - declared early to be used in useEffect
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isOpenUpdateStatus, onOpen: onOpenUpdateStatus, onClose: onCloseUpdateStatus } = useDisclosure();
  const { isOpen: isOpenRegister, onOpen: onOpenRegister, onClose: onCloseRegister } = useDisclosure();
  const { isOpen: isOpenCountCheck, onOpen: onOpenCountCheck, onClose: onCloseCountCheck } = useDisclosure();
  const { isOpen: isOpenPreviousCounts, onOpen: onOpenPreviousCounts, onClose: onClosePreviousCounts } = useDisclosure();
  const { isOpen: isOpenResolveDiscrepancy, onOpen: onOpenResolveDiscrepancy, onClose: onCloseResolveDiscrepancy } = useDisclosure();

  // Other state declarations
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [statusUpdateData, setStatusUpdateData] = useState({
    status: '',
    condition: '',
    reason: '',
  });
  const [activeTab, setActiveTab] = useState(0);
  const [selectedMachineUnits, setSelectedMachineUnits] = useState(new Set());
  const [countRemarks, setCountRemarks] = useState("");
  const [selectedPhysicalCountingRecord, setSelectedPhysicalCountingRecord] = useState(null);
  const [resolveRemarks, setResolveRemarks] = useState("");
  const [machineTypeData, setMachineTypeData] = useState({
    equipmentType: '',
    ownerName: '',
    ownerType: '',
    ratedCapacity: '',
  });
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

  // Hooks
  const toast = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const role = user?.role?.toString();

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

    machineTypeUnitCounts,
    isLoadingMachineTypeUnitCounts,
    machineTypeUnitCountsError,

    createMachineryType,
    isCreatingMachineryType,
    createMachineryUnit,
    isCreatingMachineryUnit,
    performMachineCountCheck,
    isPerformingMachineCountCheck,

    machineUnitsForPhysicalCounting,
    isLoadingMachineUnitsForPhysicalCounting,
    machineUnitsForPhysicalCountingError,

    physicalCountingRecords,
    isLoadingPhysicalCountingRecords,
    physicalCountingRecordsError,

    resolveDiscrepancyInPhysicalCount,
    isResolvingDiscrepancyInPhysicalCount
  } = useAdminDashboard({ machineUnitsPage, previousCountsPage }, { searchQuery });

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

  // Check if there are any unresolved discrepancies
  const hasUnresolvedDiscrepancy = useMemo(() => {
    if (!physicalCountingRecords?.data?.physicalCountingRecords) return false;
    return physicalCountingRecords.data.physicalCountingRecords.some(
      (record) => record.discrepancyFound === 'Discrepancy Found'
    );
  }, [physicalCountingRecords]);

  // Reset to page 1 when search query changes
  useEffect(() => {
    setMachineUnitsPage(1);
  }, [searchQuery]);

  // Reset previous counts page when modal closes
  useEffect(() => {
    if (!isOpenPreviousCounts) {
      setPreviousCountsPage(1);
    }
  }, [isOpenPreviousCounts]);

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

  // Get all machine units for count check from the dedicated query
  const getAllMachineUnitsForCount = () => {
    if (!machineUnitsForPhysicalCounting?.data?.machineTypesWithUnits) return [];
    
    const allUnits = [];
    machineUnitsForPhysicalCounting.data.machineTypesWithUnits.forEach((type) => {
      type.machineUnits?.forEach((unit) => {
        allUnits.push({
          ...unit,
          equipmentType: type.equipmentType,
          ownerName: type.ownerName,
        });
      });
    });
    return allUnits;
  };

  const allMachineUnitsForCount = getAllMachineUnitsForCount();

  // Handle machine unit checkbox change
  const handleMachineUnitToggle = (unitId) => {
    const newSelected = new Set(selectedMachineUnits);
    if (newSelected.has(unitId)) {
      newSelected.delete(unitId);
    } else {
      newSelected.add(unitId);
    }
    setSelectedMachineUnits(newSelected);
  };

  // Handle select all / deselect all
  const handleSelectAll = () => {
    if (selectedMachineUnits.size === allMachineUnitsForCount.length) {
      setSelectedMachineUnits(new Set());
    } else {
      const allIds = new Set(allMachineUnitsForCount.map(unit => unit._id.toString()));
      setSelectedMachineUnits(allIds);
    }
  };

  // Handle machine count check submission
  const handleSubmitMachineCount = async () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "User information not found",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const machineUnitIds = Array.from(selectedMachineUnits);
      
      const result = await performMachineCountCheck({
        machineUnitIds,
        employeeId: user.id,
        remarks: countRemarks.trim() || '',
      });

      toast({
        title: "Success",
        description: result.message || "Machine count check completed successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      // Reset form and close modal
      setSelectedMachineUnits(new Set());
      setCountRemarks("");
      onCloseCountCheck();

      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ['machineUnits'] });
      await queryClient.invalidateQueries({ queryKey: ['machineOverview'] });

    } catch (error) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || error?.message || "Failed to perform machine count check",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Handle resolve discrepancy in physical count
  const handleResolveDiscrepancy = async () => {
    if (!selectedPhysicalCountingRecord?._id) {
      toast({
        title: "Error",
        description: "Physical counting record not found",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const result = await resolveDiscrepancyInPhysicalCount({
        physicalCountingId: selectedPhysicalCountingRecord._id,
        resolveRemarks: resolveRemarks.trim() || '',
      });

      toast({
        title: "Success",
        description: result.message || "Discrepancy resolved successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      // Reset form and close modal
      setSelectedPhysicalCountingRecord(null);
      setResolveRemarks("");
      onCloseResolveDiscrepancy();

      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ['physicalCountingRecords'] });
      await queryClient.invalidateQueries({ queryKey: ['machineUnits'] });
      await queryClient.invalidateQueries({ queryKey: ['machineOverview'] });

    } catch (error) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || error?.message || "Failed to resolve discrepancy",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

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

  // Get units per machine type from API
  const unitsPerMachineType = machineTypeUnitCounts?.data || [];

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
      <HStack spacing={2}>
        <Button
          size="sm"
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          isDisabled={currentPage === 1}
          colorScheme={colorScheme}
          variant="outline"
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
      </HStack>
    </Flex>
  );

  const ButtonWithNotification = ({ children, showNotification, dotColor }) => {
    return (
      <Box position="relative" display="inline-block">
        {children}
        {showNotification && (
          <Box
            position="absolute"
            top="-5px"
            right="-5px"
            width="12px"
            height="12px"
            bg={dotColor}
            borderRadius="full"
            boxShadow="0 0 0 2px white"
            zIndex={1}
          />
        )}
      </Box>
    );
  };

  return (
    <>
    <Box overflow="hidden" bg="white" p={{ base: 3, md: 5 }} minH="100vh">
      <Heading 
        as="h1" 
        size={{ base: "lg", md: "xl" }} 
        mb={2} 
        color="black"
      >
        Machinery Inventory
      </Heading>
      <Text 
        color="gray.600" 
        mb={{ base: 4, md: 5 }}
        fontSize={{ base: "sm", md: "md" }}
      >
        Overview of agricultural machinery assets and their operational status.
      </Text>

      {/* BUtton Section */}
      <Flex
        direction={{ base: 'column', md: 'row' }}
        alignItems="center"
        mb={6}
        gap={4}
        p={3}
        bg="blue.50"
        borderRadius="md"
        boxShadow="sm"
      >
        <Button 
          colorScheme="blue" 
          alignSelf={{ base: 'stretch', md: 'flex-end' }}
          size={'sm'}
          leftIcon={<FaListCheck />}
          onClick={onOpenCountCheck}
        >
          Count Machines
        </Button>
        <ButtonWithNotification 
          showNotification={hasUnresolvedDiscrepancy}
          dotColor="red.500"
        >
          <Button 
            colorScheme="orange" 
            alignSelf={{ base: 'stretch', md: 'flex-end' }}
            size={'sm'}
            leftIcon={<FaStickyNote />}
            onClick={onOpenPreviousCounts}
          >
            Previous Machine Counts
          </Button>
        </ButtonWithNotification>
      </Flex>

      {/* Inventory Data Cards */}
      <Box mb={8}>
        <Flex
          justify="space-between"
          align="center"
          mb={4}
          bg="blue.50"
          p={{ base: 2, md: 3 }}
          borderRadius="md"
          borderLeftWidth="4px"
          borderLeftColor="blue.500"
        >
          <Heading 
            as="h2" 
            size={{ base: "sm", md: "md" }} 
            display="flex" 
            alignItems="center"
            flexWrap="wrap"
          >
            <Icon as={FaTractor} mr={2} color="blue.600" /> MACHINE OVERVIEW
          </Heading>
        </Flex>

        {/* Error Alert for Machine Overview */}
        {machineOverviewError && (
          <Alert status="error" mb={4} borderRadius="md">
            <AlertIcon />
            <Box>
              <AlertTitle fontSize={{ base: "sm", md: "md" }}>Error loading machine overview</AlertTitle>
              <AlertDescription fontSize={{ base: "xs", md: "sm" }}>
                {machineOverviewError?.response?.data?.message ||
                  machineOverviewError?.message ||
                  "An error occurred while fetching machine overview."}
              </AlertDescription>
            </Box>
          </Alert>
        )}

        <SimpleGrid 
          columns={{ base: 1, sm: 2, lg: 4 }} 
          spacing={{ base: 3, md: 4 }} 
          w="full"
        >
          {/* Total Machines */}
          <Box
            p={{ base: 4, md: 5 }}
            borderRadius="md"
            boxShadow="sm"
            bg="white"
            borderWidth="1px"
            borderColor="gray.200"
            transition="all 0.2s"
          >
            <Stat>
              <StatLabel 
                fontSize={{ base: "sm", md: "md" }} 
                display="flex" 
                alignItems="center"
                mb={{ base: 2, md: 3 }}
              >
                <Icon as={FaTractor} mr={2} color="blue.500" /> 
                <Text as="span" noOfLines={1}>Total Machines</Text>
              </StatLabel>
              {isLoadingMachineOverview ? (
                <Center h={{ base: "50px", md: "65px" }}>
                  <Spinner size={{ base: "md", md: "lg" }} thickness="3px" color="blue.500" />
                </Center>
              ) : (
                <StatNumber 
                  fontSize={{ base: "2xl", sm: "3xl", md: "4xl" }}
                  lineHeight="shorter"
                >
                  {stats.totalMachines}
                </StatNumber>
              )}
              <StatHelpText fontSize={{ base: "xs", md: "sm" }} mt={{ base: 1, md: 2 }}>
                {selectedYear}
              </StatHelpText>
            </Stat>
          </Box>

          {/* Functional Machines */}
          <Box
            p={{ base: 4, md: 5 }}
            borderRadius="md"
            boxShadow="sm"
            bg="white"
            borderWidth="1px"
            borderColor="gray.200"
            transition="all 0.2s"
          >
            <Stat>
              <StatLabel 
                fontSize={{ base: "sm", md: "md" }} 
                display="flex" 
                alignItems="center"
                mb={{ base: 2, md: 3 }}
              >
                <Icon as={FaCheckCircle} mr={2} color="green.500" /> 
                <Text as="span" noOfLines={1}>Functional</Text>
              </StatLabel>
              {isLoadingMachineOverview ? (
                <Center h={{ base: "50px", md: "65px" }}>
                  <Spinner size={{ base: "md", md: "lg" }} thickness="3px" color="green.500" />
                </Center>
              ) : (
                <StatNumber 
                  fontSize={{ base: "2xl", sm: "3xl", md: "4xl" }}
                  lineHeight="shorter"
                >
                  {stats.functional}
                </StatNumber>
              )}
              <StatHelpText fontSize={{ base: "xs", md: "sm" }} mt={{ base: 1, md: 2 }}>
                In good condition
              </StatHelpText>
            </Stat>
          </Box>

          {/* Under Repair */}
          <Box
            p={{ base: 4, md: 5 }}
            borderRadius="md"
            boxShadow="sm"
            bg="white"
            borderWidth="1px"
            borderColor="gray.200"
            transition="all 0.2s"
          >
            <Stat>
              <StatLabel 
                fontSize={{ base: "sm", md: "md" }} 
                display="flex" 
                alignItems="center"
                mb={{ base: 2, md: 3 }}
              >
                <Icon as={FaExclamationTriangle} mr={2} color="orange.500" /> 
                <Text as="span" noOfLines={1}>Under Repair</Text>
              </StatLabel>
              {isLoadingMachineOverview ? (
                <Center h={{ base: "50px", md: "65px" }}>
                  <Spinner size={{ base: "md", md: "lg" }} thickness="3px" color="orange.500" />
                </Center>
              ) : (
                <StatNumber 
                  fontSize={{ base: "2xl", sm: "3xl", md: "4xl" }}
                  lineHeight="shorter"
                >
                  {stats.underRepair}
                </StatNumber>
              )}
              <StatHelpText fontSize={{ base: "xs", md: "sm" }} mt={{ base: 1, md: 2 }}>
                Maintenance ongoing
              </StatHelpText>
            </Stat>
          </Box>

          {/* Retired Machines */}
          <Box
            p={{ base: 4, md: 5 }}
            borderRadius="md"
            boxShadow="sm"
            bg="white"
            borderWidth="1px"
            borderColor="gray.200"
            transition="all 0.2s"
          >
            <Stat>
              <StatLabel 
                fontSize={{ base: "sm", md: "md" }} 
                display="flex" 
                alignItems="center"
                mb={{ base: 2, md: 3 }}
              >
                <Icon as={FaTools} mr={2} color="gray.500" /> 
                <Text as="span" noOfLines={1}>Retired</Text>
              </StatLabel>
              {isLoadingMachineOverview ? (
                <Center h={{ base: "50px", md: "65px" }}>
                  <Spinner size={{ base: "md", md: "lg" }} thickness="3px" color="gray.500" />
                </Center>
              ) : (
                <StatNumber 
                  fontSize={{ base: "2xl", sm: "3xl", md: "4xl" }}
                  lineHeight="shorter"
                >
                  {stats.retired}
                </StatNumber>
              )}
              <StatHelpText fontSize={{ base: "xs", md: "sm" }} mt={{ base: 1, md: 2 }}>
                Out of service
              </StatHelpText>
            </Stat>
          </Box>
        </SimpleGrid>

        {/* Machine Units Per Type Cards */}
        {machineTypeUnitCountsError && (
          <Alert status="error" mt={4} borderRadius="md">
            <AlertIcon />
            <Box>
              <AlertTitle fontSize={{ base: "sm", md: "md" }}>Error loading machine type unit counts</AlertTitle>
              <AlertDescription fontSize={{ base: "xs", md: "sm" }}>
                {machineTypeUnitCountsError?.response?.data?.message ||
                  machineTypeUnitCountsError?.message ||
                  "An error occurred while fetching machine type unit counts."}
              </AlertDescription>
            </Box>
          </Alert>
        )}
        
        {isLoadingMachineTypeUnitCounts ? (
          <Center mt={4} py={8}>
            <Spinner size="md" thickness="3px" color="purple.500" />
          </Center>
        ) : unitsPerMachineType.length > 0 ? (
          <SimpleGrid 
            columns={{ base: 2, sm: 3, md: 4, lg: 5, xl: 6 }} 
            spacing={{ base: 2, md: 3 }} 
            w="full"
            mt={4}
          >
            {unitsPerMachineType.map((type, index) => (
              <Tooltip
                key={type._id || index}
                label={type.equipmentType || 'N/A'}
                placement="top"
                hasArrow
              >
                <Box
                  p={{ base: 2, md: 3 }}
                  borderRadius="md"
                  boxShadow="sm"
                  bg="white"
                  borderWidth="1px"
                  borderColor="gray.200"
                >
                  <Stat>
                    <StatLabel 
                      fontSize={{ base: "xs", md: "sm" }} 
                      display="flex" 
                      alignItems="center"
                      mb={{ base: 1, md: 2 }}
                    >
                      <Icon as={FaTractor} mr={1} color="purple.500" boxSize={{ base: 3, md: 4 }} /> 
                      <Text as="span" noOfLines={1} fontSize={{ base: "xs", md: "sm" }}>
                        {type.equipmentType || 'N/A'}
                      </Text>
                    </StatLabel>
                    <StatNumber 
                      fontSize={{ base: "lg", sm: "xl", md: "2xl" }}
                      lineHeight="shorter"
                    >
                      {type.unitCount || 0}
                    </StatNumber>
                  </Stat>
                </Box>
              </Tooltip>
            ))}
          </SimpleGrid>
        ) : null}
      </Box>
      
      {/* Search / Filters Bar (adapted from provided snippet) */}
      <Box 
        mb={6}
        p={{ base: 3, md: 4 }}
        bg="orange.50"
        borderRadius="md"
        boxShadow="sm"
      >
        <Flex 
          direction={{ base: "column", lg: "row" }} 
          gap={{ base: 3, md: 4 }}
          align={{ base: "stretch", lg: "flex-end" }}
        >
          {/* General Search */}
          <Box flex={{ base: "1", lg: "2" }} minW={0}>
            <HStack spacing={2} mb={2} justifyContent="flex-start" flexWrap="wrap">
              <Icon as={FaSearch} color="orange.500" boxSize={{ base: 3, md: 4 }} />
              <Text fontWeight="medium" fontSize={{ base: "xs", md: "sm" }}>
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
                fontSize={{ base: "sm", md: "md" }}
                size={{ base: "sm", md: "md" }}
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
              size={{ base: "sm", md: "md" }}
              height={{ base: "36px", md: "40px" }}
              fontSize={{ base: "sm", md: "md" }}
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
          {role === 'MIM' && (
            <Button
              colorScheme="orange"
              size={{ base: "sm", md: "md" }}
              height={{ base: "36px", md: "40px" }}
              width={{ base: "100%", lg: "auto" }}
              flexShrink={0}
              onClick={onOpenRegister}
              leftIcon={<FaPlus />}
              fontSize={{ base: "sm", md: "md" }}
            >
              Register Machine
            </Button>
          )}

        </Flex>
      </Box>

      {/* Machine Units Table */}
      <Box mb={4}>
        <Flex
          justify="space-between"
          align="center"
          mb={4}
          bg="orange.50"
          p={{ base: 2, md: 3 }}
          borderRadius="md"
          borderLeftWidth="4px"
          borderLeftColor="orange.500"
        >
          <Heading 
            as="h2" 
            size={{ base: "sm", md: "md" }} 
            display="flex" 
            alignItems="center"
            flexWrap="wrap"
          >
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
                <Table variant="simple" size="md">
                  <Thead bg="gray.50">
                    <Tr>
                      <Th textAlign={'center'}>Unit Number</Th>
                      <Th display={{ base: "none", sm: "table-cell" }}>
                        Equipment Type
                      </Th>
                      <Th display={{ base: "none", md: "table-cell" }}>
                        Owner
                      </Th>
                      <Th display={{ base: "none", lg: "table-cell" }}>
                        Engine Brand
                      </Th>
                      <Th display={{ base: "none", lg: "table-cell" }}>
                        Horsepower
                      </Th>
                      <Th>Status</Th>
                      <Th display={{ base: "none", sm: "table-cell" }}>
                        Condition
                      </Th>
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
                        <Tr key={unit._id} fontSize="sm">
                          <Td fontWeight="semibold" textAlign={'center'}>
                            {unit.unitNumber}
                          </Td>
                          <Td display={{ base: "none", sm: "table-cell" }}>
                            {type.equipmentType}
                          </Td>
                          <Td display={{ base: "none", md: "table-cell" }}>
                            {type.ownerName}
                          </Td>
                          <Td display={{ base: "none", lg: "table-cell" }}>
                            {unit.engineBrand || "N/A"}
                          </Td>
                          <Td display={{ base: "none", lg: "table-cell" }}>
                            {unit.engineHorsepower}
                          </Td>
                          <Td>
                            <Tag
                              colorScheme={getStatusColor(unit.status)}
                              size="sm"
                            >
                              {unit.status}
                            </Tag>
                          </Td>
                          <Td display={{ base: "none", sm: "table-cell" }}>
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
                    {machineTypesError ? (
                      <Alert status="error" borderRadius="md" mb={2}>
                        <AlertIcon />
                        <AlertDescription fontSize="xs">
                          {machineTypesError?.response?.data?.message ||
                            machineTypesError?.message ||
                            "Failed to load machine types"}
                        </AlertDescription>
                      </Alert>
                    ) : null}
                    <Select
                      placeholder={isLoadingMachineTypes ? "Loading machine types..." : "Select machine type"}
                      value={machineUnitData.machineryTypeId}
                      onChange={(e) => setMachineUnitData({ ...machineUnitData, machineryTypeId: e.target.value })}
                      bg="white"
                      isDisabled={isLoadingMachineTypes || !!machineTypesError}
                    >
                      {isLoadingMachineTypes ? (
                        <option disabled>Loading...</option>
                      ) : machineTypesError ? (
                        <option disabled>Error loading machine types</option>
                      ) : machineTypes?.data?.length > 0 ? (
                        machineTypes.data.map((type) => (
                          <option key={type._id} value={type._id}>
                            {type.equipmentType} - {type.ownerName}
                          </option>
                        ))
                      ) : (
                        <option disabled>No machine types available</option>
                      )}
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

    {/* Machine Count Check Modal */}
    <Modal
      isOpen={isOpenCountCheck}
      onClose={() => {
        setSelectedMachineUnits(new Set());
        setCountRemarks("");
        onCloseCountCheck();
      }}
      size="4xl"
      closeOnOverlayClick={false}
      scrollBehavior="inside"
      isCentered
      motionPreset="none"
      blockScrollOnMount={false}
    >
      <ModalOverlay />
      <ModalContent borderRadius="lg" overflow="hidden">
        <ModalHeader
          bg="blue.50"
          borderBottomWidth="1px"
          borderColor="gray.200"
          py={4}
          display="flex"
          alignItems="center"
        >
          <Icon as={FaListCheck} mr={2} color="blue.500" />
          Machine Count Check
        </ModalHeader>
        
        <ModalBody py={6}>
          <Stack spacing={4}>
            <Alert status="info" borderRadius="md" variant="left-accent">
              <AlertIcon />
              <Box>
                <AlertTitle fontSize="sm">Instructions</AlertTitle>
                <AlertDescription fontSize="xs">
                  Check the boxes next to machine units that you found during the physical inventory count. 
                  Units that are not checked will be marked as not found.
                </AlertDescription>
              </Box>
            </Alert>

            {/* Select All / Deselect All */}
            <Flex justify="space-between" align="center" p={3} bg="gray.50" borderRadius="md">
              <Text fontSize="sm" fontWeight="medium">
                {selectedMachineUnits.size} of {allMachineUnitsForCount.length} units selected
              </Text>
              <Button
                size="sm"
                variant="outline"
                onClick={handleSelectAll}
                colorScheme="blue"
              >
                {selectedMachineUnits.size === allMachineUnitsForCount.length ? "Deselect All" : "Select All"}
              </Button>
            </Flex>

            {/* Machine Units Table */}
            <Box
              maxH="400px"
              overflowY="auto"
              borderWidth="1px"
              borderColor="gray.200"
              borderRadius="md"
            >
              {isLoadingMachineUnitsForPhysicalCounting ? (
                <Center py={8}>
                  <Spinner size="md" thickness="3px" color="blue.500" />
                </Center>
              ) : machineUnitsForPhysicalCountingError ? (
                <Center py={8}>
                  <Alert status="error" borderRadius="md">
                    <AlertIcon />
                    <AlertDescription fontSize="sm">
                      {machineUnitsForPhysicalCountingError?.response?.data?.message ||
                        machineUnitsForPhysicalCountingError?.message ||
                        "Failed to load machine units"}
                    </AlertDescription>
                  </Alert>
                </Center>
              ) : allMachineUnitsForCount.length === 0 ? (
                <Center py={8}>
                  <Text color="gray.500">No machine units available for counting</Text>
                </Center>
              ) : (
                <TableContainer>
                  <Table variant="simple" size="sm">
                    <Thead bg="gray.50" position="sticky" top={0} zIndex={1}>
                      <Tr>
                        <Th width="50px" textAlign="center">
                        </Th>
                        <Th>Unit #</Th>
                        <Th>Equipment Type</Th>
                        <Th display={{ base: "none", md: "table-cell" }}>Owner</Th>
                        <Th display={{ base: "none", lg: "table-cell" }}>Engine</Th>
                        <Th>Status</Th>
                        <Th display={{ base: "none", sm: "table-cell" }}>Condition</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {allMachineUnitsForCount.map((unit) => (
                        <Tr
                          key={unit._id}
                          bg={selectedMachineUnits.has(unit._id.toString()) ? "blue.50" : "white"}
                          _hover={{ bg: selectedMachineUnits.has(unit._id.toString()) ? "blue.100" : "gray.50" }}
                          cursor="pointer"
                          onClick={() => handleMachineUnitToggle(unit._id.toString())}
                        >
                          <Td textAlign="center" onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              isChecked={selectedMachineUnits.has(unit._id.toString())}
                              onChange={() => handleMachineUnitToggle(unit._id.toString())}
                              colorScheme="blue"
                              size="md"
                            />
                          </Td>
                          <Td fontWeight="semibold">
                            {unit.unitNumber}
                          </Td>
                          <Td>
                            <Text fontSize="sm">{unit.equipmentType}</Text>
                            <Text fontSize="xs" color="gray.500" display={{ base: "block", md: "none" }}>
                              {unit.ownerName}
                            </Text>
                          </Td>
                          <Td display={{ base: "none", md: "table-cell" }}>
                            {unit.ownerName}
                          </Td>
                          <Td display={{ base: "none", lg: "table-cell" }}>
                            {unit.engineBrand ? (
                              <Text fontSize="sm">
                                {unit.engineBrand} {unit.engineHorsepower && `(${unit.engineHorsepower})`}
                              </Text>
                            ) : (
                              <Text fontSize="sm" color="gray.400">N/A</Text>
                            )}
                          </Td>
                          <Td>
                            <Tag
                              colorScheme={getStatusColor(unit.status)}
                              size="sm"
                            >
                              {unit.status}
                            </Tag>
                          </Td>
                          <Td display={{ base: "none", sm: "table-cell" }}>
                            <Tag
                              colorScheme={getConditionColor(unit.condition)}
                              size="sm"
                            >
                              {unit.condition}
                            </Tag>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              )}
            </Box>

            <Divider />

            {/* Remarks Textarea */}
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="medium">
                Remarks (Optional)
              </FormLabel>
              <Textarea
                placeholder="Enter any additional remarks about the machine count..."
                value={countRemarks}
                onChange={(e) => setCountRemarks(e.target.value)}
                bg="white"
                minH="100px"
                resize="vertical"
              />
              <Text fontSize="xs" color="gray.500" mt={1}>
                Add any notes or observations about the physical count
              </Text>
            </FormControl>
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
              setSelectedMachineUnits(new Set());
              setCountRemarks("");
              onCloseCountCheck();
            }}
            size="md"
            _hover={{ bg: "gray.100" }}
          >
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSubmitMachineCount}
            size="md"
            isLoading={isPerformingMachineCountCheck}
            isDisabled={isPerformingMachineCountCheck}
            leftIcon={<FaListCheck />}
          >
            Submit Machine Count
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>

    {/* Previous Machine Counts Modal */}
    <Modal
      isOpen={isOpenPreviousCounts}
      onClose={onClosePreviousCounts}
      size="4xl"
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
          <Icon as={FaStickyNote} mr={2} color="orange.500" />
          Previous Machine Counts
        </ModalHeader>
        
        <ModalBody py={6} maxH="70vh" overflowY="auto">
          <Stack spacing={4}>
            {isLoadingPhysicalCountingRecords ? (
              <Center py={8}>
                <Spinner size="xl" thickness="4px" color="orange.500" />
              </Center>
            ) : physicalCountingRecordsError ? (
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle>Error loading physical counting records</AlertTitle>
                  <AlertDescription>
                    {physicalCountingRecordsError?.response?.data?.message ||
                      physicalCountingRecordsError?.message ||
                      "An error occurred while fetching physical counting records."}
                  </AlertDescription>
                </Box>
              </Alert>
            ) : !physicalCountingRecords?.data?.physicalCountingRecords?.length ? (
              <Center py={8}>
                <Text color="gray.500" fontSize="lg">
                  No physical counting records found
                </Text>
              </Center>
            ) : (
              <>
                <Stack spacing={3}>
                  {physicalCountingRecords.data.physicalCountingRecords.map((record) => (
                    <Box
                      key={record._id}
                      p={3}
                      borderRadius="md"
                      borderWidth="1px"
                      borderColor="gray.200"
                      bg="white"
                      boxShadow="sm"
                    >
                      <Flex direction="column" gap={2}>
                        {/* Header Row: Date/Time, Employee, and Status */}
                        <Flex justify="space-between" align="flex-start" wrap="wrap" gap={3}>
                          <Flex gap={4} flex={1} minW={0} wrap="wrap">
                            {/* Date/Time */}
                            <Box flex="1" minW="120px">
                              <Text fontSize="xs" color="gray.500" fontWeight="medium">Date & Time</Text>
                              <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                                {record.countingDate 
                                  ? new Date(record.countingDate).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric'
                                    })
                                  : 'N/A'}
                              </Text>
                              <Text fontSize="xs" color="gray.500">
                                {record.countingDate 
                                  ? new Date(record.countingDate).toLocaleTimeString('en-US', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })
                                  : ''}
                              </Text>
                            </Box>
                            
                            {/* Employee Info */}
                            <Box flex="1" minW="150px">
                              <Text fontSize="xs" color="gray.500" fontWeight="medium">Assigned Employee</Text>
                              <Text fontSize="sm" color="gray.700">
                                {record.assignedEmployee?.first_name && record.assignedEmployee?.last_name
                                  ? `${record.assignedEmployee.first_name} ${record.assignedEmployee.last_name}`
                                  : 'N/A'}
                              </Text>
                            </Box>
                          </Flex>
                          
                          {/* Status Tag */}
                          <Tag
                            colorScheme={
                              record.discrepancyFound === 'Resolved' ? 'green' :
                              record.discrepancyFound === 'Discrepancy Found' ? 'red' :
                              'gray'
                            }
                            size="sm"
                            alignSelf="flex-start"
                          >
                            {record.discrepancyFound || 'N/A'}
                          </Tag>
                        </Flex>

                        {/* Units Count Row */}
                        <Flex gap={4} align="center">
                          <Box>
                            <Text fontSize="xs" color="gray.500" fontWeight="medium">Found Units</Text>
                            <Text fontSize="sm" fontWeight="semibold" color="green.600">
                              {record.machineUnits?.length || 0}
                            </Text>
                          </Box>
                          <Box>
                            <Text fontSize="xs" color="gray.500" fontWeight="medium">Not Found Units</Text>
                            <Text fontSize="sm" fontWeight="semibold" color="red.600">
                              {record.notFoundMachineUnits?.length || 0}
                            </Text>
                          </Box>
                        </Flex>

                        {/* Remarks */}
                        {(record.remarks || record.resolveRemarks) && (
                          <Box>
                            <Text fontSize="xs" color="gray.500" fontWeight="medium">
                              {record.discrepancyFound === 'Resolved' ? 'Resolution Remarks' : 'Remarks'}
                            </Text>
                            <Tooltip 
                              label={record.discrepancyFound === 'Resolved' ? record.resolveRemarks : record.remarks} 
                              placement="top" 
                              hasArrow
                            >
                              <Text fontSize="sm" color="gray.700" noOfLines={2} cursor="help">
                                {record.discrepancyFound === 'Resolved' ? record.resolveRemarks : record.remarks}
                              </Text>
                            </Tooltip>
                          </Box>
                        )}

                        {/* Action Button */}
                        {record.discrepancyFound === 'Discrepancy Found' && (
                          <Flex justify="flex-end" mt={1}>
                            <Button
                              size="xs"
                              colorScheme="orange"
                              variant="outline"
                              onClick={() => {
                                setSelectedPhysicalCountingRecord(record);
                                setResolveRemarks("");
                                onOpenResolveDiscrepancy();
                              }}
                              isDisabled={isResolvingDiscrepancyInPhysicalCount}
                            >
                              Resolve
                            </Button>
                          </Flex>
                        )}
                      </Flex>
                    </Box>
                  ))}
                </Stack>

                {/* Pagination Controls */}
                {physicalCountingRecords?.data?.totalPages > 1 && (
                  <Flex
                    justifyContent="space-between"
                    alignItems="center"
                    mt={4}
                    pt={4}
                    borderTopWidth="1px"
                    borderColor="gray.200"
                  >
                    <Text color="gray.600" fontSize="sm">
                      Page {physicalCountingRecords.data.currentPage} of {physicalCountingRecords.data.totalPages} 
                      ({physicalCountingRecords.data.totalCount} total records)
                    </Text>
                    <HStack spacing={2}>
                      <Button
                        size="sm"
                        onClick={() => setPreviousCountsPage(Math.max(1, previousCountsPage - 1))}
                        isDisabled={previousCountsPage === 1 || isLoadingPhysicalCountingRecords}
                        colorScheme="orange"
                        variant="outline"
                      >
                        Previous
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setPreviousCountsPage(Math.min(physicalCountingRecords.data.totalPages, previousCountsPage + 1))}
                        isDisabled={previousCountsPage >= physicalCountingRecords.data.totalPages || isLoadingPhysicalCountingRecords}
                        colorScheme="orange"
                        variant="outline"
                      >
                        Next
                      </Button>
                    </HStack>
                  </Flex>
                )}
              </>
            )}
          </Stack>
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
              setPreviousCountsPage(1);
              onClosePreviousCounts();
            }}
            size="md"
            _hover={{ bg: "gray.100" }}
          >
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>

    {/* Resolve Discrepancy Modal */}
    <Modal
      isOpen={isOpenResolveDiscrepancy}
      onClose={() => {
        setSelectedPhysicalCountingRecord(null);
        setResolveRemarks("");
        onCloseResolveDiscrepancy();
      }}
      size="md"
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
          <Icon as={FaCheckCircle} mr={2} color="orange.500" />
          Resolve Discrepancy
        </ModalHeader>
        
        <ModalBody py={6}>
          <Stack spacing={4}>
            <Alert status="info" borderRadius="md" variant="left-accent">
              <AlertIcon />
              <Box>
                <AlertTitle fontSize="sm">Resolve Physical Count Discrepancy</AlertTitle>
                <AlertDescription fontSize="xs">
                  This will mark the discrepancy as resolved. You can optionally add remarks about how the discrepancy was resolved.
                </AlertDescription>
              </Box>
            </Alert>

            {/* Record Information */}
            {selectedPhysicalCountingRecord && (
              <Box
                p={3}
                bg="gray.50"
                borderRadius="md"
                borderWidth="1px"
                borderColor="gray.200"
              >
                <Text fontSize="xs" color="gray.500" fontWeight="medium" mb={2}>Counting Date</Text>
                <Text fontWeight="semibold" fontSize="sm">
                  {selectedPhysicalCountingRecord.countingDate 
                    ? new Date(selectedPhysicalCountingRecord.countingDate).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : 'N/A'}
                </Text>
                <Text fontSize="xs" color="gray.500" fontWeight="medium" mt={2} mb={1}>Summary</Text>
                <Flex gap={4} mt={1}>
                  <Box>
                    <Text fontSize="xs" color="gray.500">Found Units</Text>
                    <Text fontWeight="semibold" color="green.600">
                      {selectedPhysicalCountingRecord.machineUnits?.length || 0}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.500">Not Found Units</Text>
                    <Text fontWeight="semibold" color="red.600">
                      {selectedPhysicalCountingRecord.notFoundMachineUnits?.length || 0}
                    </Text>
                  </Box>
                </Flex>
              </Box>
            )}

            <Divider />

            {/* Resolve Remarks Textarea */}
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="medium">
                Resolution Remarks (Optional)
              </FormLabel>
              <Textarea
                placeholder="Enter remarks about how the discrepancy was resolved..."
                value={resolveRemarks}
                onChange={(e) => setResolveRemarks(e.target.value)}
                bg="white"
                minH="100px"
                resize="vertical"
              />
              <Text fontSize="xs" color="gray.500" mt={1}>
                Add any notes about how the discrepancy was resolved
              </Text>
            </FormControl>
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
              setSelectedPhysicalCountingRecord(null);
              setResolveRemarks("");
              onCloseResolveDiscrepancy();
            }}
            size="md"
            _hover={{ bg: "gray.100" }}
            isDisabled={isResolvingDiscrepancyInPhysicalCount}
          >
            Cancel
          </Button>
          <Button
            colorScheme="orange"
            onClick={handleResolveDiscrepancy}
            size="md"
            isLoading={isResolvingDiscrepancyInPhysicalCount}
            isDisabled={isResolvingDiscrepancyInPhysicalCount}
            leftIcon={<FaCheckCircle />}
          >
            Resolve Discrepancy
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
    
    </>
  );
}

export default B_MachineInventory;
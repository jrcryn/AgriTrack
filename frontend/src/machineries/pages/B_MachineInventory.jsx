import React, { useState } from "react";
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
} from "@chakra-ui/react";
import {
  FaTractor,
  FaTools,
  FaCheckCircle,
  FaExclamationTriangle,
  FaEye,
  FaSearch,
  FaInfo,
} from "react-icons/fa";
import { useAdminDashboard } from "../store/adminDashboard.store";

const B_MachineInventory = () => {
  const [selectedYear] = useState(new Date().getFullYear());
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch real data from the store
  const {
    machineUnits,
    isLoadingMachineUnits,
    machineUnitsError,
  } = useAdminDashboard();

  // Calculate statistics from real data
  const calculateStats = () => {
    if (!machineUnits?.data?.machineTypesWithUnits) {
      return {
        totalMachines: 0,
        operational: 0,
        underRepair: 0,
        retired: 0,
      };
    }

    let total = 0;
    let operational = 0;
    let underRepair = 0;
    let retired = 0;

    machineUnits.data.machineTypesWithUnits.forEach((type) => {
      type.machineUnits?.forEach((unit) => {
        total++;
        if (unit.status === "Available" || unit.status === "In Use")
          operational++;
        if (unit.status === "Under Repair") underRepair++;
        if (unit.status === "Retired") retired++;
      });
    });

    return { totalMachines: total, operational, underRepair, retired };
  };

  const stats = calculateStats();

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

  return (
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
              {isLoadingMachineUnits ? (
                <Center h="65px">
                  <Spinner size="lg" thickness="3px" color="blue.500" />
                </Center>
              ) : (
                <StatNumber fontSize="4xl">{stats.totalMachines}</StatNumber>
              )}
              <StatHelpText>{selectedYear}</StatHelpText>
            </Stat>
          </Box>

          {/* Operational Machines */}
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
                <Icon as={FaCheckCircle} mr={2} color="green.500" /> Operational
              </StatLabel>
              {isLoadingMachineUnits ? (
                <Center h="65px">
                  <Spinner size="lg" thickness="3px" color="green.500" />
                </Center>
              ) : (
                <StatNumber fontSize="4xl">{stats.operational}</StatNumber>
              )}
              <StatHelpText>Currently in use</StatHelpText>
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
              {isLoadingMachineUnits ? (
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
              {isLoadingMachineUnits ? (
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
            onClick={() => {
              // TODO: Implement register machine flow
              console.log("Register Machine clicked");
            }}
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
                      <Th>Location</Th>
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
                          <Td fontSize={'sm'}>{unit.location}</Td>
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
                                // TODO: Implement details view
                                console.log('View details for:', unit);
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
      </Box>
    </Box>
  );
}


export default B_MachineInventory;
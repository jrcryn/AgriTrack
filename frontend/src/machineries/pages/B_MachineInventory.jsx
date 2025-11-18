import React, { useState } from "react";
import {
  Box,
  Heading,
  Text,
  Stack,
  Flex,
  Icon,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  FormControl,
  FormLabel,
  Select,
  Tag,
  Center,
  Spinner,
  Button,
} from "@chakra-ui/react";
import {
  FaTractor,
  FaTools,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUsers,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";

// Dummy data for demonstration
const availableYears = [2023, 2024, 2025];
const availableBarangays = ["Barangay 1", "Barangay 2", "Barangay 3"];
const machineTypes = ["Tractor", "Plow", "Harvester", "Sprayer"];

const dummyInventoryData = {
  totalMachines: 42,
  operational: 35,
  underRepair: 5,
  retired: 2,
  assignedFarmers: 28,
};

const B_MachineInventory = () => {
  const [selectedYear, setSelectedYear] = useState(availableYears[0]);
  const [selectedBarangay, setSelectedBarangay] = useState("");
  const [selectedMachineType, setSelectedMachineType] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Reset filters
  const handleResetFilters = () => {
    setSelectedBarangay("");
    setSelectedMachineType("");
  };

  return (
    <Box
      overflow="hidden"
      bg="white"
      p={5}
      minH="100vh"
    >
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
              {isLoading ? (
                <Center h="65px">
                  <Spinner size="lg" thickness="3px" color="blue.500" />
                </Center>
              ) : (
                <StatNumber fontSize="4xl">{dummyInventoryData.totalMachines}</StatNumber>
              )}
              <StatHelpText>
                {selectedYear}
              </StatHelpText>
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
              {isLoading ? (
                <Center h="65px">
                  <Spinner size="lg" thickness="3px" color="green.500" />
                </Center>
              ) : (
                <StatNumber fontSize="4xl">{dummyInventoryData.operational}</StatNumber>
              )}
              <StatHelpText>
                Currently in use
              </StatHelpText>
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
              {isLoading ? (
                <Center h="65px">
                  <Spinner size="lg" thickness="3px" color="orange.500" />
                </Center>
              ) : (
                <StatNumber fontSize="4xl">{dummyInventoryData.underRepair}</StatNumber>
              )}
              <StatHelpText>
                Maintenance ongoing
              </StatHelpText>
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
              {isLoading ? (
                <Center h="65px">
                  <Spinner size="lg" thickness="3px" color="gray.500" />
                </Center>
              ) : (
                <StatNumber fontSize="4xl">{dummyInventoryData.retired}</StatNumber>
              )}
              <StatHelpText>
                Out of service
              </StatHelpText>
            </Stat>
          </Box>
        </Stack>
      </Box>

      {/* Assigned Farmers Section */}
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
            <Icon as={FaUsers} mr={2} color="orange.600" /> MACHINE LIST
          </Heading>
        </Flex>

        <Box
          p={5}
          borderRadius="md"
          boxShadow="sm"
          bg="white"
          borderWidth="1px"
          borderColor="gray.200"
          maxW={{ base: "100%", md: "350px" }}
        >
          <Stat>
            <StatLabel fontSize="md" display="flex" alignItems="center">
              <Icon as={FaUsers} mr={2} color="blue.500" /> Number of Farmers
            </StatLabel>
            {isLoading ? (
              <Center h="65px">
                <Spinner size="lg" thickness="3px" color="blue.500" />
              </Center>
            ) : (
              <StatNumber fontSize="4xl">{dummyInventoryData.assignedFarmers}</StatNumber>
            )}
            <StatHelpText>
              {selectedYear}
            </StatHelpText>
          </Stat>
        </Box>
      </Box>
    </Box>
  );
};

export default B_MachineInventory;
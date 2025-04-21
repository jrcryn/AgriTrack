import React from 'react';
import {
  Box,
  Heading,
  Text,
  Stack,
  Flex,
  Icon,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Center,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Progress,
  SimpleGrid,
  CircularProgress,
  CircularProgressLabel,
} from "@chakra-ui/react";
import { 
  FaTractor,
  FaWrench,
  FaTools,
  FaPercentage,
  FaChartPie
} from "react-icons/fa";
import { useAdminDashboard } from "../store/adminDashboard.store";

const Metrics = () => {
  // Get data from the store
  const { 
    machineryUnits,
    isLoading,
    error 
  } = useAdminDashboard();

  // Calculate metrics when data is available
  const calculateMetrics = () => {
    if (!machineryUnits || machineryUnits.length === 0) {
      return {
        totalMachines: 0,
        functionalUnits: 0,
        nonFunctionalUnits: 0,
        functionalPercentage: 0,
        nonFunctionalPercentage: 0,
        operationalReadinessRate: 0
      };
    }

    // Calculate total functional and non-functional units across all barangays
    const totals = machineryUnits.reduce((acc, unit) => {
      const unitTotals = unit.barangay_allocations.reduce((barangayAcc, allocation) => {
        const functional = allocation.functional_units || 0;
        const nonFunctional = allocation.non_functional_units || 0;
        
        return {
          functional: barangayAcc.functional + functional,
          nonFunctional: barangayAcc.nonFunctional + nonFunctional
        };
      }, { functional: 0, nonFunctional: 0 });
      
      return {
        functional: acc.functional + unitTotals.functional,
        nonFunctional: acc.nonFunctional + unitTotals.nonFunctional
      };
    }, { functional: 0, nonFunctional: 0 });
    
    const totalMachines = totals.functional + totals.nonFunctional;
    const functionalPercentage = totalMachines > 0 ? (totals.functional / totalMachines) * 100 : 0;
    const nonFunctionalPercentage = totalMachines > 0 ? (totals.nonFunctional / totalMachines) * 100 : 0;
    
    return {
      totalMachines,
      functionalUnits: totals.functional,
      nonFunctionalUnits: totals.nonFunctional,
      functionalPercentage,
      nonFunctionalPercentage,
      operationalReadinessRate: functionalPercentage // Same as functional percentage
    };
  };

  const metrics = calculateMetrics();

  // Show error state
  if (error) {
    return (
      <Box 
        overflow="hidden" 
        bg="white" 
        p={5} 
        minH="100vh"
      >
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <AlertTitle>Error loading data!</AlertTitle>
          <AlertDescription>
            {error || "Unable to load machinery metrics. Please try again later."}
          </AlertDescription>
        </Alert>
      </Box>
    );
  }

    if (isLoading) {
      return (
        <Box 
          overflow="hidden" 
          bg="white" 
          p={5} 
          minH="100vh"
        >
          <Heading as="h1" size="xl" mb={2} color="black">
            Machinery Metrics
          </Heading>
          <Alert 
            bgColor={"blue.100"} 
            borderRadius="md" 
            mt={4}
            display="flex"
            alignItems="center"
            py={3}
          >
              <AlertIcon color="blue.500"/>
            <Text fontWeight="medium" mr={3}>Please Wait:</Text>
            <Spinner size="md" thickness="3px" color="blue.500" mr={3} />
            <Text>Loading Metrics Data...</Text>
          </Alert>
        </Box>
      );
    }

  return (
    <Box 
      overflow="hidden" 
      bg="white" 
      p={5} 
      minH="100vh"
    >
      <Heading as="h1" size="xl" mb={2} color="black">
        Machinery Metrics
      </Heading>
      <Text color="gray.600" mb={5}>
        Overview of machinery inventory and operational status across Calamba City.
      </Text>
      
      {/* MACHINERY INVENTORY SECTION */}
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
            <Icon as={FaTractor} mr={2} color="blue.600" /> MACHINERY INVENTORY
          </Heading>
        </Flex>
      
          <Stack 
            direction={{ base: "column", md: "row" }} 
            spacing={4} 
            w="full"
          >
            {/* Total Machinery */}
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
                <StatNumber fontSize="4xl" mb={4}>{machineryUnits.length}</StatNumber>
                <StatHelpText>
                  Number of machines currently registered in the system.
                </StatHelpText>
              </Stat>
            </Box>

            {/* Total Machinery */}
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
                  <Icon as={FaTractor} mr={2} color="blue.500" /> Total Machinery Units
                </StatLabel>
                <StatNumber fontSize="4xl" mb={4}>{metrics.totalMachines}</StatNumber>
                <StatHelpText>
                  Available machine units across all barangays
                </StatHelpText>
              </Stat>
            </Box>
          
            {/* Functional Units */}
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
                  <Icon as={FaTools} mr={2} color="green.500" /> Functional Units
                </StatLabel>
                <Flex align="center" mt={2}>
                  <StatNumber fontSize="4xl" mr={3}>{metrics.functionalUnits}</StatNumber>
                  <Box bg="green.100" color="green.800" borderRadius="md" px={2} py={1} fontWeight="bold">
                    {metrics.functionalPercentage.toFixed(1)}%
                  </Box>
                </Flex>
                <StatHelpText mt={2}>
                  Units being used for operation
                </StatHelpText>
              </Stat>
            </Box>
          
            {/* Non-Functional Units */}
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
                  <Icon as={FaWrench} mr={2} color="red.500" /> Non-Functional Units
                </StatLabel>
                <Flex align="center" mt={2}>
                  <StatNumber fontSize="4xl" mr={3}>{metrics.nonFunctionalUnits}</StatNumber>
                  <Box bg="red.100" color="red.800" borderRadius="md" px={2} py={1} fontWeight="bold">
                    {metrics.nonFunctionalPercentage.toFixed(1)}%
                  </Box>
                </Flex>
                <StatHelpText mt={2}>
                  Units in need of maintenance/repair
                </StatHelpText>
              </Stat>
            </Box>
          </Stack>
      </Box>
    
      {/* OPERATIONAL STATUS SECTION */}
      <Box mb={8}>
        <Flex 
          justify="space-between" 
          align="center" 
          mb={4}
          bg="green.50"
          p={3}
          borderRadius="md"
          borderLeftWidth="4px"
          borderLeftColor="green.500"
        >
          <Heading as="h2" size="md" display="flex" alignItems="center">
            <Icon as={FaChartPie} mr={2} color="green.600" /> OPERATIONAL READINESS
          </Heading>
        </Flex>
      
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <Box 
              p={5} 
              borderRadius="md" 
              boxShadow="sm" 
              bg="white"
              borderWidth="1px"
              borderColor="gray.200"
              display="flex"
              alignItems="center"
            >
              <Box flex="3">
                <Heading size="md" mb={4}>Operational Readiness Rate</Heading>
                <Text color="gray.600" mb={3}>
                  Percentage of total machinery that is functional and is being used.
                </Text>
                <Text mt={2} fontSize="sm" color="gray.500">
                  Higher percentage indicates better fleet readiness
                </Text>
              </Box>
              <Center flex="2">
                <CircularProgress 
                  value={metrics.operationalReadinessRate} 
                  color="green.400" 
                  size="120px"
                  thickness="12px"
                >
                  <CircularProgressLabel fontSize="xl" fontWeight="bold">
                    {metrics.operationalReadinessRate.toFixed(1)}%
                  </CircularProgressLabel>
                </CircularProgress>
              </Center>
            </Box>
            
            <Box 
              p={5} 
              borderRadius="md" 
              boxShadow="sm" 
              bg="white"
              borderWidth="1px"
              borderColor="gray.200"
            >
              <Heading size="md" mb={4} fontWeight={"bold"}>Functional vs. Non-Functional</Heading>
              <Box mb={3}>
                <Flex justify="space-between" mb={1}>
                  <Text color="green.600" fontWeight="medium">Functional ({metrics.functionalPercentage.toFixed(1)}%)</Text>
                  <Text>{metrics.functionalUnits} units</Text>
                </Flex>
                <Progress value={metrics.functionalPercentage} colorScheme="green" height="24px" borderRadius="md" />
              </Box>
              
              <Box mb={3}>
                <Flex justify="space-between" mb={1}>
                  <Text color="red.600" fontWeight="medium">Non-Functional ({metrics.nonFunctionalPercentage.toFixed(1)}%)</Text>
                  <Text>{metrics.nonFunctionalUnits} units</Text>
                </Flex>
                <Progress value={metrics.nonFunctionalPercentage} colorScheme="red" height="24px" borderRadius="md" />
              </Box>
            </Box>
          </SimpleGrid>
      </Box>
    </Box>
  );
};

export default Metrics;
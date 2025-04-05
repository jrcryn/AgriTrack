import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Text,
  Stack,
  HStack,
  Flex,
  Button,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Select,
  Icon,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import { FaChartLine, FaUsers, FaLeaf, FaSeedling, FaBoxes, FaCalendarAlt } from "react-icons/fa";
import { useAdminDashboard } from "../store/adminDashboard.store";

const Metrics = () => {
  // Get available years from API
  const { useUnifiedFarmerResponseYearQuery, useUnifiedFarmerResponseMonthsQuery } = useAdminDashboard();
  const { data: availableYears = [], isLoading: isLoadingYears, error: yearsError } = useUnifiedFarmerResponseYearQuery();
  
  // State for year and month filters
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(null);
  
  // Fetch available months based on selected year
  const { 
    data: availableMonths = [], 
    isLoading: isLoadingMonths 
  } = useUnifiedFarmerResponseMonthsQuery(selectedYear);
  
  // Set the first available month when months are loaded or when year changes
  useEffect(() => {
    if (availableMonths.length > 0) {
      setSelectedMonth(availableMonths[0]);
    } else {
      // If no months available, reset selection
      setSelectedMonth(null);
    }
  }, [availableMonths]);
  
  // Array of months (keeping this as it's just static data)
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  // Placeholder for real data - will be replaced with API call later
  const newlyPlantedData = {
    farmers: 0,
    areaPlanted: 0, 
  };
  
  const harvestingData = {
    farmers: 0,
    areaHarvested: 0,
    volumeProduction: 0,
  };

  // Show loading state
  if (isLoadingYears) {
    return (
      <Box 
        overflow="hidden" 
        bg="white" 
        p={5} 
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
      >
        <Spinner size="xl" color="blue.500" mb={4} />
        <Text>Loading metrics data...</Text>
      </Box>
    );
  }

  // Show error state
  if (yearsError) {
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
            {yearsError.message || "Unable to load metrics data. Please try again later."}
          </AlertDescription>
        </Alert>
      </Box>
    );
  }

  // Show fallback UI when no years data is available
  if (availableYears.length === 0) {
    return (
      <Box 
        overflow="hidden" 
        bg="white" 
        p={5} 
        minH="100vh"
      >
        <Heading as="h1" size="xl" mb={2} color="black">
          High-Value Crops Metrics
        </Heading>
        <Alert status="info" borderRadius="md" mt={4}>
          <AlertIcon />
          <AlertTitle>No data available!</AlertTitle>
          <AlertDescription>
            There are currently no metrics data available. Please check back later or add some farmer records.
          </AlertDescription>
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
          High-Value Crops Metrics
        </Heading>
        <Text color="gray.600" mb={5}>
          Overview of planting and harvesting activities across calamba. Go to SEE MORE for farmer response sorting.
        </Text>
      
        {/* Year and Month Selector */}
        <Flex 
          direction={{ base: "column", md: "row" }} 
          mb={6} 
          gap={4}
          p={4}
          bg="blue.50"
          borderRadius="md"
          alignItems="center"
        >
          <HStack spacing={2}>
            <Icon as={FaCalendarAlt} color="blue.500" />
            <Text fontWeight="medium">Filter by:</Text>
          </HStack>
          <HStack spacing={4} flex={1} wrap="wrap">
            <Select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              width={{ base: "full", md: "xs" }}
              bg="white"
            >
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </Select>
            
            <Select 
              value={selectedMonth || ""}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              width={{ base: "full", md: "xs" }}
              bg="white"
              isDisabled={isLoadingMonths || availableMonths.length === 0}
            >
              {isLoadingMonths ? (
                <option value="">Loading months...</option>
              ) : availableMonths.length === 0 ? (
                <option value="">No months available</option>
              ) : (
                availableMonths.map((month) => (
                  <option key={month} value={month}>
                    {months[month - 1]}
                  </option>
                ))
              )}
            </Select>
          </HStack>
        </Flex>
      
        {/* NEWLY PLANTED SECTION */}
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
              <Icon as={FaSeedling} mr={2} color="green.600" /> NEWLY PLANTED
            </Heading>
          </Flex>
        
          <Stack 
            direction={{ base: "column", md: "row" }} 
            spacing={4} 
            w="full"
          >
            {/* Number of Farmers */}
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
                  <Icon as={FaUsers} mr={2} color="blue.500" /> Number of Farmers
                </StatLabel>
                <StatNumber fontSize="3xl">{newlyPlantedData.farmers}</StatNumber>
                <StatHelpText>
                  {selectedMonth && months[selectedMonth - 1]} {selectedYear}
                </StatHelpText>
              </Stat>
            </Box>
          
            {/* Total Area Planted */}
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
                  <Icon as={FaLeaf} mr={2} color="green.500" /> T. Area Planted
                </StatLabel>
                <StatNumber fontSize="3xl">{newlyPlantedData.areaPlanted} <Text as="span" fontSize="lg">ha</Text></StatNumber>
                <StatHelpText>
                  {selectedMonth && months[selectedMonth - 1]} {selectedYear}
                </StatHelpText>
              </Stat>
            </Box>
          </Stack>
        
          <Flex justifyContent="flex-end" mt={3}>
            <Button 
              colorScheme="green" 
              size="sm"
              rightIcon={<FaChartLine />}
            >
              See more
            </Button>
          </Flex>
        </Box>
    
      
        {/* HARVESTING SECTION */}
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
              <Icon as={FaBoxes} mr={2} color="orange.600" /> HARVESTING
            </Heading>
          </Flex>
        
          <Stack 
            direction={{ base: "column", md: "row" }} 
            spacing={4} 
            w="full"
          >
            {/* Number of Farmers */}
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
                  <Icon as={FaUsers} mr={2} color="blue.500" /> Number of Farmers
                </StatLabel>
                <StatNumber fontSize="3xl">{harvestingData.farmers}</StatNumber>
                <StatHelpText>
                  {selectedMonth && months[selectedMonth - 1]} {selectedYear}
                </StatHelpText>
              </Stat>
            </Box>
          
            {/* Total Area Harvested */}
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
                  <Icon as={FaLeaf} mr={2} color="green.500" /> T. Area Harv
                </StatLabel>
                <StatNumber fontSize="3xl">{harvestingData.areaHarvested} <Text as="span" fontSize="lg">ha</Text></StatNumber>
                <StatHelpText>
                  {selectedMonth && months[selectedMonth - 1]} {selectedYear}
                </StatHelpText>
              </Stat>
            </Box>
          
            {/* Total Volume Production */}
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
                  <Icon as={FaBoxes} mr={2} color="orange.500" /> T. Volume Prod
                </StatLabel>
                <StatNumber fontSize="3xl">{harvestingData.volumeProduction} <Text as="span" fontSize="lg">mt</Text></StatNumber>
                <StatHelpText>
                  {selectedMonth && months[selectedMonth - 1]} {selectedYear}
                </StatHelpText>
              </Stat>
            </Box>
          </Stack>
        
          <Flex justifyContent="flex-end" mt={3}>
            <Button 
              colorScheme="orange" 
              size="sm"
              rightIcon={<FaChartLine />}
            >
              See more
            </Button>
          </Flex>
        </Box>
      </Box>
  );
};

export default Metrics;
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
  Center,
} from "@chakra-ui/react";
import { InfoIcon } from "@chakra-ui/icons";
import { FaChartLine, FaUsers, FaLeaf, FaSeedling, FaBoxes, FaCalendarAlt, FaWifi } from "react-icons/fa";
import { useAdminDashboard } from "../store/adminDashboard.store";

const Metrics = () => {
  // Get data from the store (similar to E_Farmers.jsx)
  const { 
    availableYears, 
    availableMonths, 
    selectedYear,
    selectedMonth,
    setSelectedYear,
    setSelectedMonth,
    metricsData,
    isLoading,
    error 
  } = useAdminDashboard();

  useEffect(() => {
    console.log("Year:", selectedYear, "Month:", selectedMonth);
    console.log("Metrics data:", metricsData);
  }, [selectedYear, selectedMonth, metricsData]);
  
  
  // Month names array for display purposes (converting numeric month to name)
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  // Placeholder for real data - will be replaced with API call later
  const newlyPlantedData = metricsData ? {
    farmers: metricsData.newlyPlanted?.farmers || 0,
    areaPlanted: metricsData.newlyPlanted?.areaPlanted || 0
  } : {
    farmers: 0,
    areaPlanted: 0
  };

  const volumeProduction = metricsData?.harvesting?.volumeProduction;
  const convertedVP = volumeProduction / 10000; // Convert to metric tons (mt)

  
  const harvestingData = metricsData ? {
    farmers: metricsData.harvesting?.farmers || 0,
    areaHarvested: metricsData.harvesting?.areaHarvested || 0,
    volumeProduction: convertedVP || 0
  } : {
    farmers: 0,
    areaHarvested: 0,
    volumeProduction: 0
  };

  // state for internet connection status
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Show offline state
  if (!isOnline) {
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
        <Alert status="warning" borderRadius="md" mt={4}>
          <AlertIcon />
          <Box>
            <AlertTitle display="flex" alignItems="center">
              <Icon as={FaWifi} mr={2} /> No Internet Connection
            </AlertTitle>
            <AlertDescription>
              You appear to be offline. Please check your internet connection and try again.
            </AlertDescription>
          </Box>
        </Alert>
        <Button 
          mt={4} 
          colorScheme="blue" 
          onClick={() => window.location.reload()}
        >
          Retry Connection
        </Button>
      </Box>
    );
  }

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
            {error || "Unable to load metrics data. Please try again later."}
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
          High-Value Crops Metrics
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
              onChange={(e) => {
                const value = e.target.value;
                if (value === "") {
                  setSelectedMonth(null);
                } else {
                  setSelectedMonth(Number(value));
                  console.log("Month selected:", Number(value)); // Debug log
                }
              }}
              width={{ base: "full", md: "xs" }}
              bg="white"
              isDisabled={availableMonths.length === 0}
            >
              {availableMonths.length === 0 ? (
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
                {isLoading ? (
                  <Center h="65px">
                    <Spinner size="lg" thickness="3px" color="blue.500" />
                  </Center>
                ) : (
                  <StatNumber fontSize="4xl">{newlyPlantedData.farmers}</StatNumber>
                )}
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
                  <Icon as={FaLeaf} mr={2} color="green.500" /> Total Area Planted
                </StatLabel>
                {isLoading ? (
                  <Center h="65px">
                    <Spinner size="lg" thickness="3px" color="green.500" />
                  </Center>
                ) : (
                  <StatNumber fontSize="4xl">{newlyPlantedData.areaPlanted.toFixed(4)} <Text as="span" fontSize="lg">ha</Text></StatNumber>
                )}
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
                {isLoading ? (
                  <Center h="65px">
                    <Spinner size="lg" thickness="3px" color="blue.500" />
                  </Center>
                ) : (
                  <StatNumber fontSize="4xl">{harvestingData.farmers}</StatNumber>
                )}
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
                  <Icon as={FaLeaf} mr={2} color="green.500" /> Total Area Harvested
                </StatLabel>
                {isLoading ? (
                  <Center h="65px">
                    <Spinner size="lg" thickness="3px" color="green.500" />
                  </Center>
                ) : (
                  <StatNumber fontSize="4xl">{harvestingData.areaHarvested.toFixed(4)} <Text as="span" fontSize="lg">ha</Text></StatNumber>
                )}
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
                  <Icon as={FaBoxes} mr={2} color="orange.500" /> Total Volume of Production
                </StatLabel>
                {isLoading ? (
                  <Center h="65px">
                    <Spinner size="lg" thickness="3px" color="orange.500" />
                  </Center>
                ) : (
                  <StatNumber fontSize="4xl">{harvestingData.volumeProduction.toFixed(4)} <Text as="span" fontSize="lg">mt</Text></StatNumber>
                )}
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
import React, { useState, useEffect } from "react";
import axios from "axios";
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
} from "@chakra-ui/react";
import { FaChartLine, FaUsers, FaLeaf, FaSeedling, FaBoxes, FaCalendarAlt } from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL;

const Metrics = () => {
  // State for available data
  const [availableYears, setAvailableYears] = useState([]);
  const [availableMonths, setAvailableMonths] = useState([]);
  
  // State for selected filters
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  
  // State for metrics data
  const [metricsData, setMetricsData] = useState(null);
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Array of month names for display
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  // Fetch available years on component mount
  useEffect(() => {
    const fetchAvailableYears = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${API_URL}/metrics/available-years`);
        setAvailableYears(response.data);
        
        // Set the most recent year as default
        if (response.data.length > 0) {
          setSelectedYear(response.data[0]);
        }
      } catch (err) {
        setError('Failed to fetch available years');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAvailableYears();
  }, []);
  
  // Fetch available months when selected year changes
  useEffect(() => {
    const fetchAvailableMonths = async () => {
      if (!selectedYear) return;
      
      try {
        setIsLoading(true);
        const response = await axios.get(`${API_URL}/metrics/available-months/${selectedYear}`);
        setAvailableMonths(response.data);
        
        // If current selected month is not in available months, select first available month
        if (response.data.length > 0 && !response.data.includes(selectedMonth)) {
          setSelectedMonth(response.data[0]);
        }
      } catch (err) {
        setError('Failed to fetch available months');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAvailableMonths();
  }, [selectedYear]);
  
  // Fetch metrics data when year or month changes
  useEffect(() => {
    const fetchMetricsData = async () => {
      if (!selectedYear || selectedMonth === null) return;
      
      try {
        setIsLoading(true);
        const response = await axios.get(`${API_URL}/metrics/data/${selectedYear}/${selectedMonth}`);
        setMetricsData(response.data);
      } catch (err) {
        setError('Failed to fetch metrics data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMetricsData();
  }, [selectedYear, selectedMonth]);
  
  // Handler for year change
  const handleYearChange = (e) => {
    setSelectedYear(Number(e.target.value));
  };
  
  // Handler for month change
  const handleMonthChange = (e) => {
    setSelectedMonth(Number(e.target.value));
  };
  
  // Default data for display when loading or no data available
  const newlyPlantedData = metricsData?.newlyPlanted || {
    farmers: 0,
    areaPlanted: 0,
  };
  
  const harvestingData = metricsData?.harvesting || {
    farmers: 0,
    areaHarvested: 0,
    volumeProduction: 0,
  };
  
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
        Overview of planting and harvesting activities across Calamba. Data is sourced from validated farmer responses.
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
            onChange={handleYearChange}
            width={{ base: "full", md: "xs" }}
            bg="white"
            isDisabled={isLoading || availableYears.length === 0}
          >
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </Select>
          <Select 
            value={selectedMonth} 
            onChange={handleMonthChange}
            width={{ base: "full", md: "xs" }}
            bg="white"
            isDisabled={isLoading || availableMonths.length === 0}
          >
            {/* Only show months that have data */}
            {availableMonths.length > 0 ? (
              availableMonths.map((monthIndex) => (
                <option key={monthIndex} value={monthIndex}>
                  {months[monthIndex]}
                </option>
              ))
            ) : (
              <option value={selectedMonth}>{months[selectedMonth]}</option>
            )}
          </Select>
        </HStack>
      </Flex>
      
      {/* Error display */}
      {error && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {error}
        </Alert>
      )}
      
      {/* Loading indicator */}
      {isLoading && (
        <Flex justify="center" my={8}>
          <Spinner size="xl" color="blue.500" />
        </Flex>
      )}
      
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
                {months[selectedMonth]} {selectedYear}
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
              <StatNumber fontSize="3xl">
                {newlyPlantedData.areaPlanted.toFixed(2)} <Text as="span" fontSize="lg">ha</Text>
              </StatNumber>
              <StatHelpText>
                {months[selectedMonth]} {selectedYear}
              </StatHelpText>
            </Stat>
          </Box>
        </Stack>
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
                {months[selectedMonth]} {selectedYear}
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
              <StatNumber fontSize="3xl">
                {harvestingData.areaHarvested.toFixed(2)} <Text as="span" fontSize="lg">ha</Text>
              </StatNumber>
              <StatHelpText>
                {months[selectedMonth]} {selectedYear}
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
              <StatNumber fontSize="3xl">
                {harvestingData.volumeProduction.toFixed(2)} <Text as="span" fontSize="lg">mt</Text>
              </StatNumber>
              <StatHelpText>
                {months[selectedMonth]} {selectedYear}
              </StatHelpText>
            </Stat>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
};

export default Metrics;
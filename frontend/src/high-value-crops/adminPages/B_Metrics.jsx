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
  FormLabel,
  Tag,
  TagLabel,
  TagCloseButton,
  SimpleGrid,
  FormControl
} from "@chakra-ui/react";
import { 
  FaCalendarAlt,     
  FaCalendarDay,     
  FaMapMarkerAlt,  
  FaSeedling,        
  FaLeaf,            
  FaBoxes,
  FaChartLine,
  FaUsers      
} from "react-icons/fa";
import { useAdminDashboard } from "../store/adminDashboard.store";
import Barangays from "../../components/barangays.js";
import Commodities from "../../components/commodities.js";

const Metrics = () => {
  // Get data from the store (similar to E_Farmers.jsx)
  const { 
    availableYears, 
    availableMonths, 
    selectedYear,
    selectedMonth,
    setSelectedYear,
    setSelectedMonth,
    selectedBarangay,     
    setSelectedBarangay,  
    selectedCommodity,    
    setSelectedCommodity, 
    metricsData,
    isLoading,
    isLoadingUFRY,
    isLoadingUFRM,
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

  if (isLoadingUFRY) {
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

  // Handle filter reset
  const handleResetFilters = () => {
    setSelectedBarangay('');
    setSelectedCommodity('');
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
          Overview of planting and harvesting activities across calamba. Go to SEE MORE for farmer response sorting.
        </Text>
      
        <Flex
          direction="column"
          mb={6}
          gap={4}
          p={4}
          bg="blue.50"
          borderRadius="md"
          boxShadow="sm"
        >

          {/* Filter controls section (using SimpleGrid for responsive layout) */}
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="medium" display="flex" alignItems="center" gap={2}>
                 <Icon as={FaCalendarAlt} color="blue.500" /> Year
              </FormLabel>
              <Select
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(Number(e.target.value));
                  setSelectedBarangay("");
                  setSelectedCommodity("");
                }}
                bg="white"
                size="md"
              >
                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm" fontWeight="medium" display="flex" alignItems="center" gap={2}>
                 <Icon as={FaCalendarDay} color="blue.500" /> Month
              </FormLabel>
              <Select
                value={selectedMonth === null ? "" : selectedMonth} // Use "" for "All Months"
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedMonth(value === "" ? null : Number(value)); // Set to null for "All Months"
                }}
                bg="white"
                size="md"
                isDisabled={isLoadingUFRM || !selectedYear} // Disable if no year selected or months loading
              >
                <option value="">All Months</option> {/* Add "All Months" option */}
                {isLoadingUFRM ? (
                  <option value="" disabled>Loading months...</option>
                ) : availableMonths.length === 0 && selectedYear ? ( // Check if year is selected before showing "No months"
                  <option value="" disabled>No months available for {selectedYear}</option>
                ) : (
                  <>
                    {availableMonths.map((month) => (
                      <option key={month} value={month}>
                        {months[month - 1]}
                      </option>
                    ))}
                  </>
                )}
              </Select>
            </FormControl>  

            <FormControl>
              <FormLabel fontSize="sm" fontWeight="medium" display="flex" alignItems="center" gap={2}>
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

            <FormControl>
              <FormLabel fontSize="sm" fontWeight="medium" display="flex" alignItems="center" gap={2}>
              <Icon as={FaSeedling} color="blue.500" /> Commodity
              </FormLabel>
              <Select
                placeholder="All Commodities"
                value={selectedCommodity}
                onChange={(e) => setSelectedCommodity(e.target.value)}
                bg="white"
                size="md"
              >
                {Commodities.map((commodity) => (
                  <option key={commodity} value={commodity}>
                    {commodity}
                  </option>
                ))}
              </Select>
            </FormControl>
          </SimpleGrid>


          {/* Active filters and reset button row */}
          {(selectedBarangay || selectedCommodity) && (
            <Flex direction={{ base: "column", md: "row" }} align="center" mt={1}>
              {/* Active Filters Group */}
              <Flex align="center" gap={2} wrap="wrap">
                <Text fontWeight="medium">Active filters:</Text>
                <Flex wrap="wrap" gap={2}>
                  {selectedBarangay && (
                    <Tag size="md" borderRadius="full" variant="subtle" colorScheme="blue">
                      <TagLabel>Barangay: {selectedBarangay}</TagLabel>
                      <TagCloseButton onClick={() => setSelectedBarangay("")} />
                    </Tag>
                  )}
                  {selectedCommodity && (
                    <Tag size="md" borderRadius="full" variant="subtle" colorScheme="green">
                      <TagLabel>Commodity: {selectedCommodity}</TagLabel>
                      <TagCloseButton onClick={() => setSelectedCommodity("")} />
                    </Tag>
                  )}
                </Flex>
              </Flex>

              {/* Reset Button */}
              <Button
                colorScheme="blue"
                size="sm"
                onClick={handleResetFilters}
                ml={{ base: 0, md: "auto" }}
                mt={{ base: 2, md: 0 }}
              >
                Reset Filters
              </Button>
            </Flex>
          )}
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
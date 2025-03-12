import React, { useState } from "react";
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
} from "@chakra-ui/react";
import { FaChartLine, FaUsers, FaLeaf, FaSeedling, FaBoxes, FaCalendarAlt } from "react-icons/fa";

const Metrics = () => {
  // State for year and month filters
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  
  // Generate array of years (last 5 years)
  const years = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - i
  );
  
  // Array of months
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  // Mock data for demonstration
  const newlyPlantedData = {
    farmers: 237,
    areaPlanted: 458.5, // in hectares
  };
  
  const harvestingData = {
    farmers: 189,
    areaHarvested: 352.8, // in hectares
    volumeProduction: 2845.6, // in metric tons
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
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </Select>
            <Select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              width={{ base: "full", md: "xs" }}
              bg="white"
            >
              {months.map((month, index) => (
                <option key={index} value={index}>
                  {month}
                </option>
              ))}
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
                <StatNumber fontSize="3xl">{newlyPlantedData.areaPlanted} <Text as="span" fontSize="lg">ha</Text></StatNumber>
                <StatHelpText>
                  {months[selectedMonth]} {selectedYear}
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
                <StatNumber fontSize="3xl">{harvestingData.areaHarvested} <Text as="span" fontSize="lg">ha</Text></StatNumber>
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
                <StatNumber fontSize="3xl">{harvestingData.volumeProduction} <Text as="span" fontSize="lg">mt</Text></StatNumber>
                <StatHelpText>
                  {months[selectedMonth]} {selectedYear}
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
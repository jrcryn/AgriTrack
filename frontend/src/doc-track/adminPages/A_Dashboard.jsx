import React, { useState } from 'react';
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
  Progress,
  CircularProgress,
  CircularProgressLabel,
  Tag,
  Center,
} from "@chakra-ui/react";
import {
  FiFileText,
  FiInbox,
  FiClock,
  FiSend,
  FiActivity,
  FiCalendar,
  FiUsers,
  FiPieChart,
  FiCheckCircle,
  FiAlertCircle,
  FiBarChart2
} from "react-icons/fi";

const A_Dashboard = () => {
  // Mock data for the dashboard
  const [selectedPeriod, setSelectedPeriod] = useState('weekly');
  
  // Mock metrics data
  const metrics = {
    totalDocuments: 243,
    incomingDocuments: 46,
    pendingDocuments: 82,
    outgoingDocuments: 115,
    processingRate: 78.5,
    avgProcessingTime: 2.4, // days
    responseRate: 92
  };

  const departmentPerformance = [
    { name: 'CID OFFICE', processed: 56, pending: 12 },
    { name: 'OSDS/ASDS OFFICE', processed: 42, pending: 8 },
    { name: 'SGOD OFFICE', processed: 31, pending: 15 },
    { name: 'FINANCE', processed: 24, pending: 6 }
  ];

  return (
    <Box 
      overflow="hidden" 
      bg="white" 
      p={5} 
      minH="100vh"
    >
      <Heading as="h1" size="xl" mb={2} color="black">
        Document Tracking Metrics
      </Heading>
      <Text color="gray.600" mb={5}>
        Overview of document processing metrics and performance across all departments.
      </Text>
      
      {/* Filter Section */}
      <Flex
        direction="column"
        mb={6}
        gap={4}
        p={4}
        bg="blue.50"
        borderRadius="md"
        boxShadow="sm"
      >
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
          <FormControl>
            <FormLabel fontSize="sm" fontWeight="medium" display="flex" alignItems="center" gap={2}>
              <Icon as={FiCalendar} color="blue.500" /> Time Period
            </FormLabel>
            <Select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              bg="white"
              size="md"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
            </Select>
          </FormControl>
        </SimpleGrid>
      </Flex>

      {/* DOCUMENT OVERVIEW SECTION */}
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
            <Icon as={FiFileText} mr={2} color="blue.600" /> DOCUMENT OVERVIEW
          </Heading>
        </Flex>
      
        <Stack 
          direction={{ base: "column", md: "row" }} 
          spacing={4} 
          w="full"
        >
          {/* Total Documents */}
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
                <Icon as={FiFileText} mr={2} color="blue.500" /> Total Documents
              </StatLabel>
              <StatNumber fontSize="4xl" mb={2}>{metrics.totalDocuments}</StatNumber>
              <StatHelpText>
                Current tracking period
              </StatHelpText>
            </Stat>
          </Box>
          
          {/* Incoming Documents */}
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
                <Icon as={FiInbox} mr={2} color="green.500" /> Incoming
              </StatLabel>
              <StatNumber fontSize="4xl" mb={2}>
                {metrics.incomingDocuments}
              </StatNumber>
              <Tag colorScheme="green" size="sm">New documents</Tag>
            </Stat>
          </Box>
          
          {/* Pending Documents */}
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
                <Icon as={FiClock} mr={2} color="yellow.500" /> Pending
              </StatLabel>
              <StatNumber fontSize="4xl" mb={2}>{metrics.pendingDocuments}</StatNumber>
              <Tag colorScheme="yellow" size="sm">In process</Tag>
            </Stat>
          </Box>
          
          {/* Outgoing Documents */}
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
                <Icon as={FiSend} mr={2} color="red.500" /> Outgoing
              </StatLabel>
              <StatNumber fontSize="4xl" mb={2}>{metrics.outgoingDocuments}</StatNumber>
              <Tag colorScheme="red" size="sm">Completed</Tag>
            </Stat>
          </Box>
        </Stack>
      </Box>
      
      {/* DEPARTMENTAL PERFORMANCE */}
      <Box mb={4}>
        <Flex 
          justify="space-between" 
          align="center" 
          mb={4}
          bg="purple.50"
          p={3}
          borderRadius="md"
          borderLeftWidth="4px"
          borderLeftColor="purple.500"
        >
          <Heading as="h2" size="md" display="flex" alignItems="center">
            <Icon as={FiUsers} mr={2} color="purple.600" /> OFFICE PERFORMANCE
          </Heading>
        </Flex>
        
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
          {departmentPerformance.map((dept, index) => (
            <Box 
              key={index}
              p={4} 
              borderRadius="md" 
              boxShadow="sm" 
              bg="white"
              borderWidth="1px"
              borderColor="gray.200"
            >
              <Text fontWeight="medium" mb={2}>{dept.name}</Text>
              <Flex align="center" justify="space-between" mb={2}>
                <Flex align="center">
                  <Icon as={FiCheckCircle} color="green.500" mr={1} />
                  <Text fontSize="sm">Processed</Text>
                </Flex>
                <Text fontWeight="bold">{dept.processed}</Text>
              </Flex>
              <Flex align="center" justify="space-between">
                <Flex align="center">
                  <Icon as={FiAlertCircle} color="yellow.500" mr={1} />
                  <Text fontSize="sm">Pending</Text>
                </Flex>
                <Text fontWeight="bold">{dept.pending}</Text>
              </Flex>
              <Progress 
                value={(dept.processed / (dept.processed + dept.pending)) * 100} 
                colorScheme="purple" 
                size="sm" 
                mt={3} 
              />
            </Box>
          ))}
        </SimpleGrid>
      </Box>
      
      {/* EFFICIENCY METRICS */}
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
            <Icon as={FiBarChart2} mr={2} color="orange.600" /> PERFORMACE METRICS
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
          >
            <Stat>
              <StatLabel fontSize="md" display="flex" alignItems="center">
                <Icon as={FiClock} mr={2} color="orange.500" /> Average Processing Time
              </StatLabel>
              <StatNumber fontSize="4xl">{metrics.avgProcessingTime} <Text as="span" fontSize="lg">days</Text></StatNumber>
              <StatHelpText>
                From creation to completion
              </StatHelpText>
            </Stat>
          </Box>
          
          <Box 
            p={5} 
            borderRadius="md" 
            boxShadow="sm" 
            bg="white"
            borderWidth="1px"
            borderColor="gray.200"
          >
            <Stat>
              <StatLabel fontSize="md" display="flex" alignItems="center">
                <Icon as={FiPieChart} mr={2} color="blue.500" /> Response Rate
              </StatLabel>
              <StatNumber fontSize="4xl">{metrics.responseRate}%</StatNumber>
              <StatHelpText>
                Documents processed 
              </StatHelpText>
            </Stat>
          </Box>
        </SimpleGrid>
      </Box>
    </Box>
  );
};

export default A_Dashboard;
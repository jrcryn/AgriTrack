import React, { useState } from 'react';
import { 
  Box, Heading, Text, VStack, Button, Flex, Icon, SimpleGrid, Divider, 
  useToast, Spinner, Alert, AlertIcon, Badge
} from "@chakra-ui/react";
import { FaFileExcel, FaDownload, FaChartBar } from 'react-icons/fa';
import { useAdminDashboard } from '../store/adminDashboard.store';

const GenReports = () => {
  const { isGeneratingReport, generateMachineryReport, isLoading, error } = useAdminDashboard();
  const toast = useToast();

  const buildFilename = () => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const cur = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
    return `machinery-monthly-report-${cur}.xlsx`;
  };

  const handleGenerateUsageReport = async () => {
    try {
      // Request and download (backend decides the period; defaults to current month)
      const blob = await generateMachineryReport();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', buildFilename());
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Report generated',
        description: 'Monthly usage report has been downloaded.',
        status: 'success',
        duration: 4000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error generating report',
        description: error.message || 'Please try again later',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <Box overflow="hidden" bg="white" p={5} minH="100vh">
        <Heading as="h1" size="xl" mb={2} color="black">
          Generate Reports
        </Heading>
        <Alert 
          bgColor="green.100"
          borderRadius="md" 
          mt={4}
          display="flex"
          alignItems="center"
          py={3}
        >
          <AlertIcon color="green.500"/>
          <Text fontWeight="medium" mr={3}>Please Wait:</Text>
          <Spinner size="md" thickness="3px" color="green.500" mr={3} />
          <Text>Loading Machinery Data...</Text>
        </Alert>
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Box overflow="hidden" bg="white" p={5} minH="100vh">
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <Heading as="h2" size="md">Error loading data!</Heading>
          <Text mt={2}>
            {error || "Unable to load machinery data. Please try again later."}
          </Text>
        </Alert>
      </Box>
    );
  }

  return (
    <Box overflow="hidden" bg="white" p={5} minH="100vh">
      <Heading as="h1" size="xl" mb={2}>
        Generate Reports
      </Heading>
      <Text color="gray.600" mb={5}>
        Generate Excel reports for monthly machinery usage.
      </Text>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
        {/* Usage Report Generation Section */}
        <Box>
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
              <Icon as={FaFileExcel} mr={2} color="green.600" /> MACHINERY MONTHLY USAGE REPORT
            </Heading>
          </Flex>
          
          <Box 
            p={6}
            borderRadius="lg" 
            boxShadow="sm" 
            borderWidth="1px" 
            borderColor="gray.200"
          >
            <VStack spacing={5} align="stretch">
              <Text>
                Generate a report of completed ticket requests and completed extensions. Each month gets its own sheet
                with rows for Farmer, Barangay, Farm Location, Area, and Type (Ticket/Extension), plus a barangay coverage summary.
              </Text>

              <Divider />

              <Button
                colorScheme="green"
                leftIcon={<FaDownload />}
                onClick={handleGenerateUsageReport}
                isLoading={isGeneratingReport}
                loadingText="Generating..."
                size="lg"
                width="100%"
              >
                Generate Usage Report
              </Button>
            </VStack>
          </Box>
        </Box>
        
        {/* Information Section */}
        <Box>
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
              <Icon as={FaChartBar} mr={2} color="blue.600" /> REPORT INFORMATION
            </Heading>
          </Flex>
          
          <Box 
            p={6}
            borderRadius="lg" 
            boxShadow="sm" 
            borderWidth="1px" 
            borderColor="gray.200"
          >
            <VStack spacing={5} align="stretch">
              <Text>
                The report contains a Summary sheet and monthly sheets generated automatically by the backend
                (current month by default).
              </Text>
              
              <Box>
                <Heading size="sm" mb={2}>Each monthly sheet includes:</Heading>
                <VStack align="start" spacing={2}>
                  <Flex align="center">
                    <Badge colorScheme="green" mr={2}>Completed Tickets</Badge>
                    <Text fontSize="sm">Farmer, Barangay, Farm Location, Area (Estimated)</Text>
                  </Flex>
                  <Flex align="center">
                    <Badge colorScheme="purple" mr={2}>Completed Extensions</Badge>
                    <Text fontSize="sm">Farmer, Barangay, Farm Location, Area (Remaining)</Text>
                  </Flex>
                  <Flex align="center">
                    <Badge colorScheme="orange" mr={2}>Barangay Coverage</Badge>
                    <Text fontSize="sm">Count of completed entries per barangay for the month</Text>
                  </Flex>
                </VStack>
              </Box>
              
              {/* <Divider />
              
              {/* <Text fontSize="sm" fontStyle="italic">
                Formatted with proper spacing, borders, and headers for printing and sharing.
              </Text> */} 
            </VStack>
          </Box>
        </Box>
      </SimpleGrid>
    </Box>
  );
};

export default GenReports;
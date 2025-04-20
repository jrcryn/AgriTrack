import React, { useState } from 'react';
import { 
  Box, Heading, Text, VStack, Button, Flex, Icon, SimpleGrid, Divider, 
  useToast, Spinner, Alert, AlertIcon, Badge
} from "@chakra-ui/react";
import { FaFileExcel, FaDownload, FaTools, FaChartBar } from 'react-icons/fa';
import { useAdminDashboard } from '../store/adminDashboard.store';

const GenReports = () => {
  const { isGeneratingReport, generateExcelReport, isLoading, error, machineryUnits } = useAdminDashboard();
  const toast = useToast();

  const handleGenerateReport = async () => {
    try {
      // Request the report data from the server
      const reportData = await generateExcelReport();

      // Handle the download in the component (UI concern)
      const url = window.URL.createObjectURL(new Blob([reportData]));
      const link = document.createElement('a');

      const date = new Date().toISOString().split('T')[0];
      const filename = `As_Of_${date}.xlsx`;

      link.href = url;
      link.setAttribute('download', `Machinery_Inventory_${filename}`); //  file name
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      
      toast({
        title: "Success!",
        description: reportData.message || "Machinery inventory report has been generated and downloaded",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error generating report:", error);
      toast({
        title: "Error generating report",
        description: error.message || "Please try again later",
        status: "error",
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
        Generate Excel reports for machinery inventory and allocation.
      </Text>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
        {/* Excel Report Generation Section */}
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
              <Icon as={FaFileExcel} mr={2} color="green.600" /> MACHINERY INVENTORY REPORT
            </Heading>
          </Flex>
          
          <Box 
            p={6}
            borderRadius="lg" 
            boxShadow="sm" 
            borderWidth="1px" 
            borderColor="gray.200"
          >
            <VStack spacing={6} align="stretch">
              <Text>
                Generate a machinery inventory report showing all units, their functional status, and barangay allocations.
              </Text>
              
              <Box bg="blue.50" p={4} borderRadius="md">
                <Flex align="center">
                  <Icon as={FaTools} color="blue.500" mr={2} />
                  <Text fontWeight="medium">
                    {machineryUnits.length} machines currently registered in the system.
                  </Text>
                </Flex>
              </Box>
              
              <Divider my={2} />
              
              <Button
                colorScheme="green"
                leftIcon={<FaDownload />}
                onClick={handleGenerateReport}
                isLoading={isGeneratingReport}
                loadingText="Generating..."
                size="lg"
                width="100%"
              >
                Generate Report
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
                This report contains comprehensive data about machinery inventory and their allocation across all barangays.
              </Text>
              
              <Box>
                <Heading size="sm" mb={2}>Report Contains:</Heading>
                <VStack align="start" spacing={2}>
                  <Flex align="center">
                    <Badge colorScheme="green" mr={2}>Machinery Units</Badge>
                    <Text fontSize="sm">Complete list of all registered machinery types</Text>
                  </Flex>
                  <Flex align="center">
                    <Badge colorScheme="blue" mr={2}>Functional Status</Badge>
                    <Text fontSize="sm">Number of functional and non-functional units per type</Text>
                  </Flex>
                  <Flex align="center">
                    <Badge colorScheme="orange" mr={2}>Barangay Allocation</Badge>
                    <Text fontSize="sm">Distribution of machinery across all barangays</Text>
                  </Flex>
                  <Flex align="center">
                    <Badge colorScheme="purple" mr={2}>Color Coding</Badge>
                    <Text fontSize="sm">Functional (green) and non-functional (red) units clearly marked</Text>
                  </Flex>
                </VStack>
              </Box>
              
              <Divider />
              
              <Text fontSize="sm" fontStyle="italic">
                The generated Excel file is formatted for easy printing and sharing.
                All machinery and their allocations are current as of the report generation date.
              </Text>
            </VStack>
          </Box>
        </Box>
      </SimpleGrid>
    </Box>
  );
};

export default GenReports;
import React, { useState, useEffect } from 'react';
import { 
  Box, Container, Heading, Text, VStack, Button, FormControl, FormLabel, 
  Select, HStack, useToast, Flex, Icon, SimpleGrid, Card, CardHeader,
  CardBody, Divider, Spinner, Alert, AlertIcon, Badge
} from "@chakra-ui/react";
import { FaFileExcel, FaDownload, FaCalendarAlt, FaChartBar } from 'react-icons/fa';
import axios from 'axios';
import { useAdminDashboard } from '../store/adminDashboard.store';

const C_GenReports = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingRanges, setLoadingRanges] = useState(false);
  const [dateRanges, setDateRanges] = useState([]);
  const [selectedRange, setSelectedRange] = useState('');
  const [error, setError] = useState(null);
  
  const { 
    availableYears, 
    availableMonths, 
    selectedYear, 
    selectedMonth,
    setSelectedYear,
    setSelectedMonth
  } = useAdminDashboard();
  
  const toast = useToast();
  const API_URL = import.meta.env.VITE_API_URL;

  // Fetch available date ranges when year and month change
  useEffect(() => {
    const fetchDateRanges = async () => {
      if (!selectedYear || !selectedMonth) return;
      
      setLoadingRanges(true);
      setError(null);
      
      try {
        const response = await axios.get(`${API_URL}/report-date-ranges/${selectedYear}/${selectedMonth}`);
        setDateRanges(response.data);
        // Auto-select the first date range if available
        if (response.data.length > 0) {
          setSelectedRange(`${response.data[0].startDate}_${response.data[0].endDate}`);
        } else {
          setSelectedRange('');
        }
      } catch (err) {
        console.error("Error fetching date ranges:", err);
        setError("Failed to load available date ranges. Please try again.");
        setDateRanges([]);
        setSelectedRange('');
      } finally {
        setLoadingRanges(false);
      }
    };
    
    fetchDateRanges();
  }, [selectedYear, selectedMonth, API_URL]);

  const handleGenerateReport = async () => {
    if (!selectedRange) {
      toast({
        title: "Missing information",
        description: "Please select a date range",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    const [startDate, endDate] = selectedRange.split('_');
    
    setIsLoading(true);
    
    try {
      const response = await axios.post(
        `${API_URL}/generate-excel-report`, 
        { 
          startDate, 
          endDate,
          reportType: 'weekly' // Always using weekly report type
        },
        { responseType: 'blob' } // Important for file download
      );
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      
      // Format filename with date range
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);
      const formattedStartDate = startDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const formattedEndDate = endDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      
      link.href = url;
      link.setAttribute('download', `HVC_Report_${formattedStartDate}_to_${formattedEndDate}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast({
        title: "Success!",
        description: "Report has been generated and downloaded",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error generating report:", error);
      toast({
        title: "Error generating report",
        description: error.response?.data?.message || "Please try again later",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box bg="white" p={5}>
      <Heading as="h1" size="xl" mb={2}>
        Generate Reports
      </Heading>
      <Text color="gray.600" mb={5}>
        Generate Excel reports based on farmer submissions.
      </Text>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
        {/* Excel Report Generation Card */}
        <Card borderRadius="lg" boxShadow="md" borderWidth="1px" borderColor="gray.200">
          <CardHeader bg="green.50" borderBottomWidth="1px" borderColor="gray.200">
            <Flex align="center">
              <Icon as={FaFileExcel} color="green.500" boxSize={6} mr={3} />
              <Heading size="md">HVC Supply and Market Profile Report</Heading>
            </Flex>
          </CardHeader>
          
          <CardBody p={6}>
            <VStack spacing={6} align="stretch">
              <Text>Generate weekly reports using the HVC template with data from farmer submissions.</Text>
              
              <HStack spacing={4} align="flex-start">
                <FormControl>
                  <FormLabel fontWeight="medium">Year</FormLabel>
                  <Select
                    value={selectedYear || ''}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    isDisabled={!availableYears || availableYears.length === 0}
                  >
                    {availableYears && availableYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl>
                  <FormLabel fontWeight="medium">Month</FormLabel>
                  <Select
                    value={selectedMonth || ''}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    isDisabled={!availableMonths || availableMonths.length === 0}
                  >
                    {availableMonths && availableMonths.map(month => (
                      <option key={month} value={month}>
                        {new Date(0, month - 1).toLocaleString('default', { month: 'long' })}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </HStack>
              
              <FormControl>
                <FormLabel fontWeight="medium" display="flex" alignItems="center">
                  <Icon as={FaCalendarAlt} mr={2} color="gray.600" />
                  Date Range
                </FormLabel>
                
                {loadingRanges ? (
                  <Flex justify="center" py={4}>
                    <Spinner />
                  </Flex>
                ) : error ? (
                  <Alert status="error" borderRadius="md">
                    <AlertIcon />
                    {error}
                  </Alert>
                ) : dateRanges.length === 0 ? (
                  <Alert status="info" borderRadius="md">
                    <AlertIcon />
                    No date ranges available for the selected year and month
                  </Alert>
                ) : (
                  <Select 
                    value={selectedRange}
                    onChange={(e) => setSelectedRange(e.target.value)}
                  >
                    {dateRanges.map(range => (
                      <option key={range.id} value={`${range.startDate}_${range.endDate}`}>
                        {range.label}
                      </option>
                    ))}
                  </Select>
                )}
              </FormControl>
              
              <Divider my={2} />
              
              <Button
                colorScheme="green"
                leftIcon={<FaDownload />}
                onClick={handleGenerateReport}
                isLoading={isLoading}
                loadingText="Generating..."
                size="lg"
                width="100%"
                isDisabled={!selectedRange || loadingRanges}
              >
                Generate Weekly Report
              </Button>
            </VStack>
          </CardBody>
        </Card>
        
        {/* Information Card */}
        <Card borderRadius="lg" boxShadow="md" borderWidth="1px" borderColor="gray.200">
          <CardHeader bg="blue.50" borderBottomWidth="1px" borderColor="gray.200">
            <Flex align="center">
              <Icon as={FaChartBar} color="blue.500" boxSize={6} mr={3} />
              <Heading size="md">Report Information</Heading>
            </Flex>
          </CardHeader>
          
          <CardBody p={6}>
            <VStack spacing={5} align="stretch">
              <Text>
                These reports contain data from farmer submissions that have been validated and processed 
                into the unified records system.
              </Text>
              
              <Box>
                <Heading size="sm" mb={2}>Report Contains:</Heading>
                <VStack align="start" spacing={2}>
                  <Flex align="center">
                    <Badge colorScheme="green" mr={2}>Harvesting Data</Badge>
                    <Text fontSize="sm">Shows harvested crops during the selected period</Text>
                  </Flex>
                  <Flex align="center">
                    <Badge colorScheme="blue" mr={2}>Plantation Data</Badge>
                    <Text fontSize="sm">Shows newly planted crops during the selected period</Text>
                  </Flex>
                  <Flex align="center">
                    <Badge colorScheme="purple" mr={2}>Farmer Details</Badge>
                    <Text fontSize="sm">Farmer information, barangays, and farm locations</Text>
                  </Flex>
                </VStack>
              </Box>
              
              <Divider />
              
              <Text fontSize="sm" fontStyle="italic">
                The report uses the official HVC Supply and Market Profile template format.
                Generated Excel files can be edited after download if additional customization is needed.
              </Text>
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>
    </Box>
  );
};

export default C_GenReports;
import React, { useState, useEffect } from 'react';
import { 
  Box, Heading, Text, VStack, Button, FormControl, FormLabel, 
  Select, HStack, useToast, Flex, Icon, SimpleGrid, Divider, 
  Spinner, Alert, AlertIcon, Badge, AlertTitle, AlertDescription, Tag, TagCloseButton, TagLabel,
  Menu, MenuButton, MenuList, Checkbox, CheckboxGroup
} from "@chakra-ui/react";
import { FaFileExcel, FaDownload, FaCalendarAlt, FaChartBar, FaMapMarkerAlt, FaChevronDown } from 'react-icons/fa';
import { useAdminDashboard } from '../store/adminDashboard.store';
import { useAuthStore } from '../../auth/store/authStore';

const B_HVCSaMPR = () => {
  const [selectedRange, setSelectedRange] = useState('');
  const [selectedBarangays, setSelectedBarangays] = useState([]); // array of selected brgys
  
  const { user } = useAuthStore();
  const { 
    availableYears, 
    availableMonths, 
    selectedYear, 
    selectedMonth,
    setSelectedYear,
    setSelectedMonth,
    dateRanges,
    barangays,
    isLoading,
    isLoadingUFRY,
    isLoadingUFRM,
    isLoadingBarangays,
    isGeneratingReport, 
    generateHVCSaMPR, 
    ufrYearsError, 
    ufrMonthsError,
    dateRangesError,
    barangaysError, 
  } = useAdminDashboard();
  
  const toast = useToast();

  // Reset selectedMonth when year changes
  useEffect(() => {
    // Reset month selection when year changes
    setSelectedMonth(null);
    // Also reset the selected range
    setSelectedRange('');
  }, [selectedYear, setSelectedMonth]);

  // Reset selectedBarangay when year or month changes
  useEffect(() => {
    setSelectedBarangays([]);
  }, [selectedYear, selectedMonth]);

  // Auto-select the first available month when availableMonths changes and there's no month selected
  useEffect(() => {
    if (availableMonths && availableMonths.length > 0 && !selectedMonth) {
      setSelectedMonth(availableMonths[0]);
    }
  }, [availableMonths, selectedMonth, setSelectedMonth]);

  // Update selected range when date ranges change
  useEffect(() => {
    if (dateRanges && dateRanges.length > 0) {
      setSelectedRange(`${dateRanges[0].startDate}_${dateRanges[0].endDate}`);
    } else {
      setSelectedRange('');
    }
  }, [dateRanges]);

  // Handle year change 
  const handleYearChange = (e) => {
    const newYear = Number(e.target.value);
    setSelectedYear(newYear);
  };

  // Handle month change
  const handleMonthChange = (e) => {
    const newMonth = Number(e.target.value);
    setSelectedMonth(newMonth);
  };

  const handleBarangaysChange = (eOrValues) => {
    // Allow both old <Select multiple> event and CheckboxGroup array
    if (Array.isArray(eOrValues)) {
      const values = eOrValues.map(String);
      setSelectedBarangays(values);
      return;
    }
    const values = Array.from(eOrValues.target.selectedOptions, (o) => String(o.value));
    setSelectedBarangays(values);
  };

  const handleResetFilters = () => {
    setSelectedBarangays([]);
  };

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
    
    if (selectedBarangays.length === 0) {
      toast({
        title: "Missing information",
        description: "Please select at least one barangay",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    if (dateRanges.length === 0) {
      toast({
        title: "No data available",
        description: "There are no date ranges available for the selected period",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    const [startDate, endDate] = selectedRange.split('_');
    
    try {
      // Now use the function from the store, passing employee ID and barangays
      const reportData = await generateHVCSaMPR(startDate, endDate, selectedBarangays, user?.id);
      
      // Handle the download in the component (UI concern)
      const url = window.URL.createObjectURL(new Blob([reportData]));
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
      toast({
        title: "Error generating report",
        description: error.response?.data?.message || "Please try again later",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (isLoadingUFRY) {
      return (
        <Box 
          overflow="hidden" 
          bg="white" 
          p={5} 
          minH="100vh"
        >
          <Heading as="h1" size="xl" mb={2} color="black">
            Generate Reports
          </Heading>
          <Alert 
            bgColor={"green.100"}
            borderRadius="md" 
            mt={4}
            display="flex"
            alignItems="center"
            py={3}
          >
            <AlertIcon color="green.500"/>
            <Text fontWeight="medium" mr={3}>Please Wait:</Text>
            <Spinner size="md" thickness="3px" color="green.500" mr={3} />
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
            Generate Reports
          </Heading>
          <Alert status="info" borderRadius="md" mt={4} bgColor={"green.100"}>
            <AlertIcon color="green.500"/>
            <AlertTitle>No data available!</AlertTitle>
            <AlertDescription>
              There are currently no metrics data available. Please check back later or add some farmer records.
            </AlertDescription>
          </Alert>
        </Box>
      );
    }

  // Show error state
  if (ufrYearsError) {
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
            {ufrYearsError || "Unable to load metrics data. Please try again later."}
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
    <Heading as="h1" size="xl" mb={2}>
      Generate Reports
    </Heading>
    <Text color="gray.600" mb={5}>
      Generate Excel reports based on farmer submissions.
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
            <Icon as={FaFileExcel} mr={2} color="green.600" /> HVC SUPPLY AND MARKET PROFILE REPORT
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
            <Text>Generate bi-weekly reports using the HVC template with data from farmer submissions.</Text>

            <HStack spacing={4} align="flex-start">
              <FormControl>
                <FormLabel fontWeight="medium">Year</FormLabel>
                <Select
                  value={selectedYear || ''}
                  onChange={handleYearChange}
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
                  onChange={handleMonthChange}
                  isDisabled={isLoadingUFRM || !availableMonths || availableMonths.length === 0}
                >
                  {isLoadingUFRM ? (
                    <option value="">Loading months...</option>
                  ) : availableMonths && availableMonths.length > 0 ? (
                    availableMonths.map(month => (
                      <option key={month} value={month}>
                        {new Date(0, month - 1).toLocaleString('default', { month: 'long' })}
                      </option>
                    ))
                  ) : (
                    <option value="">No months available</option>
                  )}

                  {ufrMonthsError && (
                    <option value="" disabled>Error loading months...</option>
                  )}
                </Select>
              </FormControl>
            </HStack>

            {/* Stack Barangay selector and Active Filters vertically */}
            <Flex direction="column">
              <FormControl mb={2}>
                <FormLabel fontWeight="medium" display="flex" alignItems="center">
                  <Icon as={FaMapMarkerAlt} mr={2} color="gray.600" />
                  Barangay
                </FormLabel>

                {selectedYear && selectedMonth ? (
                  isLoadingBarangays ? (
                    <Flex justify="center" py={4}>
                      <Spinner color="green.500" size="md" thickness="3px" />
                      <Text ml={3}>Loading available barangays...</Text>
                    </Flex>
                  ) : (barangays && barangays.length > 0) ? (
                    // Replaced <Select multiple> with a checkable dropdown
                    <Menu closeOnSelect={false} isLazy>
                      <MenuButton
                        as={Button}
                        variant="outline"
                        rightIcon={<FaChevronDown />}
                        width="100%"
                        justifyContent="space-between"
                        fontWeight={'normal'}
                        textAlign="left"
                      >
                        {selectedBarangays.length > 0
                          ? `${selectedBarangays.length} selected`
                          : 'Select Barangay/s'}
                      </MenuButton>
                      <MenuList maxH="16rem" overflowY="auto" minW="sm" p={2}>
                        <HStack justify="space-between" mb={2}>
                          <Button
                            size="xs"
                            variant="outline"
                            colorScheme='blue'
                            onClick={() => handleBarangaysChange(barangays.map(String))}
                          >
                            Select all
                          </Button>
                        </HStack>
                        <CheckboxGroup value={selectedBarangays} onChange={handleBarangaysChange}>
                          <VStack align="stretch" spacing={1}>
                            {barangays.map((b) => (
                              <Checkbox key={b} value={String(b)}>
                                {b}
                              </Checkbox>
                            ))}
                          </VStack>
                        </CheckboxGroup>
                      </MenuList>
                    </Menu>
                  ) : (
                    <Alert status="info" borderRadius="md">
                      <AlertIcon />
                      No barangays available for the selected period
                    </Alert>
                  )
                ) : (
                  <Alert status="info" borderRadius="md">
                    <AlertIcon />
                    Please select both a year and month first
                  </Alert>
                )}

                {barangaysError && (
                  <Alert status="error" borderRadius="md" mt={2}>
                    <AlertIcon />
                    Error loading barangays...
                  </Alert>
                )}
              </FormControl>

              {(selectedBarangays.length > 0) && (
                <Flex direction={{ base: "column", md: "row" }} align="center" mt={2}>
                  {/* Active Filters Group */}
                  <Flex align="center" gap={2} wrap="wrap">
                    <Text fontWeight="medium" fontSize={'sm'}>Active selection/s:</Text>
                    <Flex wrap="wrap" gap={2}>
                      {selectedBarangays.map((b) => (
                        <Tag key={b} size="md" borderRadius="full" variant="subtle" colorScheme="blue">
                          <TagLabel fontSize={'sm'}>{b}</TagLabel>
                          <TagCloseButton
                            onClick={() =>
                              setSelectedBarangays((prev) => prev.filter((x) => x !== b))
                            }
                          />
                        </Tag>
                      ))}
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
                    Reset
                  </Button>
                </Flex>
              )}
            </Flex>
            
            <FormControl>
              <FormLabel fontWeight="medium" display="flex" alignItems="center">
                <Icon as={FaCalendarAlt} mr={2} color="gray.600" />
                Date Range
              </FormLabel>
              
              {selectedYear && selectedMonth ? (
                isLoading ? (
                  <Flex justify="center" py={4}>
                    <Spinner color="green.500" size="md" thickness="3px" />
                    <Text ml={3}>Loading available date ranges...</Text>
                  </Flex>
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
                )
              ) : (
                <Alert status="info" borderRadius="md">
                  <AlertIcon />
                  Please select both a year and month first
                </Alert>
              )}

              {dateRangesError && (
                <Alert status="error" borderRadius="md" mt={2}>
                  <AlertIcon />
                  Error loading date ranges...
                </Alert>
              )}
            </FormControl>
            
            <Divider my={2} />
            
            <Button
              colorScheme="green"
              leftIcon={<FaDownload />}
              onClick={handleGenerateReport}
              isLoading={isGeneratingReport}
              loadingText="Generating..."
              size="lg"
              width="100%"
              isDisabled={!selectedMonth || dateRanges.length === 0 || isLoading || selectedBarangays.length === 0 || isLoadingBarangays}
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
                These reports contain data from farmer submissions that have been validated and processed 
                into the records system.
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
                Generated Excel files can be edited afterwards if additional customization is needed.
              </Text>
            </VStack>
          </Box>
        </Box>
      </SimpleGrid>
    </Box>
  );
};

export default B_HVCSaMPR;
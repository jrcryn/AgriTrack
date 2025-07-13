import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  HStack,
  VStack,
  Flex,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  InputGroup,
  Input,
  InputRightElement,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  useDisclosure,
  Divider,
  Tag,
  Icon,
  Spinner,
  FormControl,
  FormLabel,
  SimpleGrid,
  Select,
  InputRightAddon,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Checkbox,
} from '@chakra-ui/react';
import numOfTreesToHectares from '../../components/conversions.js';
import { FaSearch, FaEye, FaSeedling, FaBoxes, FaUser, FaLeaf, FaWifi, FaUpload } from 'react-icons/fa';
import { useAdminDashboard } from '../store/adminDashboard.store.js';
import { useQueryClient } from '@tanstack/react-query';

const Responses = () => {
  // States for search and pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [newlyPlantedPage, setNewlyPlantedPage] = useState(1);
  const [harvestingPage, setHarvestingPage] = useState(1);
  const [selectedResponse, setSelectedResponse] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [selectedNewlyPlanted, setSelectedNewlyPlanted] = useState([]);
  const [selectedHarvesting, setSelectedHarvesting] = useState([]);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  
  // Unvalidated farmer inputs
  const { 
    unvalidatedInputs, 
    isLoading,
    isCreatingUnifiedResponse,
    error,
    updateFarmerInput,
    clearError,
    createUnifiedFarmerResponse,
  } = useAdminDashboard();

  const toast = useToast();
  const queryClient = useQueryClient();


  // Filter responses based on search query
  const searchedResponses = unvalidatedInputs.filter((response) => {
    if (!response.farmerInput || !response.cropType || !response.cropRecord) {
      return false;
    }
    
    const farmerName = `${response.farmerInput.surname} ${response.farmerInput.first_name}`.toLowerCase();
    const cropType = response.cropType?.crop_type.toLowerCase() || '';
    const location = response.farmerInput.farm_location?.toLowerCase() || '';
    
    return farmerName.includes(searchQuery.toLowerCase()) ||
           cropType.includes(searchQuery.toLowerCase()) ||
           location.includes(searchQuery.toLowerCase());
  });

  // Date format for harvest date, plantation date, and month-year
  const plnt_harvDate = { year: 'numeric', month: 'short', day: 'numeric' };
  const harvMonthYear = { year: 'numeric', month: 'short' };
  const harvMonthYearFull = { year: 'numeric', month: 'long' };
  
  // Split data into newly planted and harvesting
  const newlyPlantedResponses = searchedResponses.filter(
    response => response.cropRecord.crop_stage === 'NEWLY PLANTED'
  );
  
  const harvestingResponses = searchedResponses.filter(
    response => response.cropRecord.crop_stage === 'HARVESTING'
  );
  
  // Pagination calculation for newly planted
  const currentNewlyPlanted = newlyPlantedResponses.slice((newlyPlantedPage - 1) * 5, newlyPlantedPage * 5);
  const newlyPlantedTotalPages = Math.ceil(newlyPlantedResponses.length / 5);
  
  // Pagination calculation for harvesting
  const currentHarvesting = harvestingResponses.slice((harvestingPage - 1) * 5, harvestingPage * 5);
  const harvestingTotalPages = Math.ceil(harvestingResponses.length / 5);
  
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
              {error || "Unable to load new farmer responses. Please try again later."}
            </AlertDescription>
          </Alert>
        </Box>
      );
    }

    const handleSelectNewlyPlanted = (id) => {
      setSelectedNewlyPlanted(prev => 
        prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
      );
    };
    
    const handleSelectAllNewlyPlanted = (items) => {
      if (selectedNewlyPlanted.length === currentNewlyPlanted.length) {
        setSelectedNewlyPlanted([]);
      } else {
        setSelectedNewlyPlanted(items.map(item => item.farmerInput._id));
      }
    };
    
    const handleSelectHarvesting = (id) => {
      setSelectedHarvesting(prev => 
        prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
      );
    };
    
    const handleSelectAllHarvesting = (items) => {
      if (selectedHarvesting.length === currentHarvesting.length) {
        setSelectedHarvesting([]);
      } else {
        setSelectedHarvesting(items.map(item => item.farmerInput._id));
      }
    };
  
    // Function to handle batch processing of responses
    const handleBatchPush = async (selectedIds, responses, type) => {
      if (selectedIds.length === 0) {
        toast({
          title: "No items selected",
          description: "Please select at least one response to push to records.",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      setIsBatchProcessing(true);
      
      try {
        let successCount = 0;
        let failCount = 0;
        
        // Find selected responses
        const selectedResponses = responses.filter(response => 
          selectedIds.includes(response.farmerInput._id)
        );
        
        // Process each response
        for (const response of selectedResponses) {
          try {
            const responseData = formatResponseDataForPush(response);
            await createUnifiedFarmerResponse(responseData);
            successCount++;
          } catch (error) {
            console.error(`Error processing response ${response.farmerInput._id}:`, error);
            failCount++;
          }
        }
        
        // Show results
        toast({
          title: "Batch processing complete",
          description: `Successfully pushed ${successCount} responses. Failed: ${failCount}.`,
          status: successCount > 0 ? "success" : "error",
          duration: 5000,
          isClosable: true,
        });
        
        // Clear selections after processing
        if (type === 'NEWLY_PLANTED') {
          setSelectedNewlyPlanted([]);
        } else {
          setSelectedHarvesting([]);
        }
        
        // Refresh the data
        queryClient.invalidateQueries({ queryKey: ['unvalidatedInputs'] });
        
      } catch (error) {
        toast({
          title: "Error",
          description: "An error occurred during batch processing.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        console.error("Batch processing error:", error);
      } finally {
        setIsBatchProcessing(false);
      }
    };

    // Helper function to format response data for pushing
    const formatResponseDataForPush = (selectedResponse) => {
      const isIndustrialCrop = selectedResponse.cropType?.crop_type === 'VEGETABLES, ROOT CROPS AND OTHER INDUSTRIAL CROPS';
      const isNewlyPlanted = selectedResponse.cropRecord?.crop_stage === 'NEWLY PLANTED';
      
      // Format response data
      const responseData = {
        farmer_account_id: selectedResponse.farmerInput.farmer_account_id._id,
        farm_location: selectedResponse.farmerInput.farm_location || "",
        crop_type: selectedResponse.cropType.crop_type,
        commodity: isIndustrialCrop ? 
          (selectedResponse.cropRecord.crop_type || "") : 
          (selectedResponse.cropRecord.crop_variety || ""),
        crop_stage: selectedResponse.cropRecord.crop_stage,
        original_farmer_input_id: selectedResponse.farmerInput._id
      };
      
      // Add stage-specific details
      if (isNewlyPlanted) {
        // Add newly planted details
        if (selectedResponse.cropDetails?.plantation_start_date) {
          responseData.plantation_start_date = selectedResponse.cropDetails.plantation_start_date;
        }
        
        if (selectedResponse.cropDetails?.plantation_end_date) {
          responseData.plantation_end_date = selectedResponse.cropDetails.plantation_end_date;
        }
        
        if (selectedResponse.cropDetails?.harvest_month_year) {
          responseData.harvest_month_year = selectedResponse.cropDetails.harvest_month_year;
        }
        
        if (isIndustrialCrop) {
          responseData.total_area_planted = selectedResponse.cropDetails?.total_area_planted || 0;
        } else if (selectedResponse.cropDetails?.total_trees && selectedResponse.cropRecord?.crop_variety) {
          const hectaresNew = numOfTreesToHectares(
            selectedResponse.cropRecord.crop_variety, 
            selectedResponse.cropDetails.total_trees
          );
          responseData.total_area_trees_planted = hectaresNew ? Number(hectaresNew.toFixed(4)) : null;
        }
      } else {
        // Add harvesting details
        if (selectedResponse.cropDetails?.harvest_start_date) {
          responseData.harvest_start_date = selectedResponse.cropDetails.harvest_start_date;
        }
        
        if (selectedResponse.cropDetails?.harvest_end_date) {
          responseData.harvest_end_date = selectedResponse.cropDetails.harvest_end_date;
        }
        
        responseData.total_weight = selectedResponse.cropDetails?.total_weight || 0;
        responseData.crop_purpose = selectedResponse.cropDetails?.crop_purpose || "UNKNOWN";
        
        if (selectedResponse.cropDetails?.crop_purpose === 'PANG BENTA') {
          responseData.destination = selectedResponse.cropDetails?.destination || "";
          responseData.mode_of_payment = selectedResponse.cropDetails?.mode_of_payment || "";
          responseData.mode_of_delivery = selectedResponse.cropDetails?.mode_of_delivery || "";
        }
        
        if (isIndustrialCrop) {
          responseData.total_area_harvested = selectedResponse.cropDetails?.total_area_harvested || 0;
        } else if (selectedResponse.cropDetails?.trees_harvested && selectedResponse.cropRecord?.crop_variety) {
          const hectaresHarv = numOfTreesToHectares(
            selectedResponse.cropRecord.crop_variety, 
            selectedResponse.cropDetails.trees_harvested
          );
          responseData.total_area_trees_harvested = hectaresHarv ? Number(hectaresHarv.toFixed(4)) : null;
        }
      }
      
      return responseData;
    };

  // Table component to reuse for both sections
  const ResponseTable = ({ data, status, selectedItems, onSelectItem, onSelectAll }) => {

    const isNewlyPlanted = status === 'NEWLY PLANTED';
    const allSelected = data.length > 0 && data.every(item => selectedItems?.includes(item.farmerInput._id));

    return(
        <TableContainer>
          <Table variant="simple">
            <Thead bg="gray.50">
              <Tr>
                <Th width="50px">
                  <Checkbox 
                    isChecked={allSelected}
                    onChange={() => onSelectAll(data)}
                    colorScheme={isNewlyPlanted ? "green" : "orange"}
                  />
                </Th>
                <Th>Farmer Name</Th>
                <Th>Farm Location</Th>
                {status === 'NEWLY PLANTED' ? (
                  <>
                    <Th>Commodity</Th>
                    <Th>
                      <Text>Date of</Text>
                      <Text>Plantation</Text>
                    </Th>
                    <Th>
                      <Text>Total Area</Text>
                      <Text>Planted</Text>
                    </Th>
                    <Th position={{ base: 'static', md: 'sticky' }} right={0} bg="gray.50" zIndex={{ base: 0, md: 1 }} textAlign={'center'}>
                      <Box display={{ base: 'none', md: 'block' }}>Scroll →</Box>
                      <Box display={{ base: 'block', md: 'none' }}>Actions</Box>
                    </Th>
                  </>
                  
                ) : (
                  <>
                    <Th>Commodity</Th>
                    <Th>
                      <Text>Date of</Text>
                      <Text>Harvesting</Text>
                    </Th>
                    <Th>
                      <Text>Total Area</Text>
                      <Text>Harvested</Text>
                    </Th>
                    <Th position={{ base: 'static', md: 'sticky' }} right={0} bg="gray.50" zIndex={{ base: 0, md: 1 }} textAlign={'center'}>
                      <Box display={{ base: 'none', md: 'block' }}>Scroll →</Box>
                      <Box display={{ base: 'block', md: 'none' }}>Actions</Box>
                    </Th>
                  </>
                )}
                
              </Tr>
            </Thead>
            <Tbody>
              {data.length > 0 ? (
                data.map((response, index) => (
                  <Tr key={response.farmerInput._id || index}>
                    <Td>
                      <Checkbox
                        isChecked={selectedItems?.includes(response.farmerInput._id)}
                        onChange={() => onSelectItem(response.farmerInput._id)}
                        colorScheme={isNewlyPlanted ? "green" : "orange"}
                      />
                    </Td>
                    <Td fontWeight="medium">
                    {`${response.farmerInput?.farmer_account_id?.first_name} ${response.farmerInput?.farmer_account_id?.middle_name ? response.farmerInput?.farmer_account_id?.middle_name +'.':''} ${response.farmerInput?.farmer_account_id?.surname} ${response.farmerInput?.farmer_account_id?.suffix || ''}`.trim()}
                    </Td>
                    <Td>{response.farmerInput.farm_location}</Td>
                    {status === 'NEWLY PLANTED' ? (
                        <>
                          <Td>{response.cropRecord &&  
                                (response.cropType.crop_type === 'VEGETABLES, ROOT CROPS AND OTHER INDUSTRIAL CROPS' 
                                  ? response.cropRecord.crop_type
                                  : response.cropRecord.crop_variety) || '-' }</Td> {/* commodity */}

                          <Td>{response.cropDetails && response.cropDetails?.plantation_start_date && response.cropDetails?.plantation_end_date ?
                            `${new Date(response.cropDetails.plantation_start_date).toLocaleDateString('en-US', plnt_harvDate)} to ${new Date(response.cropDetails.plantation_end_date).toLocaleDateString('en-US', plnt_harvDate)}`
                            : '-'}</Td> {/* plantation date */}

                          <Td>{response.cropDetails && response.cropDetails?.total_trees && response.cropRecord?.crop_variety ?
                              `${numOfTreesToHectares(response.cropRecord.crop_variety, response.cropDetails.total_trees)?.toFixed(4) || 'invalid commodity'}`
                              : (response.cropDetails?.total_area_planted || '-')}</Td> {/* total area planted */}
                        </>
                      ) : (
                        <>
                          <Td>{response.cropRecord &&  
                                (response.cropType.crop_type === 'VEGETABLES, ROOT CROPS AND OTHER INDUSTRIAL CROPS' 
                                  ? response.cropRecord.crop_type
                                  : response.cropRecord.crop_variety) || '-' }</Td> {/* commodity */}
                          <Td>
                          {response.cropDetails && response.cropDetails?.harvest_start_date && response.cropDetails?.harvest_end_date ?
                          `${new Date(response.cropDetails.harvest_start_date).toLocaleDateString('en-US', plnt_harvDate)} to ${new Date(response.cropDetails.harvest_end_date).toLocaleDateString('en-US', plnt_harvDate)}` 
                            : '-'}
                          </Td> {/* harvest date */}
                          <Td>{response.cropDetails && response.cropDetails?.trees_harvested && response.cropRecord?.crop_variety ?
                              `${numOfTreesToHectares(response.cropRecord.crop_variety, response.cropDetails.trees_harvested)?.toFixed(4) || 'invalid commodity'}`
                              : (response.cropDetails?.total_area_harvested || '-')}</Td>
                        </>
                      )}
                    <Td isNumeric position={{ base: 'static', md: 'sticky' }} right={0} bg={'white'} zIndex={1}>
                      <Button
                        size="sm"
                        colorScheme={status === 'NEWLY PLANTED' ? 'green' : 'orange'}
                        leftIcon={<FaEye />}
                        onClick={() => {
                          setSelectedResponse(response);
                          onOpen();
                        }}
                      >
                        Details
                      </Button>
                    </Td>
                  </Tr>
                ))
              ) : (
                <Tr>
                  <Td colSpan={7} textAlign="center" py={8}>
                    <Text color="gray.500">No responses found.</Text>
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </TableContainer>
    )
  }

  // Pagination component to reuse
  const PaginationControls = ({ currentPage, setCurrentPage, totalPages, totalItems, colorScheme }) => (
    <Flex 
      justifyContent="space-between" 
      mt={4} 
      alignItems="center"
      direction={{ base: "column", md: "row" }}
      gap={{ base: 3, md: 0 }}
      width={"100%"}
    >
      <Text color="gray.600" fontSize="md">
        Page {currentPage} of {totalPages || 1} ({totalItems} total)
      </Text>
      
      <HStack spacing={2} >
        <Button
          size="sm"
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          isDisabled={currentPage === 1}
          colorScheme={colorScheme}
          variant="outline"
        >
          Previous
        </Button>
        
        <Button
          size="sm"
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          isDisabled={currentPage >= totalPages}
          colorScheme={colorScheme}
          variant="outline"
        >
          Next
        </Button>
      </HStack>
    </Flex>
  );

  const handleModalSubmit = async () => {
    if (!selectedResponse) {
      toast({
        title: "Error",
        description: "No response data available to process.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
  
    try {
      // Validate critical data exists before proceeding
      if (!selectedResponse.farmerInput?.farmer_account_id?._id) {
        throw new Error("Missing farmer account information");
      }
  
      if (!selectedResponse.cropType?.crop_type || !selectedResponse.cropRecord?.crop_stage) {
        throw new Error("Missing crop information");
      }
  
      // Format data for unified response with safe access
      const isIndustrialCrop = selectedResponse.cropType?.crop_type === 'VEGETABLES, ROOT CROPS AND OTHER INDUSTRIAL CROPS';
      const isNewlyPlanted = selectedResponse.cropRecord?.crop_stage === 'NEWLY PLANTED';
      
      const responseData = {
        // Farmer details
        farmer_account_id: selectedResponse.farmerInput.farmer_account_id._id,
        farm_location: selectedResponse.farmerInput.farm_location || "",
        
        // Crop information
        crop_type: selectedResponse.cropType.crop_type,
        commodity: isIndustrialCrop ? 
          (selectedResponse.cropRecord.crop_type || "") : 
          (selectedResponse.cropRecord.crop_variety || ""),
        crop_stage: selectedResponse.cropRecord.crop_stage,
  
        // for deletion 
        original_farmer_input_id: selectedResponse.farmerInput._id
      };
      
      // Add stage-specific details safely
      if (isNewlyPlanted) {
        // Add plantation dates if they exist
        if (selectedResponse.cropDetails?.plantation_start_date) {
          responseData.plantation_start_date = selectedResponse.cropDetails.plantation_start_date;
        }
        
        if (selectedResponse.cropDetails?.plantation_end_date) {
          responseData.plantation_end_date = selectedResponse.cropDetails.plantation_end_date;
        }
        
        if (selectedResponse.cropDetails?.harvest_month_year) {
          responseData.harvest_month_year = selectedResponse.cropDetails.harvest_month_year;
        }
        
        // Handle area calculation based on crop type
        if (isIndustrialCrop) {
          responseData.total_area_planted = selectedResponse.cropDetails?.total_area_planted || 0;
        } else {
          // Safe tree calculation with complete null checking
          if (selectedResponse.cropDetails?.total_trees && 
              selectedResponse.cropRecord?.crop_variety && 
              typeof selectedResponse.cropDetails.total_trees === 'number') {
            const hectaresNew = numOfTreesToHectares(
              selectedResponse.cropRecord.crop_variety, 
              selectedResponse.cropDetails.total_trees
            );
            responseData.total_area_trees_planted = hectaresNew ? Number(hectaresNew.toFixed(4)) : null;
          } else {
            responseData.total_area_trees_planted = null;
          }
        }
      } else {
        // Harvesting details with safe access
        if (selectedResponse.cropDetails?.harvest_start_date) {
          responseData.harvest_start_date = selectedResponse.cropDetails.harvest_start_date;
        }
        
        if (selectedResponse.cropDetails?.harvest_end_date) {
          responseData.harvest_end_date = selectedResponse.cropDetails.harvest_end_date;
        }
        
        responseData.total_weight = selectedResponse.cropDetails?.total_weight || 0;
        responseData.crop_purpose = selectedResponse.cropDetails?.crop_purpose || "UNKNOWN";
        
        // Only add selling details if purpose is PANG BENTA
        if (selectedResponse.cropDetails?.crop_purpose === 'PANG BENTA') {
          responseData.destination = selectedResponse.cropDetails?.destination || "";
          responseData.mode_of_payment = selectedResponse.cropDetails?.mode_of_payment || "";
          responseData.mode_of_delivery = selectedResponse.cropDetails?.mode_of_delivery || "";
        }
        
        // Handle area calculation for harvest based on crop type
        if (isIndustrialCrop) {
          responseData.total_area_harvested = selectedResponse.cropDetails?.total_area_harvested || 0;
        } else {
          // Safe tree calculation for harvesting
          if (selectedResponse.cropDetails?.trees_harvested && 
              selectedResponse.cropRecord?.crop_variety &&
              typeof selectedResponse.cropDetails.trees_harvested === 'number') {
            const hectaresHarv = numOfTreesToHectares(
              selectedResponse.cropRecord.crop_variety, 
              selectedResponse.cropDetails.trees_harvested
            );
            responseData.total_area_trees_harvested = hectaresHarv ? Number(hectaresHarv.toFixed(4)) : null;
          } else {
            responseData.total_area_trees_harvested = null;
          }
        }
      }
      
      // Invalidate the query to refresh the data
      queryClient.invalidateQueries({ queryKey: ['unvalidatedInputs'] });
  
      // Create unified record (will be saved to year-based collection)
      const responseResult = await createUnifiedFarmerResponse(responseData);
  
      toast({
        title: "Success",
        description: responseResult.message || "Response successfully pushed to records.",
        status: "success",
        duration: 10000,
        isClosable: true,
      });
      
      // Close the modal after successful submission
      onClose();
      
    } catch (error) {
      console.error("Error submitting response:", error);
      queryClient.invalidateQueries({ queryKey: ['unvalidatedInputs'] });
      
      toast({
        title: "Error",
        description: error.message || error.response?.data?.message || "Failed to push response to records. Please try again.",
        status: "error",
        duration: 10000,
        isClosable: true,
      });
    }
  };

  const ResponseDetailForm = ({ response }) => {
    
    const isNewlyPlanted = response.cropRecord?.crop_stage === 'NEWLY PLANTED';
    const isHarvesting = response.cropRecord?.crop_stage === 'HARVESTING';
    const isIndustrialCrop = response.cropType?.crop_type === 'VEGETABLES, ROOT CROPS AND OTHER INDUSTRIAL CROPS';
    
    // For displaying dates nicely
    const formatDate = (dateString) => {
      if (!dateString) return '';
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    const handleChange = (section, field, value) => {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    };

    return (
    <VStack spacing={6} align="stretch">
      {/* Farmer Information Section */}
      <Box 
        p={5} 
        borderRadius="md" 
        borderWidth="1px" 
        borderColor="gray.200" 
        bg="white"
        boxShadow="sm"
      >
        <Heading as="h3" size="md" mb={4} color="blue.600" fontWeight="600">
          <HStack>
            <Icon as={FaUser} />
            <Text>Farmer Information</Text>
          </HStack>
        </Heading>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
          <FormControl>
            <FormLabel fontWeight="medium">Full Name</FormLabel>
            <Input 
              value={`${response.farmerInput.farmer_account_id?.first_name} ${response.farmerInput.farmer_account_id?.middle_name ? response.farmerInput.farmer_account_id.middle_name + ' ' : ''}${response.farmerInput.farmer_account_id?.surname} ${response.farmerInput.farmer_account_id?.suffix || ''}`}
              isReadOnly
              bg="gray.50"
              borderColor="gray.200"
            />
          </FormControl>
          <FormControl>
            <FormLabel fontWeight="medium">Farm Location</FormLabel>
            <Input 
              value={response.farmerInput?.farm_location || '-'}
              isReadOnly
              bg="gray.50"
              borderColor="gray.200"
            />
          </FormControl>
        </SimpleGrid>
      </Box>

      {/* Crop Information Section (Conditional)*/}
      <Box 
        p={5} 
        borderRadius="md" 
        borderWidth="1px" 
        borderColor="gray.200" 
        bg="white"
        boxShadow="sm"
      >
        <Heading as="h3" size="md" mb={4} color="green.600" fontWeight="600">
          <HStack>
            <Icon as={FaSeedling} />
            <Text>Crop Information</Text>
          </HStack>
        </Heading>
        
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
          {isIndustrialCrop ? (
            <>
              <FormControl>
                <FormLabel fontWeight="medium">Crop Type</FormLabel>
                <Input
                  value={response.cropType?.crop_type === 'VEGETABLES, ROOT CROPS AND OTHER INDUSTRIAL CROPS' ? 'INDUSTRIAL' : '-' }
                  isReadOnly
                  bg="gray.50"
                  borderColor="gray.200"
                />
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="medium">Commodity</FormLabel>
                <Input
                  value={response.cropRecord?.crop_type || '-'}
                  isReadOnly
                  bg="gray.50"
                  borderColor="gray.200"
                />
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="medium">Variety</FormLabel>
                <Input
                  value={response.cropRecord?.crop_variety || '-'}
                  isReadOnly
                  bg="gray.50"
                  borderColor="gray.200"
                />
              </FormControl>
            </>
          ) : (
            <>
              <FormControl>
                <FormLabel fontWeight="medium">Crop Type</FormLabel>
                <Input
                  value={response.cropType?.crop_type || '-'}
                  isReadOnly
                  bg="gray.50"
                  borderColor="gray.200"
                />
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="medium">Commodity</FormLabel>
                <Input
                  value={response.cropRecord?.crop_variety || '-'}
                  isReadOnly
                  bg="gray.50"
                  borderColor="gray.200"
                />
              </FormControl>
            </>
          )}
        </SimpleGrid>
      </Box>

      {/* Plantation Information */}
      {isNewlyPlanted && (
        <Box 
          p={5} 
          borderRadius="md" 
          borderWidth="1px" 
          borderColor="gray.200" 
          bg="white"
          boxShadow="sm"
        >
          <Heading as="h3" size="md" mb={4} color="teal.600" fontWeight="600">
            <HStack>
              <Icon as={FaLeaf} />
              <Text>Plantation Details</Text>
            </HStack>
          </Heading>
          
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5} mb={4}>
            <FormControl>
              <FormLabel fontWeight="medium">Date of Plantation</FormLabel>
              <Input
                value={response.cropDetails && response.cropDetails?.plantation_start_date && response.cropDetails?.plantation_end_date ?
                  `${formatDate(response.cropDetails.plantation_start_date)} to ${formatDate(response.cropDetails.plantation_end_date)}`
                  : '-'}
                isReadOnly
                bg="gray.50"
                borderColor="gray.200"
              />
            </FormControl>
            
            <FormControl>
              <FormLabel fontWeight="medium">Date of Harvesting</FormLabel>
              <Input
                value={response.cropDetails && response.cropDetails?.harvest_month_year ?
                  new Date(response.cropDetails.harvest_month_year).toLocaleDateString('en-US', harvMonthYearFull)
                  : '-'}
                isReadOnly
                bg="gray.50"
                borderColor="gray.200"
              />
            </FormControl>
          </SimpleGrid>

          {isIndustrialCrop ? (
            <Box 
            p={4} 
            borderRadius="md" 
            borderWidth="1px" 
            borderColor="blue.200" 
            bg="blue.50"
            mt={5}
            >
              <FormControl mb={1}>
                <FormLabel fontWeight="medium">Total Area Planted (ha)</FormLabel>
                <InputGroup>
                  <Input
                    value={response.cropDetails?.total_area_planted || ''}
                    isReadOnly
                    bg="gray.50"
                    borderColor="gray.200"
                  />
                  <InputRightAddon children="hectares" bg="blue.100" color="blue.800" />
                </InputGroup>
              </FormControl>
            </Box>
          ) : (
            <Box 
              p={4} 
              borderRadius="md" 
              borderWidth="1px" 
              borderColor="blue.200" 
              bg="blue.50"
              mt={5}
            >
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl>
                  <FormLabel fontWeight="medium" color="gray.700">Total Number of Trees</FormLabel>
                  <InputGroup>
                    <Input
                      value={response.cropDetails?.total_trees || '-'}
                      isReadOnly
                      bg="white"
                      borderColor="gray.300"
                    />
                    <InputRightAddon children="trees" bg="blue.100" color="blue.800" />
                  </InputGroup>
                </FormControl>

                <FormControl>
                  <FormLabel fontWeight="medium" color="gray.700">Equivalent Area - {response.cropRecord?.crop_variety}</FormLabel>
                  <InputGroup>
                    <Input
                      value={response.cropDetails?.total_trees && response.cropRecord?.crop_variety ?
                        `${numOfTreesToHectares(response.cropRecord.crop_variety, response.cropDetails.total_trees)?.toFixed(4) || 'invalid commodity'}`
                        : '-'}
                      isReadOnly
                      bg="white"
                      borderColor="gray.300"
                    />
                    <InputRightAddon children="hectares" bg="blue.100" color="blue.800" />
                  </InputGroup>
                </FormControl>
              </SimpleGrid>
            </Box>
          )}
        </Box>
      )}

      {/* Harvest Information (Conditional) */}
      {isHarvesting && (
        <Box 
          p={5} 
          borderRadius="md" 
          borderWidth="1px" 
          borderColor="gray.200" 
          bg="white"
          boxShadow="sm"
        >
          <Heading as="h3" size="md" mb={4} color="orange.600" fontWeight="600">
            <HStack>
              <Icon as={FaBoxes} />
              <Text>Harvesting Details</Text>
            </HStack>
          </Heading>
          
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5} mb={4}>
            <FormControl>
              <FormLabel fontWeight="medium">Date of Harvest</FormLabel>
              <Input
                value={`${formatDate(response.cropDetails?.harvest_start_date)} to ${formatDate(response.cropDetails?.harvest_end_date)}`}
                isReadOnly
                bg="gray.50"
                borderColor="gray.200"
              />
            </FormControl>

            <FormControl>
              <FormLabel fontWeight="medium">Total Weight</FormLabel>
              <InputGroup>
                <Input
                  value={response.cropDetails?.total_weight || ''}
                  isReadOnly
                  bg="gray.50"
                  borderColor="gray.200"
                />
                <InputRightAddon children="kg" bg="blue.100" color="blue.800" />
              </InputGroup>
            </FormControl>

            <FormControl>
              <FormLabel fontWeight="medium">Crop Purpose</FormLabel>
              <Input
                value={response.cropDetails?.crop_purpose || ''}
                isReadOnly
                bg="gray.50"
                borderColor="gray.200"
              />
            </FormControl>
            </SimpleGrid>
            
            {isIndustrialCrop ? (
              <Box 
                p={4} 
                borderRadius="md" 
                borderWidth="1px" 
                borderColor="blue.200" 
                bg="blue.50"
                mt={5}
                >
                  <FormControl mb={1}>
                    <FormLabel fontWeight="medium">Total Area Harvested (Ha)</FormLabel>
                    <InputGroup>
                      <Input
                        value={response.cropDetails?.total_area_harvested || ''}
                        isReadOnly
                        bg="gray.50"
                        borderColor="gray.200"
                      />
                      <InputRightAddon children="hectares" bg="blue.100" color="blue.800" />
                    </InputGroup>
                  </FormControl>
              </Box>
              ) : (
                <Box 
                p={4} 
                borderRadius="md" 
                borderWidth="1px" 
                borderColor="blue.200" 
                bg="blue.50"
                mt={5}
                >
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel fontWeight="medium" color="gray.700">Total Number of Trees Harvested</FormLabel>
                    <InputGroup>
                      <Input
                        value={response.cropDetails?.trees_harvested || '-'}
                        isReadOnly
                        bg="white"
                        borderColor="gray.300"
                      />
                      <InputRightAddon children="trees" bg="blue.100" color="blue.800" />
                    </InputGroup>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontWeight="medium" color="gray.700">Equivalent Area - {response.cropRecord?.crop_variety}</FormLabel>
                    <InputGroup>
                      <Input
                        value={response.cropDetails?.trees_harvested && response.cropRecord?.crop_variety ?
                          `${numOfTreesToHectares(response.cropRecord.crop_variety, response.cropDetails.trees_harvested)?.toFixed(4) || 'invalid commodity'}`
                          : '-'}
                        isReadOnly
                        bg="white"
                        borderColor="gray.300"
                      />
                      <InputRightAddon children="hectares" bg="blue.100" color="blue.800" />
                    </InputGroup>
                  </FormControl>
                </SimpleGrid>
             </Box>
            )}
          

          {/* Selling Details Nested Section (Conditional) */}
          {response.cropDetails?.crop_purpose === 'PANG BENTA' && (
              
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mt={4}>
                <FormControl>
                  <FormLabel fontWeight="medium">Destination</FormLabel>
                  <Input
                    value={response.cropDetails?.destination || ''}
                    isReadOnly
                    bg="gray.50"
                    borderColor="gray.200"
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel fontWeight="medium">Mode of Payment</FormLabel>
                  <Input
                    value={response.cropDetails?.mode_of_payment || ''}
                    isReadOnly
                    bg="gray.50"
                    borderColor="gray.200"
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel fontWeight="medium">Mode of Delivery</FormLabel>
                  <Input
                    value={response.cropDetails?.mode_of_delivery || ''}
                    isReadOnly
                    bg="gray.50"
                    borderColor="gray.200"
                  />
                </FormControl>
              </SimpleGrid>
          )}
        </Box>
      )}
    </VStack>
    );
  };
  
  return (
    <Box 
      overflow="hidden" 
      bg="white" 
      p={5} 
      minH="100vh"
    >
      <Heading as="h1" size="xl" mb={2}>
        Farmer New Responses
      </Heading>
      <Text color="gray.600" mb={5}>
        View and validate farmer responses of high-value crops before pushing to main record.
      </Text>
      
{/* Search Section */}
<Flex 
  direction={{ base: "column", md: "row" }} 
  mb={6} 
  p={4}
  bg="blue.50"
  borderRadius="md"
  alignItems={{ base: "flex-start", md: "center" }}  // This is the key change
>
  <HStack spacing={2} mb={{ base: 2, md: 0 }}>
    <Icon as={FaSearch} color="blue.500" />
    <Text fontSize='sm' fontWeight={'medium'}>Search:</Text>
  </HStack>
  
  <InputGroup width={{ base: "full", md: "sm" }} ml={{ base: 0, md: 4 }}>
    <Input 
      placeholder="Search by name, crop, barangay..." 
      bg="white"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      _focus={{ borderColor: "blue.400" }}
    />
    <InputRightElement pointerEvents="none">
      <FaSearch color="gray.300" />
    </InputRightElement>
  </InputGroup>
</Flex>
    
        <>
          {/* NEWLY PLANTED SECTION */}
          <Box mb={8}>
            <Flex 
              justify="space-between" 
              align="center" 
              mb={4}
              bg="green.50"
              p={3}
              height={"60px"}
              borderRadius="md"
              borderLeftWidth="4px"
              borderLeftColor="green.500"
            >
              <Heading as="h2" size="md" display="flex" alignItems="center">
                <Icon as={FaSeedling} mr={2} color="green.600" /> NEWLY PLANTED RESPONSES
              </Heading>
              {selectedNewlyPlanted.length > 0 && (
                <Button
                  colorScheme="green"
                  leftIcon={<Icon as={FaUpload} />}
                  onClick={() => handleBatchPush(selectedNewlyPlanted, newlyPlantedResponses, 'NEWLY_PLANTED')}
                  isLoading={isBatchProcessing}
                  ml={4}
                  p={3}
                  size="sm"
                >
                  Push {selectedNewlyPlanted.length} Selected
                </Button>
              )}
            </Flex>
          
            {isLoading ? (
              <Flex justifyContent="center" alignItems="center" minH="200px">
                <Spinner size="lg" color="green.500" thickness="3px" />
                <Text ml={5}>Loading newly planted responses...</Text>
              </Flex>
            ) : (
            <Box overflowX="auto" >
              <ResponseTable 
                data={currentNewlyPlanted} 
                status="NEWLY PLANTED" 
                selectedItems={selectedNewlyPlanted}
                onSelectItem={handleSelectNewlyPlanted}
                onSelectAll={handleSelectAllNewlyPlanted}
              />
            </Box>
            )}
            
            <Flex justifyContent="space-between" alignItems="center" mt={4}>
              <PaginationControls 
                currentPage={newlyPlantedPage}
                setCurrentPage={setNewlyPlantedPage}
                totalPages={newlyPlantedTotalPages}
                totalItems={newlyPlantedResponses.length}
                colorScheme="green"
              />
            </Flex>
          </Box>
          
          {/* HARVESTING SECTION */}
          <Box mb={8}>
            <Flex 
              justify="space-between" 
              align="center" 
              mb={4}
              bg="orange.50"
              p={3}
              height={"60px"}
              borderRadius="md"
              borderLeftWidth="4px"
              borderLeftColor="orange.500"
            >
              <Heading as="h2" size="md" display="flex" alignItems="center">
                <Icon as={FaBoxes} mr={2} color="orange.600" /> HARVESTING RESPONSES
              </Heading>

              {selectedHarvesting.length > 0 && (
                <Button
                  colorScheme="orange"
                  leftIcon={<Icon as={FaUpload} />}
                  onClick={() => handleBatchPush(selectedHarvesting, harvestingResponses, 'HARVESTING')}
                  isLoading={isBatchProcessing}
                  ml={4}
                  p={3}
                  size="sm"
                >
                  Push {selectedHarvesting.length} Selected
                </Button>
              )}
            </Flex>
          
            {isLoading ? (
              <Flex justifyContent="center" alignItems="center" minH="200px">
                <Spinner size="lg" color="orange.500" thickness="3px" />
                <Text ml={5}>Loading harvesting responses...</Text>
              </Flex>
            ) : (
            <Box overflowX="auto">
              <ResponseTable 
                data={currentHarvesting} 
                status="HARVESTING" 
                selectedItems={selectedHarvesting}
                onSelectItem={handleSelectHarvesting}
                onSelectAll={handleSelectAllHarvesting}
              />
            </Box>
            )}
            <Flex justifyContent="space-between" alignItems="center" mt={4}>
              <PaginationControls 
                currentPage={harvestingPage}
                setCurrentPage={setHarvestingPage}
                totalPages={harvestingTotalPages}
                totalItems={harvestingResponses.length}
                colorScheme="orange"
              />
              
            </Flex>
          </Box>
        </>
            
      {/* Details Modal */}
      <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        size="3xl" 
        closeOnOverlayClick={false} 
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent borderRadius="lg" overflow="hidden">
          <ModalHeader 
            bg="blue.50" 
            borderBottomWidth="1px"
            borderColor="gray.200"
            py={4}
            display="flex" 
            alignItems="center"
          >
            <Icon 
              as={selectedResponse?.cropRecord?.crop_stage === 'NEWLY PLANTED' ? FaSeedling : FaBoxes} 
              mr={2} 
              color={selectedResponse?.cropRecord?.crop_stage === 'NEWLY PLANTED' ? "green.600" : "orange.600"} 
            />
            Response Details
            {selectedResponse && (
              <Tag 
                size="md" 
                colorScheme={selectedResponse.cropRecord?.crop_stage === 'NEWLY PLANTED' ? 'green' : 'orange'}
                ml={2}
                borderRadius="full"
                px={3}
              >
                {selectedResponse.cropRecord?.crop_stage}
              </Tag>
            )}
          </ModalHeader>
          
          <ModalBody py={6}>
            {selectedResponse && (
              <ResponseDetailForm 
                response={selectedResponse} 
                onUpdate={(updateData) => {
                  updateFarmerInput({
                    farmerId: selectedResponse.farmerInput._id,
                    updateData
                  });
                  onClose();
                }}
                // Remove the Save Changes button from the form component
                hideSaveButton={true}
              />
            )}
          </ModalBody>
          
          <ModalFooter bg="gray.50" borderTopWidth="1px" borderColor="gray.200">
            <Button variant="outline" mr={3} onClick={onClose}>
              Close
            </Button>
            <Button 
              colorScheme="green" 
              onClick={handleModalSubmit}
              isLoading={isCreatingUnifiedResponse}
            >
              Push to Records
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Responses;
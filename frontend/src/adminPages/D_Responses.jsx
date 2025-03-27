import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Stack,
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
  ModalCloseButton,
  useDisclosure,
  Divider,
  Tag,
  Icon,
  Spinner, // Import Spinner from Chakra UI
  FormControl,
  FormLabel,
  SimpleGrid,
  Select,
} from '@chakra-ui/react';
import { FaSearch, FaEye, FaSeedling, FaBoxes } from 'react-icons/fa';
import { useAdminDashboard } from '../store/adminDashboard.store.js';

const Responses = () => {
  // States for search and pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [newlyPlantedPage, setNewlyPlantedPage] = useState(1);
  const [harvestingPage, setHarvestingPage] = useState(1);
  const [selectedResponse, setSelectedResponse] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Unvalidated farmer inputs
  const { 
    unvalidatedInputs, 
    isLoading,
    isUpdating,
    error,
    updateFarmerInput,
    clearError
  } = useAdminDashboard();


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

  // Refs for table scroll positions
  const newlyPlantedTableRef = useRef(null);
  const harvestingTableRef = useRef(null);
  const [scrollPositions, setScrollPositions] = useState({ x: 0, y: 0, container: null });

  // Handle modal open with response details and save scroll position
  const handleViewDetails = (response) => {
    // Save current scroll positions
    let scrollX = 0;
    let container = null;
    
    if (response.cropRecord.crop_stage === 'NEWLY PLANTED' && newlyPlantedTableRef.current) {
      scrollX = newlyPlantedTableRef.current.scrollLeft;
      container = 'newlyPlanted';
    } else if (response.cropRecord.crop_stage === 'HARVESTING' && harvestingTableRef.current) {
      scrollX = harvestingTableRef.current.scrollLeft;
      container = 'harvesting';
    }
    
    // First set the selected response
    setSelectedResponse(response);
    
    // Then open the modal
    onOpen();
    
    // Use a timeout to maintain the scroll position after the modal opens
    setTimeout(() => {
      if (container === 'newlyPlanted' && newlyPlantedTableRef.current) {
        newlyPlantedTableRef.current.scrollLeft = scrollX;
      } else if (container === 'harvesting' && harvestingTableRef.current) {
        harvestingTableRef.current.scrollLeft = scrollX;
      }
      
      // Save the position for later use when closing
      setScrollPositions({
        x: scrollX,
        y: window.scrollY,
        container: container
      });
    }, 0);
  };

  // Restore scroll positions after modal renders
  useEffect(() => {
    if (scrollPositions.container) {
      // Use setTimeout to ensure the DOM has updated
      setTimeout(() => {
        // Restore vertical scroll
        window.scrollTo(0, scrollPositions.y);
        
        // Restore horizontal scroll for the appropriate table
        if (scrollPositions.container === 'newlyPlanted' && newlyPlantedTableRef.current) {
          newlyPlantedTableRef.current.scrollLeft = scrollPositions.x;
        } else if (scrollPositions.container === 'harvesting' && harvestingTableRef.current) {
          harvestingTableRef.current.scrollLeft = scrollPositions.x;
        }
      }, 50);
    }
  }, [isOpen, scrollPositions]);

  // Additional effect to maintain scroll position during modal interactions
  useEffect(() => {
    if (isOpen && scrollPositions.container) {
      // Create an interval that repeatedly ensures scroll position is maintained
      // This handles cases where the modal might cause scroll position loss
      const intervalId = setInterval(() => {
        if (scrollPositions.container === 'newlyPlanted' && newlyPlantedTableRef.current) {
          if (newlyPlantedTableRef.current.scrollLeft !== scrollPositions.x) {
            newlyPlantedTableRef.current.scrollLeft = scrollPositions.x;
          }
        } else if (scrollPositions.container === 'harvesting' && harvestingTableRef.current) {
          if (harvestingTableRef.current.scrollLeft !== scrollPositions.x) {
            harvestingTableRef.current.scrollLeft = scrollPositions.x;
          }
        }
      }, 100); // Check every 100ms
      
      // Clean up interval when modal closes
      return () => clearInterval(intervalId);
    }
  }, [isOpen, scrollPositions]);
  
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
  
  // Table component to reuse for both sections
  const ResponseTable = ({ data, status, containerRef }) => (
    <TableContainer ref={containerRef}>
      <Table variant="simple">
        <Thead bg="gray.50">
          <Tr>
            <Th>Farmer Name</Th>
            <Th>Barangay</Th>
            {status === 'NEWLY PLANTED' ? (
              <>
                <Th>Commodity</Th>
                <Th>Variety</Th>
                <Th>
                  <Text>Date of</Text>
                  <Text>Plantation</Text>
                </Th>
                <Th>
                  <Text>Date of</Text>
                  <Text>Harvesting</Text>
                </Th>
                <Th position={{ base: 'static', md: 'sticky' }} right={0} bg="gray.50" zIndex={{ base: 0, md: 1 }} textAlign={'center'} shadow={'md'}>
                  <Box display={{ base: 'none', md: 'block' }}>Scroll →</Box>
                  <Box display={{ base: 'block', md: 'none' }}>Actions</Box>
                </Th>
              </>
              
            ) : (
              <>
                <Th>Commodity</Th>
                <Th>Variety</Th>
                <Th>
                  <Text>Date of</Text>
                  <Text>Harvesting</Text>
                </Th>
                <Th>
                  <Text fontSize={'10px'}>Total Area /</Text>
                  <Text fontSize={'10px'}>Number of Trees</Text>
                  <Text fontSize={'10px'}>Harvested</Text>
                </Th>
                <Th>
                  <Text>Total Weight of</Text>
                  <Text>Harvested Crops</Text>
                </Th>
                <Th>Destination</Th>
                <Th>
                  <Text>Mode of</Text>
                  <Text>Payment</Text>
                </Th>
                <Th>
                  <Text>Mode of</Text>
                  <Text>Delivery</Text>
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
                <Td fontWeight="medium">
                {`${response.farmerInput.first_name} ${response.farmerInput.middle_name ? response.farmerInput.middle_name.charAt(0).toUpperCase()+'.':''} ${response.farmerInput.surname} ${response.farmerInput.suffix || ''}`.trim()}
                </Td>
                <Td>{response.farmerInput.farm_location}</Td>
                {status === 'NEWLY PLANTED' ? (
                  <>
                    <Td>{response.cropRecord ? response.cropRecord.crop_type : '-'}</Td> {/* uri ng tanim */}
                    <Td>{response.cropRecord ? response.cropRecord.crop_variety : '-'}</Td>
                    <Td>{response.cropDetails && response.cropDetails.plantation_start_date && response.cropDetails.plantation_end_date ?
                      `${new Date(response.cropDetails.plantation_start_date).toLocaleDateString('en-US', plnt_harvDate)} to ${new Date(response.cropDetails.plantation_end_date).toLocaleDateString('en-US', plnt_harvDate)}`
                       : '-'}</Td> {/* plantation date */}
                    <Td>{response.cropDetails &&  response.cropDetails.harvest_month_year ?
                        new Date(response.cropDetails.harvest_month_year).toLocaleDateString('en-US', harvMonthYear)
                         : '-'}</Td> {/* harvest month and year */}
                  </>
                ) : (
                  <>
                    <Td>{response.cropRecord ? response.cropRecord.crop_type : '-'}</Td> {/* uri ng tanim */}
                    <Td>{response.cropRecord ? response.cropRecord.crop_variety : '-'}</Td>
                    <Td>
                    {response.cropDetails && response.cropDetails.harvest_start_date && response.cropDetails.harvest_end_date ?
                    `${new Date(response.cropDetails.harvest_start_date).toLocaleDateString('en-US', plnt_harvDate)} to ${new Date(response.cropDetails.harvest_end_date).toLocaleDateString('en-US', plnt_harvDate)}` 
                      : '-'}
                    </Td> {/* harvest date */}
                    <Td>
                      {response.cropDetails && (
                        response.cropType.crop_type === 'VEGETABLES, ROOT CROPS AND OTHER INDUSTRIAL CROPS' 
                          ? `${response.cropDetails.total_area_harvested} ha` 
                          : `${response.cropDetails.trees_harvested} trees`
                      ) || '-'}
                    </Td>
                    <Td>{response.cropDetails ? `${response.cropDetails.total_weight} kg` : '-'}</Td>
                    <Td>{response.cropDetails ? response.cropDetails.destination : '-'}</Td>
                    <Td>{response.cropDetails ? response.cropDetails.mode_of_payment : '-'}</Td>
                    <Td>{response.cropDetails ? response.cropDetails.mode_of_delivery : '-'}</Td>
                  </>
                )}
                <Td isNumeric position={{ base: 'static', md: 'sticky' }} right={0} bg={'white'} zIndex={1}>
                  <Button
                    size="sm"
                    colorScheme={status === 'NEWLY PLANTED' ? 'green' : 'orange'}
                    leftIcon={<FaEye />}
                    onClick={() => handleViewDetails(response)}
                  >
                    Details
                  </Button>
                </Td>
              </Tr>
            ))
          ) : (
            <Tr>
              <Td colSpan={6} textAlign="center" py={8}>
                <Text color="gray.500">No responses found.</Text>
              </Td>
            </Tr>
          )}
        </Tbody>
      </Table>
    </TableContainer>
  );

  // Pagination component to reuse
  const PaginationControls = ({ currentPage, setCurrentPage, totalPages, totalItems, colorScheme }) => (
    <Flex 
      justifyContent="space-between" 
      mt={4} 
      alignItems="center"
      direction={{ base: "column", md: "row" }}
      gap={{ base: 3, md: 0 }}
    >
      <Text color="gray.600">
        Page {currentPage} of {totalPages || 1} ({totalItems} total)
      </Text>
      
      <HStack spacing={2}>
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

  // Add this component in the same file before your main component

  const ResponseDetailForm = ({ response, onUpdate, hideSaveButton = false }) => {
    const [formData, setFormData] = useState({
      farmerInput: {
        surname: response.farmerInput.surname || '',
        first_name: response.farmerInput.first_name || '',
        middle_name: response.farmerInput.middle_name || '',
        suffix: response.farmerInput.suffix || '',
        farm_location: response.farmerInput.farm_location || ''
      },
      cropType: response.cropType?.crop_type || '',
      cropRecord: {
        crop_type: response.cropRecord?.crop_type || '',
        crop_variety: response.cropRecord?.crop_variety || '',
        crop_stage: response.cropRecord?.crop_stage || ''
      },
      cropDetails: response.cropDetails || {}
    });
    
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

    const handleSubmit = () => {
      onUpdate(formData);
    };

    return (
      <VStack spacing={4} align="stretch">
        {/* Farmer Information - Read Only */}
        <Box>
          <Heading as="h4" size="md" mb={3} color="blue.600">
            Farmer Information
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl>
              <FormLabel>Full Name</FormLabel>
              <Input 
                value={`${formData.farmerInput.first_name} ${formData.farmerInput.middle_name ? formData.farmerInput.middle_name + ' ' : ''}${formData.farmerInput.surname} ${formData.farmerInput.suffix || ''}`}
                isReadOnly
                bg="gray.50"
              />
            </FormControl>
            <FormControl>
              <FormLabel>Farm Location</FormLabel>
              <Input 
                value={formData.farmerInput.farm_location}
                isReadOnly
                bg="gray.50"
              />
            </FormControl>
          </SimpleGrid>
        </Box>

        <Divider />

        {/* Crop Information - Some Editable */}
        <Box>
          <Heading as="h4" size="md" mb={3} color="blue.600">
            Crop Information
          </Heading>
          
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
            {isIndustrialCrop ? (
              <FormControl>
                <FormLabel>URI NG TANIM</FormLabel>
                <Select
                  value={formData.cropRecord.crop_type}
                  onChange={(e) => handleChange('cropRecord', 'crop_type', e.target.value)}
                >
                  <option value="AMPALAYA">AMPALAYA</option>
                  <option value="EGGPLANT">EGGPLANT</option>
                  <option value="OKRA">OKRA</option>
                  <option value="SQUASH">SQUASH</option>
                  <option value="SITAO">SITAO</option>
                  <option value="KALABASA">KALABASA</option>
                  <option value="KAMATIS">KAMATIS</option>
                  <option value="PECHAY">PECHAY</option>
                  <option value="PIPINO">PIPINO</option>
                  <option value="TALONG">TALONG</option>
                  <option value="KAMOTE">KAMOTE</option>
                  <option value="PATATAS">PATATAS</option>
                </Select>
              </FormControl>
            ) : (
              <FormControl>
                <FormLabel>Crop Type</FormLabel>
                <Input
                  value={formData.cropType}
                  isReadOnly
                  bg="gray.50"
                />
              </FormControl>
            )}
            
            <FormControl>
              <FormLabel>Variety</FormLabel>
              <Input
                value={formData.cropRecord.crop_variety}
                onChange={(e) => handleChange('cropRecord', 'crop_variety', e.target.value)}
              />
            </FormControl>
          </SimpleGrid>

          {/* Crop Stage-Specific Information */}
          {isNewlyPlanted && (
            <Box>
              <Heading as="h5" size="sm" mb={3} color="green.600">
                Newly Planted Details
              </Heading>
              
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl>
                  <FormLabel>Date of Plantation</FormLabel>
                  <Input
                    value={`${formatDate(response.cropDetails?.plantation_start_date)} to ${formatDate(response.cropDetails?.plantation_end_date)}`}
                    isReadOnly
                    bg="gray.50"
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Expected Harvest Date</FormLabel>
                  <Input
                    type="date"
                    value={formData.cropDetails?.harvest_month_year ? formData.cropDetails.harvest_month_year.split('T')[0] : ''}
                    onChange={(e) => handleChange('cropDetails', 'harvest_month_year', e.target.value)}
                  />
                </FormControl>

                {isIndustrialCrop ? (
                  <FormControl>
                    <FormLabel>Total Area Planted (ha)</FormLabel>
                    <Input
                      value={formData.cropDetails?.total_area_planted || ''}
                      isReadOnly
                      bg="gray.50"
                    />
                  </FormControl>
                ) : (
                  <FormControl>
                    <FormLabel>Total Number of Trees</FormLabel>
                    <Input
                      value={formData.cropDetails?.total_trees || ''}
                      isReadOnly
                      bg="gray.50"
                    />
                  </FormControl>
                )}
              </SimpleGrid>
            </Box>
          )}

          {isHarvesting && (
            <Box>
              <Heading as="h5" size="sm" mb={3} color="orange.600">
                Harvesting Details
              </Heading>
              
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
                <FormControl>
                  <FormLabel>Date of Harvest</FormLabel>
                  <Input
                    value={`${formatDate(response.cropDetails?.harvest_start_date)} to ${formatDate(response.cropDetails?.harvest_end_date)}`}
                    isReadOnly
                    bg="gray.50"
                  />
                </FormControl>
                
                {isIndustrialCrop ? (
                  <FormControl>
                    <FormLabel>Total Area Harvested (ha)</FormLabel>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.cropDetails?.total_area_harvested || ''}
                      onChange={(e) => handleChange('cropDetails', 'total_area_harvested', e.target.value)}
                    />
                  </FormControl>
                ) : (
                  <FormControl>
                    <FormLabel>Total Number of Trees Harvested</FormLabel>
                    <Input
                      type="number"
                      value={formData.cropDetails?.trees_harvested || ''}
                      onChange={(e) => handleChange('cropDetails', 'trees_harvested', e.target.value)}
                    />
                  </FormControl>
                )}
                
                <FormControl>
                  <FormLabel>Total Weight (kg)</FormLabel>
                  <Input
                    type="number"
                    value={formData.cropDetails?.total_weight || ''}
                    onChange={(e) => handleChange('cropDetails', 'total_weight', e.target.value)}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Crop Purpose</FormLabel>
                  <Input
                    value={formData.cropDetails?.crop_purpose || ''}
                    isReadOnly
                    bg="gray.50"
                  />
                </FormControl>
              </SimpleGrid>

              {formData.cropDetails?.crop_purpose === 'PANG BENTA' && (
                <Box>
                  <Heading as="h5" size="sm" mb={3} color="purple.600">
                    Selling Details
                  </Heading>
                  
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl>
                      <FormLabel>Destination</FormLabel>
                      <Input
                        value={formData.cropDetails?.destination || ''}
                        onChange={(e) => handleChange('cropDetails', 'destination', e.target.value)}
                      />
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Mode of Payment</FormLabel>
                      <Select
                        value={formData.cropDetails?.mode_of_payment || ''}
                        onChange={(e) => handleChange('cropDetails', 'mode_of_payment', e.target.value)}
                      >
                        <option value="CASH">CASH</option>
                        <option value="GCASH">GCASH</option>
                        <option value="CHECK (TSEKE)">CHECK (TSEKE)</option>
                        <option value="OTHERS">OTHERS</option>
                      </Select>
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Mode of Delivery</FormLabel>
                      <Select
                        value={formData.cropDetails?.mode_of_delivery || ''}
                        onChange={(e) => handleChange('cropDetails', 'mode_of_delivery', e.target.value)}
                      >
                        <option value="PICKUP">PICKUP</option>
                        <option value="SUPPLIER DIRECT DELIVERY">SUPPLIER DIRECT DELIVERY</option>
                        <option value="DROPOFF">DROPOFF</option>
                        <option value="OTHERS">OTHERS</option>
                      </Select>
                    </FormControl>
                  </SimpleGrid>
                </Box>
              )}
            </Box>
          )}
        </Box>

        {!hideSaveButton && (
          <Button 
            mt={4} 
            colorScheme="green" 
            onClick={handleSubmit}
            isFullWidth
          >
            Save Changes
          </Button>
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
        alignItems="center"
      >
        <HStack spacing={2} mb={{ base: 2, md: 0 }}>
          <Icon as={FaSearch} color="blue.500" />
          <Text fontWeight="medium">Search:</Text>
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
              borderRadius="md"
              borderLeftWidth="4px"
              borderLeftColor="green.500"
            >
              <Heading as="h2" size="md" display="flex" alignItems="center">
                <Icon as={FaSeedling} mr={2} color="green.600" /> NEWLY PLANTED RESPONSES
              </Heading>
            </Flex>
          
            {isLoading ? (
              <Flex justifyContent="center" alignItems="center" minH="200px">
                <Spinner size="xl" color="blue.500" />
              </Flex>
            ) : (
            <Box overflowX="auto" >
              <ResponseTable 
                data={currentNewlyPlanted} 
                status="NEWLY PLANTED" 
                containerRef={newlyPlantedTableRef}
              />
            </Box>
            )}
            
            <PaginationControls 
              currentPage={newlyPlantedPage}
              setCurrentPage={setNewlyPlantedPage}
              totalPages={newlyPlantedTotalPages}
              totalItems={newlyPlantedResponses.length}
              colorScheme="green"
            />
          </Box>
          
          {/* HARVESTING SECTION */}
          <Box mb={8}>
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
                <Icon as={FaBoxes} mr={2} color="orange.600" /> HARVESTING RESPONSES
              </Heading>
            </Flex>
          
            {isLoading ? (
              <Flex justifyContent="center" alignItems="center" minH="200px">
                <Spinner size="xl" color="blue.500" />
              </Flex>
            ) : (
            <Box overflowX="auto">
              <ResponseTable 
                data={currentHarvesting} 
                status="HARVESTING" 
                containerRef={harvestingTableRef}
              />
            </Box>
            )}
            <PaginationControls 
              currentPage={harvestingPage}
              setCurrentPage={setHarvestingPage}
              totalPages={harvestingTotalPages}
              totalItems={harvestingResponses.length}
              colorScheme="orange"
            />
          </Box>
        </>
            
      {/* Details Modal */}
      <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        size="2xl" 
        closeOnOverlayClick={false} 
        scrollBehavior="inside"
        motionPreset="none"
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
              onClick={() => {
                if (selectedResponse) {
                  // Call the same update function that was passed to ResponseDetailForm
                  updateFarmerInput({
                    farmerId: selectedResponse.farmerInput._id,
                    updateData: document.querySelector('form')?.formData
                  });
                  onClose();
                }
              }}
              isLoading={isUpdating}
              loadingText="Saving"
            >
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Responses;
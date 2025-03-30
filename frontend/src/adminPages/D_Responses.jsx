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
  Spinner, // Import Spinner from Chakra UI
  FormControl,
  FormLabel,
  SimpleGrid,
  Select,
  InputRightAddon
} from '@chakra-ui/react';
import numOfTreesToHectares from '../components/conversions.js';
import { FaSearch, FaEye, FaSeedling, FaBoxes, FaUser, FaLeaf, FaMoneyBillWave, FaSave, FaTree } from 'react-icons/fa';
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
  
  // Table component to reuse for both sections
  const ResponseTable = ({ data, status }) => (
    <TableContainer>
      <Table variant="simple">
        <Thead bg="gray.50">
          <Tr>
            <Th>Farmer Name</Th>
            <Th>Farm Location</Th>
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
                <Th position={{ base: 'static', md: 'sticky' }} right={0} bg="gray.50" zIndex={{ base: 0, md: 1 }} textAlign={'center'}>
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


  const ResponseDetailForm = ({ response, onUpdate, hideSaveButton = false }) => {
    
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

    console.log('Crop Record:', response.cropRecord.crop_variety); 
    console.log('Total trees:', response.cropDetails.total_trees);

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
              value={`${response.farmerInput.first_name} ${response.farmerInput.middle_name ? response.farmerInput.middle_name + ' ' : ''}${response.farmerInput.surname} ${response.farmerInput.suffix || ''}`}
              isReadOnly
              bg="gray.50"
              borderColor="gray.200"
            />
          </FormControl>
          <FormControl>
            <FormLabel fontWeight="medium">Farm Location</FormLabel>
            <Input 
              value={response.farmerInput.farm_location}
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
                  value={response.cropType?.crop_type ? response.cropType.crop_type : '-'}
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
                value={response.cropDetails && response.cropDetails.plantation_start_date && response.cropDetails.plantation_end_date ?
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
                value={response.cropDetails && response.cropDetails.harvest_month_year ?
                  new Date(response.cropDetails.harvest_month_year).toLocaleDateString('en-US', harvMonthYearFull)
                  : '-'}
                isReadOnly
                bg="gray.50"
                borderColor="gray.200"
              />
            </FormControl>
          </SimpleGrid>

          {isIndustrialCrop ? (
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
          ) : (
            <Box 
              p={4} 
              borderRadius="md" 
              borderWidth="1px" 
              borderColor="blue.200" 
              bg="blue.50"
              
              mt={5}
            >
              <Heading as="h4" size="sm" mb={4} color="blue.700">
                <HStack>
                  <Icon as={FaTree} />
                  <Text>Land Utilization Metrics</Text>
                </HStack>
              </Heading>
              
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl>
                  <FormLabel fontWeight="medium" color="gray.700">Total Number of Trees</FormLabel>
                  <InputGroup>
                    <Input
                      value={response.cropDetails?.total_trees || ''}
                      isReadOnly
                      bg="white"
                      borderColor="gray.300"
                    />
                    <InputRightAddon children="trees" bg="blue.100" color="blue.800" />
                  </InputGroup>
                </FormControl>

                <FormControl>
                  <FormLabel fontWeight="medium" color="gray.700">Equivalent Area</FormLabel>
                  <InputGroup>
                    <Input
                      value={response.cropDetails?.total_trees && response.cropRecord?.crop_variety ?
                        `${numOfTreesToHectares(response.cropRecord.crop_variety, response.cropDetails.total_trees)?.toFixed(4) || '-'}`
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
            
            {isIndustrialCrop ? (
              <FormControl>
                <FormLabel fontWeight="medium">Total Area Harvested</FormLabel>
                <InputGroup>
                  <Input
                    type="number"
                    step="0.01"
                    value={response.cropDetails?.total_area_harvested || ''}
                    onChange={(e) => handleChange('cropDetails', 'total_area_harvested', e.target.value)}
                    borderColor="gray.300"
                    _focus={{ borderColor: "orange.400" }}
                  />
                  <InputRightAddon children="hectares" />
                </InputGroup>
              </FormControl>
            ) : (
              <FormControl>
                <FormLabel fontWeight="medium">Total Number of Trees Harvested</FormLabel>
                <InputGroup>
                  <Input
                    type="number"
                    value={response.cropDetails?.trees_harvested || ''}
                    onChange={(e) => handleChange('cropDetails', 'trees_harvested', e.target.value)}
                    borderColor="gray.300"
                    _focus={{ borderColor: "orange.400" }}
                  />
                  <InputRightAddon children="trees" />
                </InputGroup>
              </FormControl>
            )}
            
            <FormControl>
              <FormLabel fontWeight="medium">Total Weight</FormLabel>
              <InputGroup>
                <Input
                  type="number"
                  value={response.cropDetails?.total_weight || ''}
                  onChange={(e) => handleChange('cropDetails', 'total_weight', e.target.value)}
                  borderColor="gray.300"
                  _focus={{ borderColor: "orange.400" }}
                />
                <InputRightAddon children="kg" />
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

          {/* Selling Details Nested Section (Conditional) */}
          {response.cropDetails?.crop_purpose === 'PANG BENTA' && (
            <Box 
              p={4} 
              borderRadius="md" 
              borderWidth="1px" 
              borderColor="gray.300" 
              bg="gray.50"
              mt={3}
            >
              <Heading as="h5" size="sm" mb={3} color="purple.600" fontWeight="600">
                <HStack>
                  <Icon as={FaMoneyBillWave} />
                  <Text>Selling Details</Text>
                </HStack>
              </Heading>
              
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl>
                  <FormLabel fontWeight="medium">Destination</FormLabel>
                  <Input
                    value={response.cropDetails?.destination || ''}
                    onChange={(e) => handleChange('cropDetails', 'destination', e.target.value)}
                    borderColor="gray.300"
                    _focus={{ borderColor: "purple.400" }}
                    bg="white"
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel fontWeight="medium">Mode of Payment</FormLabel>
                  <Select
                    value={response.cropDetails?.mode_of_payment || ''}
                    onChange={(e) => handleChange('cropDetails', 'mode_of_payment', e.target.value)}
                    borderColor="gray.300"
                    _focus={{ borderColor: "purple.400" }}
                    bg="white"
                  >
                    <option value="CASH">CASH</option>
                    <option value="GCASH">GCASH</option>
                    <option value="CHECK (TSEKE)">CHECK (TSEKE)</option>
                    <option value="OTHERS">OTHERS</option>
                  </Select>
                </FormControl>
                
                <FormControl>
                  <FormLabel fontWeight="medium">Mode of Delivery</FormLabel>
                  <Select
                    value={response.cropDetails?.mode_of_delivery || ''}
                    onChange={(e) => handleChange('cropDetails', 'mode_of_delivery', e.target.value)}
                    borderColor="gray.300"
                    _focus={{ borderColor: "purple.400" }}
                    bg="white"
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

      {/* Action Button */}
      {!hideSaveButton && (
        <Button 
          mt={4} 
          colorScheme="blue" 
          onClick={handleSubmit}
          isFullWidth
          size="lg"
          fontWeight="500"
          boxShadow="md"
          _hover={{ boxShadow: "lg", bg: "blue.600" }}
        >
          <HStack>
            <Icon as={FaSave} />
            <Text>Save Changes</Text>
          </HStack>
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
        size="3xl" 
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
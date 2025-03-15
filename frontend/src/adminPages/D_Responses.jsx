import React, { useState } from 'react';
import {
  Box,
  Heading,
  Text,
  Stack,
  HStack,
  Flex,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
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
  
  //Unvalidated farmer inputs
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

  //date format na ginamit sa harv_date, plant_date, at month_year puctha 
  const plnt_harvDate = { year: 'numeric', month: 'short', day: 'numeric' };
  const harvMonthYear = { year: 'numeric', month: 'short' };

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
  
  // Handle modal open with response details
  const handleViewDetails = (response) => {
    setSelectedResponse(response);
    onOpen();
  };
  
  // Table component to reuse for both sections
  const ResponseTable = ({ data, status }) => (
    <TableContainer>
      <Table variant="simple">
        <Thead bg="gray.50">
          <Tr>
            <Th>Farmer Name</Th>
            <Th>Barangay</Th>
            <Th>Crop Type</Th>
            {status === 'NEWLY PLANTED' ? (
              <>
                <Th>Uri ng Tanim</Th>
                <Th>Variety</Th>
                <Th>D. of Plant.</Th>
                <Th>D. of Harv.</Th>
              </>
            ) : (
              <>
                <Th>Uri ng Tanim</Th>
                <Th>Variety</Th>
                <Th>D. of Harv.</Th>
                <Th>T. Area Harv.</Th>
                <Th>T. Weight. of Harv. Crops</Th>
                <Th>Destination</Th>
                <Th>MOP</Th>
                <Th>MOD</Th>
              </>
            )}
            <Th isNumeric></Th>
          </Tr>
        </Thead>
        <Tbody>
          {data.length > 0 ? (
            data.map((response, index) => (
              <Tr key={response.farmerInput._id || index}>
                <Td fontWeight="medium">
                {`${response.farmerInput.first_name} ${response.farmerInput.middle_name ? response.farmerInput.middle_name.charAt(0).toUpperCase() + '.' : ''} 
                  ${response.farmerInput.surname} 
                  ${response.farmerInput.suffix || ''}`.trim()}
                </Td>
                <Td>{response.farmerInput.farm_location}</Td>
                <Td>
                  {response.cropType.crop_type === 'VEGETABLES, ROOT CROPS AND OTHER INDUSTRIAL CROPS' ? ('INDUSTRIAL') : (response.cropType?.crop_type)}
                </Td>





                {status === 'NEWLY PLANTED' ? (
                  <>
                    <Td>{response.cropRecord ? response.cropRecord.crop_type : '-'}</Td> {/* uri ng tanim */}
                    <Td>{response.cropRecord ? response.cropRecord.crop_variety : '-'}</Td>
                    <Td>
                      {response.cropDetails && response.cropDetails.plantation_start_date && response.cropDetails.plantation_end_date ?
                      `${new Date(response.cropDetails.plantation_start_date).toLocaleDateString('en-US', plnt_harvDate)} to ${new Date(response.cropDetails.plantation_end_date).toLocaleDateString('en-US', plnt_harvDate)}`
                       : '-'}
                    </Td> {/* plantation date */}
                    <Td>
                      {response.cropDetails &&  response.cropDetails.harvest_month_year ?
                        new Date(response.cropDetails.harvest_month_year).toLocaleDateString('en-US', harvMonthYear)
                         : '-'}
                    </Td> {/* harvest month and year */}
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
                    <Td>{response.cropDetails ? `${response.cropDetails.total_area_harvested} ha` : '-'}</Td>
                    <Td>{response.cropDetails ? `${response.cropDetails.total_weight} kg` : '-'}</Td>
                    <Td>{response.cropDetails ? response.cropDetails.destination : '-'}</Td>
                    <Td>{response.cropDetails ? response.cropDetails.mode_of_payment : '-'}</Td>
                    <Td>{response.cropDetails ? response.cropDetails.mode_of_delivery : '-'}</Td>
                  </>
                )}
                <Td isNumeric>
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
      
        <Box overflowX="auto">
          <ResponseTable 
            data={currentNewlyPlanted} 
            status="NEWLY PLANTED" 
          />
        </Box>
        
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
      
        <Box overflowX="auto">
          <ResponseTable 
            data={currentHarvesting} 
            status="HARVESTING" 
          />
        </Box>
        
        <PaginationControls 
          currentPage={harvestingPage}
          setCurrentPage={setHarvestingPage}
          totalPages={harvestingTotalPages}
          totalItems={harvestingResponses.length}
          colorScheme="orange"
        />
      </Box>
            
      {/* Details Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader bg="blue.50" borderBottomWidth="1px">
            Response Details
            {selectedResponse && (
              <Tag 
                size="md" 
                colorScheme={selectedResponse.status === 'NEWLY PLANTED' ? 'green' : 'orange'}
                ml={2}
              >
                {selectedResponse.status}
              </Tag>
            )}
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody py={6}>
            {selectedResponse && (
              <Stack spacing={4}>
                <Box>
                  <Text fontWeight="bold" fontSize="sm" color="gray.500">FARMER NAME</Text>
                  <Text fontSize="md">{selectedResponse.farmerName}</Text>
                </Box>
                
                <Divider />
                
                <Box>
                  <Text fontWeight="bold" fontSize="sm" color="gray.500">FARMER DETAILS</Text>
                  <Text fontSize="md">Details to be configured later</Text>
                </Box>
                
                <Divider />
                
                <Box>
                  <Text fontWeight="bold" fontSize="sm" color="gray.500">CROP INFORMATION</Text>
                  <Text fontSize="md">Details to be configured later</Text>
                </Box>
              </Stack>
            )}
          </ModalBody>
          
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Responses;
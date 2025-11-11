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
  Spacer,
  Tooltip,
  Textarea,
} from '@chakra-ui/react';
import numOfTreesToHectares from '../../components/conversions.js';
import { FaSearch, FaEye, FaSeedling, FaBoxes, FaUser, FaLeaf, FaWifi, FaUpload, FaInfo, FaCheck, FaStop, FaLink, FaExternalLinkAlt } from 'react-icons/fa';
import { GoAlertFill } from "react-icons/go";
import { useAdminDashboard } from '../store/adminDashboard.store.js';
import { useFormStatusCheck } from '../store/farmerForm.store.js'
import { useQueryClient } from '@tanstack/react-query';

const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL;

const Responses = () => {
  // States for search and pagination
  //const [searchQuery, setSearchQuery] = useState('');
  const [selectedResponse, setSelectedResponse] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isOpenWarning, onOpen: onOpenWarning, onClose: onCloseWarning } = useDisclosure();
  const { isOpen: isOpenWarningBatch, onOpen: onOpenWarningBatch, onClose: onCloseWarningBatch } = useDisclosure();
  const { isOpen: isOpenArchive, onOpen: onOpenArchive, onClose: onCloseArchive } = useDisclosure();
  const { isOpen: isOpenRequestEdit, onOpen: onOpenRequestEdit, onClose: onCloseRequestEdit } = useDisclosure();

  const [selectedNewlyPlanted, setSelectedNewlyPlanted] = useState([]);
  const [selectedHarvesting, setSelectedHarvesting] = useState([]);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [pushType, setPushType] = useState(null);

  const [isUpdatingForReview, setIsUpdatingForReview] = useState(false);

  const [viewMode, setViewMode] = useState('unvalidated'); // 'unvalidated' or 'archived'

  // Unvalidated farmer inputs
  const { 
    newlyPlantedInputs,
    harvestingInputs,
    isLoadingNewlyPlanted,
    isLoadingHarvesting,
    isCreatingUnifiedResponse,
    flagResponseForReview,
    unflagResponseForReview,
    error,
    updateFarmerInput,
    createUnifiedFarmerResponse,
    updateFarmerResponseFields,
    newlyPlantedPage,
    setNewlyPlantedPage,
    harvestingPage,
    setHarvestingPage,

    newlyPlantedError,
    harvestingError,
    setIsModalOpen,

    FormStatusEnable,
    FormStatusDisable,
    isUpdatingFormStatus,

    archiveResponse,
    isArchivingResponse,

    setNewlyPlantedArchivedPage,
    newlyPlantedArchivedPage,
    setHarvestingArchivedPage,
    harvestingArchivedPage,

    archivedNewlyPlantedInputs,
    archivedHarvestingInputs,

    isLoadingNewlyPlantedArchived,
    isLoadingHarvestingArchived,

    archivedNewlyPlantedError,
    archivedHarvestingError,

    unarchiveResponse,
    isUnarchivingResponse,

    requestEdit,
    isRequestingEdit

  } = useAdminDashboard();

  const toast = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    setIsModalOpen(isOpen);
  }, [isOpen, setIsModalOpen]);

  //check kung nakabukas si hvc form or not
  const { checkFormStatus, isFormOpen } = useFormStatusCheck();
  const formButtonColor = isFormOpen ? "green" : "red";



  // Filter responses based on search query
  // const searchedResponses = unvalidatedInputs.filter((response) => {
  //   if (!response.farmerInput || !response.cropType || !response.cropRecord) {
  //     return false;
  //   }
    
  //   const farmerName = `${response.farmerInput.surname} ${response.farmerInput.first_name}`.toLowerCase();
  //   const cropType = response.cropType?.crop_type.toLowerCase() || '';
  //   const location = response.farmerInput.farm_location?.toLowerCase() || '';
    
  //   return farmerName.includes(searchQuery.toLowerCase()) ||
  //          cropType.includes(searchQuery.toLowerCase()) ||
  //          location.includes(searchQuery.toLowerCase());
  // });

  // Date format for harvest date, plantation date, and month-year
  const plnt_harvDate = { year: 'numeric', month: 'short', day: 'numeric' };  
  const harvMonthYear = { year: 'numeric', month: 'short' };
  const harvMonthYearFull = { year: 'numeric', month: 'long' };
  
    // Show error state
    if (newlyPlantedError && harvestingError) {
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
      const selectableItems = items.filter(item => item.farmerInput.isForReview === false);
      if (selectedNewlyPlanted.length === selectableItems.length) {
        setSelectedNewlyPlanted([]);
      } else {
        setSelectedNewlyPlanted(selectableItems.map(item => item.farmerInput._id));
      }
    };
    
    const handleSelectHarvesting = (id) => {
      setSelectedHarvesting(prev => 
        prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
      );
    };
    
    const handleSelectAllHarvesting = (items) => {
      const selectableItems = items.filter(item => item.farmerInput.isForReview === false);
      if (selectedHarvesting.length === selectableItems.length) {
        setSelectedHarvesting([]);
      } else {
        setSelectedHarvesting(selectableItems.map(item => item.farmerInput._id));
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
    
        // Fetch all selected responses across all pages
        // This assumes you have a backend endpoint or a store method to fetch by IDs
        // Replace this with your actual data fetching logic if needed
        let selectedResponses = [];
        if (type === 'NEWLY_PLANTED') {
          // Fetch all newly planted responses by IDs
          if (typeof newlyPlantedInputs.fetchByIds === 'function') {
            selectedResponses = await newlyPlantedInputs.fetchByIds(selectedIds);
          } else {
            // fallback: filter from all loaded pages (may be incomplete if not all pages loaded)
            selectedResponses = newlyPlantedInputs.allResults
              ? newlyPlantedInputs.allResults.filter(response => selectedIds.includes(response.farmerInput._id))
              : newlyPlantedInputs.results.filter(response => selectedIds.includes(response.farmerInput._id));
          }
        } else {
          // Fetch all harvesting responses by IDs
          if (typeof harvestingInputs.fetchByIds === 'function') {
            selectedResponses = await harvestingInputs.fetchByIds(selectedIds);
          } else {
            selectedResponses = harvestingInputs.allResults
              ? harvestingInputs.allResults.filter(response => selectedIds.includes(response.farmerInput._id))
              : harvestingInputs.results.filter(response => selectedIds.includes(response.farmerInput._id));
          }
        }
    
        // If still not found, warn user
        if (!selectedResponses || selectedResponses.length === 0) {
          toast({
            title: "No selected responses found",
            description: "Could not find selected responses. Please refresh and try again.",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
          setIsBatchProcessing(false);
          return;
        }
    
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
    
        onCloseWarningBatch();
        // Refresh the data
        queryClient.invalidateQueries({ queryKey: ['unvalidatedNewlyPlanted', newlyPlantedPage] });
        queryClient.invalidateQueries({ queryKey: ['unvalidatedHarvesting', harvestingPage] });
    
      } catch (error) {
        toast({
          title: "Error",
          description: error.response?.data?.message,
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
        farmerId: selectedResponse.farmerInput.farmerId,
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

    const handleSetForReview = async (responseToReview) => {
      if (!responseToReview?.farmerInput?._id) {
        toast({
          title: "Error",
          description: "Cannot identify the response to flag.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        return;
      }
      try {
        setIsUpdatingForReview(true);
        const response = await flagResponseForReview(responseToReview.farmerInput._id);

        toast({
          title: "Success",
          description: response.message,
          status: "success",
          duration: 5000,
          isClosable: true,
          colorScheme: "yellow",
        });
        queryClient.invalidateQueries({ queryKey: ['unvalidatedNewlyPlanted'] });
        queryClient.invalidateQueries({ queryKey: ['unvalidatedHarvesting'] });
        setIsUpdatingForReview(false);
        onClose();
      } catch (error) {
        toast({
          title: "Error",
          description: error.response?.data?.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };

    const handleUnsetForReview = async (responseToUnreview) => {
      if (!responseToUnreview?.farmerInput?._id) {
        toast({
          title: "Error",
          description: "Cannot identify the response to flag.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        return;
      }
      try {
        setIsUpdatingForReview(true);
        const response = await unflagResponseForReview(responseToUnreview.farmerInput._id);

        toast({
          title: "Success",
          description: response.message,
          status: "success",
          duration: 5000,
          isClosable: true,
          colorScheme: "yellow",
        });
        queryClient.invalidateQueries({ queryKey: ['unvalidatedNewlyPlanted'] });
        queryClient.invalidateQueries({ queryKey: ['unvalidatedHarvesting'] });
        setIsUpdatingForReview(false);
        onClose();
      } catch (error) {
        toast({
          title: "Error",
          description: error.response?.data?.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };

    const handleUnarchiveResponse = async (responseToUnarchive) => {
      if (!responseToUnarchive?.farmerInput?._id) {
        toast({
          title: "Error",
          description: "Cannot identify the response to unarchive.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        return;
      }
      try {
        const response = await unarchiveResponse(responseToUnarchive.farmerInput._id);

        toast({
          title: "Success",
          description: response.message,
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        queryClient.invalidateQueries({ queryKey: ['unvalidatedNewlyPlanted'] });
        queryClient.invalidateQueries({ queryKey: ['unvalidatedHarvesting'] });
        queryClient.invalidateQueries({ queryKey: ['unvalidatedNewlyPlantedArchived'] });
        queryClient.invalidateQueries({ queryKey: ['unvalidatedHarvestingArchived'] });
        onCloseArchive();
        onClose();
        setSelectedResponse(null);
      } catch (error) {
        toast({
          title: "Error",
          description: error.response?.data?.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };
    const handleArchiveResponse = async (responseToArchive) => {
      if (!responseToArchive?.farmerInput?._id) {
        toast({
          title: "Error",
          description: "Cannot identify the response to archive.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        return;
      }
      try {
        const response = await archiveResponse(responseToArchive.farmerInput._id);

        toast({
          title: "Success",
          description: response.message,
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        queryClient.invalidateQueries({ queryKey: ['unvalidatedNewlyPlanted'] });
        queryClient.invalidateQueries({ queryKey: ['unvalidatedHarvesting'] });
        queryClient.invalidateQueries({ queryKey: ['unvalidatedNewlyPlantedArchived'] });
        queryClient.invalidateQueries({ queryKey: ['unvalidatedHarvestingArchived'] });

        onCloseArchive();
        onClose();
        setSelectedResponse(null);
      } catch (error) {
        toast({
          title: "Error",
          description: error.response?.data?.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };

  const ButtonWithNotification = ({ children, showNotification }) => {
    return (
      <Box position="relative" display="inline-block">
        {children}
        {showNotification && (
          <Box
            position="absolute"
            top="-2px"
            right="-2px"
            width="10px"
            height="10px"
            bg="red"
            borderRadius="full"
            //border="1px solid white"
            zIndex={1}
          />
        )}
      </Box>
    );
  };

  // Table component to reuse for both sections
  const ResponseTable = ({ data, status, selectedItems, onSelectItem, onSelectAll }) => {

    const isNewlyPlanted = status === 'NEWLY PLANTED';
    const selectableItems = data.filter(item => item.farmerInput.isForReview === false);
    const allSelected = selectableItems.length > 0 && selectableItems.every(item => selectedItems?.includes(item.farmerInput._id));

    return(
        <TableContainer>
          <Table variant="simple" size='md'>
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
                  <Tr key={response.farmerInput._id || index} bg={viewMode === 'unvalidated' && response.farmerInput.isForReview === true ? 'orange.100' : 'white'}>
                    {response.farmerInput.isForReview === false ? (
                      <>
                    <Td>
                      <Checkbox
                        isChecked={selectedItems?.includes(response.farmerInput._id)}
                        onChange={() => onSelectItem(response.farmerInput._id)}
                        colorScheme={isNewlyPlanted ? "green" : "orange"}
                      />
                    </Td>
                    </>
                    ) : (<><Td></Td></>)}

                    <Td fontWeight="medium" fontSize={'sm'}>
                    {`${response.farmerInput?.farmer_account_id?.first_name ?? ''} ${response.farmerInput?.farmer_account_id?.middle_name ? response.farmerInput?.farmer_account_id.middle_name +'.':''} ${response.farmerInput?.farmer_account_id?.surname ?? ''} ${response.farmerInput?.farmer_account_id?.suffix ?? ''}`.trim()}
                    </Td>
                    <Td fontSize={'sm'}>{response.farmerInput?.farm_location ?? '-'}</Td>
                    {status === 'NEWLY PLANTED' ? (
                        <>
                          <Td fontSize={'sm'}>
                            {response.cropRecord
                              ? (response.cropType?.crop_type === 'VEGETABLES, ROOT CROPS AND OTHER INDUSTRIAL CROPS'
                                  ? (response.cropRecord.crop_type ?? '-')
                                  : (response.cropRecord.crop_variety ?? '-'))
                            : '-'}
                          </Td>
                          <Td fontSize={'sm'}>
                            {response.cropDetails?.plantation_start_date && response.cropDetails?.plantation_end_date
                              ? `${new Date(response.cropDetails.plantation_start_date).toLocaleDateString('en-US', plnt_harvDate)} to ${new Date(response.cropDetails.plantation_end_date).toLocaleDateString('en-US', plnt_harvDate)}`
                              : '-'}
                          </Td>
                          <Td fontSize={'sm'}>
                            {response.cropDetails?.total_trees != null && response.cropRecord?.crop_variety
                              ? `${numOfTreesToHectares(response.cropRecord.crop_variety, response.cropDetails.total_trees)?.toFixed(4) || 'invalid commodity'}`
                              : (response.cropDetails?.total_area_planted != null ? response.cropDetails.total_area_planted : '-')}
                          </Td>
                        </>
                      ) : (
                        <>
                          <Td fontSize={'sm'}>
                            {response.cropRecord
                              ? (response.cropType?.crop_type === 'VEGETABLES, ROOT CROPS AND OTHER INDUSTRIAL CROPS'
                                  ? (response.cropRecord.crop_type ?? '-')
                                  : (response.cropRecord.crop_variety ?? '-'))
                            : '-'}
                          </Td>
                          <Td fontSize={'sm'}>
                          {response.cropDetails?.harvest_start_date && response.cropDetails?.harvest_end_date
                            ? `${new Date(response.cropDetails.harvest_start_date).toLocaleDateString('en-US', plnt_harvDate)} to ${new Date(response.cropDetails.harvest_end_date).toLocaleDateString('en-US', plnt_harvDate)}`
                            : '-'}
                          </Td>
                          <Td fontSize={'sm'}>
                            {response.cropDetails?.trees_harvested != null && response.cropRecord?.crop_variety
                              ? `${numOfTreesToHectares(response.cropRecord.crop_variety, response.cropDetails.trees_harvested)?.toFixed(4) || 'invalid commodity'}`
                              : (response.cropDetails?.total_area_harvested != null ? response.cropDetails.total_area_harvested : '-')}
                          </Td>
                        </>
                      )}
                    <Td isNumeric position={{ base: 'static', md: 'sticky' }} right={0} zIndex={1} bg={viewMode === 'unvalidated' && response.farmerInput.isForReview === true ? 'orange.100' : 'white'}>
                        <ButtonWithNotification showNotification={response.farmerInput?.editConsent?.status === 'Granted'}>
                          <Button
                            alignContent={'center'}
                            size="xs"
                            colorScheme={status === 'NEWLY PLANTED' ? 'green' : 'orange'}
                            leftIcon={<FaEye />}
                            onClick={() => {
                              setSelectedResponse(response);
                              onOpen();
                            }}
                          >
                            Details
                          </Button>
                        </ButtonWithNotification>
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
        farmerId: selectedResponse.farmerInput.farmerId,
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
      queryClient.invalidateQueries({ queryKey: ['unvalidatedNewlyPlanted'] });
      queryClient.invalidateQueries({ queryKey: ['unvalidatedHarvesting'] });
  
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
      onCloseWarning();
      
    } catch (error) {
      console.error("Error submitting response:", error);
      queryClient.invalidateQueries({ queryKey: ['unvalidatedNewlyPlanted'] });
      queryClient.invalidateQueries({ queryKey: ['unvalidatedHarvesting'] });
      
      toast({
        title: "Error",
        description: error.response?.data?.message,
        status: "error",
        duration: 10000,
        isClosable: true,
      });
    }
  };

  // State for editable fields in modal
  const [editFields, setEditFields] = useState({});
  const [isUpdatingFields, setIsUpdatingFields] = useState(false);

  // NEW: Request-edit state
  const [requestEditValues, setRequestEditValues] = useState({});
  const [requestEditReason, setRequestEditReason] = useState("");
  const [hasRequestEditChanges, setHasRequestEditChanges] = useState(false);

  // When selectedResponse changes, reset editFields
  useEffect(() => {
    if (!selectedResponse) {
      setEditFields({});
      return;
    }
    const isNewlyPlanted = selectedResponse.cropRecord?.crop_stage === 'NEWLY PLANTED';
    const isIndustrialCrop = selectedResponse.cropType?.crop_type === 'VEGETABLES, ROOT CROPS AND OTHER INDUSTRIAL CROPS';
    if (isNewlyPlanted) {
      if (isIndustrialCrop) {
        setEditFields({
          total_area_planted: selectedResponse.cropDetails?.total_area_planted ?? ''
        });
      } else {
        setEditFields({
          total_trees: selectedResponse.cropDetails?.total_trees ?? ''
        });
      }
    } else {
      if (isIndustrialCrop) {
        setEditFields({
          total_weight: selectedResponse.cropDetails?.total_weight ?? '',
          total_area_harvested: selectedResponse.cropDetails?.total_area_harvested ?? ''
        });
      } else {
        setEditFields({
          total_weight: selectedResponse.cropDetails?.total_weight ?? '',
          trees_harvested: selectedResponse.cropDetails?.trees_harvested ?? ''
        });
      }
    }
  }, [selectedResponse]);

  const editValueRef = useRef(null);

  // Initialize request-edit values when the Request Edit modal opens
  useEffect(() => {
    if (!isOpenRequestEdit || !selectedResponse) return;

    const isNewlyPlanted = selectedResponse.cropRecord?.crop_stage === 'NEWLY PLANTED';
    const isHarvesting = selectedResponse.cropRecord?.crop_stage === 'HARVESTING';
    const isIndustrialCrop = selectedResponse.cropType?.crop_type === 'VEGETABLES, ROOT CROPS AND OTHER INDUSTRIAL CROPS';

    let initial = {};
    if (isNewlyPlanted) {
      initial = isIndustrialCrop
        ? { total_area_planted: selectedResponse.cropDetails?.total_area_planted ?? '' }
        : { total_trees: selectedResponse.cropDetails?.total_trees ?? '' };
    } else if (isHarvesting) {
      initial = isIndustrialCrop
        ? {
            total_weight: selectedResponse.cropDetails?.total_weight ?? '',
            total_area_harvested: selectedResponse.cropDetails?.total_area_harvested ?? '',
          }
        : {
            total_weight: selectedResponse.cropDetails?.total_weight ?? '',
            trees_harvested: selectedResponse.cropDetails?.trees_harvested ?? '',
          };
    }
    setRequestEditValues(initial);
    setRequestEditReason("");
    setHasRequestEditChanges(false);
  }, [isOpenRequestEdit, selectedResponse]);

  // Check for changes in request-edit values
  useEffect(() => {
    if (!selectedResponse || !isOpenRequestEdit) return;

    const hasChanges = Object.keys(requestEditValues).some(key => {
      const currentValue = String(requestEditValues[key] ?? '');
      const originalValue = String(selectedResponse.cropDetails?.[key] ?? '');
      return currentValue !== originalValue;
    });

    setHasRequestEditChanges(hasChanges);
  }, [requestEditValues, selectedResponse, isOpenRequestEdit]);

  // Handler for requesting farmer consent for data change (moved to Request Edit modal)
  // ...existing code...
  const handleRequestConsent = async () => {
    if (!selectedResponse) return;

    // sanitize values: cast numeric-like strings to numbers
    const sanitized = Object.entries(requestEditValues || {}).reduce((acc, [k, v]) => {
      if (v === '' || v === null || v === undefined) {
        acc[k] = v;
      } else if (!isNaN(v)) {
        acc[k] = Number(v);
      } else {
        acc[k] = v;
      }
      return acc;
    }, {});

    setIsUpdatingFields(true);
    try {
      const crop_stage = selectedResponse.cropRecord?.crop_stage;

      // Use atomic requestEdit (creates edit request + awaits consent)
      const result = await requestEdit({
        farmerId: selectedResponse.farmerInput._id,
        crop_stage,
        updates: sanitized,
        reason: requestEditReason?.trim(), 
      });

      toast({
        title: "Request Sent",
        description: result?.message || "Edit request recorded. Awaiting farmer consent.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      // Refresh lists (no optimistic local mutation; data changes only after farmer grants consent)
      queryClient.invalidateQueries({ queryKey: ['unvalidatedNewlyPlanted'] });
      queryClient.invalidateQueries({ queryKey: ['unvalidatedHarvesting'] });

      onCloseRequestEdit();
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to send edit request.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsUpdatingFields(false);
    }
  };

  // const handleRequestConsent = async () => {
  //   if (!selectedResponse) return;

  //   // sanitize values: cast numeric-like strings to numbers
  //   const sanitized = Object.entries(requestEditValues || {}).reduce((acc, [k, v]) => {
  //     if (v === '' || v === null || v === undefined) {
  //       acc[k] = v;
  //     } else if (!isNaN(v)) {
  //       acc[k] = Number(v);
  //     } else {
  //       acc[k] = v;
  //     }
  //     return acc;
  //   }, {});

  //   setIsUpdatingFields(true);
  //   try {
  //     const crop_stage = selectedResponse.cropRecord?.crop_stage;
  //     await updateFarmerResponseFields({
  //       farmerId: selectedResponse.farmerInput._id,
  //       crop_stage,
  //       updates: sanitized,
  //       reason: requestEditReason, // include reason
  //     });

  //     // update local selected response values
  //     const updatedResponse = {
  //       ...selectedResponse,
  //       cropDetails: {
  //         ...selectedResponse.cropDetails,
  //         ...sanitized,
  //       },
  //     };
  //     setSelectedResponse(updatedResponse);

  //     toast({
  //       title: "Success",
  //       description: "Edit request sent successfully.",
  //       status: "success",
  //       duration: 5000,
  //       isClosable: true,
  //     });

  //     // refresh lists
  //     queryClient.invalidateQueries({ queryKey: ['unvalidatedNewlyPlanted'] });
  //     queryClient.invalidateQueries({ queryKey: ['unvalidatedHarvesting'] });

  //     // close request-edit modal (and keep details modal open)
  //     onCloseRequestEdit();
  //   } catch (error) {
  //     toast({
  //       title: "Error",
  //       description: error.response?.data?.message || "Failed to send edit request.",
  //       status: "error",
  //       duration: 5000,
  //       isClosable: true,
  //     });
  //   } finally {
  //     setIsUpdatingFields(false);
  //   }
  // };

  const handleFormToggle = async () => {
    if (isFormOpen) {
      await FormStatusDisable();
      await checkFormStatus();
    } else {
      await FormStatusEnable();
      await checkFormStatus();
    }
  };

  // ResponseDetailForm to allow editing only for flagged responses and only allowed fields
  const ResponseDetailForm = React.memo(function ResponseDetailForm({ response, editable, onValuesChange, onHasChanges }) {
    const isNewlyPlanted = response.cropRecord?.crop_stage === 'NEWLY PLANTED';
    const isHarvesting = response.cropRecord?.crop_stage === 'HARVESTING';
    const isIndustrialCrop = response.cropType?.crop_type === 'VEGETABLES, ROOT CROPS AND OTHER INDUSTRIAL CROPS';
    console.log(response);
    const formatDate = (dateString) => {
      if (!dateString) return '-';
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    };

    const formatTime = (dateString) => {
      if (!dateString) return '-';
      return new Date(dateString).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      });
    };

    return ( 
      <VStack spacing={6} align="stretch">

        {/* Farmer Information Section */}
        <Box p={5} borderRadius="md" borderWidth="1px" borderColor="gray.200" bg="white" boxShadow="sm">
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
                value={
                  `${response.farmerInput?.farmer_account_id?.first_name ?? ''} ${response.farmerInput?.farmer_account_id?.middle_name ? response.farmerInput?.farmer_account_id.middle_name + '.' : ''} ${response.farmerInput?.farmer_account_id?.surname ?? ''} ${response.farmerInput?.farmer_account_id?.suffix ?? ''}`.trim()
                }
                isReadOnly
                bg="gray.50"
              />
            </FormControl>
            <FormControl>
              <FormLabel fontWeight="medium">Farm Location</FormLabel>
              <Input value={response.farmerInput?.farm_location ?? '-'} isReadOnly bg="gray.50" />
            </FormControl>
            <FormControl>
              <FormLabel fontWeight="medium">Date of Submission</FormLabel>
              <Input value={formatDate(response.farmerInput?.createdAt)} isReadOnly bg="gray.50" />
            </FormControl>
            <FormControl>
              <FormLabel fontWeight="medium">Time of Submission</FormLabel>
              <Input value={formatTime(response.farmerInput?.createdAt)} isReadOnly bg="gray.50" />
            </FormControl>
            <FormControl>
              <FormLabel fontWeight="medium">Farmer ID</FormLabel>
              <Input value={response.farmerInput?.farmerId ?? '-'} isReadOnly bg="gray.50" />
            </FormControl>
          </SimpleGrid>
        </Box>

        {/* Crop Information Section */}
        <Box p={5} borderRadius="md" borderWidth="1px" borderColor="gray.200" bg="white" boxShadow="sm">
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
                  <Input value="INDUSTRIAL" isReadOnly bg="gray.50" />
                </FormControl>
                <FormControl>
                  <FormLabel fontWeight="medium">Commodity</FormLabel>
                  <Input value={response.cropRecord?.crop_type ?? '-'} isReadOnly bg="gray.50" />
                </FormControl>
                <FormControl>
                  <FormLabel fontWeight="medium">Variety</FormLabel>
                  <Input value={response.cropRecord?.crop_variety ?? '-'} isReadOnly bg="gray.50" />
                </FormControl>
              </>
            ) : (
              <>
                <FormControl>
                  <FormLabel fontWeight="medium">Crop Type</FormLabel>
                  <Input value={response.cropType?.crop_type ?? '-'} isReadOnly bg="gray.50" />
                </FormControl>
                <FormControl>
                  <FormLabel fontWeight="medium">Commodity</FormLabel>
                  <Input value={response.cropRecord?.crop_variety ?? '-'} isReadOnly bg="gray.50" />
                </FormControl>
              </>
            )}
          </SimpleGrid>
        </Box>

        {/* Newlyplanted Information */}
        {isNewlyPlanted && (
          <Box p={5} borderRadius="md" borderWidth="1px" borderColor="gray.200" bg="white" boxShadow="sm">
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
                  value={
                    response.cropDetails?.plantation_start_date && response.cropDetails?.plantation_end_date
                      ? `${formatDate(response.cropDetails.plantation_start_date)} to ${formatDate(response.cropDetails.plantation_end_date)}`
                      : '-'
                  }
                  isReadOnly
                  bg="gray.50"
                />
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="medium">Date of Harvesting</FormLabel>
                <Input
                  value={
                    response.cropDetails?.harvest_month_year
                      ? new Date(response.cropDetails.harvest_month_year).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                        })
                      : '-'
                  }
                  isReadOnly
                  bg="gray.50"
                />
              </FormControl>
            </SimpleGrid>

            {isIndustrialCrop ? (
              <Box p={4} borderRadius="md" borderWidth="1px" borderColor="blue.200" bg="blue.50" mt={5}>
                <FormControl mb={1}>
                  <FormLabel fontWeight="medium">Total Area Planted (ha)</FormLabel>
                  <InputGroup>
                    <Input
                      value={`${response.cropDetails?.total_area_planted != null ? response.cropDetails.total_area_planted : '-'}  ${response?.farmerInput?.editConsent?.editRequestId?.total_area_planted != null ? '=>' : ''}  ${response?.farmerInput?.editConsent?.editRequestId?.total_area_planted != null ? response.farmerInput.editConsent.editRequestId.total_area_planted : ''}`}
                      isReadOnly
                      bg="white"
                      borderColor="gray.200"
                    />
                    <InputRightAddon children="hectares" bg="blue.100" color="blue.800" />
                  </InputGroup>
                </FormControl>
              </Box>
            ) : (
              <Box p={4} borderRadius="md" borderWidth="1px" borderColor="blue.200" bg="blue.50" mt={5}>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel fontWeight="medium" color="gray.700">
                      Total Number of Trees
                    </FormLabel>
                    <InputGroup>
                      <Input
                        value={`${response.cropDetails?.total_trees != null ? response.cropDetails.total_trees : '-'}  ${response?.farmerInput?.editConsent?.editRequestId?.total_trees != null ? '=>' : ''}  ${response?.farmerInput?.editConsent?.editRequestId?.total_trees != null ? response.farmerInput.editConsent.editRequestId.total_trees : ''}`}
                        isReadOnly
                        bg="white"
                        borderColor="gray.300"
                      />
                      <InputRightAddon children="trees" bg="blue.100" color="blue.800" />
                    </InputGroup>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontWeight="medium" color="gray.700">
                      Equivalent Area - {response.cropRecord?.crop_variety}
                    </FormLabel>
                    <InputGroup>
                      <Input
                        value={
                          response.cropDetails?.total_trees != null && response.cropRecord?.crop_variety
                            ? `${numOfTreesToHectares(response.cropRecord.crop_variety, response.cropDetails.total_trees)?.toFixed(4) || 'invalid commodity'}`
                            : '-'
                        }
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

        {/* Harvest Information */}
        {isHarvesting && (
          <Box p={5} borderRadius="md" borderWidth="1px" borderColor="gray.200" bg="white" boxShadow="sm">
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
                  value={
                    response.cropDetails?.harvest_start_date && response.cropDetails?.harvest_end_date
                      ? `${formatDate(response.cropDetails.harvest_start_date)} to ${formatDate(response.cropDetails.harvest_end_date)}`
                      : '-'
                  }
                  isReadOnly
                  bg="gray.50"
                />
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="medium">Total Weight</FormLabel>
                <InputGroup>
                  <Input
                    value={`${response.cropDetails?.total_weight != null ? response.cropDetails.total_weight : '-'}  ${response?.farmerInput?.editConsent?.editRequestId?.total_weight != null ? '=>' : ''}  ${response?.farmerInput?.editConsent?.editRequestId?.total_weight != null ? response.farmerInput.editConsent.editRequestId.total_weight : ''}`}
                    isReadOnly
                    bg="white"
                    borderColor="gray.200"
                  />
                  <InputRightAddon children="kg" bg="blue.100" color="blue.800" />
                </InputGroup>
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="medium">Crop Purpose</FormLabel>
                <Input value={response.cropDetails?.crop_purpose ?? '-'} isReadOnly bg="gray.50" />
              </FormControl>
            </SimpleGrid>

            {isIndustrialCrop ? (
              <Box p={4} borderRadius="md" borderWidth="1px" borderColor="blue.200" bg="blue.50" mt={5}>
                <FormControl mb={1}>
                  <FormLabel fontWeight="medium">Total Area Harvested (Ha)</FormLabel>
                  <InputGroup>
                    <Input
                      value={`${response.cropDetails?.total_area_harvested != null ? response.cropDetails.total_area_harvested : '-'}  ${response?.farmerInput?.editConsent?.editRequestId?.total_area_harvested != null ? '=>' : ''}  ${response?.farmerInput?.editConsent?.editRequestId?.total_area_harvested != null ? response.farmerInput.editConsent.editRequestId.total_area_harvested : ''}`}
                      isReadOnly
                      bg="white"
                      borderColor="gray.200"
                    />
                    <InputRightAddon children="hectares" bg="blue.100" color="blue.800" />
                  </InputGroup>
                </FormControl>
              </Box>
            ) : (
              <Box p={4} borderRadius="md" borderWidth="1px" borderColor="blue.200" bg="blue.50" mt={5}>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel fontWeight="medium" color="gray.700">
                      Total Number of Trees Harvested
                    </FormLabel>
                    <InputGroup>
                      <Input
                        value={`${response.cropDetails?.trees_harvested != null ? response.cropDetails.trees_harvested : '-'}  ${response?.farmerInput?.editConsent?.editRequestId?.trees_harvested != null ? '=>' : ''}  ${response?.farmerInput?.editConsent?.editRequestId?.trees_harvested != null ? response.farmerInput.editConsent.editRequestId.trees_harvested : ''}`}
                        isReadOnly
                        bg="white"
                        borderColor="gray.300"
                      />
                      <InputRightAddon children="trees" bg="blue.100" color="blue.800" />
                    </InputGroup>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontWeight="medium" color="gray.700">
                      Equivalent Area - {response.cropRecord?.crop_variety}
                    </FormLabel>
                    <InputGroup>
                      <Input
                        value={
                          response.cropDetails?.trees_harvested != null && response.cropRecord?.crop_variety
                            ? `${numOfTreesToHectares(response.cropRecord.crop_variety, response.cropDetails.trees_harvested)?.toFixed(4) || 'invalid commodity'}`
                            : '-'
                        }
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
                  <Input value={response.cropDetails?.destination ?? '-'} isReadOnly bg="gray.50" />
                </FormControl>

                <FormControl>
                  <FormLabel fontWeight="medium">Mode of Payment</FormLabel>
                  <Input value={response.cropDetails?.mode_of_payment ?? '-'} isReadOnly bg="gray.50" />
                </FormControl>

                <FormControl>
                  <FormLabel fontWeight="medium">Mode of Delivery</FormLabel>
                  <Input value={response.cropDetails?.mode_of_delivery ?? '-'} isReadOnly bg="gray.50" />
                </FormControl>
              </SimpleGrid>
            )}
          </Box>
        )}
      </VStack>
    );
  });
  
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
          mb={4} 
          p={4}
          bg="blue.50"
          borderRadius="md"
          alignItems={{ base: "flex-start", md: "center" }}
          gap={2}
        >
          <Button colorScheme={formButtonColor} size="sm" width={{ base: "full", md: "auto" }} onClick={handleFormToggle} isLoading={isUpdatingFormStatus}>
            <Icon as={isFormOpen ? FaCheck : FaStop} mr={2}/>
            {isFormOpen ? "Accepting Responses..." : "Not Accepting Responses"}
          </Button>

          <Button 
            colorScheme='blue' 
            size="sm" 
            width={{ base: "full", md: "auto" }} 
            onClick={() => {
              navigator.clipboard.writeText(`${FRONTEND_URL}/hvc/form/istcns`);
              toast({
                title: "Link Copied",
                description: "The form link has been copied to your clipboard.",
                status: "success",
                duration: 3000,
                isClosable: true,
              });
            }}
            >
            <Icon as={FaLink} mr={2}/>
            Copy Form Link
          </Button>

          <Button 
            colorScheme='blue' 
            size="sm" 
            width={{ base: "full", md: "auto" }} 
            onClick={() => { window.open(`${FRONTEND_URL}/hvc/form/istcns`, '_blank') }} 
            >
            <Icon as={FaExternalLinkAlt} mr={2}/>
            Open Form in New Tab
          </Button>

          <Spacer display={{ base: "none", md: "block" }} />

          <Select 
            value={viewMode} 
            onChange={(e) => setViewMode(e.target.value)} 
            size="sm" 
            width={{ base: "full", md: "200px" }}
            bg="white"
          >
            <option value="unvalidated">Unvalidated Responses</option>
            <option value="archived">Archived Responses</option>
          </Select>

        </Flex>
    
        {viewMode === 'unvalidated' ? (
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
                <Icon as={FaSeedling} mr={2} color="green.600" /> NEWLY PLANTED RESPONSES <Text pl={2}><Tooltip label="Only select responses from the CURRENT PAGE for batch processing. Any selected responses from other pages will be ignored." position="bottom" hasArrow>(<Icon as={FaInfo} color="blue.500" boxSize={3}/>)</Tooltip></Text>
              </Heading>
              {selectedNewlyPlanted.length > 0 && (
                <Button
                  colorScheme="green"
                  leftIcon={<Icon as={FaUpload} />}
                  onClick={() => {setPushType('NEWLY_PLANTED'); onOpenWarningBatch();}}
                  ml={4}
                  p={3}
                  size="sm"
                >
                  Push {selectedNewlyPlanted.length} Selected
                </Button>
              )}
            </Flex>
          
            {isLoadingNewlyPlanted ? (
              <Flex justifyContent="center" alignItems="center" minH="200px">
                <Spinner size="lg" color="green.500" thickness="3px" />
                <Text ml={5}>Loading newly planted responses...</Text>
              </Flex>
            ) : (
            <Box overflowX="auto" >
              <ResponseTable 
                data={newlyPlantedInputs.results} 
                status="NEWLY PLANTED" 
                selectedItems={selectedNewlyPlanted}
                onSelectItem={handleSelectNewlyPlanted}
                onSelectAll={() => handleSelectAllNewlyPlanted(newlyPlantedInputs.results)}
              />
            </Box>
            )}

            {newlyPlantedError && (
              <Box 
                overflow="hidden" 
                bg="white" 
                p={5} 
              >
                <Alert status="error" borderRadius="md">
                  <AlertIcon />
                  <AlertTitle>Error loading data!</AlertTitle>
                  <AlertDescription>
                    {newlyPlantedError || "Unable to load newly planted responses."}
                  </AlertDescription>
                </Alert>
              </Box>
            )}
            
            <Flex justifyContent="space-between" alignItems="center" mt={4}>
              <PaginationControls 
                currentPage={newlyPlantedPage}
                setCurrentPage={setNewlyPlantedPage}
                totalPages={newlyPlantedInputs.totalPages}
                totalItems={newlyPlantedInputs.totalCount}
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
                <Icon as={FaBoxes} mr={2} color="orange.600" /> HARVESTING RESPONSES <Text pl={2}><Tooltip label="Only select responses from the CURRENT PAGE for batch processing. Any selected responses from other pages will be ignored." position="bottom" hasArrow>(<Icon as={FaInfo} color="blue.500" boxSize={3}/>)</Tooltip></Text>
              </Heading>

              {selectedHarvesting.length > 0 && (
                <Button
                  colorScheme="orange"
                  leftIcon={<Icon as={FaUpload} />}
                  onClick={() => {setPushType('HARVESTING'); onOpenWarningBatch();}}
                  ml={4}
                  p={3}
                  size="sm"
                >
                  Push {selectedHarvesting.length} Selected
                </Button>
              )}
            </Flex>
          
            {isLoadingHarvesting ? (
              <Flex justifyContent="center" alignItems="center" minH="200px">
                <Spinner size="lg" color="orange.500" thickness="3px" />
                <Text ml={5}>Loading harvesting responses...</Text>
              </Flex>
            ) : (
            <Box overflowX="auto">
              <ResponseTable 
                data={harvestingInputs.results} 
                status="HARVESTING" 
                selectedItems={selectedHarvesting}
                onSelectItem={handleSelectHarvesting}
                onSelectAll={() => handleSelectAllHarvesting(harvestingInputs.results)}
              />
            </Box>
            )}

            {harvestingError && (
              <Box 
                overflow="hidden" 
                bg="white" 
                p={5} 
              >
                <Alert status="error" borderRadius="md">
                  <AlertIcon />
                  <AlertTitle>Error loading data!</AlertTitle>
                  <AlertDescription>
                    {harvestingError || "Unable to load harvesting responses."}
                  </AlertDescription>
                </Alert>
              </Box>
            )}

            <Flex justifyContent="space-between" alignItems="center" mt={4}>
              <PaginationControls 
                currentPage={harvestingPage}
                setCurrentPage={setHarvestingPage}
                totalPages={harvestingInputs.totalPages}
                totalItems={harvestingInputs.totalCount}
                colorScheme="orange"
              />
              
            </Flex>
          </Box>
        </>
        ) : (
          <>
            {/* ARCHIVED NEWLY PLANTED SECTION */}
            <Box mb={8}>
              <Flex 
                justify="space-between" 
                align="center" 
                mb={4}
                bg="gray.50"
                p={3}
                height={"60px"}
                borderRadius="md"
                borderLeftWidth="4px"
                borderLeftColor="gray.500"
              >
                <Heading as="h2" size="md" display="flex" alignItems="center">
                  <Icon as={FaSeedling} mr={2} color="green.600" /> ARCHIVED NEWLY PLANTED RESPONSES
                </Heading>
              </Flex>
            
              {isLoadingNewlyPlantedArchived ? (
                <Flex justifyContent="center" alignItems="center" minH="200px">
                  <Spinner size="lg" color="green.500" thickness="3px" />
                  <Text ml={5}>Loading archived newly planted responses...</Text>
                </Flex>
              ) : (
              <Box overflowX="auto" >
                <ResponseTable 
                  data={archivedNewlyPlantedInputs.results} 
                  status="NEWLY PLANTED" 
                  selectedItems={[]}
                  onSelectItem={() => {}}
                  onSelectAll={() => {}}
                />
              </Box>
              )}

              {archivedNewlyPlantedError && (
                <Box 
                  overflow="hidden" 
                  bg="white" 
                  p={5} 
                >
                  <Alert status="error" borderRadius="md">
                    <AlertIcon />
                    <AlertTitle>Error loading data!</AlertTitle>
                    <AlertDescription>
                      {archivedNewlyPlantedError || "Unable to load archived newly planted responses."}
                    </AlertDescription>
                  </Alert>
                </Box>
              )}
              
              <Flex justifyContent="space-between" alignItems="center" mt={4}>
                <PaginationControls 
                  currentPage={newlyPlantedArchivedPage}
                  setCurrentPage={setNewlyPlantedArchivedPage}
                  totalPages={archivedNewlyPlantedInputs.totalPages}
                  totalItems={archivedNewlyPlantedInputs.totalCount}
                  colorScheme="green"
                />
              </Flex>
            </Box>
            
            {/* ARCHIVED HARVESTING SECTION */}
            <Box mb={8}>
              <Flex 
                justify="space-between" 
                align="center" 
                mb={4}
                bg="gray.50"
                p={3}
                height={"60px"}
                borderRadius="md"
                borderLeftWidth="4px"
                borderLeftColor="gray.500"
              >
                <Heading as="h2" size="md" display="flex" alignItems="center">
                  <Icon as={FaBoxes} mr={2} color="orange.600" /> ARCHIVED HARVESTING RESPONSES
                </Heading>
              </Flex>
            
              {isLoadingHarvestingArchived ? (
                <Flex justifyContent="center" alignItems="center" minH="200px">
                  <Spinner size="lg" color="orange.500" thickness="3px" />
                  <Text ml={5}>Loading archived harvesting responses...</Text>
                </Flex>
              ) : (
              <Box overflowX="auto">
                <ResponseTable 
                  data={archivedHarvestingInputs.results} 
                  status="HARVESTING" 
                  selectedItems={[]}
                  onSelectItem={() => {}}
                  onSelectAll={() => {}}
                />
              </Box>
              )}

              {archivedHarvestingError && (
                <Box 
                  overflow="hidden" 
                  bg="white" 
                  p={5} 
                >
                  <Alert status="error" borderRadius="md">
                    <AlertIcon />
                    <AlertTitle>Error loading data!</AlertTitle>
                    <AlertDescription>
                      {archivedHarvestingError || "Unable to load archived harvesting responses."}
                    </AlertDescription>
                  </Alert>
                </Box>
              )}

              <Flex justifyContent="space-between" alignItems="center" mt={4}>
                <PaginationControls 
                  currentPage={harvestingArchivedPage}
                  setCurrentPage={setHarvestingArchivedPage}
                  totalPages={archivedHarvestingInputs.totalPages}
                  totalItems={archivedHarvestingInputs.totalCount}
                  colorScheme="orange"
                />
              </Flex>
            </Box>
          </>
        )}
            
      {/* Details Modal */}
      <Modal 
        isOpen={isOpen}
        onClose={onClose} 
        size="3xl" 
        closeOnOverlayClick={false} 
        scrollBehavior="inside"
        isCentered
        motionPreset="none"
        initialFocusRef={null}
        autoFocus={false}
        trapFocus={false}        
        returnFocusOnClose={false}
      >
        <ModalOverlay />
        <ModalContent borderRadius="lg" overflow="hidden">
          <ModalHeader 
            bg={selectedResponse?.farmerInput?.isForReview === true ? "orange.50" : "gray.50"}
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
                editable={false} // make details modal read-only
              />
            )}
          </ModalBody>
          
          <ModalFooter bg="gray.50" borderTopWidth="1px" borderColor="gray.200">
            
            {selectedResponse?.farmerInput?.isArchived ? (
              <>
                <Button variant="outline" mr={3} onClick={onClose} _hover={{ bg: "gray.100" }}>
                  Close
                </Button>
                <Button 
                  colorScheme="blue" 
                  boxShadow="sm"
                  _hover={{ boxShadow: "md", bg: "blue.600" }}
                  onClick={() => handleUnarchiveResponse(selectedResponse)}
                  isLoading={isUnarchivingResponse}
                >
                  Unarchive Response
                </Button>
              </>
            ) : (
              <>
                {selectedResponse?.farmerInput?.isForReview === true ? (
                  <>
                    <Button 
                      colorScheme="orange" 
                      onClick={() => handleUnsetForReview(selectedResponse)}
                      boxShadow="sm"
                      _hover={{ boxShadow: "md", bg: "orange.600" }}
                      isLoading={isUpdatingForReview}
                    >
                      Unflag for Review
                    </Button>
                  </>
                ) : (
                <>
                  <Button 
                    colorScheme="yellow" 
                    onClick={() => handleSetForReview(selectedResponse)}
                    boxShadow="sm"
                    _hover={{ boxShadow: "md", bg: "yellow.500" }}
                    isLoading={isUpdatingForReview}
                  >
                    Flag for Review
                  </Button>
                </>
              )}


                <Spacer />

                
                <Button variant="outline" mr={3} onClick={onClose} _hover={{ bg: "gray.100" }}>
                  Close
                </Button>

                {selectedResponse?.farmerInput?.isForReview === true && (
                  <Button 
                    colorScheme="yellow" 
                    boxShadow="sm"
                    mr={3}
                    _hover={{ boxShadow: "md", bg: "yellow.500" }}
                    onClick={onOpenArchive}
                  >
                    Archive Response
                  </Button>
                )}

                {selectedResponse?.farmerInput?.isForReview === true && (
                  <Button 
                    colorScheme="blue" 
                    boxShadow="sm"
                    _hover={{ boxShadow: "md", bg: "blue.600" }}
                    onClick={onOpenRequestEdit}
                    isLoading={isUpdatingFields}
                  >
                    Request Edit
                  </Button>
                )}

                {selectedResponse?.farmerInput?.isForReview === false && (
                  <Tooltip label="Cannot push responses that are flagged for review." placement="top" hasArrow isDisabled={!selectedResponse?.farmerInput?.isForReview === true}>
                    <Button 
                      colorScheme="green" 
                      onClick={onOpenWarning}
                      boxShadow="sm"
                      _hover={{ boxShadow: "md", bg: "green.600" }}
                    >
                      Push
                    </Button>
                  </Tooltip>
                )}
              </>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* Warning Modals */}
      <Modal isOpen={isOpenWarning} size="xs" onClose={onCloseWarning} closeOnOverlayClick={false} scrollBehavior="inside" isCentered  motionPreset="none">
        <ModalOverlay/>
        <ModalContent borderRadius="lg" overflow="hidden">
          <ModalHeader
            bg="orange.50" 
            borderBottomWidth="1px"
            borderColor="gray.200"
            py={4}
            display="flex" 
            alignItems="center"
          >
            <Icon as={GoAlertFill} mr={2} color="orange.500" />
            Confirm Action
          </ModalHeader>

          <ModalFooter bg="gray.50" borderTopWidth="1px" borderColor="gray.200">
            <Flex w="100%">
            <Button 
              variant="outline" 
              mr={3} 
              onClick={onCloseWarning}
              size="md"
              _hover={{ bg: "gray.100" }}
              w={"40%"}
            >
              Cancel
            </Button>
            <Spacer/>
            <Button 
                colorScheme="green"
                onClick={handleModalSubmit}
                isLoading={isCreatingUnifiedResponse}
                size="md"
                _hover={{ boxShadow: "md", bg: "green.600" }}
                w={"60%"}
            >
              Push To Records
            </Button>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isOpenWarningBatch} size="xs" onClose={onCloseWarningBatch} closeOnOverlayClick={false} scrollBehavior="inside" isCentered  motionPreset="none">
        <ModalOverlay/>
        <ModalContent borderRadius="lg" overflow="hidden">
          <ModalHeader
            bg="orange.50" 
            borderBottomWidth="1px"
            borderColor="gray.200"
            py={4}
            display="flex" 
            alignItems="center"
          >
            <Icon as={GoAlertFill} mr={2} color="orange.500" />
            Confirm Action
          </ModalHeader>

          <ModalFooter bg="gray.50" borderTopWidth="1px" borderColor="gray.200">
            <Flex w="100%">
            <Button 
              variant="outline" 
              mr={3} 
              onClick={onCloseWarningBatch}
              size="md"
              _hover={{ bg: "gray.100" }}
              w={"40%"}
            >
              Cancel
            </Button>
            <Spacer/>
            <Button 
                colorScheme="green"
                size="md"
                _hover={{ boxShadow: "md", bg: "green.600" }}
                w={"60%"}
                onClick={() => {
                  if (pushType === 'NEWLY_PLANTED') {
                    handleBatchPush(selectedNewlyPlanted, newlyPlantedInputs.results, 'NEWLY_PLANTED');
                  } else if (pushType === 'HARVESTING') {
                    handleBatchPush(selectedHarvesting, harvestingInputs.results, 'HARVESTING');
                  }
                }}
                isLoading={isBatchProcessing}
            >
              Push {pushType === 'NEWLY_PLANTED' ? selectedNewlyPlanted.length : selectedHarvesting.length} Selected
            </Button>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isOpenArchive} size="xs" onClose={onCloseArchive} closeOnOverlayClick={false} scrollBehavior="inside" isCentered  motionPreset="none">
        <ModalOverlay/>
        <ModalContent borderRadius="lg" overflow="hidden">
          <ModalHeader
            bg="yellow.50" 
            borderBottomWidth="1px"
            borderColor="gray.200"
            py={4}
            display="flex" 
            alignItems="center"
          >
            <Icon as={GoAlertFill} mr={2} color="yellow.500" />
            Archive Response?
          </ModalHeader>

          <ModalFooter bg="gray.50" borderTopWidth="1px" borderColor="gray.200">
            <Flex w="100%">
            <Button 
              variant="outline" 
              mr={3} 
              onClick={onCloseArchive}
              size="md"
              _hover={{ bg: "gray.100" }}
              w={"40%"}
            >
              Cancel
            </Button>
            <Spacer/>
            <Button 
                colorScheme="yellow"
                onClick={() => handleArchiveResponse(selectedResponse)}
                size="md"
                _hover={{ boxShadow: "md", bg: "yellow.600" }}
                w={"60%"}
                isLoading={isArchivingResponse}
            >
              Archive Response
            </Button>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* REQUEST EDIT MODAL */}
      <Modal isOpen={isOpenRequestEdit} onClose={onCloseRequestEdit} size="md" isCentered motionPreset='none' closeOnOverlayClick={false} scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent borderRadius="lg" overflow="hidden">
          <ModalHeader
            bg="gray.50"
            borderBottomWidth="1px"
            borderColor="gray.200"
            py={4}
            display="flex" 
            alignItems="center"
          >
            Request Edit From Farmer
          </ModalHeader>
          <ModalBody py={6}>
            {selectedResponse ? (
              <VStack align="stretch" spacing={4}>
                {/* Warning if no phone number */}
                {!selectedResponse.farmerInput?.farmer_account_id?.mobile_number && (
                  <Alert status="warning" borderRadius="md" variant="left-accent">
                    <AlertIcon />
                    <Box flex="1">
                      <AlertTitle fontSize="sm">No Phone Number Registered</AlertTitle>
                      <AlertDescription fontSize="xs">
                        SMS notification cannot be sent. Please contact the farmer leader or conduct a site visit to request this edit.
                      </AlertDescription>
                    </Box>
                  </Alert>
                )}

                {/* Dynamic fields based on stage/type */}
                {selectedResponse.cropRecord?.crop_stage === 'NEWLY PLANTED' ? (
                  selectedResponse.cropType?.crop_type === 'VEGETABLES, ROOT CROPS AND OTHER INDUSTRIAL CROPS' ? (
                    <FormControl>
                      <FormLabel fontWeight="medium">Total Area Planted (ha)</FormLabel>
                      <InputGroup>
                        <Input
                          type="number"
                          value={requestEditValues.total_area_planted ?? ''}
                          onChange={(e) => setRequestEditValues(v => ({ ...v, total_area_planted: e.target.value }))
                          }
                        />
                        <InputRightAddon children="hectares" />
                      </InputGroup>
                    </FormControl>
                  ) : (
                    <FormControl>
                      <FormLabel fontWeight="medium">Total Number of Trees</FormLabel>
                      <InputGroup>
                        <Input
                          type="number"
                          value={requestEditValues.total_trees ?? ''}
                          onChange={(e) => setRequestEditValues(v => ({ ...v, total_trees: e.target.value }))
                          }
                        />
                        <InputRightAddon children="trees" />
                      </InputGroup>
                    </FormControl>
                  )
                ) : (
                  // HARVESTING
                  <>
                    <FormControl>
                      <FormLabel fontWeight="medium">Total Weight</FormLabel>
                      <InputGroup>
                        <Input
                          type="number"
                          value={requestEditValues.total_weight ?? ''}
                          onChange={(e) => setRequestEditValues(v => ({ ...v, total_weight: e.target.value }))
                          }
                        />
                        <InputRightAddon children="kg" />
                      </InputGroup>
                    </FormControl>

                    {selectedResponse.cropType?.crop_type === 'VEGETABLES, ROOT CROPS AND OTHER INDUSTRIAL CROPS' ? (
                      <FormControl>
                        <FormLabel fontWeight="medium">Total Area Harvested (ha)</FormLabel>
                        <InputGroup>
                          <Input
                            type="number"
                            value={requestEditValues.total_area_harvested ?? ''}
                            onChange={(e) => setRequestEditValues(v => ({ ...v, total_area_harvested: e.target.value }))
                            }
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
                            value={requestEditValues.trees_harvested ?? ''}
                            onChange={(e) => setRequestEditValues(v => ({ ...v, trees_harvested: e.target.value }))
                            }
                          />
                          <InputRightAddon children="trees" />
                        </InputGroup>
                      </FormControl>
                    )}
                  </>
                )}

                <Divider />

                <FormControl isRequired>
                  <FormLabel fontWeight="medium">Reason for request</FormLabel>
                  <Textarea
                    placeholder="Explain why this edit is needed..."
                    value={requestEditReason}
                    onChange={(e) => setRequestEditReason(e.target.value)}
                    minH="100px"
                  />
                </FormControl>
              </VStack>
            ) : null}
          </ModalBody>
          <ModalFooter bg="gray.50" borderTopWidth="1px" borderColor="gray.200">
            <Flex w="100%" display={'flex'} justifyContent={'right'}>
              <Button 
                variant="outline" 
                onClick={onCloseRequestEdit}
                size="md"
                _hover={{ bg: "gray.100" }}
              >
                Cancel
              </Button>
            
              <Button
                colorScheme="blue"
                onClick={handleRequestConsent}
                isLoading={isUpdatingFields}
                isDisabled={!requestEditReason?.trim() || !hasRequestEditChanges}
                size="md"
                _hover={{ boxShadow: "md", bg: "blue.600" }}
                ml={'3'}
              >
                Send Request
              </Button>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>

    </Box>
  );
};

export default Responses;
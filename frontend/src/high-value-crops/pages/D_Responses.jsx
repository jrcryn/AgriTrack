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
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Image,
  Badge,
  AspectRatio
} from '@chakra-ui/react';
import numOfTreesToHectares from '../../components/conversions.js';
import { FaSearch, FaEye, FaSeedling, FaBoxes, FaUser, FaLeaf, FaWifi, FaUpload, FaInfo, FaCheck, FaStop, FaLink, FaExternalLinkAlt, FaCamera, FaSignature, FaCheckCircle  } from 'react-icons/fa';
import { GoAlertFill } from "react-icons/go";
import { CloseIcon } from '@chakra-ui/icons';
import { useAdminDashboard } from '../store/adminDashboard.store.js';
import { useFormStatusCheck } from '../store/farmerForm.store.js'
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../auth/store/authStore.js';

import SignatureCanvas from 'react-signature-canvas';
import { initial, set } from 'lodash';

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
  const { isOpen: isOpenScheduleVisit, onOpen: onOpenScheduleVisit, onClose: onCloseScheduleVisit } = useDisclosure();
  const { isOpen: isOpenConsentProof, onOpen: onOpenConsentProof, onClose: onCloseConsentProof } = useDisclosure();

  const { isOpen: isOpenApproveVisit, onOpen: onOpenApproveVisit, onClose: onCloseApproveVisit } = useDisclosure();
  const { isOpen: isOpenConfirmApprove, onOpen: onOpenConfirmApprove, onClose: onCloseConfirmApprove } = useDisclosure();
  const { isOpen: isOpenConfirmReject, onOpen: onOpenConfirmReject, onClose: onCloseConfirmReject } = useDisclosure();

  const [selectedNewlyPlanted, setSelectedNewlyPlanted] = useState([]);
  const [selectedHarvesting, setSelectedHarvesting] = useState([]);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [pushType, setPushType] = useState(null);

  const { user } = useAuthStore();

  const signatureRef = useRef(null);
  const canvasContainerRef = useRef(null);
  
  const [proofImage, setProofImage] = useState(null);
  const [proofImagePreview, setProofImagePreview] = useState(null);
  const [signature, setSignature] = useState(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 200 });
  const [afterValidationRemarks, setAfterValidationRemarks] = useState('');


  useEffect(() => {
    const updateCanvasSize = () => {
      if (canvasContainerRef.current) {
        const containerWidth = canvasContainerRef.current.offsetWidth;
        setCanvasSize({
          width: containerWidth - 16, // Subtract padding
          height: 200
        });
      }
    };

    if (isOpenConsentProof) {
      // Increase delay to ensure modal is fully rendered
      setTimeout(updateCanvasSize, 150);
    }
    window.addEventListener('resize', updateCanvasSize);
    
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [isOpenConsentProof]);


  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file",
          status: "error",
          duration: 3000,
          isClosable: true
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Image size should not exceed 5MB",
          status: "error",
          duration: 3000,
          isClosable: true
        });
        return;
      }

      setProofImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearImage = () => {
    setProofImage(null);
    setProofImagePreview(null);
  };

  const handleClearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
      setSignature(null);
    }
  };

  const handleSaveSignature = () => {
    if (signatureRef.current && !signatureRef.current.isEmpty()) {
      const signatureData = signatureRef.current.toDataURL();
      setSignature(signatureData);
      
      // Disable the canvas after saving
      if (signatureRef.current) {
        signatureRef.current.off();
      }
      
      toast({
        title: "Signature saved",
        description: "Farmer signature has been captured",
        status: "success",
        duration: 2000,
        isClosable: true
      });
    } else {
      toast({
        title: "Empty signature",
        description: "Please provide a signature before saving",
        status: "warning",
        duration: 3000,
        isClosable: true
      });
    }
  };

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
    createUnifiedFarmerResponse,
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
    isRequestingEdit,

    updateFarmerResponseFields,
    isUpdatingFarmerResponse,

    createValidationScheduleVisit,
    setValidationVisitCompleted,
    approveValidationVisitDetails,
    rejectValidationVisitDetails,
    isCreatingValidationSchedule,
    isSettingVisitCompleted,
    isApprovingVisitDetails,
    isRejectingVisitDetails,

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

    const handleUpdateResponseFields = async () => {
    if (!selectedResponse?.farmerInput?._id) {
      toast({
        title: "Error",
        description: "No response selected.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await updateFarmerResponseFields({
        farmerId: selectedResponse.farmerInput._id
      });
      await unflagResponseForReview(selectedResponse.farmerInput._id);

      toast({
        title: "Updated",
        description: response?.message || "Fields updated successfully.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      onClose();
      setSelectedResponse(null);
      queryClient.invalidateQueries({ queryKey: ['unvalidatedNewlyPlanted'] });
      queryClient.invalidateQueries({ queryKey: ['unvalidatedHarvesting'] });

    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed updating fields.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
    };



  const ButtonWithNotification = ({ children, showNotification, dotColor }) => {
    return (
      <Box position="relative" display="inline-block">
        {children}
        {showNotification && (
          <Box
            position="absolute"
            top="-5px"
            right="-5px"
            width="12px"
            height="12px"
            bg={dotColor}
            borderRadius="full"
            boxShadow="0 0 0 2px white"
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
                          {user?.role === 'HVCM' && (
                            <ButtonWithNotification 
                              showNotification={
                                !response.farmerInput?.successfullyUpdated && (
                                  (response.farmerInput?.editConsent?.status === 'Granted') ||
                                  (response.farmerInput?.editConsent?.status === 'Denied') ||
                                  response.farmerInput?.validationVisitDetails?.status === 'Completed' ||
                                  response.farmerInput?.validationVisitDetails?.status === 'Rejected'
                                )
                              }
                              dotColor={
                                response.farmerInput?.editConsent?.status === 'Granted' &&
                                !response.farmerInput?.successfullyUpdated
                                  ? 'green.400'
                                  : response.farmerInput?.editConsent?.status === 'Denied'
                                  ? 'red.400'
                                  : (response.farmerInput?.validationVisitDetails?.status === 'Completed' &&
                                     !response.farmerInput?.validationVisitDetails?.isValidationVisitDetailsApproved)
                                  ? 'blue.400'
                                  : response.farmerInput?.validationVisitDetails?.status === 'Rejected'
                                  ? 'red.400'
                                   // color for manager-approved validation (for staff)
                                  : (response.farmerInput?.validationVisitDetails?.status === 'Completed' &&
                                     response.farmerInput?.validationVisitDetails?.isValidationVisitDetailsApproved === true)
                                  ? 'green.400'
                                  : undefined
                              }
                            >
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
                          )}
                          {user?.role === 'HVCS' && (
                            <ButtonWithNotification 
                              showNotification={
                                !response.farmerInput?.successfullyUpdated && (
                                  (response.farmerInput?.editConsent?.status === 'Granted') ||
                                  (response.farmerInput?.editConsent?.status === 'Denied') ||
                                  response.farmerInput?.validationVisitDetails?.status === 'Rejected' ||
                                  // show notification for staff when manager HAS approved validation visit details
                                  (response.farmerInput?.validationVisitDetails?.status === 'Completed' &&
                                   response.farmerInput?.validationVisitDetails?.isValidationVisitDetailsApproved === true)
                                )
                              }
                              dotColor={
                                response.farmerInput?.editConsent?.status === 'Granted' &&
                                !response.farmerInput?.successfullyUpdated
                                  ? 'yellow.400'
                                  : response.farmerInput?.editConsent?.status === 'Denied'
                                  ? 'red.400'
                                  : response.farmerInput?.validationVisitDetails?.status === 'Rejected'
                                  ? 'red.400'
                                  // color for manager-approved validation (for staff)
                                  : (response.farmerInput?.validationVisitDetails?.status === 'Completed' &&
                                     response.farmerInput?.validationVisitDetails?.isValidationVisitDetailsApproved === true)
                                  ? 'green.400'
                                  : undefined
                              }
                            >
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
                          )}
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

  // Request-edit state
  const [requestEditValues, setRequestEditValues] = useState({});
  const [requestEditReason, setRequestEditReason] = useState("");
  const [hasRequestEditChanges, setHasRequestEditChanges] = useState(false);

  // fields for scheduling validation visit
  const [validationVisitDate, setValidationVisitDate] = useState('');
  const [validationVisitRemarks, setValidationVisitRemarks] = useState('');

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
    if (!selectedResponse || (!isOpenRequestEdit && !isOpenScheduleVisit)) return;

    const hasChanges = Object.keys(requestEditValues).some(key => {
      const currentValue = String(requestEditValues[key] ?? '');
      const originalValue = String(selectedResponse.cropDetails?.[key] ?? '');
      return currentValue !== originalValue;
    });

    setHasRequestEditChanges(hasChanges);
  }, [requestEditValues, selectedResponse, isOpenRequestEdit, isOpenScheduleVisit]);

  // Initialize request-edit values when the Schedule Visit modal opens
  useEffect(() => {
    if (!isOpenScheduleVisit || !selectedResponse) return;

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
    setValidationVisitRemarks('');
    setHasRequestEditChanges(false);
  }, [isOpenScheduleVisit, selectedResponse]);

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
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to send edit request.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } 
  };

  const handleFormToggle = async () => {
    if (isFormOpen) {
      await FormStatusDisable();
      await checkFormStatus();
    } else {
      await FormStatusEnable();
      await checkFormStatus();
    }
  };

  const handleScheduleVisitSubmit = async () => {
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

    try {
      const crop_stage = selectedResponse.cropRecord?.crop_stage;

      // Use atomic requestEdit (creates edit request + awaits consent)
      const result = await createValidationScheduleVisit({
        farmerId: selectedResponse.farmerInput._id,
        crop_stage,
        updates: sanitized,
        initialRemarks: validationVisitRemarks?.trim(), 
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
      onClose();
      onCloseScheduleVisit();
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to send edit request.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } 
  };

  const handleSubmitValidationProof = async () => {
    if (!proofImage) {
      toast({
        title: "Missing proof image",
        description: "Please upload a selfie proof image",
        status: "warning",
        duration: 3000,
        isClosable: true
      });
      return;
    }

    if (!signature) {
      toast({
        title: "Missing signature",
        description: "Please capture farmer's signature",
        status: "warning",
        duration: 3000,
        isClosable: true
      });
      return;
    }

    if (!selectedResponse) {
      toast({
        title: "Error",
        description: "No response selected",
        status: "error",
        duration: 3000,
        isClosable: true
      });
      return;
    }

    try {
      // Convert signature data URL to blob
      const signatureBlob = await fetch(signature).then(r => r.blob());
      const signatureFile = new File(
        [signatureBlob], 
        `signature_${selectedResponse.farmerInput._id}.png`, 
        { type: 'image/png' }
      );

      // Create FormData
      const formData = new FormData();
      formData.append('farmerId', selectedResponse.farmerInput._id);
      formData.append('proofImage', proofImage);
      formData.append('signature', signatureFile);
      formData.append('validatorEmployeeId', user.id);
      formData.append('remarks', afterValidationRemarks);

      // Check if any edit request values have been modified
      const isNewlyPlanted = selectedResponse.cropRecord?.crop_stage === 'NEWLY PLANTED';
      const isIndustrialCrop = selectedResponse.cropType?.crop_type === 'VEGETABLES, ROOT CROPS AND OTHER INDUSTRIAL CROPS';
      
      // Get original values for comparison
      let hasChanges = false;
      const updates = {};

      if (isNewlyPlanted) {
        if (isIndustrialCrop) {
          const originalValue = selectedResponse?.farmerInput?.editConsent?.editRequestId?.total_area_planted ?? 
                              selectedResponse.cropDetails?.total_area_planted;
          const newValue = requestEditValues.total_area_planted;
          
          if (newValue !== undefined && newValue !== '' && String(newValue) !== String(originalValue)) {
            updates.total_area_planted = Number(newValue);
            hasChanges = true;
          }
        } else {
          const originalValue = selectedResponse?.farmerInput?.editConsent?.editRequestId?.total_trees ?? 
                              selectedResponse.cropDetails?.total_trees;
          const newValue = requestEditValues.total_trees;
          
          if (newValue !== undefined && newValue !== '' && String(newValue) !== String(originalValue)) {
            updates.total_trees = Number(newValue);
            hasChanges = true;
          }
        }
      } else {
        // HARVESTING
        const originalWeight = selectedResponse?.farmerInput?.editConsent?.editRequestId?.total_weight ?? 
                              selectedResponse.cropDetails?.total_weight;
        const newWeight = requestEditValues.total_weight;
        
        if (newWeight !== undefined && newWeight !== '' && String(newWeight) !== String(originalWeight)) {
          updates.total_weight = Number(newWeight);
          hasChanges = true;
        }

        if (isIndustrialCrop) {
          const originalArea = selectedResponse?.farmerInput?.editConsent?.editRequestId?.total_area_harvested ?? 
                              selectedResponse.cropDetails?.total_area_harvested;
          const newArea = requestEditValues.total_area_harvested;
          
          if (newArea !== undefined && newArea !== '' && String(newArea) !== String(originalArea)) {
            updates.total_area_harvested = Number(newArea);
            hasChanges = true;
          }
        } else {
          const originalTrees = selectedResponse?.farmerInput?.editConsent?.editRequestId?.trees_harvested ?? 
                              selectedResponse.cropDetails?.trees_harvested;
          const newTrees = requestEditValues.trees_harvested;
          
          if (newTrees !== undefined && newTrees !== '' && String(newTrees) !== String(originalTrees)) {
            updates.trees_harvested = Number(newTrees);
            hasChanges = true;
          }
        }
      }

      // Only append updates if there are changes
      if (hasChanges) {
        formData.append('updates', JSON.stringify(updates));
      }

      const response = await setValidationVisitCompleted(formData);

      toast({
        title: "Success",
        description: response.message || "Validation visit completed successfully",
        status: "success",
        duration: 5000,
        isClosable: true
      });

      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ['unvalidatedNewlyPlanted'] });
      await queryClient.invalidateQueries({ queryKey: ['unvalidatedHarvesting'] });

      // Reset states and close modal
      setProofImage(null);
      setProofImagePreview(null);
      setSignature(null);
      setRequestEditValues({});
      onCloseConsentProof();
      onClose();
      setSelectedResponse(null);

    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to submit validation proof",
        status: "error",
        duration: 5000,
        isClosable: true
      });
    }
  };

  const handleApproveValidationVisit = async () => {
  if (!selectedResponse?.farmerInput?._id) {
    toast({
      title: "Error",
      description: "No response selected.",
      status: "error",
      duration: 4000,
      isClosable: true,
    });
    return;
  }

  try {
    const response = await approveValidationVisitDetails({
      farmerId: selectedResponse.farmerInput._id
    });

    toast({
      title: "Approved",
      description: response?.message || "Validation visit details approved successfully.",
      status: "success",
      duration: 5000,
      isClosable: true,
    });

    // Refresh the data
    queryClient.invalidateQueries({ queryKey: ['unvalidatedNewlyPlanted'] });
    queryClient.invalidateQueries({ queryKey: ['unvalidatedHarvesting'] });

    onCloseApproveVisit();
    onClose();
    onCloseConfirmApprove();
    setSelectedResponse(null);

  } catch (error) {
    toast({
      title: "Error",
      description: error.response?.data?.message || "Failed to approve validation visit details.",
      status: "error",
      duration: 5000,
      isClosable: true,
    });
  }
  };

  const handleRejectValidationVisit = async () => {
  if (!selectedResponse?.farmerInput?._id) {
    toast({
      title: "Error",
      description: "No response selected.",
      status: "error",
      duration: 4000,
      isClosable: true,
    });
    return;
  }

  try {
    const response = await rejectValidationVisitDetails({
      farmerId: selectedResponse.farmerInput._id
    });

    toast({
      title: "Rejected",
      description: response?.message || "Validation visit details rejected successfully.",
      status: "success",
      duration: 5000,
      isClosable: true,
    });

    // Refresh the data
    queryClient.invalidateQueries({ queryKey: ['unvalidatedNewlyPlanted'] });
    queryClient.invalidateQueries({ queryKey: ['unvalidatedHarvesting'] });

    onCloseApproveVisit();
    onClose();
    onCloseConfirmReject();
    setSelectedResponse(null);

  } catch (error) {
    toast({
      title: "Error",
      description: error.response?.data?.message || "Failed to reject validation visit details.",
      status: "error",
      duration: 5000,
      isClosable: true,
    });
  }
  };

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

  const getImageUrl = (url) => {
    if (!url) return null;
    
    // Extract file ID from the URL
    const match = url.match(/[?&]id=([^&]+)/);
    if (match && match[1]) {
      const fileId = match[1];
      // Use thumbnail format which works better for embedding
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
    }
    
    return url;
  };

  // ResponseDetailForm to allow editing only for flagged responses and only allowed fields
  const ResponseDetailForm = React.memo(function ResponseDetailForm({ response }) {
    const isNewlyPlanted = response.cropRecord?.crop_stage === 'NEWLY PLANTED';
    const isHarvesting = response.cropRecord?.crop_stage === 'HARVESTING';
    const isIndustrialCrop = response.cropType?.crop_type === 'VEGETABLES, ROOT CROPS AND OTHER INDUSTRIAL CROPS';
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

    // Get edit consent status
    const editConsentStatus = response.farmerInput?.editConsent?.status;
    const requiredValidationVisits = response.farmerInput?.requiredValidationVisit;
    const isSubmittedValidationVisitProof = response.farmerInput?.validationVisitDetails?.status;
    const isValidationDetailsApproved = response.farmerInput?.validationVisitDetails?.isValidationVisitDetailsApproved;
    const hasEditRequest = editConsentStatus && ['Pending', 'Granted', 'Denied', 'Completed'].includes(editConsentStatus) || requiredValidationVisits === true;
    const successfullyUpdated = response.farmerInput?.successfullyUpdated;

    return ( 
      <VStack spacing={6} align="stretch">

        {/* Edit Consent Status Alert */}
        {hasEditRequest && (
          <>
            <Alert
              status={
                editConsentStatus === 'Granted' || editConsentStatus === 'Completed' || isValidationDetailsApproved === true
                  ? 'success' 
                  : editConsentStatus === 'Denied' 
                  ? 'error'
                  : isSubmittedValidationVisitProof === 'Completed'
                  ? 'info'
                  : isSubmittedValidationVisitProof === 'Rejected'
                  ? 'error'
                  : 'info'
              }
              variant="left-accent"
              borderRadius="md"
            >
              <AlertIcon />
              <Box flex="1">
                <AlertTitle fontSize="sm">
                  {successfullyUpdated === true && 'Edit Successfully Applied'}
                  {!successfullyUpdated && isValidationDetailsApproved === true && 'Validation Visit Details Approved'}
                  {!successfullyUpdated && isSubmittedValidationVisitProof === 'Rejected' && !isValidationDetailsApproved && 'Validation Visit Details Rejected'}
                  {!successfullyUpdated && isSubmittedValidationVisitProof === 'Completed' && !isValidationDetailsApproved && 'Validation Visit Proof Submitted'}
                  {!successfullyUpdated && requiredValidationVisits === true && isSubmittedValidationVisitProof !== 'Completed' && isSubmittedValidationVisitProof !== 'Rejected' && !isValidationDetailsApproved && 'Validation Visit Made Required'}
                  {!successfullyUpdated && editConsentStatus === 'Granted' && !requiredValidationVisits && !isValidationDetailsApproved && 'Farmer Granted Edit Permission'}
                  {!successfullyUpdated && editConsentStatus === 'Denied' && !requiredValidationVisits && !isValidationDetailsApproved && 'Farmer Denied Edit Request'}
                  {!successfullyUpdated && editConsentStatus === 'Pending' && !requiredValidationVisits && !isValidationDetailsApproved && 'Edit Request Pending'}
                </AlertTitle>
                <AlertDescription fontSize="xs">
                  {successfullyUpdated === true && (
                    <>
                      The requested edits have been successfully applied to this response. The updated values are shown below.
                    </>
                  )}
                  {!successfullyUpdated && isValidationDetailsApproved === true && (
                    <>
                      The validation visit details have been approved by the manager. You can now apply the requested changes to update this response.
                      {response.farmerInput.validationVisitDetails.initialRemarks && (
                        <Text mt={1} fontStyle="italic">
                          Initial Remarks: {response.farmerInput.validationVisitDetails.initialRemarks}
                        </Text>
                      )}
                      {response.farmerInput.validationVisitDetails.remarks && (
                        <Text mt={1} fontStyle="italic">
                          Final Remarks: {response.farmerInput.validationVisitDetails.remarks}
                        </Text>
                      )}
                    </>
                  )}
                  {!successfullyUpdated && isSubmittedValidationVisitProof === 'Rejected' && !isValidationDetailsApproved && (
                    <>
                      The manager has rejected the validation visit proof. The submission was incomplete or inaccurate. Please review the requirements and resubmit the validation proof.
                      {response.farmerInput.validationVisitDetails.initialRemarks && (
                        <Text mt={1} fontStyle="italic">
                          Initial Remarks: {response.farmerInput.validationVisitDetails.initialRemarks}
                        </Text>
                      )}
                    </>
                  )}
                  {!successfullyUpdated && isSubmittedValidationVisitProof === 'Completed' && !isValidationDetailsApproved && (
                    <>
                      Validation proof submitted. Waiting for a manager to review and approve or reject the validation visit details.
                      {response.farmerInput.validationVisitDetails.initialRemarks && (
                        <Text mt={1} fontStyle="italic">
                          Initial Remarks: {response.farmerInput.validationVisitDetails.initialRemarks}
                        </Text>
                      )}
                      {response.farmerInput.validationVisitDetails.remarks && (
                        <Text mt={1} fontStyle="italic">
                          Final Remarks: {response.farmerInput.validationVisitDetails.remarks}
                        </Text>
                      )}
                    </>
                  )}
                  {!successfullyUpdated && requiredValidationVisits === true && isSubmittedValidationVisitProof !== 'Completed' && isSubmittedValidationVisitProof !== 'Rejected' && !isValidationDetailsApproved && (
                    <>
                      A validation visit has been required to verify the requested edits.
                      {response.farmerInput.validationVisitDetails.initialRemarks && (
                        <Text mt={1} fontStyle="italic">
                          Initial Remarks: {response.farmerInput.validationVisitDetails.initialRemarks}
                        </Text>
                      )}
                    </>
                  )}
                  {!successfullyUpdated && editConsentStatus === 'Granted' && !requiredValidationVisits && !isSubmittedValidationVisitProof && !isValidationDetailsApproved && 
                    `The farmer has granted permission to edit their response. You can now apply the requested changes or push the updated data to records.`
                  }
                  {!successfullyUpdated && editConsentStatus === 'Denied' && !requiredValidationVisits && !isValidationDetailsApproved && 
                    `The farmer has denied the edit request for their response. No changes can be made without their consent. You may consider scheduling a validation visit to verify the data directly.`
                  }
                  {!successfullyUpdated && editConsentStatus === 'Pending' && !requiredValidationVisits && !isValidationDetailsApproved && 
                    `Waiting for farmer's response to the edit request. An SMS notification has been sent. If it's taking too long, consider scheduling up a validation visit, reaching out to the farmer directly.`
                  }
                  {!successfullyUpdated && response.farmerInput?.editConsent?.reason && !requiredValidationVisits && !isSubmittedValidationVisitProof && !isValidationDetailsApproved && (
                    <Text mt={1} fontStyle="italic">
                      Reason: {response.farmerInput.editConsent.reason}
                    </Text>
                  )}
                </AlertDescription>
              </Box>
            </Alert>
          </>
        )}

        {/* No Phone Number Alert - Only show when edit requested or validation visit scheduled */}
        {response.farmerInput.isForReview === true && !response.farmerInput?.farmer_account_id?.mobile_number && !response?.farmerInput?.validationVisitDetails?.status && (
          <Alert status="warning" borderRadius="md" variant="left-accent">
            <AlertIcon />
              <Box flex="1">
                <AlertTitle fontSize="sm">No Phone Number Registered</AlertTitle>
                <AlertDescription fontSize="xs">
                  SMS notification for edit request cannot be sent. Please update the farmer details on the system or conduct a site visit to request an edit.
                </AlertDescription>
              </Box>
          </Alert>
            )}

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
                      value={`${response.cropDetails?.total_area_planted != null ? response.cropDetails.total_area_planted : '-'}${response?.farmerInput?.editConsent?.editRequestId?.total_area_planted != null && response?.farmerInput?.editConsent?.editRequestId?.resolved === false && !response?.farmerInput?.successfullyUpdated ? ' => ' + response.farmerInput.editConsent.editRequestId.total_area_planted : ''}`}
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
                        value={`${response.cropDetails?.total_trees != null ? response.cropDetails.total_trees : '-'}${response?.farmerInput?.editConsent?.editRequestId?.total_trees != null && response?.farmerInput?.editConsent?.editRequestId?.resolved === false && !response?.farmerInput?.successfullyUpdated ? ' => ' + response.farmerInput.editConsent.editRequestId.total_trees : ''}`}
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
                    value={`${response.cropDetails?.total_weight != null ? response.cropDetails.total_weight : '-'}${response?.farmerInput?.editConsent?.editRequestId?.total_weight != null && response?.farmerInput?.editConsent?.editRequestId?.resolved === false && !response?.farmerInput?.successfullyUpdated ? ' => ' + response.farmerInput.editConsent.editRequestId.total_weight : ''}`}
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
                      value={`${response.cropDetails?.total_area_harvested != null ? response.cropDetails.total_area_harvested : '-'}${response?.farmerInput?.editConsent?.editRequestId?.total_area_harvested != null && response?.farmerInput?.editConsent?.editRequestId?.resolved === false && !response?.farmerInput?.successfullyUpdated ? ' => ' + response.farmerInput.editConsent.editRequestId.total_area_harvested : ''}`}
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
                        value={`${response.cropDetails?.trees_harvested != null ? response.cropDetails.trees_harvested : '-'}${response?.farmerInput?.editConsent?.editRequestId?.trees_harvested != null && response?.farmerInput?.editConsent?.editRequestId?.resolved === false && !response?.farmerInput?.successfullyUpdated ? ' => ' + response.farmerInput.editConsent.editRequestId.trees_harvested : ''}`}
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
            borderRadius={'md'}
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
        blockScrollOnMount={false}
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
                    {selectedResponse?.farmerInput?.editConsent?.status === 'Pending' ? (
                      <Tooltip label="You can't unflag a response for review if the edit request status is still pending." hasArrow placement='top'>
                        <Button 
                          colorScheme="orange" 
                          onClick={() => handleUnsetForReview(selectedResponse)}
                          boxShadow="sm"
                          _hover={{ boxShadow: "md", bg: "orange.600" }}
                          isLoading={isUpdatingForReview}
                          isDisabled
                        >
                          Unflag for Review
                        </Button>
                      </Tooltip>
                    ) : (
                      <Button 
                        colorScheme="orange" 
                        onClick={() => handleUnsetForReview(selectedResponse)}
                        boxShadow="sm"
                        _hover={{ boxShadow: "md", bg: "orange.600" }}
                        isLoading={isUpdatingForReview}
                      >
                        Unflag for Review
                      </Button>
                    )}
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
                

                {/* MGA NAKAKAMATAY NA BUTTONS! */}
                {selectedResponse?.farmerInput?.isForReview === true && (
                  <>
                    {/* Consent Proof Button - For staff to upload validation proof during visit */}
                    {selectedResponse?.farmerInput?.requiredValidationVisit === true && 
                    (selectedResponse?.farmerInput?.validationVisitDetails?.status === 'Pending' ||
                    selectedResponse?.farmerInput?.validationVisitDetails?.status === 'Rejected') && (
                      <Button 
                        colorScheme="blue" 
                        boxShadow="sm"
                        _hover={{ boxShadow: "md", bg: "blue.600" }}
                        onClick={onOpenConsentProof}
                      >
                        Consent Proof
                      </Button>
                    )}

                    {/* View Consent Proof Button - For managers to review validation proof */}
                    {user?.role === 'HVCM' && 
                    selectedResponse?.farmerInput?.validationVisitDetails?.status === 'Completed' &&
                    (selectedResponse?.farmerInput?.validationVisitDetails?.isValidationVisitDetailsApproved === false || 
                      !selectedResponse?.farmerInput?.validationVisitDetails?.isValidationVisitDetailsApproved) && (
                      <Button 
                        colorScheme="purple" 
                        boxShadow="sm"
                        _hover={{ boxShadow: "md", bg: "purple.600" }}
                        onClick={onOpenApproveVisit}
                      >
                        View Consent Proof
                      </Button>
                    )}

                    {/* Update Button - Apply the approved changes */}
                    {((selectedResponse?.farmerInput?.editConsent?.status === 'Granted') ||
                      (selectedResponse?.farmerInput?.validationVisitDetails?.isValidationVisitDetailsApproved === true)) && (
                      <Button 
                        colorScheme="blue" 
                        boxShadow="sm"
                        _hover={{ boxShadow: "md", bg: "blue.600" }}
                        onClick={handleUpdateResponseFields}
                        isLoading={isUpdatingFarmerResponse}
                      >
                        Update
                      </Button>
                    )}

                    {/* Options Button - For pending SMS requests */}
                    {selectedResponse?.farmerInput?.editConsent?.status === 'Pending' && 
                      selectedResponse?.farmerInput?.successfullyUpdated === false &&
                    !selectedResponse?.farmerInput?.requiredValidationVisit &&
                    (!selectedResponse?.farmerInput?.validationVisitDetails || selectedResponse?.farmerInput?.validationVisitDetails.isValidationVisitDetailsApproved === false) && (
                      <Menu>
                        <MenuButton
                          as={Button}
                          colorScheme="blue"
                          boxShadow="sm"
                          _hover={{ boxShadow: "md", bg: "blue.600" }}
                        >
                          Options
                        </MenuButton>
                        <MenuList>
                          <MenuItem onClick={onOpenRequestEdit}>Update Request</MenuItem>
                          <MenuItem onClick={onOpenScheduleVisit}>Require Validation Visit</MenuItem>
                        </MenuList>
                      </Menu>
                    )}

                    {/* Request Edit Button - Send SMS notification to farmer */}
                    {(selectedResponse?.farmerInput?.editConsent?.status === 'Completed' ||
                      !selectedResponse?.farmerInput?.editConsent?.status) && 
                      selectedResponse?.farmerInput?.farmer_account_id?.mobile_number && (
                      <Button 
                        colorScheme="blue" 
                        boxShadow="sm"
                        _hover={{ boxShadow: "md", bg: "blue.600" }}
                        onClick={onOpenRequestEdit}
                      >
                        Request Edit
                      </Button>
                    )}

                    {/* Require Validation Visit Button - When no mobile number or no SMS request sent */}
                    {((!selectedResponse?.farmerInput?.farmer_account_id?.mobile_number || 
                       selectedResponse?.farmerInput?.editConsent?.status === 'Denied') && 
                     (!selectedResponse?.farmerInput?.validationVisitDetails?.status || 
                      selectedResponse?.farmerInput?.validationVisitDetails?.status === 'Rejected')) && (
                      <Button 
                        colorScheme="blue" 
                        boxShadow="sm"
                        _hover={{ boxShadow: "md", bg: "blue.600" }}
                        onClick={onOpenScheduleVisit}
                      >
                        Require Validation Visit
                      </Button>
                    )}
                  </>
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

                {/* Heads-up when updating an existing pending request */}
                {selectedResponse?.farmerInput?.editConsent?.status === 'Pending' && (
                  <Alert status="warning" borderRadius="md" variant="left-accent">
                    <AlertIcon />
                    <Box flex="1">
                      <AlertTitle fontSize="sm">Update will notify the farmer again</AlertTitle>
                      <AlertDescription fontSize="xs">
                        Updating this edit request will send another SMS notification to the farmer. If no changes are needed, consider waiting for the farmer's response to the current request instead.
                      </AlertDescription>
                    </Box>
                  </Alert>
                )}

                {(!selectedResponse?.farmerInput?.editConsent?.status || selectedResponse?.farmerInput?.editConsent?.status === 'Completed') && (
                  <Alert status="info" borderRadius="md" variant="left-accent">
                    <AlertIcon />
                    <Box>
                      <AlertTitle fontSize="sm">Request Edit from Farmer</AlertTitle>
                      <AlertDescription fontSize="xs">
                        Send an SMS notification to farmer where they can view the requested edits and grant them consent or not.
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
                          min="0"
                          step="0.01"
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '' || parseFloat(value) >= 0) {
                              setRequestEditValues(v => ({ ...v, total_area_planted: value }));
                            }
                          }}
                          onWheel={(e) => e.target.blur()}
                          onKeyDown={(e) => {
                            if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                              e.preventDefault();
                            }
                          }}
                        />
                        <InputRightAddon children="hectares" />
                      </InputGroup>
                      <Text fontSize="xs" color="gray.600" mt={1}>
                        Current value: <b>{selectedResponse.cropDetails?.total_area_planted ?? '-'}</b> hectares
                      </Text>
                    </FormControl>
                  ) : (
                    <FormControl>
                      <FormLabel fontWeight="medium">Total Number of Trees</FormLabel>
                      <InputGroup>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '' || parseFloat(value) >= 0) {
                              setRequestEditValues(v => ({ ...v, total_trees: value }));
                            }
                          }}
                          onWheel={(e) => e.target.blur()}
                          onKeyDown={(e) => {
                            if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '.') {
                              e.preventDefault();
                            }
                          }}
                        />
                        <InputRightAddon children="trees" />
                      </InputGroup>
                      <Text fontSize="xs" color="gray.600" mt={1}>
                        Current value: <b>{selectedResponse.cropDetails?.total_trees ?? '-'}</b> trees
                      </Text>
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
                          min="0"
                          step="0.01"
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '' || parseFloat(value) >= 0) {
                              setRequestEditValues(v => ({ ...v, total_weight: value }));
                            }
                          }}
                          onWheel={(e) => e.target.blur()}
                          onKeyDown={(e) => {
                            if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                              e.preventDefault();
                            }
                          }}
                        />
                        <InputRightAddon children="kg" />
                      </InputGroup>
                      <Text fontSize="xs" color="gray.600" mt={1}>
                        Current value: <b>{selectedResponse.cropDetails?.total_weight ?? '-'}</b> kg
                      </Text>
                    </FormControl>

                    {selectedResponse.cropType?.crop_type === 'VEGETABLES, ROOT CROPS AND OTHER INDUSTRIAL CROPS' ? (
                      <FormControl>
                        <FormLabel fontWeight="medium">Total Area Harvested (ha)</FormLabel>
                        <InputGroup>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === '' || parseFloat(value) >= 0) {
                                setRequestEditValues(v => ({ ...v, total_area_harvested: value }));
                              }
                            }}
                            onWheel={(e) => e.target.blur()}
                            onKeyDown={(e) => {
                              if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                                e.preventDefault();
                              }
                            }}
                          />
                          <InputRightAddon children="hectares" />
                        </InputGroup>
                        <Text fontSize="xs" color="gray.600" mt={1}>
                          Current value: <b>{selectedResponse.cropDetails?.total_area_harvested ?? '-'}</b> hectares
                        </Text>
                      </FormControl>
                    ) : (
                      <FormControl>
                        <FormLabel fontWeight="medium">Total Number of Trees Harvested</FormLabel>
                        <InputGroup>
                          <Input
                            type="number"
                            min="0"
                            step="1"
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === '' || parseFloat(value) >= 0) {
                                setRequestEditValues(v => ({ ...v, trees_harvested: value }));
                              }
                            }}
                            onWheel={(e) => e.target.blur()}
                            onKeyDown={(e) => {
                              if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '.') {
                                e.preventDefault();
                              }
                            }}
                          />
                          <InputRightAddon children="trees" />
                        </InputGroup>
                        <Text fontSize="xs" color="gray.600" mt={1}>
                          Current value: <b>{selectedResponse.cropDetails?.trees_harvested ?? '-'}</b> trees
                        </Text>
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
                isLoading={isRequestingEdit}
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

      {/* SCHEDULE VALIDATION VISIT MODAL */}
      <Modal isOpen={isOpenScheduleVisit} onClose={onCloseScheduleVisit} size="md" isCentered motionPreset='none' closeOnOverlayClick={false} scrollBehavior="inside">
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
            Schedule Validation Visit
          </ModalHeader>
          <ModalBody py={6}>
            <VStack align="stretch" spacing={4}>
              <Alert status="info" borderRadius="md" variant="left-accent">
                <AlertIcon />
                <Box>
                  <AlertTitle fontSize="sm">Field Validation Required</AlertTitle>
                  <AlertDescription fontSize="xs">
                    Require a validation visit to verify the requested edits on-site. Specify the corrected values below.
                  </AlertDescription>
                </Box>
              </Alert>

              {/* Dynamic Edit Fields Section */}
              {selectedResponse && (
                <>
                  {selectedResponse.cropRecord?.crop_stage === 'NEWLY PLANTED' ? (
                    selectedResponse.cropType?.crop_type === 'VEGETABLES, ROOT CROPS AND OTHER INDUSTRIAL CROPS' ? (
                      <FormControl>
                        <FormLabel fontWeight="medium">Total Area Planted (ha)</FormLabel>
                        <InputGroup>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === '' || parseFloat(value) >= 0) {
                                setRequestEditValues(v => ({ ...v, total_area_planted: value }));
                              }
                            }}
                            onWheel={(e) => e.target.blur()}
                            onKeyDown={(e) => {
                              if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                                e.preventDefault();
                              }
                            }}
                          />
                          <InputRightAddon children="hectares" />
                        </InputGroup>
                        <Text fontSize="xs" color="gray.600" mt={1}>
                          Current value: <b>{selectedResponse.cropDetails?.total_area_planted ?? '-'}</b> hectares
                        </Text>
                      </FormControl>
                    ) : (
                      <FormControl>
                        <FormLabel fontWeight="medium">Total Number of Trees</FormLabel>
                        <InputGroup>
                          <Input
                            type="number"
                            min="0"
                            step="1"
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === '' || parseFloat(value) >= 0) {
                                setRequestEditValues(v => ({ ...v, total_trees: value }));
                              }
                            }}
                            onWheel={(e) => e.target.blur()}
                            onKeyDown={(e) => {
                              if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '.') {
                                e.preventDefault();
                              }
                            }}
                          />
                          <InputRightAddon children="trees" />
                        </InputGroup>
                        <Text fontSize="xs" color="gray.600" mt={1}>
                          Current value: <b>{selectedResponse.cropDetails?.total_trees ?? '-'}</b> trees
                        </Text>
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
                            min="0"
                            step="0.01"
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === '' || parseFloat(value) >= 0) {
                                setRequestEditValues(v => ({ ...v, total_weight: value }));
                              }
                            }}
                            onWheel={(e) => e.target.blur()}
                            onKeyDown={(e) => {
                              if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                                e.preventDefault();
                              }
                            }}
                          />
                          <InputRightAddon children="kg" />
                        </InputGroup>
                        <Text fontSize="xs" color="gray.600" mt={1}>
                          Current value: <b>{selectedResponse.cropDetails?.total_weight ?? '-'}</b> kg
                        </Text>
                      </FormControl>

                      {selectedResponse.cropType?.crop_type === 'VEGETABLES, ROOT CROPS AND OTHER INDUSTRIAL CROPS' ? (
                        <FormControl>
                          <FormLabel fontWeight="medium">Total Area Harvested (ha)</FormLabel>
                          <InputGroup>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value === '' || parseFloat(value) >= 0) {
                                  setRequestEditValues(v => ({ ...v, total_area_harvested: value }));
                                }
                              }}
                              onWheel={(e) => e.target.blur()}
                              onKeyDown={(e) => {
                                if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                                  e.preventDefault();
                                }
                              }}
                            />
                            <InputRightAddon children="hectares" />
                          </InputGroup>
                          <Text fontSize="xs" color="gray.600" mt={1}>
                            Current value: <b>{selectedResponse.cropDetails?.total_area_harvested ?? '-'}</b> hectares
                          </Text>
                        </FormControl>
                      ) : (
                        <FormControl>
                          <FormLabel fontWeight="medium">Total Number of Trees Harvested</FormLabel>
                          <InputGroup>
                            <Input
                              type="number"
                              min="0"
                              step="1"
                              
                              onWheel={(e) => e.target.blur()}
                              onKeyDown={(e) => {
                                if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '.') {
                                  e.preventDefault();
                                }
                              }}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value === '' || parseFloat(value) >= 0) {
                                  setRequestEditValues(v => ({ ...v, trees_harvested: value }));
                                }
                              }}
                            />
                            <InputRightAddon children="trees" />
                          </InputGroup>
                          <Text fontSize="xs" color="gray.600" mt={1}>
                            Current value: <b>{selectedResponse.cropDetails?.trees_harvested ?? '-'}</b> trees
                          </Text>
                        </FormControl>
                      )}
                    </>
                  )}
                </>
              )}

              <Divider />

              <FormControl>
                <FormLabel fontWeight="medium">Initial Remarks (Optional)</FormLabel>
                <Textarea
                  placeholder="Add notes about why this validation visit is needed..."
                  value={validationVisitRemarks}
                  onChange={(e) => setValidationVisitRemarks(e.target.value)}
                  minH="100px"
                />
                <Text fontSize="xs" color="gray.500" mt={1}>
                  These remarks will be saved with the validation visit schedule
                </Text>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter bg="gray.50" borderTopWidth="1px" borderColor="gray.200">
            <Flex w="100%" display={'flex'} justifyContent={'right'}>
              <Button 
                variant="outline" 
                onClick={() => {
                  onCloseScheduleVisit();
                  setValidationVisitRemarks('');
                  setRequestEditValues({});
                }}
                size="md"
                _hover={{ bg: "gray.100" }}
              >
                Cancel
              </Button>
            
              <Button
                colorScheme="blue"
                size="md"
                _hover={{ boxShadow: "md", bg: "blue.600" }}
                ml={'3'}
                onClick={handleScheduleVisitSubmit}
                isLoading={isCreatingValidationSchedule}
                isDisabled={!hasRequestEditChanges}
              >
                Require Validation Visit
              </Button>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* CONSENT PROOF MODAL FOR VALIDATION VISITS */}
      <Modal isOpen={isOpenConsentProof} onClose={onCloseConsentProof} size="3xl" isCentered motionPreset="none" closeOnOverlayClick={false} scrollBehavior="inside">
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
            Upload Consent Proof
          </ModalHeader>
          <ModalBody py={6}>
            <VStack align="stretch" spacing={6}>
              <Alert status="info" borderRadius="md" variant="left-accent">
                <AlertIcon />
                <Box>
                  <AlertTitle fontSize="sm">Validation Visit Completion</AlertTitle>
                  <AlertDescription fontSize="xs">
                    Upload a proof image and capture the farmer's signature to confirm consent for the requested edits.
                  </AlertDescription>
                </Box>
              </Alert>

              {/* Proof Image Upload Section */}
              <Box>
                <FormControl isRequired>
                  <FormLabel display="flex" alignItems="center" gap={2}>
                    <Icon as={FaCamera} color="blue.500" />
                    Selfie Proof Image
                  </FormLabel>
                  <Text fontSize="sm" color="gray.600" mb={2}>
                    Upload a clear photo showing the completed work
                  </Text>
                  
                  {!proofImagePreview ? (
                    <Box
                      borderWidth={2}
                      borderStyle="dashed"
                      borderColor="gray.300"
                      borderRadius="md"
                      p={6}
                      textAlign="center"
                      bg="gray.50"
                      position="relative"
                      cursor="pointer"
                      _hover={{ borderColor: "blue.400", bg: "blue.50" }}
                      onClick={() => document.getElementById('proof-image-input').click()}
                    >
                      <Input
                        id="proof-image-input"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        display="none"
                      />
                      <Icon as={FaCamera} boxSize={10} color="gray.400" mb={2} />
                      <Text color="gray.600" fontWeight="medium">
                        Click to upload or drag and drop
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        PNG, JPG, JPEG (max 5MB)
                      </Text>
                    </Box>
                  ) : (
                    <Box position="relative" borderRadius="md" overflow="hidden" borderWidth={1} borderColor="gray.200">
                      <Image
                        src={proofImagePreview}
                        alt="Proof preview"
                        maxH="300px"
                        w="100%"
                        objectFit="contain"
                        bg="gray.100"
                      />
                      <Button
                        position="absolute"
                        top={2}
                        right={2}
                        size="sm"
                        colorScheme="red"
                        leftIcon={<CloseIcon />}
                        onClick={handleClearImage}
                      >
                        Remove
                      </Button>
                    </Box>
                  )}
                </FormControl>
              </Box>

              {/* Signature Section */}
              <Box>
                <FormControl isRequired>
                  <FormLabel display="flex" alignItems="center" gap={2}>
                    <Icon as={FaSignature} color="purple.500" />
                    Farmer Signature
                  </FormLabel>
                  <Text fontSize="sm" color="gray.600" mb={2}>
                    Ask the farmer to sign below to confirm completion
                  </Text>
                  
                  <Box
                    ref={canvasContainerRef}
                    borderWidth={2}
                    borderColor={signature ? "green.400" : "gray.300"}
                    borderRadius="md"
                    bg="white"
                    p={2}
                    position="relative"
                  >
                    <Box
                      borderWidth={1}
                      borderColor="gray.200"
                      borderRadius="md"
                      overflow="hidden"
                      position="relative"
                    >
                      <SignatureCanvas
                        ref={signatureRef}
                        canvasProps={{
                          width: canvasSize.width,
                          height: canvasSize.height,
                          style: {
                            display: 'block',
                            touchAction: 'none',
                            opacity: signature ? 0.5 : 1,
                            pointerEvents: signature ? 'none' : 'auto'
                          }
                        }}
                        backgroundColor="white"
                      />
                      {signature && (
                        <Box
                          position="absolute"
                          top={0}
                          left={0}
                          right={0}
                          bottom={0}
                          bg="transparent"
                          pointerEvents="none"
                        />
                      )}
                    </Box>
                    
                    <HStack mt={2} spacing={2}>
                      <Button
                        size="sm"
                        colorScheme="blue"
                        onClick={handleSaveSignature}
                        leftIcon={<FaSignature />}
                        isDisabled={signature !== null}
                      >
                        Save Signature
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          handleClearSignature();
                          if (signatureRef.current) {
                            signatureRef.current.on();
                          }
                        }}
                      >
                        Clear
                      </Button>
                    </HStack>

                    {signature && (
                      <Alert status="success" mt={2} borderRadius="md">
                        <AlertIcon />
                        <Text fontSize="sm">Signature captured successfully</Text>
                      </Alert>
                    )}
                  </Box>
                </FormControl>
              </Box>

              {/* Remarks Section */}
              <Box>
                <FormControl>
                  <FormLabel fontWeight="medium">Remarks (Optional)</FormLabel>
                  <Textarea
                    placeholder="Add any additional notes or observations from the validation visit..."
                    value={afterValidationRemarks}
                    onChange={(e) => setAfterValidationRemarks(e.target.value)}
                    minH="100px"
                    resize="vertical"
                  />
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    These final remarks will be saved with the validation visit details
                  </Text>
                </FormControl>
              </Box>
              <Divider />
              {/* Dynamic Edit Fields Section */}
              {selectedResponse && (
                <Box>
                  <Heading as="h4" size="sm" mb={3} color="gray.700">
                    Confirm Values
                  </Heading>
                  <Alert status="warning" borderRadius="md" variant="left-accent" mb={4}>
                    <AlertIcon />
                    <Box>
                      <AlertTitle fontSize="sm">Review and Adjust Values</AlertTitle>
                      <AlertDescription fontSize="xs">
                        The fields below show the current edit request values. If the farmer and staff agreed on different values during the validation visit, you can update them before submitting.
                      </AlertDescription>
                    </Box>
                  </Alert>

                  <VStack align="stretch" spacing={4}>
                    {selectedResponse.cropRecord?.crop_stage === 'NEWLY PLANTED' ? (
                      selectedResponse.cropType?.crop_type === 'VEGETABLES, ROOT CROPS AND OTHER INDUSTRIAL CROPS' ? (
                        <FormControl>
                          <FormLabel fontWeight="medium">Total Area Planted (ha)</FormLabel>
                          <InputGroup>
                            <Input
                              type="number"
                              value={requestEditValues.total_area_planted ?? ''}
                              onChange={(e) => setRequestEditValues(v => ({ ...v, total_area_planted: e.target.value }))}
                            />
                            <InputRightAddon children="hectares" />
                          </InputGroup>
                          <Text fontSize="xs" color="gray.600" mt={1}>
                            Current request: <b>{selectedResponse?.farmerInput?.editConsent?.editRequestId?.total_area_planted ?? selectedResponse.cropDetails?.total_area_planted ?? '-'}</b> hectares
                          </Text>
                        </FormControl>
                      ) : (
                        <FormControl>
                          <FormLabel fontWeight="medium">Total Number of Trees</FormLabel>
                          <InputGroup>
                            <Input
                              type="number"
                              value={requestEditValues.total_trees ?? ''}
                              onChange={(e) => setRequestEditValues(v => ({ ...v, total_trees: e.target.value }))}
                            />
                            <InputRightAddon children="trees" />
                          </InputGroup>
                          <Text fontSize="xs" color="gray.600" mt={1}>
                            Current request: <b>{selectedResponse?.farmerInput?.editConsent?.editRequestId?.total_trees ?? selectedResponse.cropDetails?.total_trees ?? '-'}</b> trees
                          </Text>
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
                              onChange={(e) => setRequestEditValues(v => ({ ...v, total_weight: e.target.value }))}
                            />
                            <InputRightAddon children="kg" />
                          </InputGroup>
                          <Text fontSize="xs" color="gray.600" mt={1}>
                            Current request: <b>{selectedResponse?.farmerInput?.editConsent?.editRequestId?.total_weight ?? selectedResponse.cropDetails?.total_weight ?? '-'}</b> kg
                          </Text>
                        </FormControl>

                        {selectedResponse.cropType?.crop_type === 'VEGETABLES, ROOT CROPS AND OTHER INDUSTRIAL CROPS' ? (
                          <FormControl>
                            <FormLabel fontWeight="medium">Total Area Harvested (ha)</FormLabel>
                            <InputGroup>
                              <Input
                                type="number"
                                value={requestEditValues.total_area_harvested ?? ''}
                                onChange={(e) => setRequestEditValues(v => ({ ...v, total_area_harvested: e.target.value }))}
                              />
                              <InputRightAddon children="hectares" />
                            </InputGroup>
                            <Text fontSize="xs" color="gray.600" mt={1}>
                              Current request: <b>{selectedResponse?.farmerInput?.editConsent?.editRequestId?.total_area_harvested ?? selectedResponse.cropDetails?.total_area_harvested ?? '-'}</b> hectares
                            </Text>
                          </FormControl>
                        ) : (
                          <FormControl>
                            <FormLabel fontWeight="medium">Total Number of Trees Harvested</FormLabel>
                            <InputGroup>
                              <Input
                                type="number"
                                value={requestEditValues.trees_harvested ?? ''}
                                onChange={(e) => setRequestEditValues(v => ({ ...v, trees_harvested: e.target.value }))}
                              />
                              <InputRightAddon children="trees" />
                            </InputGroup>
                            <Text fontSize="xs" color="gray.600" mt={1}>
                              Current request: <b>{selectedResponse?.farmerInput?.editConsent?.editRequestId?.trees_harvested ?? selectedResponse.cropDetails?.trees_harvested ?? '-'}</b> trees
                            </Text>
                          </FormControl>
                        )}
                      </>
                    )}
                  </VStack>
                </Box>
              )}

            </VStack>
          </ModalBody>
          <ModalFooter bg="gray.50" borderTopWidth="1px" borderColor="gray.200">
            <Flex w="100%" display="flex" justifyContent="right">
              <Button
                variant="outline"
                onClick={() => {
                  onCloseConsentProof()
                  setProofImage(null);
                  setProofImagePreview(null);
                  setSignature(null);
                  setAfterValidationRemarks('');
                  setRequestEditValues({});
                }}
                size="md"
                _hover={{ bg: "gray.100" }}
              >
                Cancel
              </Button>

              <Button
                colorScheme="blue"
                size="md"
                _hover={{ boxShadow: "md", bg: "blue.600" }}
                ml="3"
                onClick={handleSubmitValidationProof}
                isDisabled={!proofImage || !signature}
                isLoading={isSettingVisitCompleted}
              >
                Submit Consent Proof
              </Button>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* APPROVE VALIDATION VISIT PROOF MODAL. */}
      <Modal 
        isOpen={isOpenApproveVisit} 
        onClose={onCloseApproveVisit} 
        size="4xl" 
        closeOnOverlayClick={false} 
        scrollBehavior="inside" 
        isCentered 
        motionPreset="none"
      >
        <ModalOverlay />
        <ModalContent borderRadius="md" overflow="hidden">
          <ModalHeader bg="blue.50" borderBottomWidth="1px" borderColor="gray.200" display="flex" alignItems="center">
            <Icon as={FaCheckCircle} mr={3} color="blue.500" />
            Review Validation Visit Details
          </ModalHeader>

          <ModalBody py={6}>
            {selectedResponse?.farmerInput?.validationVisitDetails ? (
              <VStack spacing={6} align="stretch">
                {/* Validation Visit Information */}
                <Box bg="blue.50" p={4} borderRadius="md">
                  <Heading size="sm" mb={3}>Validation Visit Information</Heading>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                    <Box>
                      <Text fontWeight="bold" fontSize="sm" color="gray.600">Status</Text>
                      <Badge colorScheme="green">
                        {selectedResponse.farmerInput.validationVisitDetails.status}
                      </Badge>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" fontSize="sm" color="gray.600">Completed Date</Text>
                      <Text fontSize="md">
                        {formatDate(selectedResponse.farmerInput.validationVisitDetails.completedAt)}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" fontSize="sm" color="gray.600">Completed Time</Text>
                      <Text fontSize="md">
                        {formatTime(selectedResponse.farmerInput.validationVisitDetails.completedAt)}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" fontSize="sm" color="gray.600">Validator Employee</Text>
                      <Text fontSize="md">
                        {selectedResponse.farmerInput.validationVisitDetails.first_name}{' '}
                        {selectedResponse.farmerInput.validationVisitDetails.middle_name ? 
                          selectedResponse.farmerInput.validationVisitDetails.middle_name.charAt(0).toUpperCase() + '. ' : ''}
                        {selectedResponse.farmerInput.validationVisitDetails.last_name}{' '}
                        {selectedResponse.farmerInput.validationVisitDetails.suffix || ''}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" fontSize="sm" color="gray.600">Validator Email</Text>
                      <Text fontSize="md">
                        {selectedResponse.farmerInput.validationVisitDetails.email || '-'}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" fontSize="sm" color="gray.600">Validator Phone</Text>
                      <Text fontSize="md">
                        {selectedResponse.farmerInput.validationVisitDetails.phone || '-'}
                      </Text>
                    </Box>
                  </SimpleGrid>
                </Box>

                <Divider />

                {/* Proof Images Section */}
                <Box>
                  <Heading size="sm" mb={4}>Validation Proof</Heading>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    {/* Selfie Proof */}
                    <Box>
                      <Text fontWeight="bold" fontSize="sm" color="gray.600" mb={2}>
                        Selfie Proof Image
                      </Text>
                      {selectedResponse.farmerInput.validationVisitDetails.proofImageUrl ? (
                        <AspectRatio ratio={4 / 3} borderRadius="md" overflow="hidden" border="1px" borderColor="gray.200">
                          <Box
                            as="img"
                            src={getImageUrl(selectedResponse.farmerInput.validationVisitDetails.proofImageUrl)}
                            alt="Validation Selfie Proof"
                            objectFit="cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #f7fafc;"><span style="color: #718096;">Image not available</span></div>';
                            }}
                          />
                        </AspectRatio>
                      ) : (
                        <Box
                          bg="gray.100"
                          borderRadius="md"
                          p={8}
                          textAlign="center"
                          border="1px"
                          borderColor="gray.200"
                        >
                          <Text color="gray.500">No proof image available</Text>
                        </Box>
                      )}
                      {selectedResponse.farmerInput.validationVisitDetails.proofImageUrl && (
                        <Button
                          as="a"
                          href={selectedResponse.farmerInput.validationVisitDetails.proofImageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          size="sm"
                          colorScheme="blue"
                          variant="link"
                          mt={2}
                        >
                          Open in new tab
                        </Button>
                      )}
                    </Box>

                    {/* Farmer Signature */}
                    <Box>
                      <Text fontWeight="bold" fontSize="sm" color="gray.600" mb={2}>
                        Farmer Signature
                      </Text>
                      {selectedResponse.farmerInput.validationVisitDetails.signatureUrl ? (
                        <AspectRatio ratio={4 / 3} borderRadius="md" overflow="hidden" border="1px" borderColor="gray.200">
                          <Box
                            as="img"
                            src={getImageUrl(selectedResponse.farmerInput.validationVisitDetails.signatureUrl)}
                            alt="Farmer Signature"
                            objectFit="cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #f7fafc;"><span style="color: #718096;">Image not available</span></div>';
                            }}
                          />
                        </AspectRatio>
                      ) : (
                        <Box
                          bg="gray.100"
                          borderRadius="md"
                          p={8}
                          textAlign="center"
                          border="1px"
                          borderColor="gray.200"
                        >
                          <Text color="gray.500">No signature available</Text>
                        </Box>
                      )}
                      {selectedResponse.farmerInput.validationVisitDetails.signatureUrl && (
                        <Button
                          as="a"
                          href={selectedResponse.farmerInput.validationVisitDetails.signatureUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          size="sm"
                          colorScheme="blue"
                          variant="link"
                          mt={2}
                        >
                          Open in new tab
                        </Button>
                      )}
                    </Box>
                  </SimpleGrid>
                </Box>

                {/* Remarks Sections */}
                <Divider />

                
              {selectedResponse.farmerInput.validationVisitDetails.initialRemarks && (
                <Box>
                  <FormControl>
                    <FormLabel fontWeight="bold" fontSize="sm" color="gray.600">
                      Initial Remarks
                    </FormLabel>
                    <Textarea
                      value={selectedResponse.farmerInput.validationVisitDetails.initialRemarks}
                      isReadOnly
                      bg="gray.50"
                      fontSize="sm"
                      minH="80px"
                      resize="none"
                    />
                  </FormControl>
                </Box>
              )}

              {selectedResponse.farmerInput.validationVisitDetails.remarks && (
                <Box>
                  <FormControl>
                    <FormLabel fontWeight="bold" fontSize="sm" color="gray.600">
                      Final Remarks
                    </FormLabel>
                    <Textarea
                      value={selectedResponse.farmerInput.validationVisitDetails.remarks}
                      isReadOnly
                      bg="gray.50"
                      fontSize="sm"
                      minH="80px"
                      resize="none"
                    />
                  </FormControl>
                </Box>
              )}

              </VStack>
            ) : (
              <VStack spacing={4} align="center" py={8}>
                <Text color="gray.600" fontSize="sm">No validation visit details available</Text>
              </VStack>
            )}
          </ModalBody>

          <ModalFooter bg="gray.50" borderTopWidth="1px" borderColor="gray.200">
            <Button 
              variant="outline" 
              mr={3} 
              onClick={onCloseApproveVisit} 
              _hover={{ bg: "gray.100" }}
            >
              Close
            </Button>
            <Button 
              colorScheme="red" 
              mr={3}
              onClick={onOpenConfirmReject}
            >
              Reject
            </Button>
            <Button 
              colorScheme="green"
              onClick={onOpenConfirmApprove}
            >
              Approve
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* CONFIRM APPROVE VALIDATION VISIT MODAL */}
      <Modal 
        isOpen={isOpenConfirmApprove} 
        onClose={onCloseConfirmApprove} 
        size="sm" 
        isCentered 
        motionPreset="none"
        closeOnOverlayClick={false}
      >
        <ModalOverlay />
        <ModalContent borderRadius="lg" overflow="hidden">
          <ModalHeader
            bg="green.50"
            borderBottomWidth="1px"
            borderColor="gray.200"
            py={4}
            display="flex"
            alignItems="center"
          >
            <Icon as={FaCheckCircle} mr={2} color="green.500" />
            Approve Validation Visit?
          </ModalHeader>
          {/* <ModalBody py={6}>
            <VStack spacing={3} align="stretch">
              <Text fontSize="sm">
                Are you sure you want to approve this validation visit? This action will:
              </Text>
              <VStack align="stretch" spacing={2} pl={4}>
                <Text fontSize="sm">• Mark the validation visit as approved</Text>
                <Text fontSize="sm">• Allow the requested edits to be applied</Text>
                <Text fontSize="sm">• Enable the response to be updated with new values</Text>
              </VStack>
            </VStack>
          </ModalBody> */}
          <ModalFooter bg="gray.50" borderTopWidth="1px" borderColor="gray.200">
            <Button 
              variant="outline" 
              mr={3} 
              onClick={onCloseConfirmApprove}
              size="md"
              _hover={{ bg: "gray.100" }}
            >
              Cancel
            </Button>
            <Button 
              colorScheme="green"
              onClick={handleApproveValidationVisit}
              isLoading={isApprovingVisitDetails}
              size="md"
              _hover={{ boxShadow: "md", bg: "green.600" }}
            >
              Approve Details
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* CONFIRM REJECT VALIDATION VISIT MODAL */}
      <Modal 
        isOpen={isOpenConfirmReject} 
        onClose={onCloseConfirmReject} 
        size="sm" 
        isCentered 
        motionPreset="none"
        closeOnOverlayClick={false}
      >
        <ModalOverlay />
        <ModalContent borderRadius="lg" overflow="hidden">
          <ModalHeader
            bg="red.50"
            borderBottomWidth="1px"
            borderColor="gray.200"
            py={4}
            display="flex"
            alignItems="center"
          >
            <Icon as={GoAlertFill} mr={2} color="red.500" />
            Reject Validation Visit?
          </ModalHeader>
          <ModalBody py={6}>
            <VStack spacing={3} align="stretch">
              <Text fontSize="sm">
                Are you sure you want to reject this validation visit? This action will:
              </Text>
              <VStack align="stretch" spacing={2} pl={4}>
                <Text fontSize="sm">• Mark the validation visit as rejected</Text>
                <Text fontSize="sm">• Reset the validation visit status to pending</Text>
                <Text fontSize="sm">• Require the staff to submit new proof</Text>
              </VStack>
            </VStack>
          </ModalBody>
          <ModalFooter bg="gray.50" borderTopWidth="1px" borderColor="gray.200">
            <Button 
              variant="outline" 
              mr={3} 
              onClick={onCloseConfirmReject}
              size="md"
              _hover={{ bg: "gray.100" }}
            >
              Cancel
            </Button>
            <Button 
              colorScheme="red"
              onClick={handleRejectValidationVisit}
              isLoading={isRejectingVisitDetails}
              size="md"
              _hover={{ boxShadow: "md", bg: "red.600" }}
            >
              Reject Details
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

    </Box>
  );
};

export default Responses;
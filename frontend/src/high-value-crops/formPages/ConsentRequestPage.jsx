import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  FormControl,
  FormLabel,
  SimpleGrid,
  Icon,
  Flex,
  useToast,
  Card,
  CardHeader,
  CardBody,
  Container,
  Input,
  InputGroup,
  InputRightAddon,
} from '@chakra-ui/react';
import { FaUser, FaSeedling, FaBoxes, FaCheck, FaTimes } from 'react-icons/fa';
import { useAdminDashboard } from '../store/adminDashboard.store.js';
import { useQueryClient } from '@tanstack/react-query';

const ConsentRequestPage = () => {
  const { editRequestId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { getEditRequestDetails, handleConsentForEditRequest, isGettingEditRequestDetails, isHandlingConsent } = useAdminDashboard();

  const [editRequestData, setEditRequestData] = useState(null);
  const [error, setError] = useState(null);
  const [isProcessed, setIsProcessed] = useState(false);
  const [consentStatus, setConsentStatus] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchEditRequest = async () => {
      try {
        const data = await getEditRequestDetails(editRequestId);
        setEditRequestData(data);
        
        // Check if already processed
        if (data?.result?.farmerInput?.editConsent?.status === 'Granted' || 
            data?.result?.farmerInput?.editConsent?.status === 'Completed' ||
            data?.result?.farmerInput?.editConsent?.status === 'Denied') {
          setIsProcessed(true);
        }

      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load edit request details.');

      }
    };

    if (editRequestId) {
      fetchEditRequest();
    }
  }, [editRequestId]);

  const handleConsent = async (consent) => {
    try {
      const response = await handleConsentForEditRequest({
        editRequestId,
        consent,
      });

      const newStatus = consent === 'granted' ? 'Granted' : 'Denied';
      setConsentStatus(newStatus);

      toast({
        title: "Success",
        description: response.message,
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      setIsProcessed(true);

      queryClient.invalidateQueries({ queryKey: ['unvalidatedNewlyPlanted'] });
      queryClient.invalidateQueries({ queryKey: ['unvalidatedHarvesting'] });

    } catch (err) {
      toast({
        title: "Error",
        description: err.response?.data?.message || 'Failed to process consent.',
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

  if (isGettingEditRequestDetails) {
    return (
      <Flex justifyContent="center" alignItems="center" minH="100vh" bg="gray.50">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" thickness="3px" />
          <Text fontSize="lg">Naglo-load ng data...</Text>
        </VStack>
      </Flex>
    );
  }

  if (!editRequestData && !isGettingEditRequestDetails) {
    return (
      <Container maxW="container.md" py={10}>
        <Alert 
          status="warning" 
          borderRadius="md"
          flexDirection="column"
          alignItems="flex-start"
          p={6}
        >
          <HStack mb={3}>
            <AlertIcon boxSize={6} />
            <AlertTitle fontSize="lg">Hindi Nahanap ang Kahilingan</AlertTitle>
          </HStack>
          <AlertDescription>
            <VStack align="stretch" spacing={3} fontSize="md">
              <Text>
                Ang kahilingan ng pagbabago ay hindi mahanap. Maaaring dahil sa mga sumusunod na dahilan:
              </Text>
              <Box pl={4}>
                <Text>• Mali ang link na inyong pinindot</Text>
                <Text>• Tapos na at naproseso na ang inyong tugon sa kahilingan</Text>
                <Text>• May problema sa aming sistema</Text>
              </Box>
              <Text mt={2} fontWeight="medium" color="orange.700">
                Kung sa tingin ninyo ito ay mali o may problema, mangyaring makipag-ugnayan sa aming mga staff para sa tulong.
              </Text>
            </VStack>
          </AlertDescription>
        </Alert>
      </Container>
    );
  }

  const { editRequest, result } = editRequestData;
  const { farmerInput, cropType, cropRecord, cropDetails } = result;

  const isNewlyPlanted = cropRecord?.crop_stage === 'NEWLY PLANTED';
  const isIndustrialCrop = cropType?.crop_type === 'VEGETABLES, ROOT CROPS AND OTHER INDUSTRIAL CROPS';

  return (
    <Box minH="100vh" bg="gray.50" py={{ base: 4, md: 8 }} px={{ base: 3, sm: 4, md: 6 }}>
      <Container maxW={{ base: "100%", sm: "container.sm", md: "container.md", lg: "container.lg", xl: "container.xl" }} px={{ base: 0, sm: 4 }}>
        <VStack spacing={{ base: 4, md: 6 }} align="stretch">
          {/* Header */}
          <Card shadow={{ base: "sm", md: "md" }}>
            <CardHeader bg="blue.50" borderBottomWidth="1px" py={{ base: 4, md: 6 }} px={{ base: 4, md: 6 }}>
              <Heading size={{ base: "md", md: "lg" }} color="blue.700">
                Kahilingan ng Pagbabago mula sa Staff
              </Heading>
              <Text color="gray.600" mt={2} fontSize={{ base: "sm", md: "md" }}>
                Mangyaring suriin ang mga iminungkahing pagbabago sa inyong naisumiteng datos.
              </Text>
            </CardHeader>
          </Card>

          {/* Already Processed Alert */}
          {isProcessed && (
            <Alert
              status={(consentStatus || farmerInput?.editConsent?.status) === 'Granted' || (consentStatus || farmerInput?.editConsent?.status) === 'Completed' ? 'success' : 'warning'}
              borderRadius="md"
              flexDirection={{ base: "column", sm: "row" }}
              alignItems={{ base: "flex-start", sm: "center" }}
              py={{ base: 3, md: 4 }}
              px={{ base: 3, md: 4 }}
            >
              <AlertIcon mb={{ base: 2, sm: 0 }} />
              <Box flex="1">
                <AlertTitle fontSize={{ base: "sm", md: "md" }}>
                  {((consentStatus || farmerInput?.editConsent?.status) === 'Granted' || (consentStatus || farmerInput?.editConsent?.status) === 'Completed') ? 'Pumayag na sa Pagbabago' : 'Tumanggi na sa Pagbabago'}
                </AlertTitle>
                <AlertDescription fontSize={{ base: "xs", md: "sm" }}>
                  Ang kahilingang ito ay naproseso na.
                </AlertDescription>
              </Box>
            </Alert>
          )}

          {/* Reason for Edit */}
          {farmerInput?.editConsent?.reason && (
            <Card shadow={{ base: "sm", md: "md" }}>
              <CardBody py={{ base: 4, md: 5 }} px={{ base: 4, md: 6 }}>
                <VStack align="stretch" spacing={{ base: 2, md: 3 }}>
                  <Heading size={{ base: "sm", md: "md" }} color="orange.600">
                    <Icon as={FaBoxes} mr={2} boxSize={{ base: 4, md: 5 }} />
                    Dahilan ng Kahilingan
                  </Heading>
                  <Text 
                    bg="orange.50" 
                    p={{ base: 3, md: 4 }} 
                    borderRadius="md" 
                    borderLeftWidth="4px" 
                    borderLeftColor="orange.500"
                    fontSize={{ base: "sm", md: "md" }}
                  >
                    {farmerInput.editConsent.reason}
                  </Text>
                </VStack>
              </CardBody>
            </Card>
          )}

          {/* Farmer Information */}
          <Card shadow={{ base: "sm", md: "md" }}>
            <CardBody py={{ base: 4, md: 5 }} px={{ base: 4, md: 6 }}>
              <VStack spacing={{ base: 4, md: 5 }} align="stretch">
                <Heading size={{ base: "sm", md: "md" }} color="blue.600">
                  <HStack spacing={{ base: 2, md: 3 }}>
                    <Icon as={FaUser} boxSize={{ base: 4, md: 5 }} />
                    <Text>Impormasyon ng Magsasaka</Text>
                  </HStack>
                </Heading>

                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 3, md: 5 }}>
                  <FormControl>
                    <FormLabel fontWeight="medium" fontSize={{ base: "sm", md: "md" }}>Buong Pangalan</FormLabel>
                    <Input
                      value={
                        `${farmerInput?.farmer_account_id?.first_name ?? ''} ${farmerInput?.farmer_account_id?.middle_name ? farmerInput?.farmer_account_id.middle_name + '.' : ''} ${farmerInput?.farmer_account_id?.surname ?? ''} ${farmerInput?.farmer_account_id?.suffix ?? ''}`.trim()
                      }
                      isReadOnly
                      bg="gray.50"
                      size={{ base: "sm", md: "md" }}
                      fontSize={{ base: "sm", md: "md" }}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontWeight="medium" fontSize={{ base: "sm", md: "md" }}>Lokasyon ng Bukid</FormLabel>
                    <Input value={farmerInput?.farm_location ?? '-'} isReadOnly bg="gray.50" size={{ base: "sm", md: "md" }} fontSize={{ base: "sm", md: "md" }} />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontWeight="medium" fontSize={{ base: "sm", md: "md" }}>Petsa ng Pagsumite</FormLabel>
                    <Input value={formatDate(farmerInput?.createdAt)} isReadOnly bg="gray.50" size={{ base: "sm", md: "md" }} fontSize={{ base: "sm", md: "md" }} />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontWeight="medium" fontSize={{ base: "sm", md: "md" }}>Farmer ID</FormLabel>
                    <Input value={farmerInput?.farmerId ?? '-'} isReadOnly bg="gray.50" size={{ base: "sm", md: "md" }} fontSize={{ base: "sm", md: "md" }} />
                  </FormControl>
                </SimpleGrid>
              </VStack>
            </CardBody>
          </Card>

          {/* Crop Information */}
          <Card shadow={{ base: "sm", md: "md" }}>
            <CardBody py={{ base: 4, md: 5 }} px={{ base: 4, md: 6 }}>
              <VStack spacing={{ base: 4, md: 5 }} align="stretch">
                <Heading size={{ base: "sm", md: "md" }} color="green.600">
                  <HStack spacing={{ base: 2, md: 3 }}>
                    <Icon as={FaSeedling} boxSize={{ base: 4, md: 5 }} />
                    <Text>Impormasyon ng Pananim</Text>
                  </HStack>
                </Heading>

                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 3, md: 5 }}>
                  <FormControl>
                    <FormLabel fontWeight="medium" fontSize={{ base: "sm", md: "md" }}>Uri ng Pananim</FormLabel>
                    <Input value={isIndustrialCrop ? "INDUSTRIAL" : cropType?.crop_type ?? '-'} isReadOnly bg="gray.50" size={{ base: "sm", md: "md" }} fontSize={{ base: "sm", md: "md" }} />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontWeight="medium" fontSize={{ base: "sm", md: "md" }}>Produkto</FormLabel>
                    <Input value={isIndustrialCrop ? cropRecord?.crop_type : cropRecord?.crop_variety ?? '-'} isReadOnly bg="gray.50" size={{ base: "sm", md: "md" }} fontSize={{ base: "sm", md: "md" }} />
                  </FormControl>
                </SimpleGrid>
              </VStack>
            </CardBody>
          </Card>

          {/* Proposed Changes */}
          <Card borderWidth="2px" borderColor="orange.300" shadow={{ base: "sm", md: "md" }}>
            <CardHeader bg="orange.50" py={{ base: 4, md: 5 }} px={{ base: 4, md: 6 }}>
              <Heading size={{ base: "sm", md: "md" }} color="orange.700">
                Mga Iminungkahing Pagbabago
              </Heading>
            </CardHeader>
            <CardBody py={{ base: 4, md: 5 }} px={{ base: 4, md: 6 }}>
              <VStack spacing={{ base: 3, md: 4 }} align="stretch">
                {isNewlyPlanted ? (
                  isIndustrialCrop ? (
                    <FormControl>
                      <FormLabel fontWeight="medium" fontSize={{ base: "sm", md: "md" }}>Kabuuang Luwang na Tinamnán</FormLabel>
                      <VStack spacing={{ base: 3, md: 0 }} align="stretch">
                        <HStack spacing={{ base: 2, md: 4 }} flexDirection={{ base: "column", md: "row" }}>
                          <Box flex={1} w="full">
                            <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600" mb={1}>Kasalukuyang Halaga</Text>
                            <InputGroup size={{ base: "sm", md: "md" }}>
                              <Input value={cropDetails?.total_area_planted ?? '-'} isReadOnly bg="gray.50" fontSize={{ base: "sm", md: "md" }} />
                              <InputRightAddon children="ha" bg="blue.100" color="blue.800" fontSize={{ base: "xs", md: "sm" }} />
                            </InputGroup>
                          </Box>
                          <Text fontWeight={'semibold'} mt={{ base: 0, md: 6 }} display={{ base: "none", md: "block" }}>{'=>'}</Text>
                          <Text fontWeight={'semibold'} fontSize="lg" display={{ base: "block", md: "none" }} alignSelf="center">↓</Text>
                          <Box flex={1} w="full">
                            <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600" mb={1}>Bagong Halaga</Text>
                            <InputGroup size={{ base: "sm", md: "md" }}>
                              <Input value={editRequest?.total_area_planted ?? '-'} isReadOnly bg="orange.50" fontWeight="bold" borderColor="orange.400" borderWidth="2px" fontSize={{ base: "sm", md: "md" }} />
                              <InputRightAddon children="ha" bg="orange.100" color="orange.800" borderColor="orange.400" borderWidth="2px" fontSize={{ base: "xs", md: "sm" }} />
                            </InputGroup>
                          </Box>
                        </HStack>
                      </VStack>
                    </FormControl>
                  ) : (
                    <FormControl>
                      <FormLabel fontWeight="medium" fontSize={{ base: "sm", md: "md" }}>Kabuuang Bilang ng Puno</FormLabel>
                      <VStack spacing={{ base: 3, md: 0 }} align="stretch">
                        <HStack spacing={{ base: 2, md: 4 }} flexDirection={{ base: "column", md: "row" }}>
                          <Box flex={1} w="full">
                            <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600" mb={1}>Kasalukuyang Halaga</Text>
                            <InputGroup size={{ base: "sm", md: "md" }}>
                              <Input value={cropDetails?.total_trees ?? '-'} isReadOnly bg="gray.50" fontSize={{ base: "sm", md: "md" }} />
                              <InputRightAddon children="puno" bg="blue.100" color="blue.800" fontSize={{ base: "xs", md: "sm" }} />
                            </InputGroup>
                          </Box>
                          <Text fontWeight={'semibold'} mt={{ base: 0, md: 6 }} display={{ base: "none", md: "block" }}>{'=>'}</Text>
                          <Text fontWeight={'semibold'} fontSize="lg" display={{ base: "block", md: "none" }} alignSelf="center">↓</Text>
                          <Box flex={1} w="full">
                            <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600" mb={1}>Bagong Halaga</Text>
                            <InputGroup size={{ base: "sm", md: "md" }}>
                              <Input value={editRequest?.total_trees ?? '-'} isReadOnly bg="orange.50" fontWeight="bold" borderColor="orange.400" borderWidth="2px" fontSize={{ base: "sm", md: "md" }} />
                              <InputRightAddon children="puno" bg="orange.100" color="orange.800" borderColor="orange.400" borderWidth="2px" fontSize={{ base: "xs", md: "sm" }} />
                            </InputGroup>
                          </Box>
                        </HStack>
                      </VStack>
                    </FormControl>
                  )
                ) : (
                  <>
                    <FormControl>
                      <FormLabel fontWeight="medium" fontSize={{ base: "sm", md: "md" }}>Kabuuang Timbang ng Ani</FormLabel>
                      <VStack spacing={{ base: 3, md: 0 }} align="stretch">
                        <HStack spacing={{ base: 2, md: 4 }} flexDirection={{ base: "column", md: "row" }}>
                          <Box flex={1} w="full">
                            <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600" mb={1}>Kasalukuyang Halaga</Text>
                            <InputGroup size={{ base: "sm", md: "md" }}>
                              <Input value={cropDetails?.total_weight ?? '-'} isReadOnly bg="gray.50" fontSize={{ base: "sm", md: "md" }} />
                              <InputRightAddon children="kg" bg="blue.100" color="blue.800" fontSize={{ base: "xs", md: "sm" }} />
                            </InputGroup>
                          </Box>
                          <Text fontWeight={'semibold'} mt={{ base: 0, md: 6 }} display={{ base: "none", md: "block" }}>{'=>'}</Text>
                          <Text fontWeight={'semibold'} fontSize="lg" display={{ base: "block", md: "none" }} alignSelf="center">↓</Text>
                          <Box flex={1} w="full">
                            <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600" mb={1}>Bagong Halaga</Text>
                            <InputGroup size={{ base: "sm", md: "md" }}>
                              <Input value={editRequest?.total_weight ?? '-'} isReadOnly bg="orange.50" fontWeight="bold" borderColor="orange.400" borderWidth="2px" fontSize={{ base: "sm", md: "md" }} />
                              <InputRightAddon children="kg" bg="orange.100" color="orange.800" borderColor="orange.400" borderWidth="2px" fontSize={{ base: "xs", md: "sm" }} />
                            </InputGroup>
                          </Box>
                        </HStack>
                      </VStack>
                    </FormControl>

                    {isIndustrialCrop ? (
                      editRequest?.total_area_harvested !== undefined && (
                        <FormControl>
                          <FormLabel fontWeight="medium" fontSize={{ base: "sm", md: "md" }}>Kabuuang Luwang na Inaani</FormLabel>
                          <VStack spacing={{ base: 3, md: 0 }} align="stretch">
                            <HStack spacing={{ base: 2, md: 4 }} flexDirection={{ base: "column", md: "row" }}>
                              <Box flex={1} w="full">
                                <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600" mb={1}>Kasalukuyang Halaga</Text>
                                <InputGroup size={{ base: "sm", md: "md" }}>
                                  <Input value={cropDetails?.total_area_harvested ?? '-'} isReadOnly bg="gray.50" fontSize={{ base: "sm", md: "md" }} />
                                  <InputRightAddon children="ha" bg="blue.100" color="blue.800" fontSize={{ base: "xs", md: "sm" }} />
                                </InputGroup>
                              </Box>
                              <Text fontWeight={'semibold'} mt={{ base: 0, md: 6 }} display={{ base: "none", md: "block" }}>{'=>'}</Text>
                              <Text fontWeight={'semibold'} fontSize="lg" display={{ base: "block", md: "none" }} alignSelf="center">↓</Text>
                              <Box flex={1} w="full">
                                <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600" mb={1}>Bagong Halaga</Text>
                                <InputGroup size={{ base: "sm", md: "md" }}>
                                  <Input value={editRequest?.total_area_harvested ?? '-'} isReadOnly bg="orange.50" fontWeight="bold" borderColor="orange.400" borderWidth="2px" fontSize={{ base: "sm", md: "md" }} />
                                  <InputRightAddon children="ha" bg="orange.100" color="orange.800" borderColor="orange.400" borderWidth="2px" fontSize={{ base: "xs", md: "sm" }} />
                                </InputGroup>
                              </Box>
                            </HStack>
                          </VStack>
                        </FormControl>
                      )
                    ) : (
                      editRequest?.trees_harvested !== undefined && (
                        <FormControl>
                          <FormLabel fontWeight="medium" fontSize={{ base: "sm", md: "md" }}>Kabuuang Bilang ng Punong Inaani</FormLabel>
                          <VStack spacing={{ base: 3, md: 0 }} align="stretch">
                            <HStack spacing={{ base: 2, md: 4 }} flexDirection={{ base: "column", md: "row" }}>
                              <Box flex={1} w="full">
                                <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600" mb={1}>Kasalukuyang Halaga</Text>
                                <InputGroup size={{ base: "sm", md: "md" }}>
                                  <Input value={cropDetails?.trees_harvested ?? '-'} isReadOnly bg="gray.50" fontSize={{ base: "sm", md: "md" }} />
                                  <InputRightAddon children="puno" bg="blue.100" color="blue.800" fontSize={{ base: "xs", md: "sm" }} />
                                </InputGroup>
                              </Box>
                              <Text fontWeight={'semibold'} mt={{ base: 0, md: 6 }} display={{ base: "none", md: "block" }}>{'=>'}</Text>
                              <Text fontWeight={'semibold'} fontSize="lg" display={{ base: "block", md: "none" }} alignSelf="center">↓</Text>
                              <Box flex={1} w="full">
                                <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600" mb={1}>Bagong Halaga</Text>
                                <InputGroup size={{ base: "sm", md: "md" }}>
                                  <Input value={editRequest?.trees_harvested ?? '-'} isReadOnly bg="orange.50" fontWeight="bold" borderColor="orange.400" borderWidth="2px" fontSize={{ base: "sm", md: "md" }} />
                                  <InputRightAddon children="puno" bg="orange.100" color="orange.800" borderColor="orange.400" borderWidth="2px" fontSize={{ base: "xs", md: "sm" }} />
                                </InputGroup>
                              </Box>
                            </HStack>
                          </VStack>
                        </FormControl>
                      )
                    )}
                  </>
                )}
              </VStack>
            </CardBody>
          </Card>

          {/* Action Buttons */}
          {!isProcessed && (
            <Card shadow={{ base: "sm", md: "md" }}>
              <CardBody py={{ base: 5, md: 6 }} px={{ base: 4, md: 6 }}>
                <VStack spacing={{ base: 4, md: 5 }}>
                  <Text fontSize={{ base: "md", md: "lg" }} fontWeight="medium" textAlign="center" px={{ base: 2, md: 0 }}>
                    Pumapayag ba kayo sa mga pagbabagong ito?
                  </Text>
                  <HStack 
                    spacing={{ base: 3, md: 4 }} 
                    justify="center" 
                    w="full" 
                    flexDirection={{ base: "column", sm: "row" }}
                  >
                    <Button
                      colorScheme="red"
                      size={{ base: "md", md: "lg" }}
                      leftIcon={<Icon as={FaTimes} />}
                      onClick={() => handleConsent('denied')}
                      isLoading={isHandlingConsent}
                      w={{ base: "full", sm: "auto" }}
                      minW={{ sm: "150px" }}
                      fontSize={{ base: "sm", md: "md" }}
                    >
                      Hindi
                    </Button>
                    <Button
                      colorScheme="green"
                      size={{ base: "md", md: "lg" }}
                      leftIcon={<Icon as={FaCheck} />}
                      onClick={() => handleConsent('granted')}
                      isLoading={isHandlingConsent}
                      w={{ base: "full", sm: "auto" }}
                      minW={{ sm: "150px" }}
                      fontSize={{ base: "sm", md: "md" }}
                    >
                      Oo, Pumapayag
                    </Button>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          )}
        </VStack>
      </Container>
    </Box>
  );
};

export default ConsentRequestPage;
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

const ConsentRequestPage = () => {
  const { editRequestId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { getEditRequestDetails, handleConsentForEditRequest, isGettingEditRequestDetails, isHandlingConsent } = useAdminDashboard();

  const [editRequestData, setEditRequestData] = useState(null);
  const [error, setError] = useState(null);
  const [isProcessed, setIsProcessed] = useState(false);

  useEffect(() => {
    const fetchEditRequest = async () => {
      try {
        const data = await getEditRequestDetails(editRequestId);
        setEditRequestData(data);
        
        // Check if already processed
        if (data?.result?.farmerInput?.editConsent?.status === 'Granted' ||
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
        <Alert status="warning" borderRadius="md">
          <AlertIcon />
          <Box flex="1">
            <AlertTitle>Hindi Nahanap</AlertTitle>
            <AlertDescription>Pasensya na. Hindi mahanap ang kahilingan. Maaring problema ito sa parte namin.</AlertDescription>
          </Box>
        </Alert>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxW="container.md" py={10}>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <Box flex="1">
            <AlertTitle>Error!</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Box>
        </Alert>
      </Container>
    );
  }

  const { editRequest, result } = editRequestData;
  const { farmerInput, cropType, cropRecord, cropDetails } = result;

  const isNewlyPlanted = cropRecord?.crop_stage === 'NEWLY PLANTED';
  const isIndustrialCrop = cropType?.crop_type === 'VEGETABLES, ROOT CROPS AND OTHER INDUSTRIAL CROPS';

  return (
    <Box minH="100vh" bg="gray.50" py={8}>
      <Container maxW="container.xl">
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <Card>
            <CardHeader bg="blue.50" borderBottomWidth="1px">
              <Heading size="lg" color="blue.700">
                Kahilingan ng Pagbabago mula sa Staff
              </Heading>
              <Text color="gray.600" mt={2}>
                Mangyaring suriin ang mga iminungkahing pagbabago sa inyong naisumiteng datos.
              </Text>
            </CardHeader>
          </Card>

          {/* Already Processed Alert */}
          {isProcessed && (
            <Alert
              status={farmerInput?.editConsent?.status === 'Granted' ? 'success' : 'warning'}
              borderRadius="md"
            >
              <AlertIcon />
              <Box flex="1">
                <AlertTitle>
                  {farmerInput?.editConsent?.status === 'Granted' ? 'Pumayag na sa Pagbabago' : 'Tumanggi na sa Pagbabago'}
                </AlertTitle>
                <AlertDescription>
                  Ang kahilingang ito ay naproseso na.
                </AlertDescription>
              </Box>
            </Alert>
          )}

          {/* Reason for Edit */}
          {farmerInput?.editConsent?.reason && (
            <Card>
              <CardBody>
                <VStack align="stretch" spacing={3}>
                  <Heading size="md" color="orange.600">
                    <Icon as={FaBoxes} mr={2} />
                    Dahilan ng Kahilingan
                  </Heading>
                  <Text bg="orange.50" p={4} borderRadius="md" borderLeftWidth="4px" borderLeftColor="orange.500">
                    {farmerInput.editConsent.reason}
                  </Text>
                </VStack>
              </CardBody>
            </Card>
          )}

          {/* Farmer Information */}
          <Card>
            <CardBody>
              <VStack spacing={5} align="stretch">
                <Heading size="md" color="blue.600">
                  <HStack>
                    <Icon as={FaUser} />
                    <Text>Impormasyon ng Magsasaka</Text>
                  </HStack>
                </Heading>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                  <FormControl>
                    <FormLabel fontWeight="medium">Buong Pangalan</FormLabel>
                    <Input
                      value={
                        `${farmerInput?.farmer_account_id?.first_name ?? ''} ${farmerInput?.farmer_account_id?.middle_name ? farmerInput?.farmer_account_id.middle_name + '.' : ''} ${farmerInput?.farmer_account_id?.surname ?? ''} ${farmerInput?.farmer_account_id?.suffix ?? ''}`.trim()
                      }
                      isReadOnly
                      bg="gray.50"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontWeight="medium">Lokasyon ng Bukid</FormLabel>
                    <Input value={farmerInput?.farm_location ?? '-'} isReadOnly bg="gray.50" />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontWeight="medium">Petsa ng Pagsumite</FormLabel>
                    <Input value={formatDate(farmerInput?.createdAt)} isReadOnly bg="gray.50" />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontWeight="medium">Farmer ID</FormLabel>
                    <Input value={farmerInput?.farmerId ?? '-'} isReadOnly bg="gray.50" />
                  </FormControl>
                </SimpleGrid>
              </VStack>
            </CardBody>
          </Card>

          {/* Crop Information */}
          <Card>
            <CardBody>
              <VStack spacing={5} align="stretch">
                <Heading size="md" color="green.600">
                  <HStack>
                    <Icon as={FaSeedling} />
                    <Text>Impormasyon ng Pananim</Text>
                  </HStack>
                </Heading>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                  <FormControl>
                    <FormLabel fontWeight="medium">Uri ng Pananim</FormLabel>
                    <Input value={isIndustrialCrop ? "INDUSTRIAL" : cropType?.crop_type ?? '-'} isReadOnly bg="gray.50" />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontWeight="medium">Produkto</FormLabel>
                    <Input value={isIndustrialCrop ? cropRecord?.crop_type : cropRecord?.crop_variety ?? '-'} isReadOnly bg="gray.50" />
                  </FormControl>
                </SimpleGrid>
              </VStack>
            </CardBody>
          </Card>

          {/* Proposed Changes */}
          <Card borderWidth="2px" borderColor="orange.300">
            <CardHeader bg="orange.50">
              <Heading size="md" color="orange.700">
                Mga Iminungkahing Pagbabago
              </Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                {isNewlyPlanted ? (
                  isIndustrialCrop ? (
                    <FormControl>
                      <FormLabel fontWeight="medium">Kabuuang Luwang na Tinamnán</FormLabel>
                      <HStack spacing={4}>
                        <Box flex={1}>
                          <Text fontSize="sm" color="gray.600" mb={1}>Kasalukuyang Halaga</Text>
                          <InputGroup>
                            <Input value={cropDetails?.total_area_planted ?? '-'} isReadOnly bg="gray.50" />
                            <InputRightAddon children="ha" bg="blue.100" color="blue.800" />
                          </InputGroup>
                        </Box>
                        <Text fontWeight={'semibold'} mt={6}>{'=>'}</Text>
                        <Box flex={1}>
                          <Text fontSize="sm" color="gray.600" mb={1}>Bagong Halaga</Text>
                          <InputGroup>
                            <Input value={editRequest?.total_area_planted ?? '-'} isReadOnly bg="orange.50" fontWeight="bold" borderColor="orange.400" borderWidth="2px" />
                            <InputRightAddon children="ha" bg="orange.100" color="orange.800" borderColor="orange.400" borderWidth="2px" />
                          </InputGroup>
                        </Box>
                      </HStack>
                    </FormControl>
                  ) : (
                    <FormControl>
                      <FormLabel fontWeight="medium">Kabuuang Bilang ng Puno</FormLabel>
                      <HStack spacing={4}>
                        <Box flex={1}>
                          <Text fontSize="sm" color="gray.600" mb={1}>Kasalukuyang Halaga</Text>
                          <InputGroup>
                            <Input value={cropDetails?.total_trees ?? '-'} isReadOnly bg="gray.50" />
                            <InputRightAddon children="puno" bg="blue.100" color="blue.800" />
                          </InputGroup>
                        </Box>
                        <Text fontWeight={'semibold'} mt={6}>{'=>'}</Text>
                        <Box flex={1}>
                          <Text fontSize="sm" color="gray.600" mb={1}>Bagong Halaga</Text>
                          <InputGroup>
                            <Input value={editRequest?.total_trees ?? '-'} isReadOnly bg="orange.50" fontWeight="bold" borderColor="orange.400" borderWidth="2px" />
                            <InputRightAddon children="puno" bg="orange.100" color="orange.800" borderColor="orange.400" borderWidth="2px" />
                          </InputGroup>
                        </Box>
                      </HStack>
                    </FormControl>
                  )
                ) : (
                  <>
                    <FormControl>
                      <FormLabel fontWeight="medium">Kabuuang Timbang ng Ani</FormLabel>
                      <HStack spacing={4}>
                        <Box flex={1}>
                          <Text fontSize="sm" color="gray.600" mb={1}>Kasalukuyang Halaga</Text>
                          <InputGroup>
                            <Input value={cropDetails?.total_weight ?? '-'} isReadOnly bg="gray.50" />
                            <InputRightAddon children="kg" bg="blue.100" color="blue.800" />
                          </InputGroup>
                        </Box>
                        <Text fontWeight={'semibold'} mt={6}>{'=>'}</Text>
                        <Box flex={1}>
                          <Text fontSize="sm" color="gray.600" mb={1}>Bagong Halaga</Text>
                          <InputGroup>
                            <Input value={editRequest?.total_weight ?? '-'} isReadOnly bg="orange.50" fontWeight="bold" borderColor="orange.400" borderWidth="2px" />
                            <InputRightAddon children="kg" bg="orange.100" color="orange.800" borderColor="orange.400" borderWidth="2px" />
                          </InputGroup>
                        </Box>
                      </HStack>
                    </FormControl>

                    {isIndustrialCrop ? (
                      editRequest?.total_area_harvested !== undefined && (
                        <FormControl>
                          <FormLabel fontWeight="medium">Kabuuang Luwang na Inaani</FormLabel>
                          <HStack spacing={4}>
                            <Box flex={1}>
                              <Text fontSize="sm" color="gray.600" mb={1}>Kasalukuyang Halaga</Text>
                              <InputGroup>
                                <Input value={cropDetails?.total_area_harvested ?? '-'} isReadOnly bg="gray.50" />
                                <InputRightAddon children="ha" bg="blue.100" color="blue.800" />
                              </InputGroup>
                            </Box>
                            <Text fontWeight={'semibold'} mt={6}>{'=>'}</Text>
                            <Box flex={1}>
                              <Text fontSize="sm" color="gray.600" mb={1}>Bagong Halaga</Text>
                              <InputGroup>
                                <Input value={editRequest?.total_area_harvested ?? '-'} isReadOnly bg="orange.50" fontWeight="bold" borderColor="orange.400" borderWidth="2px" />
                                <InputRightAddon children="ha" bg="orange.100" color="orange.800" borderColor="orange.400" borderWidth="2px" />
                              </InputGroup>
                            </Box>
                          </HStack>
                        </FormControl>
                      )
                    ) : (
                      editRequest?.trees_harvested !== undefined && (
                        <FormControl>
                          <FormLabel fontWeight="medium">Kabuuang Bilang ng Punong Inaani</FormLabel>
                          <HStack spacing={4}>
                            <Box flex={1}>
                              <Text fontSize="sm" color="gray.600" mb={1}>Kasalukuyang Halaga</Text>
                              <InputGroup>
                                <Input value={cropDetails?.trees_harvested ?? '-'} isReadOnly bg="gray.50" />
                                <InputRightAddon children="puno" bg="blue.100" color="blue.800" />
                              </InputGroup>
                            </Box>
                            <Text fontWeight={'semibold'} mt={6}>{'=>'}</Text>
                            <Box flex={1}>
                              <Text fontSize="sm" color="gray.600" mb={1}>Bagong Halaga</Text>
                              <InputGroup>
                                <Input value={editRequest?.trees_harvested ?? '-'} isReadOnly bg="orange.50" fontWeight="bold" borderColor="orange.400" borderWidth="2px" />
                                <InputRightAddon children="puno" bg="orange.100" color="orange.800" borderColor="orange.400" borderWidth="2px" />
                              </InputGroup>
                            </Box>
                          </HStack>
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
            <Card>
              <CardBody>
                <VStack spacing={4}>
                  <Text fontSize="lg" fontWeight="medium" textAlign="center">
                    Pumapayag ba kayo sa mga pagbabagong ito?
                  </Text>
                  <HStack spacing={4} justify="center">
                    <Button
                      colorScheme="red"
                      size="lg"
                      leftIcon={<Icon as={FaTimes} />}
                      onClick={() => handleConsent('denied')}
                      isLoading={isHandlingConsent}
                      minW="150px"
                    >
                      Hindi
                    </Button>
                    <Button
                      colorScheme="green"
                      size="lg"
                      leftIcon={<Icon as={FaCheck} />}
                      onClick={() => handleConsent('granted')}
                      isLoading={isHandlingConsent}
                      minW="150px"
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
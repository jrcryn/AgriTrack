import React, { useState, useEffect } from 'react';
import { 
  Box, Heading, Text, VStack, Button, FormControl, FormLabel, 
  Select, HStack, useToast, Flex, Icon, SimpleGrid, Divider, 
  Spinner, Alert, AlertIcon, Badge, AlertTitle, AlertDescription, Input,
} from "@chakra-ui/react";
import { IoArrowForwardCircle } from "react-icons/io5";
import { MdCreateNewFolder } from "react-icons/md";
import { HiMiniViewfinderCircle } from "react-icons/hi2";
import { useAdminDashboard } from '../store/adminDashboard.store.js';
import { useAuthStore } from '../../auth/store/authStore.js';

const B_RegisterDocument = () => {

  const {
      documentTypes,
      isLoadingDocumentTypes,
      documentTypesError,
      registerDocument,
      forwardDocument,
      isRegisteringDocument,
      isForwardingDocument
    } = useAdminDashboard();

    const { user } = useAuthStore();
    const toast = useToast();

    const {registeredDocId, setRegisteredDocID} = useState('')
    const {forwardImmediately, setForwardImmediately} = useState(false);
    const [formData, setFormData] = useState({
      documentId: '',
      userAccountId: user.id,
      priority: '',
      details: '',

      registeredDocId: registeredDocId,
      forwardAccountId: '',
      forwardRemarks: ''
    }) /* yung ibang details: (Register: userAccountId, documentId) and (Forward: userAccountId, forwardAccountId, registeredDocId) sa mismong function 
     ng handle submits nalang nakalagay, mag kasama na roon yung function for registering and forwarding document*/
    
    const handleInputChange = (e) => {
      const {name, value} = e.target;
      setFormData({...formData, [name]: value});
    };

    console.log(formData);

    const handleRegisterDocument = async () => {
      try {
        const response = await registerDocument(formData);
        toast({
          title: "Success",
          description: response.message,
          status: "success",
          duration: 5000,
          isClosable: true,
        });
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

    const handleRegisterAndForwardDocument = async () => {
      try {
        //first register the document
        const response = await registerDocument(formData);
        toast({
          title: "Success",
          description: response.message,
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        //2nd forward it
        setRegisteredDocID(response.newDocRegistration._id); //for forwarding
        const response2 = await forwardDocument(formData);
        toast({
          title: "Success",
          description: response2.message,
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: error.response?.data?.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    }
  return (
    <Box 
    overflow="hidden" 
    bg="white" 
    p={5} 
    minH="100vh"
  >
    <Heading as="h1" size="xl" mb={2}>
      Produce Documents
    </Heading>
    <Text color="gray.600" mb={5}>
      Register and locate documents in the system for management and tracking.
    </Text>

    <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
      {/* Document Registration Section */}
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
            <Icon as={MdCreateNewFolder} mr={2} color="green.600" /> REGISTER DOCUMENT
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

            <HStack spacing={4} align="flex-start">
              <FormControl isRequired>
                <FormLabel>Select Document Type</FormLabel>
                  <Select
                    name="documentId"
                    value={formData.documentId}
                    onChange={handleInputChange}
                    isDisabled={isLoadingDocumentTypes || !documentTypes}
                  >
                    
                    {isLoadingDocumentTypes ? (
                      <option value="">Loading available document types...</option>
                    ) : documentTypes && documentTypes.length > 0 ? (
                      <>
                      <option value="">Select a document type</option>
                      {documentTypes.map((type) => (
                        <option key={type._id} value={type._id}>
                          {`(${type.documentCode}) ${type.documentName}`}
                        </option>
                      ))};
                      </>
                    ) : (
                      <option>No document types available...</option>
                    )}
                
                    {documentTypesError && (
                      <option>Error loadinng document types...</option>
                    )}
                  </Select>
              </FormControl>
            </HStack>
            <HStack>
              <FormControl isRequired>
                <FormLabel>Priority Level</FormLabel>
                <Select
                  name='priority'
                  placeholder='Select priority level'
                  value={formData.priority}
                  onChange={handleInputChange}
                  isDisabled={!formData.documentId}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="Urgent">Urgent</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Details</FormLabel>
                <Input
                  name='details'
                  type='text'
                  placeholder='Details or remarks'
                  value={formData.details}
                  onChange={handleInputChange}
                  borderColor='gray.300'
                  _focus={{ borderColor: "blue.400" }}
                  isDisabled={!formData.documentId}
                />
              </FormControl>
            </HStack>
            
            
            <Divider my={2} />

            <HStack>
            <Button
              colorScheme="orange"
              leftIcon={<IoArrowForwardCircle />}
              onClick={() => setForwardImmediately(true)}
              size="md"
              width="100%"
              isDisabled={!formData.documentId || !formData.priority || !formData.details}
            >
              Forward Immediately
            </Button>

            <Button
              colorScheme="green"
              leftIcon={<MdCreateNewFolder />}
              //onClick={handleGenerateReport}
              isLoading={isRegisteringDocument}
              loadingText="Registering..."
              size="md"
              width="100%"
              isDisabled={!formData.documentId || !formData.priority || !formData.details}
            >
              Register Document
            </Button>
            </HStack>
            
          </VStack>
        </Box>
      </Box>
        
        {/* Find Document Via QR-Code Section */}
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
              <Icon as={HiMiniViewfinderCircle} mr={2} color="blue.600" /> FIND DOCUMENT VIA QR CODE
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
             
            </VStack>
          </Box>
        </Box>
      </SimpleGrid>
    </Box>
  );
};

export default B_RegisterDocument;
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

    const [formData, setFormData] = useState({
      priority: '',
      details: '',
      forwardRemarks: ''
    }) /* yung ibang details: (Register: userAccountId, documentId) and (Forward: userAccountId, forwardAccountId, registeredDocId) sa mismong function 
     ng handle submits nalang nakalagay, mag kasama na roon yung function for registering and forwarding document*/
     
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
                    //value={selectedDocId}
                    //onChange={handleSelectDocumentForEdit}
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
                <Select>
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
                  placeholder=' '
                  //value={editFormData.documentName}
                  //onChange={handleEditInputChange}
                  borderColor='gray.300'
                  _focus={{ borderColor: "blue.400" }}
                  //isDisabled={!selectedDocId}
                />
              </FormControl>
            </HStack>
            
            
            <Divider my={2} />

            <HStack>
            <Button
              colorScheme="orange"
              leftIcon={<IoArrowForwardCircle />}
              //onClick={handleGenerateReport}
              //isLoading={isGeneratingReport}
              size="md"
              width="100%"
              //isDisabled={!selectedMonth || dateRanges.length === 0 || isLoading}
            >
              Forward Immediately
            </Button>

            <Button
              colorScheme="green"
              leftIcon={<MdCreateNewFolder />}
              //onClick={handleGenerateReport}
              //isLoading={isGeneratingReport}
              loadingText="Registering..."
              size="md"
              width="100%"
              //isDisabled={!selectedMonth || dateRanges.length === 0 || isLoading}
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
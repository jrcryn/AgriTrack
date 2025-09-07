import React, { useState } from 'react';
import {
  Box,
  Heading,
  Text,
  Flex,
  InputGroup,
  Input,
  InputRightElement,
  Button,
  Icon,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  FormControl,
  FormLabel,
  HStack,
  Spinner,
  Center,
  Select
} from '@chakra-ui/react';
import { FiSearch, FiInbox } from 'react-icons/fi';
import { FaQrcode } from 'react-icons/fa';

const C_Incoming = () => {
  // State for search query
  const [searchQuery, setSearchQuery] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  
  // Mock empty state - would be replaced with real data in actual implementation
  const hasDocuments = false;

  // Mock function for QR scanning
  const handleScanQR = () => {
    setIsScanning(true);
    // Simulate a scanning process
    setTimeout(() => setIsScanning(false), 2000);
  };

  // Priority badge color mapping
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'Low': return 'green';
      case 'Medium': return 'blue';
      case 'High': return 'orange';
      case 'Urgent': return 'red';
      default: return 'gray';
    }
  };

  return (
    <Box 
      overflow="hidden" 
      bg="white" 
      p={5} 
      minH="100vh"
    >
      <Heading as="h1" size="xl" mb={2}>
        Incoming Documents
      </Heading>
      <Text color="gray.600" mb={5}>
        View and manage all incoming documents that require processing.
      </Text>

      {/* Filter Section */}
      <Flex
        direction="column"
        mb={6}
        gap={4}
        p={4}
        bg="blue.50"
        borderRadius="md"
        boxShadow="sm"
      >
        <Flex 
          direction={{ base: "column", md: "row" }} 
          gap={4} 
          alignItems={{ base: "stretch", md: "flex-end" }}
        >
          {/* Reference Number Search */}
          <FormControl flex="1">
            <FormLabel fontSize="sm" fontWeight="medium" display="flex" alignItems="center" gap={2}>
              <Icon as={FiSearch} color="blue.500" /> Reference Number
            </FormLabel>
            <InputGroup>
              <Input
                placeholder="Search by reference number..."
                value={searchQuery}
                type="number"
                onChange={(e) => setSearchQuery(e.target.value)}
                bg="white"
                _focus={{ borderColor: "blue.400" }}
              />
              <InputRightElement>
                <Icon as={FiSearch} boxSize={5} />
              </InputRightElement>
            </InputGroup>
          </FormControl>
          
        {/* QR Code Scan Button */}
        <Button
            onClick={handleScanQR}
            isLoading={isScanning}
            loadingText="Scanning"
            bg="green.500"
            color={"white"}
            _hover={{ bg: "green.600" }}
            leftIcon={<FaQrcode />}
            size="md"
            alignSelf={{ base: "stretch", md: "flex-end" }}
            mt={{ base: 2, md: 0 }}
            >
            Scan QR Code
        </Button>
        </Flex>
      </Flex>

      {/* Documents Section */}
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
            <Icon as={FiInbox} mr={2} color="green.600" /> INCOMING DOCUMENTS
          </Heading>
        </Flex>

        {/* Priority Tabs */}
        <Tabs 
          colorScheme="green" 
          variant="enclosed" 
          onChange={(index) => setActiveTab(index)}
          mb={4}
        >
          <TabList>
            <Tab>All</Tab>
            <Tab>Low</Tab>
            <Tab>Medium</Tab>
            <Tab>High</Tab>
            <Tab>Urgent</Tab>
          </TabList>

          <TabPanels>
            {/* Each tab has the same structure but would filter by different priorities */}
            {['All', 'Low', 'Medium', 'High', 'Urgent'].map((priority, index) => (
              <TabPanel key={priority} p={0} pt={4}>
                {hasDocuments ? (
                  <Table variant="simple" size="md">
                    <Thead bg="gray.50">
                      <Tr>
                        <Th>Reference #</Th>
                        <Th>Title</Th>
                        <Th>Date Received</Th>
                        <Th>From</Th>
                        <Th>Priority</Th>
                        <Th>Status</Th>
                        <Th width="100px">Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {/* This would be populated with actual document data */}
                    </Tbody>
                  </Table>
                ) : (
                  <Center 
                    p={10} 
                    borderWidth="1px" 
                    borderRadius="md" 
                    borderStyle="dashed" 
                    borderColor="gray.300"
                    flexDirection="column"
                    gap={3}
                  >
                    <Icon as={FiInbox} boxSize={10} color="gray.400" />
                    <Text color="gray.500" fontWeight="medium">
                      No {priority !== 'All' ? priority + ' priority' : ''} incoming documents found
                    </Text>
                    <Text fontSize="sm" color="gray.400">
                      Documents will appear here once received in the system
                    </Text>
                  </Center>
                )}
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      </Box>
    </Box>
  );
};

export default C_Incoming;
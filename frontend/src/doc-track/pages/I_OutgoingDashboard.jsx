import React, { useEffect, useState } from 'react';
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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  FormControl,
  FormLabel,
  Center,
  Spinner,
  TableContainer,
  Select,
  useDisclosure,
  Tooltip,
} from '@chakra-ui/react';
import { FiSearch, FiInbox } from 'react-icons/fi';
import { LuLogs } from "react-icons/lu";
import { FaEye, FaInfo } from 'react-icons/fa';
import { TbFileShredder } from "react-icons/tb";

import { useAdminDashboard } from '../store/adminDashboard.store.js';
import DocumentLifeCycleModal from '../../components/docLifeCyclePanel.jsx';

const I_OutgoingDashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [releasedPage, setTotalReleasedPage] = useState(1);
  const [isOutgoingPage, setIsOutgoingPage] = useState(false);

  const {
    releasedDocuments,
    isLoadingReleasedDocuments,
    releasedDocumentsError
  } = useAdminDashboard(
    { releasedPage },
    { searchQuery }
  );

  useEffect(() => {
    setTotalReleasedPage(1);
  }, [searchQuery]);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedDoc, setSelectedDoc] = useState(null);

  const documents = releasedDocuments?.data?.relevantDocs || [];
  const totalPages = releasedDocuments?.data?.totalPages || 1;
  const currentPage = releasedDocuments?.data?.currentPage || 1;
  const totalItems = releasedDocuments?.data?.totalCount || 0;

  const handleOpenDetails = (doc, { isOutgoingPage = true } = {}) => {
    setSelectedDoc(doc);
    setIsOutgoingPage(isOutgoingPage);
    onOpen();
  };

  const PaginationControls = ({ currentPage, setCurrentPage, totalPages, totalItems }) => (
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
      <Flex>
        <Button
          size="sm"
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          isDisabled={currentPage === 1}
          colorScheme="red"
          variant="outline"
          mr={2}
        >
          Previous
        </Button>
        <Button
          size="sm"
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          isDisabled={currentPage >= totalPages}
          colorScheme='red'
          variant="outline"
        >
          Next
        </Button>
      </Flex>
    </Flex>
  );

  return (
    <Box overflow="hidden" bg="white" p={5} minH="100vh">
      <Heading as="h1" size="xl" mb={2}>
        Document Logs
      </Heading>
      <Text color="gray.600" mb={5}>
        View and manage incoming documents.
      </Text>

      {/* Filter Section */}
      <Flex direction="column" mb={6} gap={4} p={4} bg="blue.50" borderRadius="md" boxShadow="sm">
        <Flex direction={{ base: "column", md: "row" }} gap={4} alignItems={{ base: "stretch", md: "flex-end" }}>
          {/* Search */}
          <FormControl flex="1">
            <FormLabel fontSize="sm" fontWeight="medium" display="flex" alignItems="center" gap={2}>
              <Icon as={FiSearch} color="blue.500" /> Search
            </FormLabel>
            <InputGroup>
              <Input
                placeholder="Search by ref #, name, or person..."
                value={searchQuery}
                type="text"
                onChange={(e) => setSearchQuery(e.target.value)}
                bg="white"
                _focus={{ borderColor: "blue.400" }}
              />
              <InputRightElement>
                <Icon as={FiSearch} boxSize={5} />
              </InputRightElement>
            </InputGroup>
          </FormControl>

          {/* Type Select */}
          {/* <FormControl maxW={{ md: '260px' }}>
            <FormLabel fontSize="sm" fontWeight="medium">Document Type</FormLabel>
            <Select
              bg="white"
              value={logType}
              onChange={(e) => setLogType(e.target.value)}
            >
              <option value="archived">Archived Documents</option>
              <option value="released">Released Documents</option>
            </Select>
          </FormControl> */}
        </Flex>
      </Flex>

      {/* Documents Section */}
      <Box mb={8}>
        <Flex justify="space-between" align="center" mb={4} bg={'red.50'} p={3} borderRadius="md" borderLeftWidth="4px" borderLeftColor={'red.500'}>
          <Heading as="h2" size="md" display="flex" alignItems="center">
            <Icon as={LuLogs} mr={2} color={'red.500'} /> OUTGOING DOCUMENTS
            <text style={{ marginLeft: 4 }}>
              <Tooltip label="Released documents records will be automatically deleted after a month." fontSize="sm" placement="top" hasArrow={true}>
                (<Icon as={FaInfo} color="blue.500" boxSize={3} />)
              </Tooltip>
            </text>
          </Heading>
        </Flex>

        {isLoadingReleasedDocuments ? (
          <Center p={10}>
            <Spinner size="lg" color={'orange.500'} />
          </Center>
        ) : documents.length > 0 ? (
          <Box overflowX="auto">
            <TableContainer>
              <Table variant="simple" size="md">
                <Thead bg="gray.50">
                  <Tr>
                    <Th>Reference #</Th>
                    <Th>Title</Th>
                    <Th>Date Released</Th>
                    <Th>Released By</Th>
                    <Th
                      position={{ base: 'static', md: 'sticky' }}
                      right={0}
                      bg="gray.50"
                      zIndex={{ base: 0, md: 1 }}
                      textAlign="center"
                      width="120px"
                    >
                      <Box display={{ base: 'none', md: 'block' }}>Scroll →</Box>
                      <Box display={{ base: 'block', md: 'none' }}>Actions</Box>
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {documents.map((doc) => {
                    const lastAction = doc.lastAction || (doc.lifeCycle?.[doc.lifeCycle.length - 1] ?? {});
                    const date = lastAction?.timeStamp ? new Date(lastAction.timeStamp).toLocaleString() : '—';
                    const by = `${lastAction?.performedBy?.first_name || ''} ${lastAction?.performedBy?.last_name || ''}`.trim() || '—';
                    return (
                      <Tr key={doc._id} fontSize="sm">
                        <Td fontWeight="semibold">{doc.refNumber || '—'}</Td>
                        <Td>{doc.documentName === 'N/A' ? doc.documentNameText : doc.documentName || '-'}</Td>
                        <Td>{date}</Td>
                        <Td>{by}</Td>
                        <Td
                          isNumeric
                          position={{ base: 'static', md: 'sticky' }}
                          right={0}
                          zIndex={1}
                          bg="white"
                        >
                          <Button
                            size="sm"
                            colorScheme='red'
                            leftIcon={<FaEye />}
                            onClick={() => handleOpenDetails(doc, { archived: true, disposal: false })}
                          >
                            Details
                          </Button>
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </TableContainer>
          </Box>
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
              No incoming documents found
            </Text>
            <Text fontSize="sm" color="gray.400">
              Try adjusting your search.
            </Text>
          </Center>
        )}

        <Flex justifyContent="space-between" alignItems="center" mt={4}>
          <PaginationControls
            currentPage={currentPage}
            setCurrentPage={setTotalReleasedPage}
            totalPages={totalPages}
            totalItems={totalItems}
            colorScheme='orange'
          />
        </Flex>
      </Box>

      {/* Details Modal (view-only) */}
      <DocumentLifeCycleModal
        isOpen={isOpen}
        onClose={onClose}
        document={selectedDoc}
        isPendingPage={false}
        isOutgoingPage={false}
        isProduceDocumentPage={false}
        isReleased={false}
        isArchived={false}
        isForDisposal={false}
        isIncomingDashboardPage={false}
        isOutgoingDashboardPage={isOutgoingPage}
      />
    </Box>
  );
};

export default I_OutgoingDashboard;
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
} from '@chakra-ui/react';
import { FiSearch, FiInbox } from 'react-icons/fi';
import { LuLogs } from "react-icons/lu";
import { FaEye } from 'react-icons/fa';

import { useAdminDashboard } from '../store/adminDashboard.store';
import DocumentLifeCycleModal from '../../components/docLifeCyclePanel.jsx';

const F_DocumentLogs = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [logType, setLogType] = useState('archived'); // archived | released
  const [archivedPage, setArchivedPage] = useState(1);
  const [releasedPage, setReleasedPage] = useState(1);
  const [isReleased, setIsReleased] = useState(false);
  const [isArchived, setIsArchived] = useState(false);
  const [isDocumentLogsPage, setIsDocumentLogsPage] = useState(true);

  const {
    archivedDocuments,
    releasedDocuments,
    isLoadingArchivedDocuments,
    isLoadingReleasedDocuments,
  } = useAdminDashboard(
    { archivedPage, releasedPage },
    { searchQuery }
  );

  useEffect(() => {
    setArchivedPage(1);
    setReleasedPage(1);
  }, [searchQuery, logType]);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedDoc, setSelectedDoc] = useState(null);

  const currentData = logType === 'archived' ? archivedDocuments?.data : releasedDocuments?.data;
  const isLoading = logType === 'archived' ? isLoadingArchivedDocuments : isLoadingReleasedDocuments;

  const documents = currentData?.relevantDocs || [];
  const totalPages = currentData?.totalPages || 1;
  const currentPage = currentData?.currentPage || 1;
  const totalItems = currentData?.totalCount || 0;

  const handleOpenDetails = (doc) => {
    setSelectedDoc(doc);
    onOpen();
  };

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
      <Flex>
        <Button
          size="sm"
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          isDisabled={currentPage === 1}
          colorScheme={colorScheme}
          variant="outline"
          mr={2}
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
      </Flex>
    </Flex>
  );

  const color = logType === 'archived' ? { scheme: 'orange', bg: 'orange.50', accent: 'orange.500', title: 'ARCHIVED' }
                                       : { scheme: 'red', bg: 'red.50', accent: 'red.500', title: 'RELEASED' };

  return (
    <Box overflow="hidden" bg="white" p={5} minH="100vh">
      <Heading as="h1" size="xl" mb={2}>
        Document Logs
      </Heading>
      <Text color="gray.600" mb={5}>
        View archived and released documents.
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
          <FormControl maxW={{ md: '260px' }}>
            <FormLabel fontSize="sm" fontWeight="medium">Document Type</FormLabel>
            <Select
              bg="white"
              value={logType}
              onChange={(e) => setLogType(e.target.value)}
            >
              <option value="archived">Archived Documents</option>
              <option value="released">Released Documents</option>
            </Select>
          </FormControl>
        </Flex>
      </Flex>

      {/* Documents Section */}
      <Box mb={8}>
        <Flex justify="space-between" align="center" mb={4} bg={color.bg} p={3} borderRadius="md" borderLeftWidth="4px" borderLeftColor={color.accent}>
          <Heading as="h2" size="md" display="flex" alignItems="center">
            <Icon as={LuLogs} mr={2} color={color.accent} /> {color.title} DOCUMENTS
          </Heading>
        </Flex>

        {isLoading ? (
          <Center p={10}>
            <Spinner size="lg" color={color.accent} />
          </Center>
        ) : documents.length > 0 ? (
          <Box overflowX="auto">
            <TableContainer>
              <Table variant="simple" size="md">
                <Thead bg="gray.50">
                  <Tr>
                    <Th>Reference #</Th>
                    <Th>Title</Th>
                    <Th>{logType === 'archived' ? 'Date Archived' : 'Date Released'}</Th>
                    <Th>{logType === 'archived' ? 'Archived By' : 'Released By'}</Th>
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
                        <Td>{doc.documentName || '—'}</Td>
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
                            colorScheme={color.scheme}
                            onClick={() => handleOpenDetails(doc)}
                            leftIcon={<FaEye />}
                            onClickCapture={() => {
                              if (logType === 'archived') {
                                setIsArchived(true);
                                setIsReleased(false);
                                setIsDocumentLogsPage(true);
                              } else {
                                setIsReleased(true);
                                setIsArchived(false);
                                setIsDocumentLogsPage(true);
                              }
                            }}
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
              No {logType} documents found
            </Text>
            <Text fontSize="sm" color="gray.400">
              Try adjusting your search.
            </Text>
          </Center>
        )}

        <Flex justifyContent="space-between" alignItems="center" mt={4}>
          <PaginationControls
            currentPage={currentPage}
            setCurrentPage={logType === 'archived' ? setArchivedPage : setReleasedPage}
            totalPages={totalPages}
            totalItems={totalItems}
            colorScheme={color.scheme}
          />
        </Flex>
      </Box>

      {/* Details Modal (view-only) */}
      <DocumentLifeCycleModal
        isOpen={isOpen}
        onClose={onClose}
        document={selectedDoc}
        isIncomingPage={false}
        isPendingPage={false}
        isOutgoingPage={false}
        isProduceDocumentPage={false}
        isReleased={isReleased}
        isArchived={isArchived}
        isDocumentLogsPage={isDocumentLogsPage}
      />
    </Box>
  );
};

export default F_DocumentLogs;
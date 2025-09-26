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
import { TbFileShredder } from "react-icons/tb";

import { useAdminDashboard } from '../store/adminDashboard.store.js';
import DocumentLifeCycleModal from '../../components/docLifeCyclePanel.jsx';

const F_ArchivedDocuments = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const [archivedPage, setArchivedPage] = useState(1);
  const [expiredPage, setExpiredPage] = useState(1);
  const [disposalPage, setDisposedPage] = useState(1);

  const [isArchived, setIsArchived] = useState(false);
  const [isForDisposal, setIsForDisposal] = useState(false);
  const [isDisposalPage, setIsForDisposalPage] = useState(false);
  

  const [logType, setLogType] = useState('archived');

  const {
    archivedDocuments,
    isLoadingArchivedDocuments,
    archivedDocumentsError,

    expiredDocuments,
    isLoadingExpiredDocuments,
    expiredDocumentsError,

    disposedDocuments,
    isLoadingDisposedDocuments,
    disposedDocumentError
  } = useAdminDashboard(
    { archivedPage, expiredPage },
    { searchQuery }
  );

  useEffect(() => {
    setArchivedPage(1);
    setExpiredPage(1);
    setDisposedPage(1);
  }, [searchQuery]);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedDoc, setSelectedDoc] = useState(null);

  const documents = archivedDocuments?.data?.relevantDocs || [];
  const totalPages = archivedDocuments?.data?.totalPages || 1;
  const currentPage = archivedDocuments?.data?.currentPage || 1;
  const totalItems = archivedDocuments?.data?.totalCount || 0;

  const expiredDocs = expiredDocuments?.data?.relevantDocs || [];
  const expiredTotalPages = expiredDocuments?.data?.totalPages || 1;
  const expiredCurrentPage = expiredDocuments?.data?.currentPage || 1;
  const expiredTotalItems = expiredDocuments?.data?.totalCount || 0;

  const disposedDocs = disposedDocuments?.data?.relevantDocs || [];
  const disposedTotalPages = disposedDocuments?.data?.totalPages || 1;
  const disposedCurrentPage = disposedDocuments?.data?.currentPage || 1;
  const disposedTotalItems = disposedDocuments?.data?.totalCount || 0;

  const handleOpenDetails = (doc, { archived = false, disposal = false, isDisposalPage = false } = {}) => {
    setSelectedDoc(doc);
    setIsArchived(archived);
    setIsForDisposal(disposal);
    setIsForDisposalPage(isDisposalPage);
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

  return (
    <Box overflow="hidden" bg="white" p={5} minH="100vh">
      <Heading as="h1" size="xl" mb={2}>
        Document Logs
      </Heading>
      <Text color="gray.600" mb={5}>
        View and manage archived, expired and disposed documents.
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
              <option value="disposed">Disposed Documents</option>
            </Select>
          </FormControl>
        </Flex>
      </Flex>

      {/* Documents Section */}

      {logType === 'archived' && (
        <>
        {/* Archived DOcument Section */}
        <Box mb={8}>
          <Flex justify="space-between" align="center" mb={4} bg={'orange.50'} p={3} borderRadius="md" borderLeftWidth="4px" borderLeftColor={'orange.500'}>
            <Heading as="h2" size="md" display="flex" alignItems="center">
              <Icon as={LuLogs} mr={2} color={'orange.500'} /> ARCHIVED DOCUMENTS
            </Heading>
          </Flex>

          {isLoadingArchivedDocuments ? (
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
                      <Th>Date Archived</Th>
                      <Th>Archived By</Th>
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
                              colorScheme='orange'
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
                No archived documents found
              </Text>
              <Text fontSize="sm" color="gray.400">
                Try adjusting your search.
              </Text>
            </Center>
          )}

          <Flex justifyContent="space-between" alignItems="center" mt={4}>
            <PaginationControls
              currentPage={currentPage}
              setCurrentPage={setArchivedPage}
              totalPages={totalPages}
              totalItems={totalItems}
              colorScheme='orange'
            />
          </Flex>
        </Box>

        {/* Expired Document Section */}
        <Box mb={8}>
          <Flex justify="space-between" align="center" mb={4} bg={'orange.50'} p={3} borderRadius="md" borderLeftWidth="4px" borderLeftColor={'orange.500'}>
            <Heading as="h2" size="md" display="flex" alignItems="center">
              <Icon as={TbFileShredder} mr={2} color={'orange.500'} /> EXPIRED DOCUMENTS
            </Heading>
          </Flex>

          {isLoadingExpiredDocuments ? (
            <Center p={10}>
              <Spinner size="lg" color={'orange.500'} />
            </Center>
          ) : expiredDocs.length > 0 ? (
            <Box overflowX="auto">
              <TableContainer>
                <Table variant="simple" size="md">
                  <Thead bg="gray.50">
                    <Tr>
                      <Th>Reference #</Th>
                      <Th>Title</Th>
                      <Th>Retention Until</Th>
                      <Th>Archived By</Th>
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
                    {expiredDocs.map((doc) => {
                      
                      const archiveEvt = (doc.lifeCycle || []).find(ev => ev.action === 'Archived');
                      const retentionUntil = archiveEvt?.archivalDetails?.retentionUntil
                        ? new Date(archiveEvt.archivalDetails.retentionUntil).toLocaleDateString()
                        : '—';
                      const by = archiveEvt?.performedBy
                        ? `${archiveEvt.performedBy.first_name || ''} ${archiveEvt.performedBy.last_name || ''}`.trim()
                        : '—';

                      return (
                        <Tr key={doc._id} fontSize="sm">
                          <Td fontWeight="semibold">{doc.refNumber || '—'}</Td>
                          <Td>{doc.documentName === 'N/A' ? doc.documentNameText : doc.documentName || '-'}</Td>
                          <Td>{retentionUntil}</Td>
                          <Td>{by || '—'}</Td>
                          <Td
                            isNumeric
                            position={{ base: 'static', md: 'sticky' }}
                            right={0}
                            zIndex={1}
                            bg="white"
                          >
                            <Button
                              size="sm"
                              colorScheme='orange'
                              leftIcon={<FaEye />}
                              onClick={() => handleOpenDetails(doc, { archived: false, disposal: true })}
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
                No expired documents found
              </Text>
              <Text fontSize="sm" color="gray.400">
                Try adjusting your search.
              </Text>
            </Center>
          )}

          <Flex justifyContent="space-between" alignItems="center" mt={4}>
            <PaginationControls
              currentPage={expiredCurrentPage}
              setCurrentPage={setExpiredPage}
              totalPages={expiredTotalPages}
              totalItems={expiredTotalItems}
              colorScheme='orange'
            />
          </Flex>
        </Box>
        </>
      )}

      {logType === 'disposed' && (
        <>
        {/* Disposed Documents */}
        <Box mb={8}>
          <Flex justify="space-between" align="center" mb={4} bg={'gray.50'} p={3} borderRadius="md" borderLeftWidth="4px" borderLeftColor={'gray.500'}>
            <Heading as="h2" size="md" display="flex" alignItems="center">
              <Icon as={LuLogs} mr={2} color={'gray.500'} /> DISPOSED DOCUMENTS
            </Heading>
          </Flex>

          {isLoadingDisposedDocuments ? (
            <Center p={10}>
              <Spinner size="lg" color={'orange.500'} />
            </Center>
          ) : disposedDocs.length > 0 ? (
            <Box overflowX="auto">
              <TableContainer>
                <Table variant="simple" size="md">
                  <Thead bg="gray.50">
                    <Tr>
                      <Th>Reference #</Th>
                      <Th>Title</Th>
                      <Th>Date Disposed</Th>
                      <Th>Disposed By</Th>
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
                              colorScheme='gray'
                              leftIcon={<FaEye />}
                              onClick={() => handleOpenDetails(doc, { archived: false, disposal: false, isDisposalPage: true })}
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
                No archived documents found
              </Text>
              <Text fontSize="sm" color="gray.400">
                Try adjusting your search.
              </Text>
            </Center>
          )}

          <Flex justifyContent="space-between" alignItems="center" mt={4}>
            <PaginationControls
              currentPage={expiredCurrentPage}
              setCurrentPage={setExpiredPage}
              totalPages={expiredTotalPages}
              totalItems={expiredTotalItems}
              colorScheme='orange'
            />
          </Flex>
        </Box>
        </>
      )}
      

      {/* Details Modal (view-only) */}
      <DocumentLifeCycleModal
        isOpen={isOpen}
        onClose={onClose}
        document={selectedDoc}
        isPendingPage={false}
        isOutgoingPage={false}
        isProduceDocumentPage={false}
        isReleased={false}
        isArchived={isArchived}
        isForDisposal={isForDisposal}
        isDisposalPage={isDisposalPage}
      />
    </Box>
  );
};

export default F_ArchivedDocuments;
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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
} from '@chakra-ui/react';
import { FiSearch, FiInbox } from 'react-icons/fi';
import { LuLogs } from "react-icons/lu";
import { FaEye, FaInfo, FaQrcode } from 'react-icons/fa';
import { TbFileShredder } from "react-icons/tb";
import { HiMiniViewfinderCircle } from 'react-icons/hi2';

import { useAdminDashboard } from '../store/adminDashboard.store.js';
import DocumentLifeCycleModal from '../../components/docLifeCyclePanel.jsx';
import QrScannerPanel from '../../components/qrScannerPanel.jsx';

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

  // QR modal state (copied pattern)
  const { isOpen: isOpenQr, onOpen: onOpenQr , onClose: onCloseQr } = useDisclosure();
  const [scanNow, setScanNow] = useState(false);

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
        View and manage outgoing documents.
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

          {/* Scan QR Code Button (copied from Outgoing page) */}
          <Button
            bg="red.500"
            color={"white"}
            _hover={{ bg: "red.600" }}
            leftIcon={<FaQrcode />}
            size="md"
            alignSelf={{ base: "stretch", md: "flex-end" }}
            mt={{ base: 2, md: 0 }}
            onClick={() => {
              onOpenQr();
              setScanNow(true);
            }}
          >
            Scan QR Code
          </Button>
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

      {/* QR Scanner Modal (copied from Outgoing page) */}
      <Modal isOpen={isOpenQr} onClose={onCloseQr} isCentered size='2xl' closeOnOverlayClick={false} scrollBehavior="inside" motionPreset="none">
        <ModalOverlay/>
        <ModalContent borderRadius="md" overflow="hidden" boxShadow="lg">
          <ModalHeader bg="red.50" borderBottomWidth="1px" borderColor="gray.200" display="flex" alignItems="center" py={4}>
            <Icon as={HiMiniViewfinderCircle} mr={2} color={'red.500'}/>
            Scan QR Code
          </ModalHeader>

          <ModalBody py={6}>
            <QrScannerPanel
              scanResults={setSelectedDoc}
              searchQuery={setSearchQuery}
              scanNow={scanNow}
              //onOpen={onOpen}
              onCloseQR={onCloseQr}
              isPendingPage={false}
              isIncomingPage={false}
              isOutgoingPage={false}
              isIncomingDashboardPage={false}
              isOutgoingDashboardPage={true}
              isStaffsPage={false}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default I_OutgoingDashboard;
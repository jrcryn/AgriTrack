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
  Center,
  Spinner,
  TableContainer,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Divider,
  SimpleGrid,
  useDisclosure,
  useToast,
  Select,
} from '@chakra-ui/react';
import { FiSearch, FiInbox } from 'react-icons/fi';
import { FaQrcode } from 'react-icons/fa';
import { CheckCircleIcon, ArrowForwardIcon, TimeIcon } from "@chakra-ui/icons";
import { FaArchive } from "react-icons/fa";
import { CiInboxOut } from "react-icons/ci";
import { GrFolderCycle } from "react-icons/gr";
import { useAuthStore } from '../../auth/store/authStore';
import { useAdminDashboard } from '../store/adminDashboard.store';

const D_Pending = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [page, setPage] = useState(1);

  const { user } = useAuthStore();

  const {
    pendingDocuments,
    isLoadingPendingDocuments,
    pendingDocumentsError,

    adminAndStaffAccounts,
    isLoadingAdminAndStaffAccounts,

    forwardDocument,
    isForwardingDocument,

    archiveDocument,
    isArchivingDocument,

    releaseDocument,
    isReleasingDocument,

    pendingRefetch,
  } = useAdminDashboard({ pendingPage: page });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const [selectedDoc, setSelectedDoc] = useState(null);
  const [forwardData, setForwardData] = useState({ forwardAccountId: '', forwardRemarks: '' });
  const [archiveData, setArchiveData] = useState({ medium: '', location: '', archiveRemarks: '' });
  const [releaseData, setReleaseData] = useState({ recipientOffice: '', recipientPerson: '', modeOfRelease: '', releaseRemarks: '' });

  const priorities = ['All', 'Low', 'Medium', 'Urgent'];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Low': return 'green';
      case 'Medium': return 'blue';
      case 'Urgent': return 'red';
      default: return 'gray';
    }
  };

  const allDocs = pendingDocuments?.data?.relevantDocs || [];
  const totalPages = pendingDocuments?.data?.totalPages || 1;
  const currentPage = pendingDocuments?.data?.currentPage || page;
  const totalItems = pendingDocuments?.data?.totalCount || 0;

  const filterDocs = (priorityLabel) => {
    const q = (searchQuery || '').toString().trim();
    return allDocs.filter(doc => {
      const matchesPriority = priorityLabel === 'All' ? true : doc.priority === priorityLabel;
      const matchesQuery = q === '' ? true : String(doc.refNumber || '').includes(q);
      return matchesPriority && matchesQuery;
    });
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

  const actionStyles = {
    "Document Created": { color: "green.400", icon: <CheckCircleIcon /> },
    "Forwarded": { color: "blue.400", icon: <ArrowForwardIcon /> },
    "Received/Work on Progress": { color: "gray.400", icon: <TimeIcon /> },
    "Archived": { color: "orange.400", icon: <FaArchive /> },
    "Released": { color: "red.400", icon: <CiInboxOut /> }
  };

  const handleOpenManage = (doc) => {
    setSelectedDoc(doc);
    onOpen();
  };

  const handleForward = async () => {
    if (!selectedDoc || !forwardData.forwardAccountId || !forwardData.forwardRemarks) {
      toast({ title: "Missing fields", description: "Select a recipient and provide remarks.", status: "warning", duration: 4000, isClosable: true });
      return;
    }
    try {
      const res = await forwardDocument({
        registeredDocId: selectedDoc._id,
        userAccountId: user.id,
        forwardAccountId: forwardData.forwardAccountId,
        forwardRemarks: forwardData.forwardRemarks,
      });
      toast({ title: "Success", description: res.message, status: "success", duration: 5000, isClosable: true });
      setForwardData({ forwardAccountId: '', forwardRemarks: '' });
      await pendingRefetch();
      onClose();
    } catch (error) {
      toast({ title: "Error", description: error.response?.data?.message || "Failed to forward document.", status: "error", duration: 5000, isClosable: true });
    }
  };

  const handleArchive = async () => {
    const { medium, location, archiveRemarks } = archiveData;
    if (!selectedDoc || !medium || !location) {
      toast({ title: "Missing fields", description: "Medium and location are required.", status: "warning", duration: 4000, isClosable: true });
      return;
    }
    try {
      const res = await archiveDocument({
        registeredDocId: selectedDoc._id,
        userAccountId: user.id,
        medium,
        location,
        archiveRemarks,
      });
      toast({ title: "Success", description: res.message, status: "success", duration: 5000, isClosable: true });
      setArchiveData({ medium: '', location: '', archiveRemarks: '' });
      await pendingRefetch();
      onClose();
    } catch (error) {
      toast({ title: "Error", description: error.response?.data?.message || "Failed to archive document.", status: "error", duration: 5000, isClosable: true });
    }
  };

  const handleRelease = async () => {
    const { recipientOffice, recipientPerson, modeOfRelease, releaseRemarks } = releaseData;
    if (!selectedDoc || !recipientOffice || !recipientPerson || !modeOfRelease) {
      toast({ title: "Missing fields", description: "Recipient, office and mode of release are required.", status: "warning", duration: 4000, isClosable: true });
      return;
    }
    try {
      const res = await releaseDocument({
        registeredDocId: selectedDoc._id,
        userAccountId: user.id,
        recipientOffice,
        recipientPerson,
        modeOfRelease,
        releaseRemarks,
      });
      toast({ title: "Success", description: res.message, status: "success", duration: 5000, isClosable: true });
      setReleaseData({ recipientOffice: '', recipientPerson: '', modeOfRelease: '', releaseRemarks: '' });
      await pendingRefetch();
      onClose();
    } catch (error) {
      toast({ title: "Error", description: error.response?.data?.message || "Failed to release document.", status: "error", duration: 5000, isClosable: true });
    }
  };

  return (
    <Box overflow="hidden" bg="white" p={5} minH="100vh">
      <Heading as="h1" size="xl" mb={2}>
        Pending Documents
      </Heading>
      <Text color="gray.600" mb={5}>
        View and manage all pending documents that require processing.
      </Text>

      {/* Filter Section */}
      <Flex direction="column" mb={6} gap={4} p={4} bg="blue.50" borderRadius="md" boxShadow="sm">
        <Flex direction={{ base: "column", md: "row" }} gap={4} alignItems={{ base: "stretch", md: "flex-end" }}>
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
            bg="yellow.500"
            color={"white"}
            _hover={{ bg: "yellow.600" }}
            leftIcon={<FaQrcode />}
            size="md"
            alignSelf={{ base: "stretch", md: "flex-end" }}
            mt={{ base: 2, md: 0 }}
            // onClick={handleScanQR}
          >
            Scan QR Code
          </Button>
        </Flex>
      </Flex>

      {/* Documents Section */}
      <Box mb={8}>
        <Flex justify="space-between" align="center" mb={4} bg="yellow.50" p={3} borderRadius="md" borderLeftWidth="4px" borderLeftColor="yellow.500">
          <Heading as="h2" size="md" display="flex" alignItems="center">
            <Icon as={FiInbox} mr={2} color="yellow.600" /> PENDING DOCUMENTS
          </Heading>
        </Flex>

        <Tabs colorScheme="yellow" variant="enclosed" index={activeTab} onChange={(i) => setActiveTab(i)} mb={4}>
          <TabList>
            {priorities.map((p) => <Tab key={p}>{p}</Tab>)}
          </TabList>

          <TabPanels>
            {priorities.map((priority) => {
              const docs = filterDocs(priority);
              const hasDocuments = docs.length > 0;

              return (
                <TabPanel key={priority} p={0} pt={4}>
                  {isLoadingPendingDocuments ? (
                    <Center p={10}>
                      <Spinner size="lg" color="yellow.500" />
                    </Center>
                  ) : hasDocuments ? (
                    <Box overflowX="auto">
                      <TableContainer>
                        <Table variant="simple" size="md">
                          <Thead bg="gray.50">
                            <Tr>
                              <Th>Reference #</Th>
                              <Th>Title</Th>
                              <Th>Date Received</Th>
                              <Th>From</Th>
                              <Th>Priority</Th>
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
                            {docs.map((doc) => {
                              const lastAction = doc.lastAction || (doc.lifeCycle?.[doc.lifeCycle.length - 1] ?? {});
                              const prevAction = doc.lifeCycle?.[doc.lifeCycle.length - 2] ?? {};
                              const from = `${prevAction?.performedBy?.first_name || ''} ${prevAction?.performedBy?.last_name || ''}`.trim() || '—';
                              const receivedAt = lastAction?.timeStamp ? new Date(lastAction.timeStamp).toLocaleString() : '—';
                              return (
                                <Tr key={doc._id} fontSize="sm">
                                  <Td fontWeight="semibold">{doc.refNumber || '—'}</Td>
                                  <Td>{doc.documentName || '—'}</Td>
                                  <Td>{receivedAt}</Td>
                                  <Td>{from}</Td>
                                  <Td>
                                    <Badge colorScheme={getPriorityColor(doc.priority)}>{doc.priority || '—'}</Badge>
                                  </Td>
                                  <Td
                                    isNumeric
                                    position={{ base: 'static', md: 'sticky' }}
                                    right={0}
                                    zIndex={1}
                                    bg="white"
                                  >
                                    <Button
                                      size="sm"
                                      colorScheme="green"
                                      onClick={() => handleOpenManage(doc)}
                                    >
                                      Manage
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
                        No {priority !== 'All' ? priority + ' priority' : ''} pending documents found
                      </Text>
                      <Text fontSize="sm" color="gray.400">
                        Documents will appear here once received in the system
                      </Text>
                    </Center>
                  )}
                </TabPanel>
              );
            })}
          </TabPanels>
        </Tabs>

        <Flex justifyContent="space-between" alignItems="center" mt={4}>
          <PaginationControls
            currentPage={currentPage}
            setCurrentPage={setPage}
            totalPages={totalPages}
            totalItems={totalItems}
            colorScheme="yellow"
          />
        </Flex>
      </Box>

      {/* Manage Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="2xl" closeOnOverlayClick={false} scrollBehavior="inside" motionPreset="none">
        <ModalOverlay />
        <ModalContent borderRadius="md" overflow="hidden" boxShadow="lg">
          <ModalHeader bg="yellow.50" borderBottomWidth="1px" borderColor="gray.200" display="flex" alignItems="center" py={4}>
            <Icon as={GrFolderCycle} mr={3} color="yellow.600" />
            Document Details & Actions
          </ModalHeader>

          <ModalBody py={6}>
            {!selectedDoc ? (
              <Center py={6}>
                <Spinner size="lg" color="yellow.500" />
              </Center>
            ) : (
              <>
                {/* Info */}
                <Box bg="gray.50" p={4} borderRadius="md">
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                    <Box>
                      <Text fontWeight="bold" fontSize="sm" color="gray.600">Document Type</Text>
                      <Text fontSize="md">{selectedDoc.documentName}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" fontSize="sm" color="gray.600">Document Code</Text>
                      <Text fontSize="md">{selectedDoc.documentCode}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" fontSize="sm" color="gray.600">Reference Number</Text>
                      <Text fontSize="md">{selectedDoc.refNumber}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" fontSize="sm" color="gray.600">Priority</Text>
                      <Badge colorScheme={
                        selectedDoc.priority === "Urgent" ? "red" :
                        selectedDoc.priority === "Medium" ? "blue" :
                        "green"
                      }>
                        {selectedDoc.priority}
                      </Badge>
                    </Box>
                  </SimpleGrid>
                </Box>

                <Divider my={4} />

                {/* Timeline */}
                <Heading size="sm" mb={2}>Document Lifecycle</Heading>
                <Box position="relative">
                  <Box position="absolute" left="24px" top="0" bottom="0" width="2px" bg="gray.200" zIndex={1} />
                  <Box position="relative" zIndex={2}>
                    {selectedDoc.lifeCycle?.map((event, idx) => {
                      const isLast = idx === selectedDoc.lifeCycle.length - 1;
                      const style = actionStyles[event.action] || { color: "gray.300", icon: null };
                      const formattedDate = event.timeStamp ? new Date(event.timeStamp).toLocaleString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true
                      }) : '-';
                      return (
                        <Box key={idx} pb={isLast ? 0 : 4}>
                          <Flex>
                            <Box minWidth="50px" height="50px" borderRadius="full" bg={style.color} color="white" display="flex" alignItems="center" justifyContent="center" fontSize="xl" boxShadow="md">
                              {style.icon}
                            </Box>
                            <Box ml={4} flex={1}>
                              <Flex justify="space-between" align="flex-start">
                                <Box>
                                  <Text fontWeight="bold">{event.action}</Text>
                                  <Text fontSize="sm" color="gray.600">
                                    {`By: ${event.performedBy?.first_name || ''} ${event.performedBy?.last_name || ''} (${event.performedBy?.office_position || (event.performedBy?.role ? event.performedBy.role[0].toUpperCase()+event.performedBy.role.slice(1) : '-')})`}
                                  </Text>
                                </Box>
                                <Text fontSize="sm" color="gray.500">{formattedDate}</Text>
                              </Flex>
                              {event.action === "Forwarded" && event.forwardDetails && (
                                <Box mt={2} p={3} bg="blue.50" borderRadius="md" borderLeftWidth="3px" borderLeftColor="blue.500">
                                  <Text fontSize="sm" fontWeight="bold">
                                    {`Forwarded to: ${event.forwardDetails.first_name || ''} ${event.forwardDetails.last_name || ''} (${event.forwardDetails.office_position || (event.forwardDetails.role ? event.forwardDetails.role[0].toUpperCase()+event.forwardDetails.role.slice(1) : '-')})`}
                                  </Text>
                                  {event.forwardDetails.forwardRemarks && (
                                    <Text fontSize="sm" mt={1}>Remarks: "{event.forwardDetails.forwardRemarks}"</Text>
                                  )}
                                </Box>
                              )}
                            </Box>
                          </Flex>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>

                <Divider my={4} />

                {/* Action Tabs */}
                <Tabs colorScheme="yellow" variant="enclosed">
                  <TabList>
                    <Tab>Forward</Tab>
                    <Tab>Release</Tab>
                    <Tab>Archive</Tab>
                  </TabList>
                  <TabPanels>
                    {/* Forward */}
                    <TabPanel px={0} pt={4}>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <FormControl isRequired>
                          <FormLabel>Forward To</FormLabel>
                          <Select
                            placeholder={isLoadingAdminAndStaffAccounts ? 'Loading accounts...' : 'Select a user'}
                            value={forwardData.forwardAccountId}
                            onChange={(e) => setForwardData(d => ({ ...d, forwardAccountId: e.target.value }))}
                            isDisabled={isLoadingAdminAndStaffAccounts}
                          >
                            {!isLoadingAdminAndStaffAccounts && adminAndStaffAccounts?.map(acc => (
                              <option key={acc._id} value={acc._id}>
                                {`${acc.first_name} ${acc.last_name} (${acc.office_position || (acc.role ? acc.role[0].toUpperCase()+acc.role.slice(1) : '-')})`}
                              </option>
                            ))}
                          </Select>
                        </FormControl>
                        <FormControl isRequired>
                          <FormLabel>Forward Remarks</FormLabel>
                          <Input
                            placeholder='Instructions or remarks'
                            value={forwardData.forwardRemarks}
                            onChange={(e) => setForwardData(d => ({ ...d, forwardRemarks: e.target.value }))}
                          />
                        </FormControl>
                      </SimpleGrid>
                      <Flex justify="flex-end" mt={4}>
                        <Button
                          colorScheme="yellow"
                          onClick={handleForward}
                          isLoading={isForwardingDocument}
                          isDisabled={!forwardData.forwardAccountId || !forwardData.forwardRemarks}
                        >
                          Forward Document
                        </Button>
                      </Flex>
                    </TabPanel>

                    {/* Release */}
                    <TabPanel px={0} pt={4}>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <FormControl isRequired>
                          <FormLabel>Recipient Office</FormLabel>
                          <Input
                            placeholder='Office name'
                            value={releaseData.recipientOffice}
                            onChange={(e) => setReleaseData(d => ({ ...d, recipientOffice: e.target.value }))}
                          />
                        </FormControl>
                        <FormControl isRequired>
                          <FormLabel>Recipient Person</FormLabel>
                          <Input
                            placeholder='Full name'
                            value={releaseData.recipientPerson}
                            onChange={(e) => setReleaseData(d => ({ ...d, recipientPerson: e.target.value }))}
                          />
                        </FormControl>
                        <FormControl isRequired>
                          <FormLabel>Mode of Release</FormLabel>
                          <Input
                            placeholder='e.g. Personal, Courier, Email'
                            value={releaseData.modeOfRelease}
                            onChange={(e) => setReleaseData(d => ({ ...d, modeOfRelease: e.target.value }))}
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel>Release Remarks</FormLabel>
                          <Input
                            placeholder='Optional remarks'
                            value={releaseData.releaseRemarks}
                            onChange={(e) => setReleaseData(d => ({ ...d, releaseRemarks: e.target.value }))}
                          />
                        </FormControl>
                      </SimpleGrid>
                      <Flex justify="flex-end" mt={4}>
                        <Button
                          colorScheme="red"
                          onClick={handleRelease}
                          isLoading={isReleasingDocument}
                          isDisabled={!releaseData.recipientOffice || !releaseData.recipientPerson || !releaseData.modeOfRelease}
                        >
                          Mark as Released
                        </Button>
                      </Flex>
                    </TabPanel>

                    {/* Archive */}
                    <TabPanel px={0} pt={4}>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <FormControl isRequired>
                          <FormLabel>Medium</FormLabel>
                          <Input
                            placeholder='e.g. Paper, Digital'
                            value={archiveData.medium}
                            onChange={(e) => setArchiveData(d => ({ ...d, medium: e.target.value }))}
                          />
                        </FormControl>
                        <FormControl isRequired>
                          <FormLabel>Location</FormLabel>
                          <Input
                            placeholder='Storage location'
                            value={archiveData.location}
                            onChange={(e) => setArchiveData(d => ({ ...d, location: e.target.value }))}
                          />
                        </FormControl>
                        <FormControl gridColumn={{ md: 'span 2' }}>
                          <FormLabel>Archive Remarks</FormLabel>
                          <Input
                            placeholder='Optional remarks'
                            value={archiveData.archiveRemarks}
                            onChange={(e) => setArchiveData(d => ({ ...d, archiveRemarks: e.target.value }))}
                          />
                        </FormControl>
                      </SimpleGrid>
                      <Flex justify="flex-end" mt={4}>
                        <Button
                          colorScheme="orange"
                          onClick={handleArchive}
                          isLoading={isArchivingDocument}
                          isDisabled={!archiveData.medium || !archiveData.location}
                        >
                          Archive Document
                        </Button>
                      </Flex>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </>
            )}
          </ModalBody>

          <ModalFooter bg="gray.50" borderTopWidth="1px" borderColor="gray.200" py={4}>
            <Button
              variant="outline"
              onClick={() => {
                onClose();
                setSelectedDoc(null);
                setForwardData({ forwardAccountId: '', forwardRemarks: '' });
                setArchiveData({ medium: '', location: '', archiveRemarks: '' });
                setReleaseData({ recipientOffice: '', recipientPerson: '', modeOfRelease: '', releaseRemarks: '' });
              }}
              _hover={{ bg: "gray.100" }}
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default D_Pending;
import React from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  Box, VStack, Text, Heading, Divider, SimpleGrid, Badge, Flex, Button
} from '@chakra-ui/react';
import { CheckCircleIcon, ArrowForwardIcon, TimeIcon } from "@chakra-ui/icons";
import { FaArchive } from "react-icons/fa";
import { CiInboxOut } from "react-icons/ci";
import { GrFolderCycle } from "react-icons/gr";
import { set } from 'lodash';

const actionStyles = {
  "Document Created": { color: "green.400", icon: <CheckCircleIcon /> },
  "Forwarded": { color: "blue.400", icon: <ArrowForwardIcon /> },
  "Received/Work on Progress": { color: "gray.400", icon: <TimeIcon /> },
  "Archived": { color: "orange.400", icon: <FaArchive /> },
  "Released": { color: "red.400", icon: <CiInboxOut /> }
};

const roleLabel = (office_position, role) =>
  office_position || (role ? role.charAt(0).toUpperCase() + role.slice(1) : '');

const DocumentLifecycleModal = ({
  isOpen,
  onClose,
  selectedDoc,                 // lifecycle doc from backend
  onScanAgain,          // optional

  isIncomingPage,
  isPendingPage,
  isOutgoingPage,
  isProduceDocumentPage
}) => {
  const data = selectedDoc;


  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="2xl" closeOnOverlayClick={false} scrollBehavior="inside" motionPreset="none">
      <ModalOverlay />
      <ModalContent borderRadius="md" overflow="hidden" boxShadow="lg">
        {isPendingPage || isProduceDocumentPage && (
            <ModalHeader bg="blue.50" borderBottomWidth="1px" borderColor="gray.200" display="flex" alignItems="center" py={4}>
                <GrFolderCycle style={{ marginRight: 12, color: '#2563eb' }} />
                Current Lifecycle
            </ModalHeader>
        )}

        {isOutgoingPage && (
            <ModalHeader bg="red.50" borderBottomWidth="1px" borderColor="gray.200" display="flex" alignItems="center" py={4}>
                <GrFolderCycle style={{ marginRight: 12, color: '#2563eb' }} />
                Document Status
            </ModalHeader>
        )}



        <ModalBody py={6}>
          {!data ? (
            <VStack spacing={4} align="center" py={6}>
              <Text color="gray.600">Please scan a document QR code or select a document first to view its lifecycle...</Text>
            </VStack>
          ) : (
            <VStack spacing={4} align="stretch">
              {/* Document Info */}
              <Box bg="gray.50" p={4} borderRadius="md">
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                  <Box>
                    <Text fontWeight="bold" fontSize="sm" color="gray.600">Document Type</Text>
                    <Text fontSize="md">{data.documentName}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" fontSize="sm" color="gray.600">Document Code</Text>
                    <Text fontSize="md">{data.documentCode}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" fontSize="sm" color="gray.600">Reference Number</Text>
                    <Text fontSize="md">{data.refNumber}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" fontSize="sm" color="gray.600">Priority</Text>
                    <Badge colorScheme={
                      data.priority === "Urgent" ? "red" :
                      data.priority === "Medium" ? "orange" :
                      "green"
                    }>
                      {data.priority}
                    </Badge>
                  </Box>
                </SimpleGrid>
              </Box>

              <Divider my={2} />

              {/* Timeline */}
              <Heading size="sm" mb={2}>Document Lifecycle</Heading>

              <Box position="relative">
                <Box position="absolute" left="24px" top="0" bottom="0" width="2px" bg="gray.200" zIndex={1} />
                <VStack spacing={0} align="stretch" position="relative" zIndex={2}>
                  {Array.isArray(data.lifeCycle) && data.lifeCycle.map((event, index) => {
                    const isLast = index === data.lifeCycle.length - 1;
                    const style = actionStyles[event?.action] || { color: "gray.400", icon: <TimeIcon /> };
                    const date = event?.timeStamp ? new Date(event.timeStamp) : null;
                    const formattedDate = date
                      ? date.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })
                      : '';

                    return (
                      <Box key={index} pb={isLast ? 0 : 4}>
                        <Flex>
                          <Box
                            minWidth="50px"
                            height="50px"
                            borderRadius="full"
                            bg={style.color}
                            color="white"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            fontSize="xl"
                            boxShadow="md"
                          >
                            {style.icon}
                          </Box>

                          <Box ml={4} flex={1}>
                            <Flex justify="space-between" align="flex-start">
                              <Box>
                                <Text fontWeight="bold">{event?.action || 'Event'}</Text>
                                <Text fontSize="sm" color="gray.600">
                                  {event?.performedBy
                                    ? `By: ${event.performedBy.first_name || ''} ${event.performedBy.last_name || ''} (${roleLabel(event.performedBy.office_position, event.performedBy.role)})`
                                    : 'By: Unknown'}
                                </Text>
                              </Box>
                              <Text fontSize="sm" color="gray.500">{formattedDate}</Text>
                            </Flex>

                            {event?.action === "Forwarded" && event?.forwardDetails && (
                              <Box mt={2} p={3} bg="blue.50" borderRadius="md" borderLeftWidth="3px" borderLeftColor="blue.500">
                                <Text fontSize="sm" fontWeight="bold">
                                  {`Forwarded to: ${event.forwardDetails.first_name || ''} ${event.forwardDetails.last_name || ''} (${roleLabel(event.forwardDetails.office_position, event.forwardDetails.role)})`}
                                </Text>
                                {event.forwardDetails.forwardRemarks && (
                                  <Text fontSize="sm" mt={1}>
                                    Remarks: "{event.forwardDetails.forwardRemarks}"
                                  </Text>
                                )}
                              </Box>
                            )}

                            {event?.action === "Received" && event?.receiveDetails && (
                              <Box mt={2} p={3} bg="green.50" borderRadius="md" borderLeftWidth="3px" borderLeftColor="green.500">
                                {event.receiveDetails.receiveRemarks && (
                                  <Text fontSize="sm">Comments: "{event.receiveDetails.receiveRemarks}"</Text>
                                )}
                              </Box>
                            )}

                            {event?.action === "Archived" && event?.archiveDetails && (
                              <Box mt={2} p={3} bg="purple.50" borderRadius="md" borderLeftWidth="3px" borderLeftColor="purple.500">
                                <SimpleGrid columns={2} spacing={2} fontSize="sm">
                                  <Text fontWeight="bold">Medium:</Text>
                                  <Text>{event.archiveDetails.medium}</Text>

                                  <Text fontWeight="bold">Location:</Text>
                                  <Text>{event.archiveDetails.location}</Text>

                                  {event.archiveDetails.archiveRemarks && (
                                    <>
                                      <Text fontWeight="bold">Remarks:</Text>
                                      <Text>"{event.archiveDetails.archiveRemarks}"</Text>
                                    </>
                                  )}
                                </SimpleGrid>
                              </Box>
                            )}

                            {event?.action === "Released" && event?.releaseDetails && (
                              <Box mt={2} p={3} bg="yellow.50" borderRadius="md" borderLeftWidth="3px" borderLeftColor="yellow.500">
                                <SimpleGrid columns={2} spacing={2} fontSize="sm">
                                  <Text fontWeight="bold">Recipient Office:</Text>
                                  <Text>{event.releaseDetails.recipientOffice}</Text>

                                  <Text fontWeight="bold">Recipient Person:</Text>
                                  <Text>{event.releaseDetails.recipientPerson}</Text>

                                  <Text fontWeight="bold">Mode of Release:</Text>
                                  <Text>{event.releaseDetails.modeOfRelease}</Text>

                                  {event.releaseDetails.releaseRemarks && (
                                    <>
                                      <Text fontWeight="bold">Remarks:</Text>
                                      <Text>"{event.releaseDetails.releaseRemarks}"</Text>
                                    </>
                                  )}
                                </SimpleGrid>
                              </Box>
                            )}
                          </Box>
                        </Flex>
                      </Box>
                    );
                  })}
                </VStack>
              </Box>

              {/* Current Handler */}
              {isProduceDocumentPage && (
                <Box mt={4} p={4} bg="blue.50" borderRadius="md">
                    <Heading size="sm" mb={2}>Current Document Handler</Heading>
                    <Text>
                    {(() => {
                        const events = Array.isArray(data.lifeCycle) ? data.lifeCycle : [];
                        const last = events[events.length - 1];
                        if (!last) return <i>No lifecycle events</i>;
                        if (last.action === 'Forwarded' && last.forwardDetails) {
                        return `By: ${last.forwardDetails.first_name || ''} ${last.forwardDetails.last_name || ''} (${roleLabel(last.forwardDetails.office_position, last.forwardDetails.role)})`;
                        }
                        if (last.performedBy) {
                        return `By: ${last.performedBy.first_name || ''} ${last.performedBy.last_name || ''} (${roleLabel(last.performedBy.office_position, last.performedBy.role)})`;
                        }
                        return <i>Unknown</i>;
                    })()}
                    </Text>
                </Box>
              )}

              {isPendingPage && (
                <>
                <Divider my={2} />

                {/* Action Tabs */}
                <Tabs colorScheme="yellow" variant="enclosed">
                  <TabList>
                    <Tab>Forward</Tab>
                    <Tab>Release</Tab>
                    <Tab>Archive</Tab>
                  </TabList>
                  <TabPanels>
                    {/* Forward */}
                    <TabPanel px={0} pt={4} pb={0}>
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
                    <TabPanel px={0} pt={4} pb={0}>
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
                    <TabPanel px={0} pt={4} pb={0}>
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
             

            </VStack>
          )}
        </ModalBody>

        <ModalFooter bg="gray.50" borderTopWidth="1px" borderColor="gray.200" py={4}>
          <Button
            variant="outline"
            onClick={onClose}
            size="md"
            _hover={{ bg: "gray.100" }}
          >
            Close
          </Button>
          {isProduceDocumentPage && (
            <Button
              colorScheme='blue'
              ml={3}
              size="md"
              fontWeight="500"
              boxShadow="sm"
              _hover={{ boxShadow: "md", bg: "blue.600" }}
              onClick={onScanAgain}
            >
              Scan Again
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DocumentLifecycleModal;
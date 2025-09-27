import React, { useState, useEffect } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  Box, VStack, Text, Heading, Divider, SimpleGrid, Badge, Flex, Button, Tabs, TabList, TabPanels, Tab, TabPanel,
  FormControl, FormLabel, Input, Select, useToast,
  Switch, NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper,
  Tooltip, Icon, HStack
} from '@chakra-ui/react';
import { CheckCircleIcon, ArrowForwardIcon, TimeIcon } from "@chakra-ui/icons";
import { FaArchive, FaInfo } from "react-icons/fa";
import { CiInboxOut } from "react-icons/ci";
import { GrFolderCycle } from "react-icons/gr";
import { TbRouteAltRight, TbFileShredder } from "react-icons/tb";
import { MdOutgoingMail } from "react-icons/md";
import { FaBoxOpen } from "react-icons/fa";
import { RiMailDownloadFill } from "react-icons/ri";

import { useAdminDashboard } from '../doc-track/store/adminDashboard.store';
import { useAuthStore } from '../auth/store/authStore.js';
import { useQueryClient } from '@tanstack/react-query';
import { Form } from 'react-router-dom';


const actionStyles = {
  "Document Created": { color: "green.400", icon: <CheckCircleIcon /> },
  "Forwarded": { color: "blue.400", icon: <ArrowForwardIcon /> },
  "Received/Work on Progress": { color: "gray.400", icon: <TimeIcon /> },
  "Archived": { color: "orange.400", icon: <FaArchive /> },
  "Released": { color: "red.400", icon: <MdOutgoingMail /> },
  "Rerouted": { color: "purple.400", icon: <TbRouteAltRight /> },
  "Unarchived": { color: "yellow.400", icon: <FaBoxOpen /> },
  "Unreleased": { color: "pink.400", icon: <RiMailDownloadFill /> },
  "Disposed": { color: "red.500", icon: <TbFileShredder /> },
};

const roleLabel = (office_position, role) =>
  office_position || (role ? role.charAt(0).toUpperCase() + role.slice(1) : '');

const DocumentLifeCycleModal = ({
  isOpen,
  onClose,
  document,            

  isPendingPage,
  isOutgoingPage,
  isProduceDocumentPage,
  isArchived,
  isForDisposal,
  isStaffsPage,
  isIncomingDashboardPage,
  isOutgoingDashboardPage,
  isDisposalPage
}) => {
    const data = document;
    const toast = useToast();
    const queryClient = useQueryClient();

    const { user } = useAuthStore();

    const {
        forwardDocument,
        isForwardingDocument,
        archiveDocument,
        isArchivingDocument,
        releaseDocument,
        isReleasingDocument,
        adminAndStaffAccounts,
        isLoadingAdminAndStaffAccounts,

        unarchiveDocument,           
        isUnarchivingDocument,       
        unreleaseDocument,           
        isUnreleasingDocument,      
        rerouteDocument,            
        isReroutingDocument,
        disposeDocuments,
        isDisposingDocuments,

        deleteRegisteredDocument,
        isDeletingRegisteredDocument
    } = useAdminDashboard();
    const [isUnderstood, setIsUnderstood] = useState(false);
    const [forwardData, setForwardData] = useState({ forwardAccountId: '', forwardRemarks: '' });
    const [archiveData, setArchiveData] = useState({ 
      medium: '', 
      location: '', 
      archiveRemarks: '', 
      isCustomDoc: '',
      customDisposalMethod: '',
      customRetentionPeriod: ''
    });
    const [releaseData, setReleaseData] = useState({ recipientOffice: '', recipientPerson: '', modeOfRelease: '', releaseRemarks: '', isCustomDoc: '' });

    const handleForward = async () => {
      if (!data || !forwardData.forwardAccountId || !forwardData.forwardRemarks) {
        toast({ title: "Missing fields", description: "Select a recipient and provide remarks.", status: "warning", duration: 4000, isClosable: true });
        return;
      }
      try {
        const res = await forwardDocument({
          registeredDocId: data._id,
          userAccountId: user.id,
          forwardAccountId: forwardData.forwardAccountId,
          forwardRemarks: forwardData.forwardRemarks,
        });
        toast({ title: "Success", description: res.message, status: "success", duration: 5000, isClosable: true });
        setForwardData({ forwardAccountId: '', forwardRemarks: '' });
        onClose();

        await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['pendingDocuments'] }),
            queryClient.invalidateQueries({ queryKey: ['outgoingDocuments'] }),
            queryClient.invalidateQueries({ queryKey: ['forwardedDocuments'] }),
            queryClient.invalidateQueries({ queryKey: ['documentWorkload'] }),
            queryClient.invalidateQueries({ queryKey: ['sectionDocumentCount'] })
        ]);

      } catch (error) {
        toast({ title: "Error", description: error.response?.data?.message || "Failed to forward document.", status: "error", duration: 5000, isClosable: true });
        console.log(error);
      }
    };
  
    const handleArchive = async () => {
      const { medium, location, archiveRemarks } = archiveData;
      if ( !medium || !location) {
        toast({ title: "Missing fields", description: "Medium and location are required.", status: "warning", duration: 4000, isClosable: true });
        return;
      }
      try {
        const res = await archiveDocument({
          registeredDocId: data._id,
          userAccountId: user.id,
          medium,
          location,
          archiveRemarks,
          isCustomDoc: data.documentName === 'N/A' ? true : false,
          customDisposalMethod: data.documentName === 'N/A' ? archiveData.customDisposalMethod : null,
          customRetentionPeriod: data.documentName === 'N/A' ? archiveData.customRetentionPeriod : null
        });
        toast({ title: "Success", description: res.message, status: "success", duration: 5000, isClosable: true });
        setArchiveData({ medium: '', location: '', archiveRemarks: '', isCustomDoc: '', customDisposalMethod: '', customRetentionPeriod: '' });
        onClose();

        await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['pendingDocuments'] }),
            queryClient.invalidateQueries({ queryKey: ['archivedDocuments'] }),
            queryClient.invalidateQueries({ queryKey: ['documentWorkload'] }),
        ])

      } catch (error) {
        console.log(error);
        toast({ title: "Error", description: error.response?.data?.message || "Failed to archive document.", status: "error", duration: 5000, isClosable: true });
      }
    };
  
    const handleRelease = async () => {
      const { recipientOffice, recipientPerson, modeOfRelease, releaseRemarks } = releaseData;
      if (!data || !recipientOffice || !recipientPerson || !modeOfRelease) {
        toast({ title: "Missing fields", description: "Recipient, office and mode of release are required.", status: "warning", duration: 4000, isClosable: true });
        return;
      }
      try {
        const res = await releaseDocument({
          registeredDocId: data._id,
          userAccountId: user.id,
          recipientOffice,
          recipientPerson,
          modeOfRelease,
          releaseRemarks,
          isCustomDoc: data.documentName === 'N/A' ? true : false,
        });
        toast({ title: "Success", description: res.message, status: "success", duration: 5000, isClosable: true });
        setReleaseData({ recipientOffice: '', recipientPerson: '', modeOfRelease: '', releaseRemarks: '' });
        onClose();

        await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['pendingDocuments'] }),
            queryClient.invalidateQueries({ queryKey: ['releasedDocuments'] }),
            queryClient.invalidateQueries({ queryKey: ['documentWorkload'] }),
        ])
      } catch (error) {
        toast({ title: "Error", description: error.response?.data?.message || "Failed to release document.", status: "error", duration: 5000, isClosable: true });
      }
    };

    const [unarchiveData, setUnarchiveData] = useState({ forwardToSelf: '', forwardAccountId: '', unarchiveRemarks: '' });
    const [unreleaseData, setUnreleaseData] = useState({ forwardToSelf: '', forwardAccountId: '', unreleaseRemarks: '' });

    const [rerouteData, setRerouteData] = useState({ rerouteToSelf: true, rerouteAccountId: '', rerouteRemarks: '' });
    const [disposeData, setDisposeData] = useState({ disposalRemarks: '' });

    const handleUnarchive = async () => {
      if (!data || !user?.id) return;
      if (!unarchiveData.forwardToSelf && !unarchiveData.forwardAccountId) {
        toast({ title: "Missing fields", description: "Select a recipient or forward to yourself.", status: "warning", duration: 4000, isClosable: true });
        return;
      }
      try {
        const res = await unarchiveDocument({
          archivedDocId: data._id,
          userAccountId: user.id,
          forwardAccountId: unarchiveData.forwardToSelf ? undefined : unarchiveData.forwardAccountId,
          unarchiveRemarks: unarchiveData.unarchiveRemarks || '',
          forwardToSelf: unarchiveData.forwardToSelf
        });
        toast({ title: "Success", description: res.message || "Document unarchived.", status: "success", duration: 5000, isClosable: true });
        setUnarchiveData({ forwardToSelf: '', forwardAccountId: '', unarchiveRemarks: '' });
        onClose();
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['archivedDocuments'] }),
          queryClient.invalidateQueries({ queryKey: ['forwardedDocuments'] }),
          queryClient.invalidateQueries({ queryKey: ['sectionDocumentCount'] }),
          queryClient.invalidateQueries({ queryKey: ['documentWorkload'] }),
        ]);
      } catch (error) {
        toast({ title: "Error", description: error.response?.data?.message || "Failed to unarchive document.", status: "error", duration: 5000, isClosable: true });
      }
    };

    const handleUnrelease = async () => {
      if (!data || !user?.id) return;
      if (!unreleaseData.forwardToSelf && !unreleaseData.forwardAccountId) {
        toast({ title: "Missing fields", description: "Select a recipient or forward to yourself.", status: "warning", duration: 4000, isClosable: true });
        return;
      }
      try {
        const res = await unreleaseDocument({
          releasedDocId: data._id,
          userAccountId: user.id,
          forwardAccountId: unreleaseData.forwardToSelf ? undefined : unreleaseData.forwardAccountId,
          unreleaseRemarks: unreleaseData.unreleaseRemarks || '',
          forwardToSelf: !!unreleaseData.forwardToSelf
        });
        toast({ title: "Success", description: res.message || "Document unreleased.", status: "success", duration: 5000, isClosable: true });
        setUnreleaseData({ forwardToSelf: '', forwardAccountId: '', unreleaseRemarks: '' });
        onClose();
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['releasedDocuments'] }),
          queryClient.invalidateQueries({ queryKey: ['forwardedDocuments'] }),
          queryClient.invalidateQueries({ queryKey: ['sectionDocumentCount'] }),
          queryClient.invalidateQueries({ queryKey: ['documentWorkload'] }),
        ]);
      } catch (error) {
        toast({ title: "Error", description: error.response?.data?.message || "Failed to unrelease document.", status: "error", duration: 5000, isClosable: true });
      }
    };

    const handleReroute = async () => {
      if (!document || !user?.id) return;
      if (!rerouteData.rerouteToSelf && !rerouteData.rerouteAccountId) {
        toast({ title: 'Missing fields', description: 'Select a recipient or reroute to yourself.', status: 'warning', duration: 4000, isClosable: true });
        return;
      }
      try {
        const res = await rerouteDocument({
          registeredDocId: document._id,
          userAccountId: user.id,
          rerouteAccountId: rerouteData.rerouteToSelf ? undefined : rerouteData.rerouteAccountId,
          rerouteRemarks: rerouteData.rerouteRemarks || '',
          rerouteToSelf: !!rerouteData.rerouteToSelf
        });
        toast({ title: 'Success', description: res.message || 'Document rerouted.', status: 'success', duration: 5000, isClosable: true });
        setRerouteData({ rerouteToSelf: true, rerouteAccountId: '', rerouteRemarks: '' });
        onClose();
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['forwardedDocuments'] }),
          queryClient.invalidateQueries({ queryKey: ['pendingDocuments'] }),
          queryClient.invalidateQueries({ queryKey: ['sectionDocumentCount'] }),
          queryClient.invalidateQueries({ queryKey: ['documentWorkload'] }),
        ]);
      } catch (error) {
        toast({ title: 'Error', description: error.response?.data?.message || 'Failed to reroute document.', status: 'error', duration: 5000, isClosable: true });
      }
    };

    const handleDispose = async () => {
      if (!data || !user?.id) return;
      try {
        const res = await disposeDocuments({
          archivedDocId: data._id,
          userAccountId: user.id,
          disposalRemarks: disposeData.disposalRemarks || ''
        });
        toast({ title: 'Success', description: res.message || 'Document disposed.', status: 'success', duration: 5000, isClosable: true });
        setDisposeData({ disposalRemarks: '' });
        onClose();
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['expiredDocuments'] }),
          queryClient.invalidateQueries({ queryKey: ['archivedDocuments'] }),
        ]);
      } catch (error) {
        toast({ title: 'Error', description: error.response?.data?.message || 'Failed to dispose document.', status: 'error', duration: 5000, isClosable: true });
      }
    };

    const handleDeleteDocument = async () => {
      if (!data || !user?.id) return;
      try {
        const res = await deleteRegisteredDocument(data._id);
        toast({ title: 'Success', description: res.message || 'Document deleted.', status: 'success', duration: 5000, isClosable: true });
        onClose();
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['totalIncomingDocuments'] }),
          queryClient.invalidateQueries({ queryKey: ['forwardedDocuments'] }),
          queryClient.invalidateQueries({ queryKey: ['pendingDocuments'] }),
          queryClient.invalidateQueries({ queryKey: ['outgoingDocuments'] }),
          queryClient.invalidateQueries({ queryKey: ['documentWorkload'] }),
        ]);
      } catch (error) {
        toast({ 
          title: 'Error', description: error.response?.data?.message || 'Failed to delete document.', 
          status: 'error', 
          duration: 5000, 
          isClosable: true 
        });
      }
    }

    // compute if doc is expired based on retentionUntil
    // const isExpiredDoc = React.useMemo(() => {
    //   if (!data?.lifeCycle) return false;
    //   const archEvt = data.lifeCycle.find(ev => ev.action === 'Archived' && ev.archivalDetails?.retentionUntil);
    //   if (!archEvt) return false;
    //   try {
    //     return new Date(archEvt.archivalDetails.retentionUntil) <= new Date();
    //   } catch {
    //     return false;
    //   }
    // }, [data]);

    return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="2xl" closeOnOverlayClick={false} scrollBehavior="inside" motionPreset="none">
      <ModalOverlay />
      <ModalContent borderRadius="md" overflow="hidden" boxShadow="lg">
        {(isPendingPage || isProduceDocumentPage) && (
            <ModalHeader bg="blue.50" borderBottomWidth="1px" borderColor="gray.200" display="flex" alignItems="center" py={4}>
                <GrFolderCycle style={{ marginRight: 12, color: '#2563eb' }} />
                Current Lifecycle
            </ModalHeader>
        )}

        {(isOutgoingPage || isOutgoingDashboardPage) && (
            <ModalHeader bg="red.50" borderBottomWidth="1px" borderColor="gray.200" display="flex" alignItems="center" py={4}>
                <GrFolderCycle style={{ marginRight: 12, color: 'red' }} />
                Document Status
            </ModalHeader>
        )}

        {(isArchived || isForDisposal) && (
            <ModalHeader bg="yellow.50" borderBottomWidth="1px" borderColor="gray.200" display="flex" alignItems="center" py={4}>
                <GrFolderCycle style={{ marginRight: 12, color: '#2563eb' }} />
                Document Status
            </ModalHeader>
        )}

        {isStaffsPage && (
            <ModalHeader bg="purple.50" borderBottomWidth="1px" borderColor="gray.200" display="flex" alignItems="center" py={4}>
                <GrFolderCycle style={{ marginRight: 12, color: 'purple' }} />
                Document Status
            </ModalHeader>
        )}

        {isIncomingDashboardPage && (
          <ModalHeader bg="green.50" borderBottomWidth="1px" borderColor="gray.200" display="flex" alignItems="center" py={4}>
                <GrFolderCycle style={{ marginRight: 12, color: 'green' }} />
                Document Status
          </ModalHeader>
        )}

        {isDisposalPage && (
          <ModalHeader bg="gray.50" borderBottomWidth="1px" borderColor="gray.200" display="flex" alignItems="center" py={4}>
                <GrFolderCycle style={{ marginRight: 12, color: 'gray' }} />
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
              {isPendingPage && (
                <>
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

                        {/* Custom Disposal Method */}
                        {data.documentName === 'N/A' && (
                          <>
                          <FormControl>
                          <FormLabel>
                            Disposal Method

                            <text style={{ marginLeft: 4 }}>
                                <Tooltip label="Specify the disposal method for the document, keep empty if permanent." fontSize="sm" placement="top" hasArrow={true}>
                                  (<Icon as={FaInfo} color="blue.500" boxSize={3}/>)
                                </Tooltip>

                              </text>
                          </FormLabel>
                          <Input
                            placeholder='Disposal Method'
                            value={archiveData.customDisposalMethod}
                            onChange={(e) => setArchiveData(d => ({ ...d, customDisposalMethod: e.target.value }))}
                          />
                          </FormControl>

                          <FormControl>
                            <FormLabel>
                              Retention Period in Months 
                              
                              <text style={{ marginLeft: 4 }}>
                                <Tooltip label="Specify the retention period in months, keep empty if permanent." fontSize="sm" placement="top" hasArrow={true}>
                                  (<Icon as={FaInfo} color="blue.500" boxSize={3}/>)
                                </Tooltip>

                              </text>

                            </FormLabel>
                            <NumberInput
                              min={1}
                              max={60}
                              step={1}
                              value={archiveData.customRetentionPeriod}
                              onChange={(valueNumber) =>
                                setArchiveData(d => ({
                                  ...d,
                                  customRetentionPeriod: valueNumber 
                                }))
                              }
                            >
                              <NumberInputField placeholder="e.g. 24 (2 Years)" />
                              <NumberInputStepper>
                                <NumberIncrementStepper />
                                <NumberDecrementStepper />
                              </NumberInputStepper>
                            </NumberInput>

                          </FormControl>
                          </>
                        )}


                        
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

                <Divider my={2} />
                </>
              )}

              
                {isArchived && (
                  <>
                  <Tabs colorScheme='orange' variant='enclosed'>
                    <TabList>
                      <Tab>Unarchive</Tab>
                    </TabList>
                    <TabPanels>
                      <TabPanel px={0} pt={4} pb={0}>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                          <FormControl>
                            <FormLabel>Forward to myself</FormLabel>
                            <Switch
                              isChecked={unarchiveData.forwardToSelf}
                              onChange={(e) =>
                                setUnarchiveData(d => ({ ...d, forwardToSelf: e.target.checked, forwardAccountId: '' }))
                              }
                            />
                          </FormControl>
                          <FormControl isDisabled={unarchiveData.forwardToSelf} isRequired={!unarchiveData.forwardToSelf}>
                            <FormLabel>Forward To</FormLabel>
                            <Select
                              placeholder={isLoadingAdminAndStaffAccounts ? 'Loading accounts...' : 'Select a user'}
                              value={unarchiveData.forwardAccountId}
                              onChange={(e) => setUnarchiveData(d => ({ ...d, forwardAccountId: e.target.value }))}
                              isDisabled={isLoadingAdminAndStaffAccounts || unarchiveData.forwardToSelf}
                            >
                              {!isLoadingAdminAndStaffAccounts && adminAndStaffAccounts?.map(acc => (
                                <option key={acc._id} value={acc._id}>
                                  {`${acc.first_name} ${acc.last_name} (${acc.office_position || (acc.role ? acc.role[0].toUpperCase()+acc.role.slice(1) : '-')})`}
                                </option>
                              ))}
                            </Select>
                          </FormControl>
                          <FormControl gridColumn={{ md: 'span 2' }}>
                            <FormLabel>Remarks</FormLabel>
                            <Input
                              placeholder='Reason or context for unarchiving'
                              value={unarchiveData.unarchiveRemarks}
                              onChange={(e) => setUnarchiveData(d => ({ ...d, unarchiveRemarks: e.target.value }))}
                            />
                          </FormControl>
                        </SimpleGrid>
                        <Flex justify="flex-end" mt={4}>
                          <Button
                            colorScheme="orange"
                            onClick={handleUnarchive}
                            isLoading={isUnarchivingDocument}
                            isDisabled={!unarchiveData.forwardToSelf && !unarchiveData.forwardAccountId}
                          >
                            Unarchive and Forward
                          </Button>
                        </Flex>
                      </TabPanel>
                        </TabPanels>
                      </Tabs>

                  <Divider my={2} />
                  </>
                )}
                {isForDisposal && (
                  <>
                    <Tabs colorScheme='orange' variant='enclosed'>
                      <TabList>
                        <Tab>Dispose</Tab>
                        <Tab>Unarchive</Tab>
                      </TabList>
                      <TabPanels>
                        <TabPanel px={0} pt={4} pb={0}>
                            <Box bg="red.50" p={3} borderRadius="md" mb={3} borderLeft="4px solid" borderLeftColor="red.400">
                              <Text fontSize="sm" color="red.600">
                                Disposing permanently removes the document from circulation. This action cannot be undone.
                              </Text>
                            </Box>
                            <SimpleGrid columns={{ base: 1, md: 1 }} spacing={4}>
                              <FormControl>
                                <FormLabel>Disposal Remarks</FormLabel>
                                <Input
                                  placeholder="Reason or context for disposal (optional)"
                                  value={disposeData.disposalRemarks}
                                  onChange={(e) => setDisposeData(d => ({ ...d, disposalRemarks: e.target.value }))}
                                />
                              </FormControl>
                            </SimpleGrid>
                            <Flex justify="flex-end" mt={4}>
                              <Button
                                colorScheme="red"
                                leftIcon={<TbFileShredder />}
                                onClick={handleDispose}
                                isLoading={isDisposingDocuments}
                              >
                                Dispose Document
                              </Button>
                            </Flex>
                        </TabPanel>

                        <TabPanel px={0} pt={4} pb={0}>
                          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                            <FormControl>
                              <FormLabel>Forward to myself</FormLabel>
                              <Switch
                                isChecked={unarchiveData.forwardToSelf}
                                onChange={(e) =>
                                  setUnarchiveData(d => ({ ...d, forwardToSelf: e.target.checked, forwardAccountId: '' }))
                                }
                              />
                            </FormControl>
                            <FormControl isDisabled={unarchiveData.forwardToSelf} isRequired={!unarchiveData.forwardToSelf}>
                              <FormLabel>Forward To</FormLabel>
                              <Select
                                placeholder={isLoadingAdminAndStaffAccounts ? 'Loading accounts...' : 'Select a user'}
                                value={unarchiveData.forwardAccountId}
                                onChange={(e) => setUnarchiveData(d => ({ ...d, forwardAccountId: e.target.value }))}
                                isDisabled={isLoadingAdminAndStaffAccounts || unarchiveData.forwardToSelf}
                              >
                                {!isLoadingAdminAndStaffAccounts && adminAndStaffAccounts?.map(acc => (
                                  <option key={acc._id} value={acc._id}>
                                    {`${acc.first_name} ${acc.last_name} (${acc.office_position || (acc.role ? acc.role[0].toUpperCase()+acc.role.slice(1) : '-')})`}
                                  </option>
                                ))}
                              </Select>
                            </FormControl>
                            <FormControl gridColumn={{ md: 'span 2' }}>
                              <FormLabel>Remarks</FormLabel>
                              <Input
                                placeholder='Reason or context for unarchiving'
                                value={unarchiveData.unarchiveRemarks}
                                onChange={(e) => setUnarchiveData(d => ({ ...d, unarchiveRemarks: e.target.value }))}
                              />
                            </FormControl>
                          </SimpleGrid>
                          <Flex justify="flex-end" mt={4}>
                            <Button
                              colorScheme="orange"
                              onClick={handleUnarchive}
                              isLoading={isUnarchivingDocument}
                              isDisabled={!unarchiveData.forwardToSelf && !unarchiveData.forwardAccountId}
                            >
                              Unarchive and Forward
                            </Button>
                          </Flex>
                        </TabPanel>
                      </TabPanels>
                    </Tabs>
                  </>
                )}
                {isOutgoingDashboardPage && (
                  <>
                  <Tabs colorScheme='red' variant='enclosed'>
                    <TabList>
                      <Tab>Unrelease Document</Tab>
                    </TabList>
                    <TabPanels>
                      <TabPanel px={0} pt={4} pb={0}>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                          <FormControl>
                            <FormLabel>Forward to myself</FormLabel>
                            <Switch
                              isChecked={unreleaseData.forwardToSelf}
                              onChange={(e) =>
                                setUnreleaseData(d => ({ ...d, forwardToSelf: e.target.checked, forwardAccountId: '' }))
                              }
                            />
                          </FormControl>
                          <FormControl isDisabled={unreleaseData.forwardToSelf} isRequired={!unreleaseData.forwardToSelf}>
                            <FormLabel>Forward To</FormLabel>
                            <Select
                              placeholder={isLoadingAdminAndStaffAccounts ? 'Loading accounts...' : 'Select a user'}
                              value={unreleaseData.forwardAccountId}
                              onChange={(e) => setUnreleaseData(d => ({ ...d, forwardAccountId: e.target.value }))}
                              isDisabled={isLoadingAdminAndStaffAccounts || unreleaseData.forwardToSelf}
                            >
                              {!isLoadingAdminAndStaffAccounts && adminAndStaffAccounts?.map(acc => (
                                <option key={acc._id} value={acc._id}>
                                  {`${acc.first_name} ${acc.last_name} (${acc.office_position || (acc.role ? acc.role[0].toUpperCase()+acc.role.slice(1) : '-')})`}
                                </option>
                              ))}
                            </Select>
                          </FormControl>
                          <FormControl gridColumn={{ md: 'span 2' }}>
                            <FormLabel>Remarks</FormLabel>
                            <Input
                              placeholder='Reason or context for unreleasing'
                              value={unreleaseData.unreleaseRemarks}
                              onChange={(e) => setUnreleaseData(d => ({ ...d, unreleaseRemarks: e.target.value }))}
                            />
                          </FormControl>
                        </SimpleGrid>
                        <Flex justify="flex-end" mt={4}>
                          <Button
                            colorScheme="red"
                            onClick={handleUnrelease}
                            isLoading={isUnreleasingDocument}
                            isDisabled={!unreleaseData.forwardToSelf && !unreleaseData.forwardAccountId}
                          >
                            Unrelease and Forward
                          </Button>
                        </Flex>
                      </TabPanel>
                    </TabPanels>
                  </Tabs>

                  <Divider my={2} />
                  </>
                )}
                

              {/* Staffs Page */}
              {isStaffsPage && (
                <>
                <Tabs colorScheme="purple" variant="enclosed">
                  <TabList>
                    <Tab>Reroute</Tab>
                    <Tab>Delete</Tab>
                  </TabList>
                  <TabPanels>
                    {/* Reroute */}
                    <TabPanel px={0} pt={4} pb={0}>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <FormControl>
                          <FormLabel>Reroute to myself</FormLabel>
                          <Switch
                            isChecked={rerouteData.rerouteToSelf}
                            onChange={(e) =>
                              setRerouteData(d => ({ ...d, rerouteToSelf: e.target.checked, rerouteAccountId: '' }))
                            }
                          />
                        </FormControl>
                        <FormControl isDisabled={rerouteData.rerouteToSelf} isRequired={!rerouteData.rerouteToSelf}>
                          <FormLabel>Reroute To</FormLabel>
                          <Select
                            placeholder={isLoadingAdminAndStaffAccounts ? 'Loading accounts...' : 'Select a user'}
                            value={rerouteData.rerouteAccountId}
                            onChange={(e) => setRerouteData(d => ({ ...d, rerouteAccountId: e.target.value }))}
                            isDisabled={isLoadingAdminAndStaffAccounts || rerouteData.rerouteToSelf}
                          >
                            {!isLoadingAdminAndStaffAccounts && adminAndStaffAccounts?.map(acc => (
                              <option key={acc._id} value={acc._id}>
                                {`${acc.first_name} ${acc.last_name} (${acc.office_position || (acc.role ? acc.role[0].toUpperCase()+acc.role.slice(1) : '-')})`}
                              </option>
                            ))}
                          </Select>
                        </FormControl>
                        <FormControl gridColumn={{ md: 'span 2' }}>
                          <FormLabel>Reroute Remarks</FormLabel>
                          <Input
                            placeholder="Reason or context for rerouting"
                            value={rerouteData.rerouteRemarks}
                            onChange={(e) => setRerouteData(d => ({ ...d, rerouteRemarks: e.target.value }))}
                          />
                        </FormControl>
                      </SimpleGrid>
                      <Flex justify="flex-end" mt={4}>
                        <Button
                          colorScheme="purple"
                          onClick={handleReroute}
                          isLoading={isReroutingDocument}
                          isDisabled={!rerouteData.rerouteToSelf && !rerouteData.rerouteAccountId}
                        >
                          Reroute Document
                        </Button>
                      </Flex>
                    </TabPanel>

                    {/* Delete */}
                    <TabPanel px={0} pt={4} pb={0}>
                        <Box bg="red.50" p={3} borderRadius="md" mb={3} borderLeft="4px solid" borderLeftColor="red.400">
                          <Text fontSize="sm" color="red.600">
                            Deleting permanently removes the document from the system. This action cannot be undone.
                          </Text>
                        </Box>
                        <HStack justify="flex-end" align="center" spacing={2} mt={4}>
                          <FormControl display="flex" alignItems="center" gap={2}>
                            <FormLabel mb="0">I understand</FormLabel>
                            <Switch isChecked={isUnderstood} onChange={(e) => setIsUnderstood(e.target.checked)} />
                          </FormControl>
                          <Button colorScheme="red" onClick={handleDeleteDocument} isLoading={isDeletingRegisteredDocument} pl={8} pr={8} isDisabled={!isUnderstood}>
                            Delete Document
                          </Button>
                        </HStack>
                      </TabPanel>
                  </TabPanels>
                </Tabs>
                <Divider my={2} />
                </>
              )}

              {isIncomingDashboardPage && (
                <>
                  <Tabs colorScheme='green' variant='enclosed'>
                    <TabList>
                      <Tab>Delete Document</Tab>
                    </TabList>
                    <TabPanels>
                      <TabPanel px={0} pt={4} pb={0}>
                        <Box bg="red.50" p={3} borderRadius="md" mb={3} borderLeft="4px solid" borderLeftColor="red.400">
                          <Text fontSize="sm" color="red.600">
                            Deleting permanently removes the document from the system. This action cannot be undone.
                          </Text>
                        </Box>
                        <HStack justify="flex-end" align="center" spacing={2} mt={4}>
                          <FormControl display="flex" alignItems="center" gap={2}>
                            <FormLabel mb="0">I understand</FormLabel>
                            <Switch isChecked={isUnderstood} onChange={(e) => setIsUnderstood(e.target.checked)} />
                          </FormControl>
                          <Button colorScheme="red" onClick={handleDeleteDocument} isLoading={isDeletingRegisteredDocument} pl={8} pr={8} isDisabled={!isUnderstood}>
                            Delete Document
                          </Button>
                        </HStack>
                      </TabPanel>
                    </TabPanels>
                  </Tabs>

                  <Divider my={2} />
                </>
              )}

              {/* Document Info */}
              <Box bg="gray.50" p={4} borderRadius="md">
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                  <Box>
                    <Text fontWeight="bold" fontSize="sm" color="gray.600">Document Type</Text>
                    <Text fontSize="md">{data.documentName === 'N/A' ? data.documentNameText : data.documentName}</Text>
                  </Box>
                  {data.documentCode !== 'N/A' ? (
                  <Box>
                    <Text fontWeight="bold" fontSize="sm" color="gray.600">Document Code</Text>
                    <Text fontSize="md">{data.documentCode}</Text>
                  </Box>
                  ) : (
                    <Box>
                    <Text fontWeight="bold" fontSize="sm" color="gray.600">Originating Office</Text>
                    <Text fontSize="md">{data.originatingOffice}</Text>
                  </Box>
                  )}
                  
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
                    
                    const retentionUntil = new Date(event.archivalDetails?.retentionUntil).toLocaleString('en-US', {month: 'short', day: 'numeric', year: 'numeric'});

                    return (
                      <Box key={index} pb={isLast ? 0 : 4}>
                        <Flex>
                          <Box
                            minWidth="50px"
                            height="50px"
                            borderRadius='full'
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
                            {/* Yung mismong name ng action, for example Created, Forwarded, Rerouted, Archived etc. */}
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
                            
                            {event?.action === "Unarchived" && event?.forwardDetails && (
                              <Box mt={2} p={3} bg="yellow.50" borderRadius="md" borderLeftWidth="3px" borderLeftColor="yellow.500">
                                <Text fontSize="sm" fontWeight="bold">
                                  {`Forwarded to: ${event.forwardDetails.first_name || ''} ${event.forwardDetails.last_name || ''} (${roleLabel(event.forwardDetails.office_position, event.forwardDetails.role)})`}
                                </Text>
                                {event.forwardDetails.forwardRemarks && (
                                  <Text fontSize="sm" mt={1}>
                                    Unarchive Remarks: "{event.forwardDetails.forwardRemarks}"
                                  </Text>
                                )}
                              </Box>
                            )}

                            {event?.action === "Rerouted" && event?.rerouteDetails && (
                              <Box mt={2} p={3} bg="blue.50" borderRadius="md" borderLeftWidth="3px" borderLeftColor="blue.500">
                                <Text fontSize="sm" fontWeight="bold">
                                  {`Rerouted to: ${event.rerouteDetails.first_name || ''} ${event.rerouteDetails.last_name || ''} (${roleLabel(event.rerouteDetails.office_position, event.rerouteDetails.role)})`}
                                </Text>
                                {event.rerouteDetails.rerouteRemarks && (
                                  <Text fontSize="sm" mt={1}>
                                    Remarks: "{event.rerouteDetails.rerouteRemarks}"
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
                            
                            {/* Archival Details */}
                            {event?.action === "Archived" && event?.archivalDetails && (
                              <Box mt={2} p={3} bg="yellow.50" borderRadius="md" borderLeftWidth="3px" borderLeftColor="yellow.500">
                                <SimpleGrid columns={2} spacing={2} fontSize="sm">
                                  <Text fontWeight="bold">Disposal Method:</Text>
                                  <Text>{event.archivalDetails.disposalMethod}</Text>

                                  <Text fontWeight="bold">Retention Period:</Text>
                                  <Text>{event.archivalDetails.retentionPeriod} Month/s (Until {retentionUntil})</Text>

                                  <Text fontWeight="bold">Document Medium:</Text>
                                  <Text>{event.archivalDetails.medium}</Text>

                                  <Text fontWeight="bold">Document Location:</Text>
                                  <Text>{event.archivalDetails.location}</Text>

                                  {event.archivalDetails.archiveRemarks && (
                                    <>
                                      <Text fontWeight="bold">Remarks:</Text>
                                      <Text>"{event.archivalDetails.archiveRemarks}"</Text>
                                    </>
                                  )}
                                </SimpleGrid>
                              </Box>
                            )}

                            {/* Release Details */}
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

                            {/* NEW: show details for Unreleased action (remarks live in forwardDetails.forwardRemarks) */}
                            {event?.action === "Unreleased" && event?.forwardDetails && (
                              <Box mt={2} p={3} bg="yellow.50" borderRadius="md" borderLeftWidth="3px" borderLeftColor="yellow.500">
                                <Text fontSize="sm" fontWeight="bold">
                                  {`Forwarded to: ${event.forwardDetails.first_name || ''} ${event.forwardDetails.last_name || ''} (${roleLabel(event.forwardDetails.office_position, event.forwardDetails.role)})`}
                                </Text>
                                {event.forwardDetails.forwardRemarks && (
                                  <Text fontSize="sm" mt={1}>
                                    Unrelease Remarks: "{event.forwardDetails.forwardRemarks}"
                                  </Text>
                                )}
                              </Box>
                            )}

                            {/* NEW: show Disposed details if available */}
                            {event?.action === "Disposed" && event?.disposalDetails && (
                              <Box mt={2} p={3} bg="red.50" borderRadius="md" borderLeftWidth="3px" borderLeftColor="red.500">
                                <SimpleGrid columns={2} spacing={2} fontSize="sm">
                                  {event.disposalDetails.method && (
                                    <>
                                      <Text fontWeight="bold">Method:</Text>
                                      <Text>{event.disposalDetails.method}</Text>
                                    </>
                                  )}
                                  {event.disposalDetails.disposalRemarks && (
                                    <>
                                      <Text fontWeight="bold">Remarks:</Text>
                                      <Text>"{event.disposalDetails.disposalRemarks}"</Text>
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
              {(isProduceDocumentPage || isIncomingDashboardPage) && (
                <Box mt={4} p={4} bg="blue.50" borderRadius="md">
                    <Heading size="sm" mb={2}>Current Document Handler:</Heading>
                    <Text>
                    {(() => {
                        if (data.currentHandler && data.currentHandler?.first_name && data.currentHandler?.last_name) {
                            return `${data.currentHandler.first_name} ${data.currentHandler.last_name} (${roleLabel(data.currentHandler.office_position, data.currentHandler.role)})`;
                        }
                        return <i>No current handler, document may have been released or archived.</i>;
                    })()}
                    </Text>
                </Box>
              )}


            </VStack>
          )}
        </ModalBody>

        <ModalFooter bg="gray.50" borderTopWidth="1px" borderColor="gray.200" py={4}>
          <Button
            variant="outline"
            onClick={() => {
              onClose();
              setForwardData({ forwardAccountId: '', forwardRemarks: '' });
              setReleaseData({ recipientOffice: '', recipientPerson: '', modeOfRelease: '', releaseRemarks: '', isCustomDoc: '' });
              setArchiveData({ medium: '', location: '', archiveRemarks: '', isCustomDoc: '', customDisposalMethod: '', customRetentionPeriod: '' });
              setUnarchiveData({ forwardToSelf: true, forwardAccountId: '', unarchiveRemarks: '' });
              setUnreleaseData({ forwardToSelf: true, forwardAccountId: '', unreleaseRemarks: '' });
              setRerouteData({ rerouteToSelf: true, rerouteAccountId: '', rerouteRemarks: '' });
              setDisposeData({ disposalRemarks: '' });
              setIsUnderstood(false);
            }}
            size="md"
            _hover={{ bg: "gray.100" }}
          >
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DocumentLifeCycleModal;
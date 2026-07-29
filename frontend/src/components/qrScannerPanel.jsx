import React, { useEffect, useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { Box, VStack, Text, Button, FormControl, FormLabel, Select, Spinner, useToast } from '@chakra-ui/react';
import { HiMiniViewfinderCircle } from 'react-icons/hi2';
import { MdCancel } from 'react-icons/md';

import { useAdminDashboard } from '../doc-track/store/adminDashboard.store.js';

const QrScannerPanel = ({
  scanResults,
  onOpen,
  scanNow,
  onCloseQR,
  handleReceive,

  searchQuery,
  isPendingPage,
  isIncomingPage,
  isOutgoingPage,

  isIncomingDashboardPage,
  isOutgoingDashboardPage,
  
  isStaffsPage
}) => {
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanNowQ, setScanNowQ] = useState(scanNow);
  const toast = useToast();

  const { isGettingDocumentStatus, documentStatus } = useAdminDashboard();

  const handleStartScanning = async () => {
      setScanning(true);
      try {
        const availableDevices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = availableDevices.filter(d => d.kind === 'videoinput');
        setDevices(videoDevices);
        if (videoDevices.length > 0) {
          // Prefer the back camera if available, otherwise use the first one
          const rearCamera = videoDevices.find(device => device.label.toLowerCase().includes('back'));
          setSelectedDeviceId(rearCamera ? rearCamera.deviceId : videoDevices[0].deviceId);
        }
      } catch (err) {
        toast({
          title: "Camera Error",
          description: "Could not access camera devices. Please check permissions.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };

  const handleScan = async (results) => {
    const qrData = JSON.parse(results?.[0]?.rawValue);

    try {
        const response = await documentStatus(qrData);
        scanResults(response.data);
        if (isIncomingPage) {
          null
        } else if (isPendingPage) {
          null
        } else if (isOutgoingPage) {
          null
        } else if (isIncomingDashboardPage) {
          null
        } else if (isOutgoingDashboardPage) {
          null
        } else if (isStaffsPage) {
          null
        } else {
          toast({
            title: "Success",
            description: response.message,
            status: "success",
            duration: 5000,
            isClosable: true,
          });
        }
        
        onOpen?.();
        onCloseQR?.();
        handleReceive?.(response.data);
        searchQuery?.(response.data.refNumber);
      } catch (error) {
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to retrieve document status.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
  };

  return (
        <VStack spacing={5} align="stretch">

            {!scanning && !scanNowQ ? (
              <VStack spacing={4} align="center">
                <Text>Scan a document QR code to quickly view its details and status. Your browser may ask for permission to use the camera.</Text>
                <Button
                  colorScheme="orange"
                  leftIcon={<HiMiniViewfinderCircle />}
                  onClick={handleStartScanning}
                  size="md"
                  width="100%"
                >
                  Start Camera Scanner
                </Button>
              </VStack>
            ) : isGettingDocumentStatus ? (
              <VStack spacing={4} align="center">
                <Spinner size="xl" color="blue.500" thickness="4px" speed="0.65s" />
                <Text color="gray.600">Retrieving document information...</Text>
              </VStack>
            ) : (scanning && !!scanResults) || (scanNowQ && !!scanResults) ? (
              <VStack spacing={4}>
                <Text>Point your camera at a QR code to scan. Ensure the code is well-lit and clearly visible.</Text>

                {devices.length > 1 && (
                  <FormControl>
                    <FormLabel fontSize="sm">Change Camera</FormLabel>
                    <Select 
                      size="sm"
                      value={selectedDeviceId}
                      onChange={(e) => setSelectedDeviceId(e.target.value)}
                    >
                      {devices.map(device => (
                        <option key={device.deviceId} value={device.deviceId}>
                          {device.label || `Camera ${devices.indexOf(device) + 1}`}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                )}

                <Box 
                  borderWidth="1px" 
                  borderColor="gray.300" 
                  borderRadius="md" 
                  overflow="hidden"
                  width="100%"
                >
                  <Scanner
                    onScan={handleScan}
                    style={{ width: '100%' }}
                    constraints={{
                      audio: false,
                      video: { facingMode: "environment" },
                      deviceId: selectedDeviceId ? {exact: selectedDeviceId} : undefined
                    }}
                    isDisabled={true}
                  />
                </Box>
                <Button 
                  onClick={() => {
                    setScanning(false); 
                    setScanNowQ(false); 
                    onCloseQR();
                  }} 
                  leftIcon={<MdCancel />}
                  colorScheme="red"
                  size="md"
                  width="100%"
                >
                  Cancel Scanning
                </Button>
              </VStack>
            ) : null}

        </VStack>
  );
};

export default QrScannerPanel;
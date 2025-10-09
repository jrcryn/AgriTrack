 import { useEffect, useState, useCallback } from "react";
import { Alert, AlertIcon, Box, Slide, Text } from "@chakra-ui/react";

const NetworkStatusAlert = () => {
  const [isDeviceOnline, setIsDeviceOnline] = useState(navigator.onLine);
  const [hasInternet, setHasInternet] = useState(true);
  const [show, setShow] = useState(false);

  // Compute overall status
  const isActuallyOnline = isDeviceOnline && hasInternet;

  // Helper: Fetch with a timeout
  const fetchWithTimeout = (url, options = {}, timeout = 10000) =>
    Promise.race([
      fetch(url, options),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), timeout)
      ),
    ]);

  // Check actual internet connectivity by fetching a lightweight, reliable endpoint.
  const checkInternetConnectivity = useCallback(async () => {
    try {
      // Using Google's 204 endpoint is a common practice for connectivity checks.
      // It's fast and returns no content.
      // We use 'no-cors' mode as we don't need to read the response, just see if the request succeeds.
      await fetchWithTimeout(
        "https://www.google.com/generate_204?cachebuster=" + Date.now(),
        { method: "HEAD", mode: "no-cors", cache: "no-cache" }
      );
      // If the fetch promise resolves, it means we have a connection.
      setHasInternet(true);
      return true;
    } catch (error) {
      // The promise rejects on network errors or timeout.
      setHasInternet(false);
      return false;
    }
  }, []);

  useEffect(() => {
    const updateStatus = async () => {
      if (navigator.onLine) {
        setIsDeviceOnline(true);
        const internet = await checkInternetConnectivity();
        setHasInternet(internet);
      } else {
        setIsDeviceOnline(false);
        setHasInternet(false);
      }
    };

    // Run an initial status update
    updateStatus();

    const handleOnline = () => {
      updateStatus();
    };

    const handleOffline = () => {
      setIsDeviceOnline(false);
      setHasInternet(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Regularly check internet connectivity when online
    const intervalId = setInterval(() => {
      if (navigator.onLine) {
        checkInternetConnectivity();
      }
    }, 30000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(intervalId);
    };
  }, [checkInternetConnectivity]);

  // Watch overall connection status.
  // Auto-hide the alert after 3 seconds if fully online.
  useEffect(() => {
    if (isActuallyOnline) {
      const timer = setTimeout(() => setShow(false), 3000);
      return () => clearTimeout(timer);
    } else {
      setShow(true);
    }
  }, [isActuallyOnline]);

  return (
    <Slide direction="bottom" in={show} style={{ zIndex: 9999 }}>
      <Alert
        status={isActuallyOnline ? "success" : "error"}
        variant="solid"
        justifyContent="center"
        shadow="lg"
        py={3}
      >
        <Box display="flex" alignItems="center">
          <AlertIcon boxSize="24px" />
          <Text fontWeight="medium">
            {isActuallyOnline
              ? "You are back online! Changes will be saved."
              : isDeviceOnline
              ? "Connected to network, but no internet. Changes may not be saved until connection is restored."
              : "You are offline. Changes may not be saved until connection is restored."}
          </Text>
        </Box>
      </Alert>
    </Slide>
  );
};

export default NetworkStatusAlert;

import { useEffect, useState, useCallback } from "react";
import { Alert, AlertIcon, Box, Slide, Text } from "@chakra-ui/react";

const NetworkStatusAlert = () => {
  const [isDeviceOnline, setIsDeviceOnline] = useState(navigator.onLine);
  const [hasInternet, setHasInternet] = useState(true);
  const [show, setShow] = useState(false);

  // Compute overall status
  const isActuallyOnline = isDeviceOnline && hasInternet;

  // Helper: Fetch with a timeout
  const fetchWithTimeout = (url, options = {}, timeout = 5000) =>
    Promise.race([
      fetch(url, options),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), timeout)
      ),
    ]);

  // Check actual internet connectivity via a reliable CORS-enabled endpoint (pwede pamalit cloudfare pag dumating yung oras na hindi na gumagana, pero kasi mas reliable at gumana agad to).
  const checkInternetConnectivity = useCallback(async () => {
    try {
      const response = await fetchWithTimeout(
        "https://httpstat.us/200?cachebuster=" + Date.now(),
        { cache: "no-cache" },
        5000
      );
      if (response && response.ok) {
        setHasInternet(true);
        return true;
      } else {
        setHasInternet(false);
        return false;
      }
    } catch (error) {
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

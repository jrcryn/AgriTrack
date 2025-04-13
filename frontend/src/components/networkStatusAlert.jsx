import { useEffect, useState } from "react";
import { Alert, AlertIcon, Box, Slide } from "@chakra-ui/react";

const NetworkStatusAlert = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [show, setShow] = useState(!navigator.onLine); // Show immediately if offline

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Show "back online" message briefly before hiding
      setShow(true);
      setTimeout(() => setShow(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShow(true); // Show and keep showing while offline
    };

    // Check initial status
    if (!navigator.onLine) {
      setShow(true);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <Slide direction="bottom" in={show} style={{ zIndex: 9999 }}>
      <Alert
        status={isOnline ? "success" : "error"}
        variant="solid"
        justifyContent="center"
        shadow="lg"
        mb={0}
        py={3}
      >
        <Box display="flex" alignItems="center">
          <AlertIcon boxSize="24px" />
          {isOnline 
            ? "You are back online! Changes will be saved."
            : "You are offline. Changes may not be saved until connection is restored."}
        </Box>
      </Alert>
    </Slide>
  );
};

export default NetworkStatusAlert;
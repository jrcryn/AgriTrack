import { Box, Heading, Text, Button, VStack, Icon, Stack, HStack, Divider } from "@chakra-ui/react";
import { WarningIcon, InfoIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";

const FormClosedPage = () => {
  const navigate = useNavigate();

  const cardBg = "white";
  const accentColor = "blue.600";
  const headerBorder = "gray.200";

  return (
    <Box minH="100vh" py={10} px={4}>
      <VStack spacing={8} maxW="800px" mx="auto" w="full">
        {/* Main Card */}
        <Box bg={cardBg} borderRadius="xl" shadow="xl" w="full" overflow="hidden">
          {/* Header */}
          <Box p={6} borderBottomWidth="2px" borderColor={headerBorder} align="center">
            <Heading size="lg" color={accentColor} fontWeight="semibold" letterSpacing="tight" mb={3}>
              Free Tractor Services (Ticket Request) Form
            </Heading>
            <Text fontSize="sm" color="gray.500" fontWeight="medium" mb={-2}>
              FORM STATUS NOTICE
            </Text>
          </Box>

          {/* Content */}
          <Box p={8}>
            <VStack spacing={6} align="stretch">
              {/* Notice */}
              <Box bg="yellow.50" borderRadius="md" p={4} borderLeftWidth="4px" borderColor="yellow.400" mb={6}>
                <HStack spacing={3} align="start">
                  <Icon as={WarningIcon} color="yellow.500" boxSize={5} mt={1} />
                  <Box>
                    <Heading size="md" color="gray.800" mb={3}>
                      KASALUKUYANG HINDI TUMATANGGAP NG SAGOT.
                    </Heading>
                    <Text fontSize="sm" color="gray.700">
                      Pahintulot, ngunit ang form na ito ay kasalukuyang sarado at hindi tumatanggap ng mga bagong sagot.
                      Mangyaring bumalik muli o makipag-ugnayan sa staffs o operators para sa karagdagang impormasyon.
                    </Text>
                  </Box>
                </HStack>
              </Box>

              {/* Actions */}
              <Stack direction={{ base: "column", md: "row" }} spacing={4} justify="flex-end" pt={2}>
                <Button variant='ghost' colorScheme="blue" onClick={() => navigate("/")} px={8} borderRadius="md">
                  Back
                </Button>
                <Button bg={accentColor} color="white" _hover={{ bg: "blue.700" }} onClick={() => { navigate("/hvc/form/istcns"); window.location.reload(); }} px={8} borderRadius="md">
                  Retry
                </Button>
              </Stack>
            </VStack>
          </Box>
        </Box>
      </VStack>
    </Box>
  );
}

export default FormClosedPage;
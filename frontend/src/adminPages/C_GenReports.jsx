import React from 'react'
import { Box, Container, Heading, Text, VStack, Button } from "@chakra-ui/react";

const C_GenReports = () => {
  return (
    <Container maxW="container.md" py={10}>
      <VStack spacing={5} align="stretch">
        <Heading size="xl" textAlign="center">Mock Chakra UI Testing Page</Heading>
        <Text textAlign="center" color="gray.500">
        Not a real page. For debugging purposes lang, and ginawa for testing scrollable content and responsiveness.
        </Text>
        <Box
          maxH="500px"
          overflowY="auto"
          p={4}
          borderWidth={1}
          borderRadius="md"
          boxShadow="md"
        >
          {Array(50)
            .fill("")
            .map((_, i) => (
              <Text key={i} my={2}>
                This is a sample content line {i + 1}.
              </Text>
            ))}
        </Box>
        <Button colorScheme="teal" size="lg" alignSelf="center">
          Test Button
        </Button>
      </VStack>
    </Container>
  )
}

export default C_GenReports
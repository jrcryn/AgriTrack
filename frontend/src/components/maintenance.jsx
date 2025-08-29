import React from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  VStack,
  Spinner,
  Image,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { SettingsIcon, TimeIcon } from '@chakra-ui/icons';
import calambaLogo from '../images/Calamba_Seal.png';

const Maintenance = () => {
  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const boxBgColor = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const headingColor = useColorModeValue('gray.700', 'whiteAlpha.900');

  return (
    <Flex
      align="center"
      justify="center"
      minH="100vh"
      bg={bgColor}
      p={4}
    >
      <Box
        p={{ base: 6, md: 10 }}
        borderWidth={1}
        borderRadius="lg"
        boxShadow="xl"
        bg={boxBgColor}
        textAlign="center"
        maxW="lg"
        w="full"
      >
        <VStack spacing={6}>
          <Image 
            src={calambaLogo} 
            alt="Calamba City Seal" 
            boxSize={{ base: '80px', md: '100px' }} 
          />
          <Heading as="h2" size="md" color={headingColor} mt={-4}>
            AgriTrack
          </Heading>

          <Heading as="h1" size="xl" color={headingColor} mt={-2}>
            System Maintenance
          </Heading>
          
          
          <Text fontSize="lg" color={textColor}>
            We're currently performing updates to the system. The application will be back online at some point.
          </Text>
          
          <VStack spacing={3} align="center">
            <Flex align="center">
              <Icon as={SettingsIcon} w={5} h={5} mr={2} color="green.500" />
              <Text color={textColor}>We are working hard to complete the updates.</Text>
            </Flex>
            <Flex align="center">
              <Icon as={TimeIcon} w={5} h={5} mr={2} color="green.500" />
              <Text color={textColor}>Estimated downtime: <strong>---</strong></Text>
            </Flex>
          </VStack>
          
          <Text color="gray.500" fontSize="sm" pt={4}>
            Thank you for your patience.
          </Text>
        </VStack>
      </Box>
    </Flex>
  );
};

export default Maintenance;
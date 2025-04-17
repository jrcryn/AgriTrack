import React, { useState } from 'react';
import {
  Box,
  Heading,
  Text,
  Flex,
  Input,
  Select,
  Icon,
  SimpleGrid,
  FormControl,
  FormLabel,
  InputGroup,
  InputRightElement,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  TagLabel,
  Tag,
  HStack,
  TableContainer,
  Spinner,
  Alert,
  AlertIcon,
  Tooltip
} from "@chakra-ui/react";
import { FaSearch, FaMapMarkerAlt, FaPlus, FaExchangeAlt, FaTractor } from "react-icons/fa";
import { useAdminDashboard } from "../store/adminDashboard.store";
import Barangays from "../../components/barangays.js";

const MachineryInventory = () => {
  // State for filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBarangay, setSelectedBarangay] = useState('');
  
  // Get data from store
  const { 
    machineryUnits,
    isLoading,
    error
  } = useAdminDashboard();

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Filter machinery units based on search query
  const filteredMachineryUnits = machineryUnits.filter(unit => {
    return unit.unit_name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Calculate totals for a unit
  const calculateTotals = (unit) => {
    return unit.barangay_allocations.reduce(
      (totals, allocation) => {
        return {
          functional: totals.functional + (allocation.functional_units || 0),
          nonFunctional: totals.nonFunctional + (allocation.non_functional_units || 0),
          total: totals.total + (allocation.total_units || 0)
        };
      },
      { functional: 0, nonFunctional: 0, total: 0 }
    );
  };


  // Render label with line breaks for multi-word strings
  const renderLabel = (label) => {
    const words = label.split(" ");
    return (
      <>
        {words.map((word, idx) => (
          <Text key={idx} as="span" display="block">
            {word}
          </Text>
        ))}
      </>
    );
  };

  //column widths for machineru, units, functional, non-functional
  const getColumnWidth = (type) => {
    switch(type) {
      case "machinery": return "150px";
      case "units": return "50px";
      case "functional": return "80px";
      case "nonFunctional": return "100px";
      case "barangay": return "100px";
      default: return "100px";
    }
  };

  return (
    <Box 
      overflow="hidden" 
      p={5} 
      minH="100vh"
    >
      {/* Header */}
      <Heading as="h1" size="xl" mb={2} color="black">
        Machinery Inventory
      </Heading>
      <Text color="gray.600" mb={5} >
        View and manage all agricultural machinery units available in Calamba City. Click the MACHINE NAME to view remarks.
      </Text>
      
      {/* Filter Box */}
      <Box
        mb={6}
        p={4}
        bgColor="blue.50"
        borderRadius="lg"
      >
        {/* All controls in a single row */}
        <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={4} alignItems="flex-end">
          {/* Search Bar */}
          <FormControl>
            <FormLabel fontSize="sm" fontWeight="medium" display="flex" alignItems="center" gap={2} mb={2}>
              <Icon as={FaSearch} color="blue.500" /> Search
            </FormLabel>
            <InputGroup size="md">
              <Input 
                placeholder="Search by machine name..." 
                value={searchQuery}
                onChange={handleSearchChange}
                bg="white"
                _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px blue.400" }}
              />
              <InputRightElement pointerEvents="none">
                <Icon as={FaSearch} color="gray.400" />
              </InputRightElement>
            </InputGroup>
          </FormControl>

          {/* Barangay Filter */}
          <FormControl>
            <FormLabel fontSize="sm" fontWeight="medium" display="flex" alignItems="center" gap={2} mb={2}> 
              <Icon as={FaMapMarkerAlt} color="blue.500" /> Barangay
            </FormLabel>
            <Select
              placeholder="All Barangays"
              value={selectedBarangay}
              onChange={(e) => setSelectedBarangay(e.target.value)}
              bg="white"
              size="md"
            >
              {Barangays.map((barangay) => (
                <option key={barangay} value={barangay}>
                  {barangay}
                </option>
              ))}
            </Select>
          </FormControl>

          {/* New Machinery Button */}
          <Button 
            leftIcon={<Icon as={FaPlus} />} 
            colorScheme="blue" 
            size="md" 
            h="40px"
            mt={{ base: 0, md: "auto" }}
          >
            New Machinery
          </Button>

          {/* Transfer Units Button */}
          <Button 
            leftIcon={<Icon as={FaExchangeAlt} />} 
            colorScheme="green" 
            size="md"
            h="40px"
            mt={{ base: 0, md: "auto" }}
          >
            Transfer Units
          </Button>
        </SimpleGrid>
      </Box>
      
      <Box mb={8}>
        <Flex
          justify="space-between" 
          align="center" 
          mb={4}
          bg="blue.50"
          p={3}
          borderRadius="md"
          borderLeftWidth="4px"
          borderLeftColor="blue.500"
        >
          <Heading as="h2" size="md" display="flex" alignItems="center">
            <Icon as={FaTractor}  mr={2} color="blue.600" /> FARM MACHINERIES
          </Heading>
        </Flex>

        {/*Machineries Table*/}
        {isLoading ? (
              <Flex justifyContent="center" alignItems="center" minH="200px">
                <Spinner size="lg" color="blue.500" thickness="3px" />
                <Text ml={5}>Loading machineries...</Text>
              </Flex>
        ) : (
          <Box overflowX="auto" border="1px solid" borderColor="gray.200">
            <TableContainer>
              <Table variant="simple" size="xs" tableLayout="fixed" w="auto">

                {/* Table Header */}
              <Thead borderBottom="2px solid" borderColor="gray.300">
                <Tr>
                  <Th 
                    px={2} py={1} 
                    fontSize="2xs" 
                    textTransform="uppercase" 
                    borderRight="1px solid" 
                    borderColor="green.300" 
                    textAlign={"center"} 
                    bg={"green.100"}
                    width={getColumnWidth("machinery")}
                    maxW={getColumnWidth("machinery")}
                  >
                    Machinery
                  </Th>
                  <Th 
                    px={2} py={1} 
                    fontSize="2xs" 
                    textTransform="uppercase" 
                    borderRight="1px solid" 
                    borderColor="green.300" 
                    textAlign={"center"} 
                    bg={"green.100"}
                    width={getColumnWidth("units")}
                    maxW={getColumnWidth("units")}
                  >
                    Units
                  </Th>
                  <Th 
                    px={2} py={1} 
                    fontSize="2xs" 
                    textTransform="uppercase" 
                    borderRight="1px solid" 
                    borderColor="green.300" 
                    textAlign={"center"} 
                    bg={"green.100"}
                    width={getColumnWidth("functional")}
                    maxW={getColumnWidth("functional")}
                  >
                    Functional
                  </Th>
                  <Th 
                    px={2} py={1} 
                    fontSize="2xs" 
                    textTransform="uppercase" 
                    borderRight="1px solid" 
                    borderColor="green.300" 
                    textAlign={"center"} 
                    bg={"green.100"}
                    width={getColumnWidth("nonFunctional")}
                    maxW={getColumnWidth("nonFunctional")}
                  >
                    <Text>Non-</Text>
                    <Text>Functional</Text>
                  </Th>
                  {selectedBarangay ? (
                    // Only show the selected barangay column
                    <Th
                      key={selectedBarangay}
                      px={2}
                      py={1}
                      bg={"orange.100"}
                      fontSize="2xs"
                      textTransform="uppercase"
                      borderRight="1px solid"
                      borderColor="orange.300"
                      width={getColumnWidth("barangay")}
                      maxW={getColumnWidth("barangay")}
                      textAlign="center"
                      whiteSpace="normal"
                    >
                      <Tooltip label={selectedBarangay} placement="top">
                        <Box>
                          {renderLabel(selectedBarangay)}
                        </Box>
                      </Tooltip>
                    </Th>
                  ) : (

                    // Table Header ng Barangays (dynamic)
                    Barangays.map((barangay) => (
                      <Th
                        key={barangay}
                        px={2}
                        py={1}
                        bg={"orange.100"}
                        fontSize="2xs"
                        textTransform="uppercase"
                        borderRight="1px solid"
                        borderColor="orange.300"
                        width={getColumnWidth("barangay")}
                        maxW={getColumnWidth("barangay")}
                        textAlign="center"
                        whiteSpace="normal"
                      >
                        <Tooltip label={barangay} placement="top">
                          <Box>
                            {renderLabel(barangay)}
                          </Box>
                        </Tooltip>
                      </Th>
                    ))
                  )}
                </Tr>
              </Thead>

              {/* Table Body */}
                <Tbody>
                  {filteredMachineryUnits.length === 0 ? (
                    <Tr>
                      <Td colSpan={4 + (selectedBarangay ? 1 : Barangays.length)} textAlign="center" py={4}>
                        No machinery units found
                      </Td>
                    </Tr>
                  ) : (
                    filteredMachineryUnits.map((unit) => {
                      // Calculate totals for the unit
                      const totals = calculateTotals(unit);
                      
                      return (
                        <Tr key={unit._id}>
                          {/* Machinery name */}
                          <Td borderRight="1px solid" borderColor="gray.300" fontSize="xs" px={2} py={1} fontWeight={"medium"}>
                            {unit.unit_name}
                          </Td>
                          
                          {/* Total Units */}
                          <Td borderRight="1px solid" borderColor="gray.300" fontSize="xs" px={2} py={1} fontWeight={"medium"} textAlign={"center"}>
                            {totals.total}
                          </Td>
                          
                          {/* Functional Units */}
                          <Td borderRight="1px solid" borderColor="gray.300" fontSize="xs" px={2} py={1} fontWeight={"medium"} textAlign="center">
                            <Tag size="sm" variant="subtle" colorScheme="green">
                              <TagLabel>{totals.functional}</TagLabel>
                            </Tag>
                          </Td>
                          
                          {/* Non-Functional Units */}
                          <Td borderRight="1px solid" borderColor="gray.300" fontSize="xs" px={2} py={1} fontWeight={"medium"} textAlign="center">
                            <Tag size="sm" variant="subtle" colorScheme="red">
                              <TagLabel>{totals.nonFunctional}</TagLabel>
                            </Tag>
                          </Td>
                          
                          {/* Barangay Allocations */}
                          {selectedBarangay ? (
                            (() => {
                              // Find allocation for selected barangay
                              const allocation = unit.barangay_allocations.find(
                                (alloc) => alloc.barangay === selectedBarangay
                              );
                              
                              // If no allocation found, return empty cell
                              if (!allocation) {
                                return (
                                  <Td 
                                    key={selectedBarangay} 
                                    borderRight="1px solid" 
                                    borderColor="gray.300"
                                    textAlign="center"
                                    px={2}
                                    py={1}
                                  >
                                    -
                                  </Td>
                                );
                              }
                              
                              // If both functional and non-functional units are 0, show dash
                              const functionalUnits = allocation.functional_units || 0;
                              const nonFunctionalUnits = allocation.non_functional_units || 0;
                              
                              if (functionalUnits === 0 && nonFunctionalUnits === 0) {
                                return (
                                  <Td 
                                    key={selectedBarangay} 
                                    borderRight="1px solid" 
                                    borderColor="gray.300"
                                    textAlign="center"
                                    px={2}
                                    py={1}
                                  >
                                    -
                                  </Td>
                                );
                              }
                              
                              // Show allocation details if there are units
                              return (
                                <Td 
                                  key={selectedBarangay} 
                                  borderRight="1px solid" 
                                  borderColor="gray.300"
                                  textAlign="center"
                                  px={1}
                                  py={1}
                                  fontSize="sm"
                                >
                                  <HStack spacing={1} justify="center">
                                    <Tag size="sm" variant="subtle" colorScheme="green">
                                      <TagLabel>{functionalUnits}</TagLabel>
                                    </Tag>
                                    <Text>/</Text>
                                    <Tag size="sm" variant="subtle" colorScheme="red">
                                      <TagLabel>{nonFunctionalUnits}</TagLabel>
                                    </Tag>
                                  </HStack>
                                </Td>
                              );
                            })()
                          ) : (
                            // When no filter is selected, show all barangay columns
                            Barangays.map((barangay) => {
                              // Find allocation for this barangay
                              const allocation = unit.barangay_allocations.find(
                                (alloc) => alloc.barangay === barangay
                              );
                              
                              // If no allocation found, return empty cell
                              if (!allocation) {
                                return (
                                  <Td 
                                    key={barangay} 
                                    borderRight="1px solid" 
                                    borderColor="gray.300"
                                    textAlign="center"
                                    px={2}
                                    py={1}
                                  >
                                    -
                                  </Td>
                                );
                              }
                              
                              // If both functional and non-functional units are 0, show dash
                              const functionalUnits = allocation.functional_units || 0;
                              const nonFunctionalUnits = allocation.non_functional_units || 0;
                              
                              if (functionalUnits === 0 && nonFunctionalUnits === 0) {
                                return (
                                  <Td 
                                    key={barangay} 
                                    borderRight="1px solid" 
                                    borderColor="gray.300"
                                    textAlign="center"
                                    px={2}
                                    py={1}
                                  >
                                    -
                                  </Td>
                                );
                              }
                              
                              // Show allocation details if there are units
                              return (
                                <Td 
                                  key={barangay} 
                                  borderRight="1px solid" 
                                  borderColor="gray.300"
                                  textAlign="center"
                                  px={1}
                                  py={1}
                                  fontSize="xs"
                                >
                                  <HStack spacing={1} justify="center">
                                    <Tag size="sm" variant="subtle" colorScheme="green">
                                      <TagLabel>{functionalUnits}</TagLabel>
                                    </Tag>
                                    <Text>/</Text>
                                    <Tag size="sm" variant="subtle" colorScheme="red">
                                      <TagLabel>{nonFunctionalUnits}</TagLabel>
                                    </Tag>
                                  </HStack>
                                </Td>
                              );
                            })
                          )}
                        </Tr>
                      );
                    })
                  )}
                </Tbody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default MachineryInventory;
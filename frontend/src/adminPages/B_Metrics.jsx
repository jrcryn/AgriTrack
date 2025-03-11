import React, { useState } from 'react';
import { 
  Box, 
  Heading, 
  Text, 
  HStack, 
  Flex, 
  Stat, 
  StatLabel, 
  StatNumber, 
  Button,
  Divider,
  Icon,
  useColorModeValue,
  Select,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Badge
} from '@chakra-ui/react';
import { FiUsers, FiMapPin, FiTruck, FiArrowRight, FiFilter, FiCalendar } from 'react-icons/fi';
import { GiPlantSeed } from "react-icons/gi"; 


const MetricCard = ({ title, value, icon, accentColor }) => {
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  return (
    <Box 
      bg={bgColor}
      p={5}
      borderRadius="lg"
      boxShadow="md"
      borderWidth="1px"
      borderColor={borderColor}
      flexGrow={1}
      position="relative"
      overflow="hidden"
    >
      <Box 
        position="absolute" 
        top={0} 
        left={0} 
        h="4px" 
        w="100%" 
        bg={accentColor} 
      />
      
      <HStack spacing={4} align="center">
        <Icon as={icon} boxSize={10} color={accentColor} />
        <Stat>
          <StatLabel fontSize="sm" color="gray.500">{title}</StatLabel>
          <StatNumber fontSize="2xl" fontWeight="bold">{value}</StatNumber>
        </Stat>
      </HStack>
    </Box>
  );
};

const SectionHeader = ({ title, accentColor }) => {
  return (
    <Flex align="center" mb={4}>
      <Box w="4px" h="24px" bg={accentColor} mr={3} borderRadius="sm" />
      <Heading size="md" fontWeight="semibold" letterSpacing="tight">
        {title}
      </Heading>
    </Flex>
  );
};

const FilterControls = ({ onFilterChange }) => {
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [period, setPeriod] = useState('all');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const bgColor = useColorModeValue('gray.50', 'gray.800');

  const handleFilter = () => {
    onFilterChange({ year, period });
  };

  return (
    <Box 
      mb={6} 
      p={4} 
      borderWidth="1px" 
      borderColor={borderColor} 
      borderRadius="md" 
      bg={bgColor}
    >
      <Flex 
        direction={{ base: "column", md: "row" }} 
        align={{ base: "stretch", md: "flex-end" }}
        justify="space-between"
        wrap="wrap"
        gap={4}
      >
        <Box>
          <Flex align="center" mb={2}>
            <Icon as={FiFilter} mr={2} color="blue.600" />
            <Text fontWeight="medium" color="gray.700">Data Filters</Text>
          </Flex>
          <Badge colorScheme="blue" variant="subtle" mb={2}>
            Current view: {period === 'all' ? 'All periods' : period} {year}
          </Badge>
        </Box>
        
        <Grid 
          templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }}
          gap={4}
          width={{ base: "100%", md: "auto" }}
        >
          <GridItem>
            <FormControl size="sm">
              <FormLabel fontSize="xs" fontWeight="medium" mb={1}>Year</FormLabel>
              <Select 
                size="sm" 
                value={year} 
                onChange={(e) => setYear(e.target.value)}
              >
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
              </Select>
            </FormControl>
          </GridItem>
          
          <GridItem>
            <FormControl size="sm">
              <FormLabel fontSize="xs" fontWeight="medium" mb={1}>Period</FormLabel>
              <Select 
                size="sm" 
                value={period} 
                onChange={(e) => setPeriod(e.target.value)}
              >
                <option value="all">All Periods</option>
                <option value="Q1">Q1 (Jan-Mar)</option>
                <option value="Q2">Q2 (Apr-Jun)</option>
                <option value="Q3">Q3 (Jul-Sep)</option>
                <option value="Q4">Q4 (Oct-Dec)</option>
              </Select>
            </FormControl>
          </GridItem>
          
          <GridItem display="flex" alignItems="flex-end">
            <Button 
              leftIcon={<FiCalendar />}
              colorScheme="blue" 
              size="sm"
              onClick={handleFilter}
              width="100%"
            >
              Apply Filter
            </Button>
          </GridItem>
        </Grid>
      </Flex>
    </Box>
  );
};

const MetricsSection = ({ title, metrics, accentColor }) => {
  return (
    <Box mb={10}>
      <Flex justify="space-between" align="center" mb={5}>
        <SectionHeader title={title} accentColor={accentColor} />
        <Button 
          rightIcon={<FiArrowRight />} 
          variant="outline" 
          size="sm"
          colorScheme="blue"
        >
          SEE MORE
        </Button>
      </Flex>
      
      <HStack spacing={5} wrap={["wrap", "wrap", "nowrap"]}>
        {metrics.map((metric, index) => (
          <MetricCard 
            key={index}
            title={metric.title}
            value={metric.value}
            icon={metric.icon}
            accentColor={accentColor}
          />
        ))}
      </HStack>
    </Box>
  );
};

const Metrics = () => {
  const [activeFilter, setActiveFilter] = useState({ 
    year: new Date().getFullYear().toString(), 
    period: 'all' 
  });
  
  const handleFilterChange = (filters) => {
    setActiveFilter(filters);
    // In a real app, you would fetch filtered data here
    console.log('Filters applied:', filters);
  };
  
  // Sample data - would be replaced with actual data from API/state based on activeFilter
  const newlyPlantedMetrics = [
    { title: "Number of Farmers", value: "124", icon: FiUsers },
    { title: "T. Num of Trees Planted", value: "328.5 ha", icon: GiPlantSeed }
  ];
  
  const harvestingMetrics = [
    { title: "Number of Farmers", value: "87", icon: FiUsers },
    { title: "T. Area Harv.", value: "205.2 ha", icon: FiMapPin },
    { title: "T. Volume Prod.", value: "468.3 tons", icon: FiTruck }
  ];

  return (
    <Box p={6} maxW="1200px" mx="auto">
      <Box mb={6}>
        <Heading size="lg" mb={2} color="blue.700">
          High Value Crops Metrics
        </Heading>
        <Text color="gray.600">
          Overview of planting and harvesting activities across the barangays. Go to SEE MORE for farmer response sorting.
        </Text>
        <Divider my={4} />
      </Box>
      
      {/* Filter controls added here */}
      <FilterControls onFilterChange={handleFilterChange} />
      
      <MetricsSection 
        title="NEWLY PLANTED" 
        metrics={newlyPlantedMetrics}
        accentColor="green.500"
      />
      
      <MetricsSection 
        title="HARVESTING" 
        metrics={harvestingMetrics}
        accentColor="blue.500"
      />
    </Box>
  );
};

export default Metrics;
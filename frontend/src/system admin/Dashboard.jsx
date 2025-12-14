import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Flex,
  Icon,
  VStack,
  HStack
} from '@chakra-ui/react';
import { FiUsers, FiShield, FiActivity, FiLock } from 'react-icons/fi';
import { FaArchive, FaUserCheck } from 'react-icons/fa';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalAdmins: 0,
    recentActions: 0,
    lockedAccounts: 0,
    archivedAccounts: 0,
    activeAccounts: 0
  });

  // Mock data for now
  useEffect(() => {
    setStats({
      totalEmployees: 45,
      totalAdmins: 5,
      recentActions: 128,
      lockedAccounts: 3,
      archivedAccounts: 12,
      activeAccounts: 35
    });
  }, []);

  const StatCard = ({ icon, title, value, color, bgColor }) => (
    <Box
      bg="white"
      borderRadius="xl"
      boxShadow="md"
      p={6}
      _hover={{ boxShadow: 'lg' }}
      transition="all 0.2s"
    >
      <Flex justify="space-between" align="center">
        <Box>
          <Text color="gray.500" fontSize="sm" fontWeight="medium">{title}</Text>
          <Text fontSize="3xl" fontWeight="bold" mt={2} color={color}>{value}</Text>
        </Box>
        <Flex
          p={4}
          borderRadius="full"
          bg={bgColor}
        >
          <Icon as={icon} boxSize={7} color={color} />
        </Flex>
      </Flex>
    </Box>
  );

  const recentActivities = [
    { action: 'User registered', user: 'john.doe@agritrack.com', time: '5 minutes ago', type: 'success' },
    { action: 'Password changed', user: 'jane.smith@agritrack.com', time: '15 minutes ago', type: 'info' },
    { action: 'Account locked', user: 'test.user@agritrack.com', time: '1 hour ago', type: 'warning' },
    { action: 'Roles updated', user: 'admin.user@agritrack.com', time: '2 hours ago', type: 'info' },
    { action: 'Account archived', user: 'old.user@agritrack.com', time: '3 hours ago', type: 'error' },
  ];

  return (
    <Box p={8} bg="gray.50" minH="100vh">
      {/* Header */}
      <Box mb={8}>
        <Heading size="xl" color="gray.800">System Admin Dashboard</Heading>
        <Text color="gray.600" mt={2}>Welcome back! Here's what's happening with your system.</Text>
      </Box>

      {/* Stats Grid */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mb={8}>
        <StatCard 
          icon={FiUsers} 
          title="Total Employees" 
          value={stats.totalEmployees} 
          color="blue.500"
          bgColor="blue.100"
        />
        <StatCard 
          icon={FiShield} 
          title="System Admins" 
          value={stats.totalAdmins} 
          color="purple.500"
          bgColor="purple.100"
        />
        <StatCard 
          icon={FiActivity} 
          title="Recent Actions" 
          value={stats.recentActions} 
          color="green.500"
          bgColor="green.100"
        />
        <StatCard 
          icon={FaUserCheck} 
          title="Active Accounts" 
          value={stats.activeAccounts} 
          color="cyan.500"
          bgColor="cyan.100"
        />
        <StatCard 
          icon={FiLock} 
          title="Locked Accounts" 
          value={stats.lockedAccounts} 
          color="orange.500"
          bgColor="orange.100"
        />
        <StatCard 
          icon={FaArchive} 
          title="Archived Accounts" 
          value={stats.archivedAccounts} 
          color="red.500"
          bgColor="red.100"
        />
      </SimpleGrid>

      {/* Recent Activity */}
      <Box bg="white" borderRadius="xl" boxShadow="md" p={6}>
        <Heading size="md" color="gray.800" mb={4}>Recent Activity</Heading>
        <VStack spacing={3} align="stretch">
          {recentActivities.map((activity, index) => (
            <Flex
              key={index}
              align="center"
              justify="space-between"
              p={4}
              bg="gray.50"
              borderRadius="lg"
              _hover={{ bg: 'gray.100' }}
              transition="all 0.2s"
            >
              <HStack spacing={4}>
                <Box
                  w={2}
                  h={2}
                  borderRadius="full"
                  bg={
                    activity.type === 'success' ? 'green.500' :
                    activity.type === 'warning' ? 'orange.500' :
                    activity.type === 'error' ? 'red.500' :
                    'blue.500'
                  }
                />
                <Box>
                  <Text fontWeight="medium" color="gray.800">{activity.action}</Text>
                  <Text fontSize="sm" color="gray.500">{activity.user}</Text>
                </Box>
              </HStack>
              <Text fontSize="sm" color="gray.400">{activity.time}</Text>
            </Flex>
          ))}
        </VStack>
      </Box>
    </Box>
  );
};

export default Dashboard;

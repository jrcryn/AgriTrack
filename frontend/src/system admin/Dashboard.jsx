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

  const StatCard = ({ icon, title, value, color }) => (
    <Box
      bg="white"
      border="1px"
      borderColor="gray.200"
      borderRadius="md"
      p={4}
    >
      <HStack spacing={3}>
        <Icon as={icon} boxSize={5} color={color} />
        <Box flex="1">
          <Text color="gray.600" fontSize="xs">{title}</Text>
          <Text fontSize="2xl" fontWeight="bold" color={color}>{value}</Text>
        </Box>
      </HStack>
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
    <Box p={6} minH="100vh">
      {/* Header */}
      <Box mb={6}>
        <Heading size="lg">System Admin Dashboard</Heading>
        <Text color="gray.600" fontSize="sm" mt={1}>Welcome back! Here's what's happening with your system.</Text>
      </Box>

      {/* Stats Grid */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4} mb={6}>
        <StatCard 
          icon={FiUsers} 
          title="Total Employees" 
          value={stats.totalEmployees} 
          color="blue.500"
        />
        <StatCard 
          icon={FiShield} 
          title="System Admins" 
          value={stats.totalAdmins} 
          color="purple.500"
        />
        <StatCard 
          icon={FiActivity} 
          title="Recent Actions" 
          value={stats.recentActions} 
          color="green.500"
        />
        <StatCard 
          icon={FaUserCheck} 
          title="Active Accounts" 
          value={stats.activeAccounts} 
          color="cyan.500"
        />
        <StatCard 
          icon={FiLock} 
          title="Locked Accounts" 
          value={stats.lockedAccounts} 
          color="orange.500"
        />
        <StatCard 
          icon={FaArchive} 
          title="Archived Accounts" 
          value={stats.archivedAccounts} 
          color="red.500"
        />
      </SimpleGrid>

      {/* Recent Activity */}
      <Box bg="white" border="1px" borderColor="gray.200" borderRadius="md" p={4}>
        <Heading size="sm" mb={3}>Recent Activity</Heading>
        <VStack spacing={2} align="stretch">
          {recentActivities.map((activity, index) => (
            <Flex
              key={index}
              align="center"
              justify="space-between"
              p={2}
              borderBottom="1px"
              borderColor="gray.100"
              _last={{ borderBottom: 'none' }}
            >
              <HStack spacing={3}>
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
                  <Text fontSize="sm" fontWeight="medium">{activity.action}</Text>
                  <Text fontSize="xs" color="gray.500">{activity.user}</Text>
                </Box>
              </HStack>
              <Text fontSize="xs" color="gray.400">{activity.time}</Text>
            </Flex>
          ))}
        </VStack>
      </Box>
    </Box>
  );
};

export default Dashboard;

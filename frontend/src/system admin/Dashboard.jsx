import React, { useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Flex,
  Icon,
  VStack,
  HStack,
  Spinner
} from '@chakra-ui/react';
import { FiUsers, FiShield, FiActivity, FiLock } from 'react-icons/fi';
import { FaArchive, FaUserCheck } from 'react-icons/fa';
import { useSystemAdminStore } from './store/systemAdminDashboard.store';

const Dashboard = () => {
  const {
    dashboardStats,
    dashboardStatsLoading,
    dashboardStatsError,
    fetchDashboardStats,
    actionLogs,
    fetchActionLogs
  } = useSystemAdminStore();

  useEffect(() => {
    fetchDashboardStats();
    // Fetch recent activity logs
    fetchActionLogs({ page: 1, limit: 5 });
  }, [fetchDashboardStats, fetchActionLogs]);

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

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const getUserName = (log) => {
    if (!log.userId) return 'Unknown User';
    const user = log.userId;
    const name = `${user.first_name || ''} ${user.middle_name || ''} ${user.last_name || ''} ${user.suffix || ''}`.trim();
    return name || user.email || 'Unknown User';
  };

  const getActivityType = (status) => {
    return status === 'SUCCESS' ? 'success' : status === 'FAILED' ? 'error' : 'info';
  };

  const recentActivities = (actionLogs || []).slice(0, 5).map(log => ({
    action: log.action.replace(/_/g, ' '),
    user: getUserName(log),
    time: formatTimeAgo(log.createdAt),
    type: getActivityType(log.status)
  }));

  return (
    <Box p={6} minH="100vh">
      {/* Header */}
      <Box mb={6}>
        <Heading size="lg">System Admin Dashboard</Heading>
        <Text color="gray.600" fontSize="sm" mt={1}>Welcome back! Here's what's happening with your system.</Text>
      </Box>

      {/* Stats Grid */}
      {dashboardStatsLoading ? (
        <Flex justify="center" align="center" py={12}>
          <Spinner size="xl" color="blue.500" />
        </Flex>
      ) : dashboardStatsError ? (
        <Box bg="red.50" border="1px" borderColor="red.200" borderRadius="md" p={4} mb={6}>
          <Text color="red.600">{dashboardStatsError}</Text>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4} mb={6}>
          <StatCard 
            icon={FiUsers} 
            title="Total Employees" 
            value={dashboardStats.totalEmployees} 
            color="blue.500"
          />
          <StatCard 
            icon={FiShield} 
            title="System Admins" 
            value={dashboardStats.totalAdmins} 
            color="purple.500"
          />
          <StatCard 
            icon={FiActivity} 
            title="Recent Actions" 
            value={dashboardStats.recentActions} 
            color="green.500"
          />
          <StatCard 
            icon={FaUserCheck} 
            title="Active Accounts" 
            value={dashboardStats.activeAccounts} 
            color="cyan.500"
          />
          <StatCard 
            icon={FiLock} 
            title="Locked Accounts" 
            value={dashboardStats.lockedAccounts} 
            color="orange.500"
          />
          <StatCard 
            icon={FaArchive} 
            title="Archived Accounts" 
            value={dashboardStats.archivedAccounts} 
            color="red.500"
          />
        </SimpleGrid>
      )}

      {/* Recent Activity */}
      <Box bg="white" border="1px" borderColor="gray.200" borderRadius="md" p={4}>
        <Heading size="sm" mb={3}>Recent Activity</Heading>
        {recentActivities.length === 0 ? (
          <Text fontSize="sm" color="gray.500" textAlign="center" py={4}>No recent activity</Text>
        ) : (
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
        )}
      </Box>
    </Box>
  );
};

export default Dashboard;

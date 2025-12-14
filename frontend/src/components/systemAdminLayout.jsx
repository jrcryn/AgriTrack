import React from 'react';
import { Box, Flex } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import SidebarHeaderSystemAdmin from './sidebarHeaderSystemAdmin.jsx';

const SystemAdminLayout = () => {
  return (
    <Flex minH="100vh" direction="column">
      {/* SidebarHeaderSystemAdmin - already has fixed positioning */}
      <SidebarHeaderSystemAdmin />
  
      {/* Main content area - adjust margin to account for sidebar width */}
      <Box 
        flex="1" 
        ml={{ base: 0, md: "260px" }} 
        mt="45px" 
        p={4}
        overflowY="auto"
      >
        <Outlet />
      </Box>
    </Flex>
  );
};

export default SystemAdminLayout;

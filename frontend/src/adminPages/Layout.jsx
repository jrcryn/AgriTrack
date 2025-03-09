import React from 'react';
import { Box } from '@chakra-ui/react';
import SidebarHeader from './SidebarHeader';

const Layout = ({ children }) => {
  return (
    <Box>
      {/* SidebarHeader */}
      <SidebarHeader />
      
      {/* Main content area */}
      <Box flex="1" ml="250px" p={4} position={'sticky'}>
        {children}
      </Box>
    </Box>
  );
};

export default Layout;

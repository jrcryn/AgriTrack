import React from 'react';
import { Box, Flex } from '@chakra-ui/react';
import SidebarHeader from './SidebarHeader';

const Layout = ({ children }) => {
  return (
    <Flex minH="100vh" direction="column">
      {/* SidebarHeader - already has fixed positioning */}
      <SidebarHeader />
      
      {/* Main content area - adjust margin to account for sidebar width */}
      <Box 
        flex="1" 
        ml={{ base: 0, md: "260px" }} 
        mt="55px" 
        p={4}
        overflowY="auto"
      >
        {children}
      </Box>
    </Flex>
  );
};

export default Layout;
import { Box, CloseButton } from '@chakra-ui/react';
import React from 'react';

const UserBadgeItem = ({ user, handleFunction }) => {
  return (
    <Box
      px={2}
      py={0}
      borderRadius="lg"
      m={1}
      mb={2}
      variant="solid"
      fontSize={12}
      bgColor="#CC66CC"
      color="white"
      cursor="pointer"
      display="flex"
      alignItems="center"
    >
      {user.name}
      <CloseButton size="sm" pl={2} onClick={handleFunction} />
    </Box>
  );
};

export default UserBadgeItem;

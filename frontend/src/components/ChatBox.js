import React, { useContext } from 'react';
import { ChatContext } from '../Context/ChatProvider';

import { Box } from '@chakra-ui/react';
import SingleChat from './SingleChat';

const ChatBox = ({ fetchAgain, setFetchAgain }) => {
  const { selectedChat } = useContext(ChatContext);

  return (
    <Box
      display={{ base: selectedChat ? 'flex' : 'none', md: 'flex' }}
      alignItems="center"
      flexDir="column"
      p={3}
      w={{ base: '100%', md: '68%' }}
      borderRadius="lg"
      bgColor="#23272A"
      boxShadow="4px 4px 5px 0px rgba(35, 39, 42, 0.75)"
    >
      <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
    </Box>
  );
};

export default ChatBox;

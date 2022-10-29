import React, { useState, useEffect, useContext } from 'react';

import { ChatContext } from '../Context/ChatProvider';
import {
  Box,
  Button,
  useToast,
  Stack,
  Text,
  StackDivider,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import ChatLoading from './ChatLoading';

import axios from 'axios';
import { getSender } from '../config/ChatLogics';
import GroupChatModal from './miscellaneous/GroupChatModal';

const MyChats = ({ fetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState();
  const ChatState = () => {
    return useContext(ChatContext);
  };
  const { selectedChat, setSelectedChat, user, chats, setChats } = ChatState();

  const toast = useToast();

  const fetchChats = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };

      const { data } = await axios.get('/api/chat', config);
      setChats(data);
    } catch (err) {
      toast({
        title: 'Error Ocurred!',
        description: 'Failed to Load the chats',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom-left',
      });
    }
  };

  useEffect(() => {
    setLoggedUser(user);
    fetchChats();
  }, [fetchAgain]);

  return (
    <Box
      display={{ base: selectedChat ? 'none' : 'flex', md: 'flex' }}
      flexDir="column"
      alignItems="center"
      pt={3}
      bg="#23272A"
      w={{ base: '100%', md: '31%' }}
      borderRadius="lg"
      boxShadow="4px 4px 5px 0px rgba(35, 39, 42, 0.75)"
    >
      <Box
        pb={3}
        px={3}
        fontSize={{ base: '28px', md: '30px' }}
        fontFamily="Work sans"
        display="flex"
        w="100%"
        justifyContent="end"
        alignItems="center"
      >
        <GroupChatModal>
          <Button
            display="flex"
            fontSize={{ base: '17px', md: '10px', lg: '17px' }}
            rightIcon={<AddIcon />}
            bgColor="#40e0d0"
          >
            Novo Grupo
          </Button>
        </GroupChatModal>
      </Box>

      <Box
        display="flex"
        flexDir="column"
        p={3}
        bg="#23272A"
        w="100%"
        h="100%"
        borderRadius="lg"
        overflowY="hidden"
      >
        {chats ? (
          <Stack
            overflowY="scroll"
            divider={<StackDivider borderColor="gray.200" />}
          >
            {chats.map((chat) => (
              <Box
                onClick={() => setSelectedChat(chat)}
                cursor="pointer"
                bg={selectedChat === chat ? '#40e0d0' : 'inherit'}
                color={selectedChat === chat ? 'black' : '#F6F6F6'}
                px={3}
                py={2}
                borderRadius="lg"
                // borderBottom="1px"
                borderColor="GrayText"
                key={chat._id}
              >
                <Text>
                  {!chat.isGroupChat
                    ? getSender(loggedUser, chat.users)
                    : chat.chatName}
                </Text>
              </Box>
            ))}
          </Stack>
        ) : (
          <ChatLoading />
        )}
      </Box>
    </Box>
  );
};

export default MyChats;

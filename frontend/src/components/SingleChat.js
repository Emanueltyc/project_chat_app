import { ArrowBackIcon } from '@chakra-ui/icons';
import { Box, Divider, IconButton, Image, Text } from '@chakra-ui/react';
import React, { useContext } from 'react';
import { ChatContext } from '../Context/ChatProvider';
import { getSender, getSenderFull } from '../config/ChatLogics';
import ProfileModal from '../components/miscellaneous/ProfileModal';
import UpdateGroupChatModal from './miscellaneous/UpdateGroupChatModal';

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const { user, selectedChat, setSelectedChat } = useContext(ChatContext);

  return (
    <>
      {selectedChat ? (
        <>
          <Text
            fontSize={{ base: '28px', md: '30px' }}
            pb={3}
            px={2}
            w="100%"
            fontFamily="Work sans"
            display="flex"
            justifyContent={{ base: 'space-between' }}
            alignItems="center"
            color="#F6F6F6"
          >
            <IconButton
              display={{ base: 'flex', md: 'none' }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat('')}
              color="black"
            />
            {!selectedChat.isGroupChat ? (
              <>
                <Box display="flex" gap="10px" alignItems="center">
                  <Image
                    borderRadius="full"
                    boxSize="12"
                    src={getSenderFull(user, selectedChat.users).pic}
                    alt={getSenderFull(user, selectedChat.users).name}
                  />
                  {getSender(user, selectedChat.users)}
                </Box>
                <ProfileModal user={getSenderFull(user, selectedChat.users)} />
              </>
            ) : (
              <>
                {selectedChat.chatName}
                <UpdateGroupChatModal
                  fetchAgain={fetchAgain}
                  setFetchAgain={setFetchAgain}
                />
              </>
            )}
          </Text>
          <Divider />
          <Box
            display="flex"
            flexDir="column"
            justifyContent="flex-end"
            p={3}
            w="100%"
            h="100%"
            borderRadius="lg"
            overflowY="hidden"
          ></Box>
        </>
      ) : (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          h="100%"
        >
          <Text fontSize="3xl" pb={3} fontFamily="Work sans" color="#40e0d0">
            Clique em um usuário para iniciar uma conversa
          </Text>
        </Box>
      )}
    </>
  );
};

export default SingleChat;

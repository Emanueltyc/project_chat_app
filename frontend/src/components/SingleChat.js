import { ArrowBackIcon } from '@chakra-ui/icons';
import {
  Box,
  Divider,
  FormControl,
  IconButton,
  Image,
  Input,
  Spinner,
  Text,
  useToast,
} from '@chakra-ui/react';
import React, { useContext, useEffect, useState } from 'react';
import { ChatContext } from '../Context/ChatProvider';
import { getSender, getSenderFull } from '../config/ChatLogics';
import ProfileModal from '../components/miscellaneous/ProfileModal';
import UpdateGroupChatModal from './miscellaneous/UpdateGroupChatModal';
import ScrollableChat from './ScrollableChat';
import Lottie from 'react-lottie';
import animationData from '../animations/typing.json';

import axios from 'axios';
import io from 'socket.io-client';
const ENDPOINT = 'http://localhost:5000';
var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState();
  const [newMessage, setNewMessage] = useState();
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  };

  const { user, selectedChat, setSelectedChat, notification, setNotification } =
    useContext(ChatContext);

  const toast = useToast();

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      setLoading(true);

      const headers = {
        Authorization: `Bearer ${user.token}`,
      };

      const { data } = await axios.get(`/api/message/${selectedChat._id}`, {
        headers,
      });

      setMessages(data);
      setLoading(false);

      socket.emit('join chat', selectedChat._id);
    } catch (err) {
      toast({
        title: 'Ocorreu um erro!',
        description: 'Falha ao carregar as mensagens',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom',
      });
    }
  };

  useEffect(() => {
    fetchMessages();

    selectedChatCompare = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit('setup', user);
    socket.on('connected', () => setSocketConnected(true));
    socket.on('typing', () => setIsTyping(true));
    socket.on('stop typing', () => setIsTyping(false));
  }, []);

  useEffect(() => {
    socket.on('message received', (newMessageReceived) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageReceived.chat._id
      ) {
        if (!notification.includes(newMessageReceived)) {
          setNotification([newMessageReceived, ...notification]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages([...messages, newMessageReceived]);
      }
    });
  });

  const sendMessage = async (event) => {
    if (event.key === 'Enter' && newMessage) {
      socket.emit('stop typing', selectedChat._id);
      try {
        const headers = {
          Authorization: `Bearer ${user.token}`,
        };

        setNewMessage('');
        const { data } = await axios.post(
          '/api/message',
          { content: newMessage, chatId: selectedChat._id },
          { headers }
        );

        socket.emit('new message', data);
        setMessages([...messages, data]);
      } catch (err) {
        toast({
          title: 'Ocorreu um erro!',
          description: 'Falha ao enviar a mensagem',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'bottom',
        });
      }
    }
  };

  useEffect(() => {
    setNotification(
      notification.filter((n) => n.chat._id !== selectedChat._id)
    );
  }, [notification, selectedChat._id, setNotification]);

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit('typing', selectedChat._id);
    }

    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;

      if (timeDiff >= timerLength && typing) {
        socket.emit('stop typing', selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

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
                  fetchMessages={fetchMessages}
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
          >
            {loading ? (
              <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"
                color="#40e0d0"
              />
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  overflowY: 'scroll',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                }}
              >
                <ScrollableChat messages={messages} />
              </div>
            )}
            <FormControl onKeyDown={sendMessage} isRequired mt={3}>
              {isTyping ? (
                <div>
                  <Lottie
                    options={defaultOptions}
                    width={70}
                    style={{ marginLeft: 0, marginBottom: 15 }}
                  />
                </div>
              ) : (
                <></>
              )}
              <Input
                variant="filled"
                placeholder="Escreva uma mensagem..."
                onChange={typingHandler}
                value={newMessage}
                bgColor="inherit"
                borderColor="#40e0d0"
                size="lg"
                _hover={{ bgColor: 'inherit' }}
                _focus={{ borderColor: '#40e0d0' }}
                color="#F6F6F6"
              />
            </FormControl>
          </Box>
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

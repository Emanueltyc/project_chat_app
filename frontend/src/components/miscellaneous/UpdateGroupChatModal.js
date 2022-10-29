import React, { useContext, useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { ViewIcon } from '@chakra-ui/icons';
import { ChatContext } from '../../Context/ChatProvider';
import UserBadgeItem from '../UserItem/UserBadgeItem';
import UserListItem from '../UserItem/UserListItem';

import axios from 'axios';

const UpdateGroupChatModal = ({ fetchAgain, setFetchAgain }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [groupChatName, setGroupChatName] = useState();
  const [search, setSearch] = useState('');
  const [searchResult, setSearchResult] = useState();
  const [loading, setLoading] = useState(false);
  const [renameLoading, setRenameLoading] = useState(false);

  const toast = useToast();

  const { selectedChat, setSelectedChat, user } = useContext(ChatContext);

  const handleAddUser = async (userOne) => {
    if (selectedChat.users.find((u) => u._id === userOne._id)) {
      toast({
        title: 'Usuário já está no grupo!',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom',
      });

      return;
    }

    if (selectedChat.groupAdmin._id !== user._id) {
      toast({
        title: 'Apenas administradores podem adicionar membros!',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom',
      });

      return;
    }

    try {
      setLoading(true);

      const headers = {
        Authorization: `Bearer ${user.token}`,
      };

      const { data } = await axios.put(
        '/api/chat/groupadd',
        {
          chatId: selectedChat._id,
          userId: userOne._id,
        },
        { headers }
      );

      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setLoading(false);
    } catch (err) {
      toast({
        title: 'Ocorreu um erro!',
        description: err.response.data.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom',
      });

      return;
    }
  };

  const handleRemove = async (userOne) => {
    if (selectedChat.groupAdmin._id !== user._id && user._id !== userOne._id) {
      toast({
        title: 'Apenas administradores podem remover membros!',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom',
      });

      return;
    }

    try {
      setLoading(true);

      const headers = {
        Authorization: `Bearer ${user.token}`,
      };

      const { data } = await axios.put(
        '/api/chat/groupremove',
        {
          chatId: selectedChat._id,
          userId: userOne._id,
        },
        { headers }
      );

      userOne._id === user._id ? setSelectedChat() : setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setLoading(false);
    } catch (err) {
      toast({
        title: 'Ocorreu um erro!',
        description: err.response.data.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom',
      });

      return;
    }
  };

  const handleRename = async () => {
    if (!groupChatName) return;

    try {
      setRenameLoading(true);

      const headers = {
        Authorization: `Bearer ${user.token}`,
      };

      const { data } = await axios.put(
        '/api/chat/rename',
        {
          chatId: selectedChat._id,
          chatName: groupChatName,
        },
        { headers }
      );

      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setRenameLoading(false);
    } catch (err) {
      toast({
        title: 'Ocorreu um erro!',
        description: err.response.data.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom',
      });
      setRenameLoading(false);
    }

    setGroupChatName('');
  };

  const handleSearch = async (query) => {
    if (!query) {
      setSearch('');
      setSearchResult([]);
      return;
    }

    try {
      setLoading(true);
      setSearch(query);

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(`/api/user?search=${search}`, config);
      setSearchResult(data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      toast({
        title: 'Error Ocurred!',
        description: 'Failed to Load the Search Results',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom-left',
      });
    }
  };

  return (
    <>
      <IconButton
        display={{ base: 'flex' }}
        icon={<ViewIcon />}
        onClick={onOpen}
        color="#40e0d0"
        bgColor="#36393F"
        _hover={{ bgColor: '#40e0d0', color: '#36393F' }}
      />

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{selectedChat.chatName}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box w="100%" display="flex" flexWrap="wrap" pb={3}>
              {selectedChat.users.map((user) => (
                <UserBadgeItem
                  key={user._id}
                  user={user}
                  handleFunction={() => handleRemove(user)}
                />
              ))}
            </Box>
            <FormControl display="flex">
              <Input
                placeHolder="Nome do grupo"
                mb={3}
                value={groupChatName}
                onChange={(e) => setGroupChatName(e.target.value)}
              />
              <Button
                variant="solid"
                colorScheme="teal"
                ml={1}
                isLoading={renameLoading}
                onClick={handleRename}
              >
                Atualizar
              </Button>
            </FormControl>
            <FormControl>
              <Input
                placeHolder="Adicionar usuarios ao grupo"
                mb={1}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </FormControl>
            {loading ? (
              <Spinner size="lg" />
            ) : (
              searchResult?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => handleAddUser(user)}
                />
              ))
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={() => handleRemove(user)} colorScheme="red">
              Sair do grupo
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default UpdateGroupChatModal;

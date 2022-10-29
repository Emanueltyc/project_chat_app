import React, { useContext, useState } from 'react';
import { ChatContext } from '../../Context/ChatProvider';

import {
  Box,
  Button,
  FormControl,
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

import UserListItem from '../UserItem/UserListItem';

import axios from 'axios';
import UserBadgeItem from '../UserItem/UserBadgeItem';

const GroupChatModal = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [groupChatName, setGroupChatName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [searchResult, setSearchResult] = useState();
  const [loading, setLoading] = useState(false);

  const toast = useToast();

  const { user, chats, setChats } = useContext(ChatContext);

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

  const handleSubmit = async () => {
    if (!groupChatName || !setSelectedUsers) {
      toast({
        title: 'Por favor, preencha todos os campos',
        status: 'warning',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });

      return;
    }

    try {
      const headers = {
        Authorization: `Bearer ${user.token}`,
      };

      const { data } = await axios.post(
        '/api/chat/group',
        {
          name: groupChatName,
          users: JSON.stringify(selectedUsers.map((u) => u._id)),
        },
        { headers }
      );

      setChats([data, ...chats]);
      toast({
        title: 'Novo grupo criado!',
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'bottom',
      });
      onClose();
    } catch (err) {
      toast({
        title: 'Erro ao criar o grupo!',
        description: err.response.data.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom',
      });
    }
  };

  const handleGroup = (userToAdd) => {
    if (selectedUsers.includes(userToAdd)) {
      toast({
        title: 'user already added',
        status: 'warning',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });

      return;
    }

    setSelectedUsers([...selectedUsers, userToAdd]);
  };

  const handleRemove = (userToRemove) => {
    setSelectedUsers(
      selectedUsers.filter((user) => user._id !== userToRemove._id)
    );
  };

  return (
    <>
      <span onClick={onOpen}>{children}</span>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Modal Title</ModalHeader>
          <ModalCloseButton />

          <ModalBody display="flex" flexDir="column" alignItems="center">
            <FormControl>
              <Input
                placeholder="Chat Name"
                mb={3}
                onChange={(e) => {
                  setGroupChatName(e.target.value);
                }}
              />
            </FormControl>
            <FormControl>
              <Input
                placeholder="Add Users"
                mb={1}
                onChange={(e) => {
                  handleSearch(e.target.value);
                }}
              />
            </FormControl>

            <Box display="flex" w="100%" flexWrap="wrap">
              {selectedUsers.map((user) => (
                <UserBadgeItem
                  key={user._id}
                  user={user}
                  handleFunction={() => handleRemove(user)}
                />
              ))}
            </Box>

            {loading ? (
              <Spinner />
            ) : (
              searchResult
                ?.slice(0, 4)
                .map((user) => (
                  <UserListItem
                    key={user._id}
                    user={user}
                    handleFunction={() => handleGroup(user)}
                  />
                ))
            )}
          </ModalBody>

          <ModalFooter>
            <Button mr="auto" bg="#40e0d0" onClick={handleSubmit}>
              Create Chat
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default GroupChatModal;

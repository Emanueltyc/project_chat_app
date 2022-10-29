import {
  Box,
  Button,
  Text,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  Avatar,
  MenuItem,
  MenuDivider,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  Input,
  useToast,
  Spinner,
} from '@chakra-ui/react';
import { BellIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { LogoIcon } from './LogoIcon';
import { useDisclosure } from '@chakra-ui/hooks';
import React, { useState, useContext } from 'react';

import { ChatContext } from '../../Context/ChatProvider';
import ProfileModal from './ProfileModal';
import { useHistory } from 'react-router-dom';

import axios from 'axios';
import ChatLoading from '../ChatLoading';
import UserListItem from '../UserItem/UserListItem';

const SideDrawer = () => {
  const [search, setSearch] = useState('');
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const ChatState = () => {
    return useContext(ChatContext);
  };

  const { user, setSelectedChat, chats, setChats } = ChatState();

  const history = useHistory();
  const toast = useToast();

  const logoutHandler = () => {
    localStorage.removeItem('userInfo');
    history.push('/');
  };

  const handleSearch = async () => {
    if (!search) {
      toast({
        title: 'Please Enter something in search',
        status: 'warning',
        duration: 5000,
        isClosable: true,
        position: 'top-left',
      });

      return;
    }

    try {
      setLoading(true);

      const config = { headers: { Authorization: `Bearer ${user.token}` } };

      const { data } = await axios.get(`/api/user?search=${search}`, config);

      setLoading(false);
      setSearchResult(data);
    } catch (err) {
      toast({
        title: 'Error Occured!',
        description: 'Failed to Load the Search Results',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom-left',
      });
    }
  };

  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);

      const headers = {
        Authorization: `Bearer ${user.token}`,
      };

      const { data } = await axios.post('/api/chat', { userId }, { headers });

      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);

      setSelectedChat(data);
      setLoadingChat(false);
      onClose();
    } catch (err) {
      toast({
        title: 'Error fetching the chat',
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom-left',
      });
    }
  };

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        bg="#23272A"
        w="100%"
        p="5px 10px 5px 10px"
        color="#F6F6F6"
        boxShadow="0px 4px 5px 0px rgba(35, 39, 42, 0.75)"
      >
        <Tooltip
          label="Pesquisar usuários para conversar"
          hasArrow
          placement="bottom-end"
        >
          <Button
            variant="ghost"
            onClick={onOpen}
            _hover={{ bgColor: '#40e0d0' }}
          >
            <i className="fas fa-search"></i>
            <Text display={{ base: 'none', md: 'flex' }} px="4">
              Pesquisar usuário
            </Text>
          </Button>
        </Tooltip>

        <LogoIcon fontSize="4xl" m={1} />

        <div>
          <Menu>
            <MenuButton p={1}>
              <BellIcon fontSize="2xl" m={1} color="blackAlpha" />
            </MenuButton>
            {/* <MenuList></MenuList> */}
          </Menu>
          <Menu>
            <MenuButton
              bgColor="#CC66CC"
              as={Button}
              rightIcon={<ChevronDownIcon />}
            >
              <Avatar
                size="sm"
                cursor="pointer"
                name={user.name}
                src={user.pic}
                border="1px"
              />
            </MenuButton>
            <MenuList color="#23272A" bgColor="#F6F6F6">
              <ProfileModal user={user}>
                <MenuItem>Meu perfil</MenuItem>
              </ProfileModal>
              <MenuDivider />
              <MenuItem onClick={logoutHandler}>logout</MenuItem>
            </MenuList>
          </Menu>
        </div>
      </Box>

      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />

        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">Procurar usuários</DrawerHeader>

          <DrawerBody>
            <Box display="flex" pb={2}>
              <Input
                placeholder="Search by name or email"
                mr={2}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button onClick={handleSearch}>Go</Button>
            </Box>
            {loading ? (
              <ChatLoading />
            ) : (
              searchResult?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => accessChat(user._id)}
                />
              ))
            )}
            {loadingChat && <Spinner ml="auto" display="flex" />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default SideDrawer;

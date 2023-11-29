import React, { useState } from 'react'
import { Button, Box, IconButton, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useDisclosure, useToast, FormControl, Input, Spinner } from "@chakra-ui/react";
import { ViewIcon } from '@chakra-ui/icons';
import { ChatState } from "../../Context/ChatProvider"
import UserBadgeItem from './UserBadgeItem';
import UserListItem from "./UserListItem";
import axios from "axios";
const UpdateGroupChatModal = ({ fetchAgain, setFetchAgain , fetchMessages}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user, selectedChat, setselectedChat } = ChatState();
  const [groupChatName, setGroupChatName] = useState("");
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [renameLoading, setRenameLoading] = useState(false);
  const toast = useToast();
  const handleRemove = async (user1) => {
    if (selectedChat.groupAdmin._id !== user._id && user1._id !== user._id) {
      toast({
        title: "Only Admin can add someone!",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top"
      });
      return;
    }
    try {
      setLoading(true);
      const config = {
        headers: {
          "Authorization": `Bearer ${user.token}`,
        }
      };
      const { data } = await axios.put("http://localhost:5000/api/chats/groupremove", {
        chatId: selectedChat._id,
        userId: user1._id
      }, config);
      user1._id === user.id ? setselectedChat() : setselectedChat(data);
      user1._id === user._id && onClose();
      setFetchAgain(!fetchAgain);
      fetchMessages();
      setLoading(false);
    } catch (error) {
      toast({
        title: "Error Occurred!",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top"
      });
      setLoading(false);
    }

  }
  const handleAddUser = async (user1) => {
    if (selectedChat.users.find((u) => u._id === user1._id)) {
      toast({
        title: "User already in group!",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top"
      });
      return;
    }
    if (selectedChat.groupAdmin._id !== user._id) {
      toast({
        title: "Only Admin can add someone!",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top"
      });
      return;
    }
    try {
      setLoading(true);
      const config = {
        headers: {
          "Authorization": `Bearer ${user.token}`,
        }
      };
      const { data } = await axios.put("http://localhost:5000/api/chats/groupadd", {
        chatId: selectedChat._id,
        userId: user1._id
      }, config);
      setselectedChat(data);
      setFetchAgain(!fetchAgain);
      setLoading(false);
    } catch (error) {
      toast({
        title: "Error Occurred!",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top"
      });
      setLoading(false);
    }

  }

  const handleRename = async () => {
    if (!groupChatName) return;
    try {
      setRenameLoading(true);
      const config = {
        headers: {
          "Authorization": `Bearer ${user.token}`,
        }
      };
      const { data } = await axios.put("http://localhost:5000/api/chats/rename", {
        chatId: selectedChat._id,
        newChatName: groupChatName
      }, config);
      setselectedChat(data);
      setFetchAgain(!fetchAgain);
      setRenameLoading(false);
    } catch (error) {
      toast({
        title: "Error Occurred!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right"
      })
      setRenameLoading(false);
      setGroupChatName("");
    }
  }
  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) {
      return;
    }
    try {
      setLoading(true);
      const config = {
        headers: {
          "Authorization": `Bearer ${user.token}`,
        }
      };

      const { data } = await axios.get(`http://localhost:5000/api/user?search=${search}`, config);
      setLoading(false);
      setSearchResult(data);
      console.log(data);
    } catch (error) {

    }


  }
  return (
    <>
      <IconButton display={{ base: "flex" }} icon={<ViewIcon />} onClick={onOpen} />

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize={"35px"}
            display={"flex"}
            justifyContent={"center"}
          >{selectedChat.chatName}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box w={"100%"} display={"flex"} flexWrap={"wrap"} pb={3}>
              {selectedChat.users.map((u) => (
                <UserBadgeItem
                  key={u._id}
                  user={u}
                  handleFunction={() => handleRemove(u)}
                />
              ))}
            </Box>
            <FormControl display={"flex"}>
              <Input
                placeholder='Chat Name'
                mb={3}
                value={groupChatName}
                onChange={(e) => setGroupChatName(e.target.value)}
              />
              <Button
                variant={"solid"}
                colorScheme='teal'
                ml={1}
                isLoading={renameLoading}
                onClick={handleRename}
              >Update</Button>
            </FormControl>
            <FormControl>
              <Input
                placeholder='Add user to group'
                mb={1}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </FormControl>
            {loading ? (<Spinner size={"lg"} />) : (
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
            <Button colorScheme='red' onClick={() => handleRemove(user)}>
              Leave Group
            </Button>

          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default UpdateGroupChatModal
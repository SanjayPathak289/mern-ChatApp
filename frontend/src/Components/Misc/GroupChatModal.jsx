import { Box, Button, FormControl, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useDisclosure, useToast } from '@chakra-ui/react'
import React, { useState } from 'react'
import { ChatState } from '../../Context/ChatProvider';
import axios from 'axios';
import ChatLoading from './ChatLoading';
import UserListItem from './UserListItem';
import UserBadgeItem from './UserBadgeItem';

const GroupChatModal = ({ children }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [groupChatName, setGroupChatName] = useState("");
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const toast = useToast();
    const { user, chats, setChats } = ChatState();
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

            const { data } = await axios.get(`https://chat-app-cw69.onrender.com/api/user?search=${search}`, config);
            setLoading(false);
            setSearchResult(data);
            console.log(data);
        } catch (error) {

        }
    }
    const handleSubmit = async () => {
        if (!groupChatName || !selectedUsers) {
            toast({
                title: "Please fill all the fields",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "top"
            })
            return;
        }
        try {
            const config = {
                headers: {
                    "Authorization": `Bearer ${user.token}`,
                }
            };
            const { data } = await axios.post("https://chat-app-cw69.onrender.com/api/chats/groups", {
                name: groupChatName,
                users: JSON.stringify(selectedUsers.map((u) => u._id)),
            }, config);
            setChats([data, ...chats]);
            onClose();
            toast({
                title: "New Group Created!",
                status: "success",
                duration: 5000,
                isClosable: true,
                position: "top-right"
            })
        } catch (error) {
            toast({
                title: "Error Occurred!",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "top-right"
            })
        }
    }
    const handleDelete = (userDel) => {
        setSelectedUsers(selectedUsers.filter(sel => sel._id !== userDel._id));
    }
    const handleGroup = (userToAdd) => {
        if (selectedUsers.includes(userToAdd)) {
            toast({
                title: "User Already Added",
                status: "warning",
                duration: 2000,
                isClosable: true,
                position: "top"
            })
            return;
        }
        setSelectedUsers([...selectedUsers, userToAdd])
    }
    return (
        <>
            <span onClick={onOpen}>{children}</span>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader
                        fontSize={"35px"}
                        display={"flex"}
                        justifyContent={"center"}
                    >Create Group Chat</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody display={"flex"} flexDirection={"column"} alignItems={"center"}>
                        <FormControl>
                            <Input placeholder='Chat Name' mb={3} onChange={(e) => setGroupChatName(e.target.value)} />
                        </FormControl>
                        <FormControl>
                            <Input placeholder='Add Users' mb={1} onChange={(e) => handleSearch(e.target.value)} value={search} />
                        </FormControl>
                        <Box
                            w={"100%"} display={"flex"} flexWrap={"wrap"}
                        >
                            {selectedUsers.map((user) => (
                                <UserBadgeItem
                                    key={user._id}
                                    user={user}
                                    handleFunction={() => handleDelete(user)}
                                />
                            ))}
                        </Box>
                        {loading ? (<ChatLoading />) : (
                            searchResult.map((user) => (
                                <UserListItem
                                    key={user._id}
                                    user={user}
                                    handleFunction={() => handleGroup(user)}
                                />
                            ))
                        )}
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme='blue' onClick={handleSubmit}>
                            Create Chat
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}

export default GroupChatModal
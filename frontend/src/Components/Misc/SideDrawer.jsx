import { BellIcon, ChevronDownIcon, Search2Icon } from '@chakra-ui/icons';
import { Avatar, Box, Button, Drawer, DrawerBody, DrawerContent, DrawerHeader, DrawerOverlay, Input, Menu, MenuButton, MenuDivider, MenuItem, MenuList, Spinner, Text, Toast, Tooltip, useDisclosure, useToast } from '@chakra-ui/react';
import React, { useState } from 'react'
import { ChatState } from '../../Context/ChatProvider';
import ProfileModal from './ProfileModal';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import axios from 'axios';
import ChatLoading from './ChatLoading';
import UserListItem from './UserListItem';
import { getSender } from '../../config/ChatLogic';
import { Effect } from "react-notification-badge";
import NotificationBadge from 'react-notification-badge/lib/components/NotificationBadge';
const SideDrawer = () => {
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingChat, setLoadingChat] = useState();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();
    const { user, setselectedChat, chats, setChats, notification, setNotification } = ChatState();
    const history = useHistory();
    const logoutHandler = () => {
        localStorage.removeItem("userInfo");
        history.push("/");
    }

    const handleSearch = async () => {
        if (search) {
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
            } catch (error) {
                toast({
                    title: "Error Occurred!",
                    description: "Failed to load search result",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                    position: "top-right"
                })
            }
        }
    }
    const getChat = async (userId) => {
        try {
            setLoadingChat(true);

            const config = {
                headers: {
                    "Content-type": "application/json",
                    "Authorization": `Bearer ${user.token}`
                }
            }
            const { data } = await axios.post("https://chat-app-cw69.onrender.com/api/chats", { userId }, config);
            if (!chats.find((c) => c._id === data._id)) {
                setChats([...chats, data]);
            }
            setLoadingChat(false);
            setselectedChat(data);
            onClose();
        }
        catch (error) {
            toast({
                title: "Error fetching the chat",
                description: error.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "top-right"
            })
        }
    }
    return (
        <>
            <Box
                display={"flex"}
                justifyContent={"space-between"}
                alignItems={"center"}
                w={"100%"}
                bg={"white"}
                p={"5px 10px 5px 10px"}
                borderWidth={"5px"}>
                <Tooltip label="Search Users to Chat" hasArrow placement='bottom-end'>
                    <Button variant={"ghost"} onClick={onOpen}>
                        <Search2Icon />
                        <Text display={{ base: "none", md: "flex" }}
                            px={"4"}>Search User</Text>
                    </Button>
                </Tooltip>

                <Text fontSize={"2xl"} fontFamily={"fantasy"}>
                    Chat App
                </Text>

                <div>
                    <Menu>
                        <MenuButton p={1}>
                            <NotificationBadge
                                count={notification.length}
                                effect={Effect.SCALE}
                            />
                            <BellIcon fontSize={"2xl"} m={1} />
                        </MenuButton>
                        <MenuList pl={2}>
                            {!notification.length && "No new messages"}
                            {notification.map((notf) => (
                                <MenuItem key={notf._id} onClick={() => {
                                    setselectedChat(notf.chat)
                                    setNotification(notification.filter((n) => n !== notf))
                                }}>
                                    {notf.chat.isGroupChat ? `New Message in ${notf.chat.chatName}` : `New Message from ${getSender(user, notf.chat.users)}`}
                                </MenuItem>
                            ))}
                        </MenuList>
                    </Menu>
                    <Menu>
                        <MenuButton p={1} as={Button}>
                            <Avatar size={"sm"} cursor={"pointer"} name={user.name} src={user.pic} />
                            <ChevronDownIcon fontSize={"2xl"} m={1} />
                        </MenuButton>

                        <MenuList>
                            <ProfileModal user={user}>
                                <MenuItem>My Profile</MenuItem>
                            </ProfileModal>
                            <MenuDivider />
                            <MenuItem onClick={logoutHandler}>Logout</MenuItem>
                        </MenuList>
                    </Menu>

                </div>
            </Box>

            <Drawer placement='left' onClose={onClose} isOpen={isOpen}>
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerHeader borderBottomWidth={"1px"}>Search Users</DrawerHeader>
                    <DrawerBody>
                        <Box display={"flex"}
                            paddingBottom={2}>
                            <Input
                                placeholder='Search by name or email'
                                mr={2}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <Button onClick={handleSearch}>Go</Button>

                        </Box>
                        {loading ? (<ChatLoading />) : (
                            searchResult?.map((user) => (
                                <UserListItem
                                    key={user._id}
                                    user={user}
                                    handleFunction={() => getChat(user._id)}
                                />
                            ))
                        )}
                        {loadingChat && <Spinner ml={"auto"} display={"flex"} />}
                    </DrawerBody>
                </DrawerContent>

            </Drawer>
        </>
    )
}

export default SideDrawer   
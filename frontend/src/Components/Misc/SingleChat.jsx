import React, { useEffect, useState } from 'react'
import { ChatState } from '../../Context/ChatProvider'
import { Box, FormControl, IconButton, Input, Spinner, Text, useToast } from "@chakra-ui/react"
import { ArrowBackIcon } from '@chakra-ui/icons';
import UpdateGroupChatModal from './UpdateGroupChatModal';
import { getSender, getSenderFull } from '../../config/ChatLogic';
import ProfileModal from './ProfileModal';
import axios from 'axios';
import ScrollableChat from './ScrollableChat';
import io from "socket.io-client";
import Lottie from "react-lottie";
import animationData from "../../animations/typing.json";
const ENDPOINT = "https://chat-app-cw69.onrender.com";
var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
    const { user, selectedChat, setselectedChat, notification, setNotification } = ChatState();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const toast = useToast();
    const [socketConnected, setSocketConnected] = useState(false);
    const [typing, setTyping] = useState(false);
    const [isTyping, setIsTyping] = useState(false);

    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: animationData,
        rendererSettings: {
            preserveAspectRatio: "xMidYMid slice",
        }
    }
    useEffect(() => {
        socket = io(ENDPOINT);
        socket.emit("setup", user);
        socket.on("connected", () => setSocketConnected(true));
        socket.on("typing", () => setIsTyping(true));
        socket.on("stop typing", () => setIsTyping(false));
    }, [])

    const sendMessage = async (e) => {
        if (e.key === "Enter" && newMessage) {
            socket.emit("stop typing", selectedChat._id);
            try {
                const config = {
                    headers: {
                        "Content-type": "application/json",
                        "Authorization": `Bearer ${user.token}`
                    }
                }
                setNewMessage("");
                const { data } = await axios.post("https://chat-app-cw69.onrender.com/api/message", {
                    content: newMessage,
                    chatId: selectedChat._id
                }, config);
                socket.emit("new message", data);
                setMessages([...messages, data]);
            } catch (error) {
                toast({
                    title: "Error",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                    position: "top-right"
                });
            }
        }
    }

    const fetchMessages = async () => {
        if (!selectedChat) {
            return;
        }
        try {
            const config = {
                headers: {
                    "Authorization": `Bearer ${user.token}`
                }
            }
            setLoading(true);
            const { data } = await axios.get(`https://chat-app-cw69.onrender.com/api/message/${selectedChat._id}`, config);
            setMessages(data);
            setLoading(false);
            socket.emit("join chat", selectedChat._id);
        } catch (error) {
            toast({
                title: "Error",
                status: "error",
                duration: 3000,
                isClosable: true,
                position: "top-right"
            });
        }
    }

    useEffect(() => {
        fetchMessages();

        selectedChatCompare = selectedChat;
    }, [selectedChat]);

    useEffect(() => {
        socket.on("message received", (newMessageReceived) => {
            if (!selectedChatCompare || selectedChatCompare._id !== newMessageReceived.chat._id) {
                //give notification
                if (!notification.includes(newMessageReceived)) {
                    setNotification([newMessageReceived, ...notification]);
                    setFetchAgain(!fetchAgain);
                }
            }
            else {
                setMessages([...messages, newMessageReceived]);
            }
        })
    })

    const typingHandler = (e) => {
        setNewMessage(e.target.value);

        //typing indicator
        if (!socketConnected) return;
        if (!typing) {
            setTyping(true);
            socket.emit("typing", selectedChat._id);
        }
        let lastTypingTime = new Date().getTime();
        var timerLength = 3000;
        setTimeout(() => {
            var timeNow = new Date().getTime();
            var timeDiff = timeNow - lastTypingTime;
            if (timeDiff >= timerLength && typing) {
                socket.emit("stop typing", selectedChat._id);
                setTyping(false);
            }
        }, timerLength)
    }
    return (
        <>
            {selectedChat ? (
                <>
                    <Text
                        fontSize={{ base: "28px", md: "30px" }}
                        pb={3} px={2} w={"100%"} display={"flex"} justifyContent={{ base: "space-between" }} alignItems={"center"}
                    >
                        <IconButton
                            display={{ base: "flex", md: "none" }}
                            icon={<ArrowBackIcon />}
                            onClick={() => setselectedChat("")}
                        />
                        {selectedChat && !selectedChat.isGroupChat ? (
                            <>
                                {getSender(user, selectedChat.users)}
                                <ProfileModal user={getSenderFull(user, selectedChat.users)} />
                            </>
                        ) : (
                            <>{selectedChat.chatName.toUpperCase()}
                                {<UpdateGroupChatModal fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} fetchMessages={fetchMessages}></UpdateGroupChatModal>}
                            </>
                        )}
                    </Text>
                    <Box
                        display={'flex'} flexDir={"column"} justifyContent={"flex-end"}
                        p={3} bg={"#E8E8E8"} w={"100%"} h={"100%"} borderRadius={"lg"} overflowY={"hidden"}
                    >
                        {loading ? (<Spinner size={"xl"} w={20} h={20} alignSelf={"center"} margin={"auto"} />) : (
                            <div style={{ display: "flex", flexDirection: "column", overflowY: "scroll", scrollbarWidth: 'none' }}>
                                <ScrollableChat messages={messages} />
                            </div>
                        )}
                        <FormControl onKeyDown={sendMessage} isRequired mt={3}>
                            {isTyping ? <div>
                                <Lottie
                                    options={defaultOptions}
                                    width={70}
                                    style={{ marginBottom: 15, marginLeft: 0 }}
                                />
                            </div> : <></>}
                            <Input placeholder='Enter a message...' variant={"filled"} bg={"E0E0E0"} onChange={typingHandler} value={newMessage} />
                        </FormControl>
                    </Box>
                </>
            ) : (
                <Box
                    display={"flex"} alignItems={"center"} justifyContent={"center"} h={"100%"}
                >
                    <Text
                        fontSize={"3xl"} pb={3}>
                        Click on a user to start chatting
                    </Text>
                </Box>
            )
            }
        </>
    )
}

export default SingleChat
import React, { useEffect } from 'react'
import { Box, Container, Tab, TabList, TabPanel, TabPanels, Tabs, Text } from '@chakra-ui/react';
import Login from '../Components/Authentication/Login';
import Signup from '../Components/Authentication/Signup';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
const HomePage = () => {
    const history = useHistory();
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("userInfo"));
        if (user) {
            history.push("/chats");
        }
    }, [history]);


    return (
        <Container maxW={'xl'} centerContent>
            <Box
                display={"flex"}
                justifyContent={"center"}
                p={3}
                bg={"white"}
                w={"100%"}
                m={"40px 0 15px 0"}
                borderRadius={"lg"}
                borderWidth={"1px"}
            >
                <Text
                    fontSize={"2xl"}
                    color={"black"}
                >Chat App</Text>
            </Box>
            <Box
                bg={"white"}
                w={"100%"}
                borderRadius={"lg"}
                borderWidth={"1px"}
            >
                <Tabs variant={"soft-rounded"} colorScheme='green' p={"2em"}>
                    <TabList mb={"1em"}>
                        <Tab width={"50%"}>Login</Tab>
                        <Tab width={"50%"}>Sign Up</Tab>
                    </TabList>

                    <TabPanels>
                        <TabPanel>
                            <Login />
                        </TabPanel>
                        <TabPanel>
                            <Signup />
                        </TabPanel>
                    </TabPanels>

                </Tabs>
            </Box>
        </Container>
    )
}

export default HomePage
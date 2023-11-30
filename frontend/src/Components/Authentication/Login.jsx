import { Button, FormControl, FormLabel, Input, InputGroup, InputRightElement, VStack, useToast, } from '@chakra-ui/react'
import axios from 'axios';
import React, { useState } from 'react'
import { useHistory } from 'react-router-dom/cjs/react-router-dom';

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const toast = useToast();
    const history = useHistory();
    const submitForm = async () => {
        setLoading(true);
        try {
            const config = {
                headers: {
                    "Content-type": "application/json",
                }
            }
            const { data } = await axios.post("https://chat-app-cw69.onrender.com/api/user/login",
                { email, password }, config);
            toast({
                title: "Login Successfull",
                status: "success",
                duration: 5000,
                isClosable: true,
                position: "top-right"
            });
            localStorage.removeItem("userInfo");
            localStorage.setItem("userInfo", JSON.stringify(data));
            setLoading(false);
            history.push("/chats");
        } catch (error) {
            toast({
                title: "Error Occurred!",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "top-right"
            });
            setLoading(false);
        }
    }
    return (
        <VStack spacing={"1rem"}>
            <FormControl id='email' isRequired>
                <FormLabel>Email</FormLabel>
                <Input placeholder='Enter Your Email' onChange={(e) => setEmail(e.target.value)} value={email} />
            </FormControl>

            <FormControl id='password' isRequired>
                <FormLabel>Password</FormLabel>
                <InputGroup>
                    <Input type={show ? "text" : "password"} placeholder='Enter Your Passsword' onChange={(e) => setPassword(e.target.value)} value={password} />
                    <InputRightElement width={"4.5rem"}>
                        <Button h="1.75rem" size={"sm"} onClick={() => setShow(!show)}>
                            {show ? "Hide" : "Show"}
                        </Button>
                    </InputRightElement>
                </InputGroup>
            </FormControl>

            <Button
                colorScheme='green'
                width={"100%"}
                mt={15}
                onClick={submitForm}>
                Login
            </Button>
            <Button
                colorScheme='red'
                width={"100%"}
                onClick={() => {
                    setEmail("guest@example.com")
                    setPassword("123456");
                }}
                isLoading={loading}>
                Get Guest User Credentials
            </Button>
        </VStack>
    )
}

export default Login
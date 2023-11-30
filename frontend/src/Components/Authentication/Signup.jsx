import { Button, FormControl, FormLabel, Input, InputGroup, InputRightElement, VStack, useToast } from '@chakra-ui/react'
import axios from 'axios';
import React, { useState } from 'react'
import { useHistory } from 'react-router-dom/cjs/react-router-dom';

const Signup = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [pic, setPic] = useState("");
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const history = useHistory();
    //chakra hooks
    const toast = useToast();

    const postDetails = (uploadPic) => {
        setLoading(true);
        if (uploadPic === undefined) {
            toast({
                title: "Please select an Image",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "top-right"
            });
            return;
        }
        if (uploadPic.type === "image/jpeg" || uploadPic.type === "image/png") {
            const data = new FormData();
            data.append("file", uploadPic);
            data.append("upload_preset", "chat app");
            data.append("cloud_name", "dmgnxt8oh");
            fetch("https://api.cloudinary.com/v1_1/dmgnxt8oh/image/upload", {
                method: "post",
                body: data,
            }).then((res) => res.json()).then((data) => {
                setPic(data.url.toString());
                setLoading(false);
            }).catch((err) => {
                console.log(err);
                setLoading(false);
            })
        }
        else {
            toast({
                title: "Please select an Image",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "top-right"
            });
            setLoading(false);
            return;
        }
    }
    const submitForm = async () => {
        setLoading(true);
        if (!name || !email || !password || !confirmPassword) {
            toast({
                title: "Please fill all the fields",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "top-right"
            });
            setLoading(false);
            return;
        }
        if (password !== confirmPassword) {
            toast({
                title: "Password do not match",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "top-right"
            })
            return;
        }

        try {
            const config = {
                header: {
                    "Content-type": "application/json",
                }
            };
            const { data } = await axios.post("https://chat-app-cw69.onrender.com/api/user", { name, email, password, pic }, config);
            toast({
                title: "Registration Successfull",
                status: "success",
                duration: 5000,
                isClosable: true,
                position: "top-right"
            })
            localStorage.setItem("userInfo", JSON.stringify(data));
            setLoading(false);
            history.push("/chats");

        } catch (error) {
            toast({
                title: "Error Occured!",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "top-right"
            })
            setLoading(false);
        }
    }
    return (
        <VStack spacing={"1rem"}>
            <FormControl id='first-name' isRequired>
                <FormLabel>Name</FormLabel>
                <Input placeholder='Enter Your Name' onChange={(e) => setName(e.target.value)} value={name} />
            </FormControl>

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

            <FormControl id='confirmPassword' isRequired>
                <FormLabel>Confirm Password</FormLabel>
                <InputGroup>
                    <Input type={show ? "text" : "password"} placeholder='Enter Your Passsword' onChange={(e) => setConfirmPassword(e.target.value)} value={confirmPassword} />
                    <InputRightElement width={"4.5rem"}>
                        <Button h="1.75rem" size={"sm"} onClick={() => setShow(!show)}>
                            {show ? "Hide" : "Show"}
                        </Button>
                    </InputRightElement>
                </InputGroup>
            </FormControl>

            <FormControl id='pic' isRequired>
                <FormLabel>Upload Your Picture</FormLabel>
                <Input type='file' p={1.5} accept='image/*' onChange={(e) => postDetails(e.target.files[0])} />
            </FormControl>

            <Button
                colorScheme='green'
                width={"100%"}
                mt={15}
                onClick={submitForm}
                isLoading={loading}>
                Sign Up
            </Button>
        </VStack>
    )
}

export default Signup
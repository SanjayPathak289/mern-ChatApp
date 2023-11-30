require("dotenv").config();
const express = require("express");
const connectDb = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors({
    origin: "http://localhost:3000",
    methods: ["POST", "GET", "PUT"],
    credentials: true,
    optionSuccessStatus: 200
}))
connectDb();



app.use(express.json());


app.use("/api/user", userRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/message", messageRoutes);

// -------------------Deployment Start---------------------
const __dirname1 = path.resolve();
console.log(path.join(__dirname1, "../frontend/build/index.html"));
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname1, '../frontend/build')));
    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname1, "../frontend/build/index.html"));
    })
} else {
    app.get("/", (req, res) => {
        res.send("API is running successfully");
    })
}



// ----------------Deployment End------------------------

const server = app.listen(process.env.PORT);

const io = require("socket.io")(server, {
    pingTimeOut: 60000,
    cors: {
        origin: "http://localhost:3000"
    }
});

io.on("connection", (socket) => {
    socket.on("setup", (userData) => {
        socket.join(userData._id);
        socket.emit("connected");
    });


    socket.on("join chat", (room) => {
        socket.join(room);
        console.log("User joined room" + room);
    })

    socket.on("typing", (room) => {
        socket.in(room).emit("typing");
    })

    socket.on("stop typing", (room) => {
        socket.in(room).emit("stop typing");
    })

    socket.on("new message", (newMessageReceived) => {
        var chat = newMessageReceived.chat;
        if (!chat.users) return console.log("chat.users not defined");

        chat.users.forEach(user => {
            if (user._id == newMessageReceived.sender._id) return;

            socket.in(user._id).emit("message received", newMessageReceived);
        });
    })
    socket.off("setup", () => {
        console.log("User Disconnected");
        socket.leave(userData._id);
    })
})
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const bp = require("body-parser");
require('custom-env').env('local');
const router = require('./routing/router');
const app = express();
const http = require('http');
const server = http.createServer(app);
const {Server} = require("socket.io");
const io = new Server(server, {
    cors: {
        origins: ['http://localhost:4200']
    }
});
const ChatController = require('./controllers/chat-controller');

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
app.use(bp.urlencoded({extended: true}));
app.use(bp.json());
app.use(bp.urlencoded({extended: false}));
app.use(bp.json());
app.use(cors());
app.use(require("morgan")("dev"));
app.use('', router);

const connectedUsers = {};


io.on('connection', socket => {
    const userId = socket.request._query['userId'];

    io.emit("user connected", {userId});
    io.to(socket.id).emit("online users", {allUsers:Object.keys(connectedUsers)} )

    connectedUsers[userId] = socket.id;

    socket.on('disconnect', () => {
        delete connectedUsers[userId];
        io.emit("user disconnected", {userId})
    });

    socket.on('message sent', async (data) => {
        const receiverId = data.receiverId;
        const senderId = data.senderId;
        const msg = data.msg;

    socket.on('someone typing', async(data) => {
        const receiverId = data.receiverId;
        const senderId = data.senderId;
        io.emit('typing', { receiverId,senderId})

    })

        let res = await ChatController.saveMessage(senderId, receiverId, msg);
        if (!connectedUsers.hasOwnProperty(receiverId)) {
            io.to(connectedUsers[senderId]).emit('new message', {success: res.success, msg, receiverId, senderId});
            return;
        }

        io.to(connectedUsers[receiverId]).to(connectedUsers[senderId]).emit('new message', {success: res.success, msg, receiverId, senderId});
    })
});

server.listen(process.env.HTTP_PORT, '192.168.1.43', () => {
    console.log("Express server listening on port " + process.env.HTTP_PORT);
});


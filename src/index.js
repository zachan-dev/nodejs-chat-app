const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users');

const app = express();
const server = http.createServer(app); //called by express behind anyways
const io = socketio(server); //need raw http server
const port = process.env.PORT || 3000;

const publicDirPath = path.join(__dirname, '../public');

const botName = 'chat_bot';

app.use(express.static(publicDirPath));

// let count = 0;

io.on('connection', (socket) => { // socket: specific client
    console.log('New WebSocket connection');

    // socket.emit('countUpdated', count); //event to the client side, argument list to the callback function on client

    // socket.on('increment', () => { //listener from the client side, argument list from the emit function on client
    //     count++;
    //     // socket.emit('countUpdated', count); // emit to specific client
    //     io.emit('countUpdated', count); //emit to everyone!!!
    // });


    socket.on('join', (options, callback) => {
        const { error, user } = addUser({ id: socket.id, ...options });

        if (error) {
            return callback(error);
        }

        socket.join(user.room); // Socket Rooms!!!

        socket.emit('message', generateMessage(botName, 'Welcome!')); // the current client
        socket.broadcast.to(user.room).emit('message', generateMessage(botName, `${user.username} has joined the chat room!`)); //everyone but the current client
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        });

        callback(); // no error

        // socket.emit, io.emit, socket.broadcast.emit
        // io.to.emit (everyone in a specific room)
        // socket.broadcast.to.emit (everyone in the room but the client)
    });
    
    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter();

        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed!')
        }

        const user = getUser(socket.id);

        if (!user) {
            return callback('Cannot send message! User not found');
        }

        io.to(user.room).emit('message', generateMessage(user.username, message)); // everyone
        callback(); // event acknowledgement
    });

    socket.on('sendLocation', (location, callback) => {
        const user = getUser(socket.id);

        if (!user) {
            return callback('Cannot share location! User not found');
        }

        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${location.latitude},${location.longitude}`));
        callback();
    });

    socket.on('disconnect', () => { // special event
        const user = removeUser(socket.id);

        if (user) {
            io.to(user.room).emit('message', generateMessage(botName, `${user.username} has left.`)); // everyone
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            });
        }
    });

});

server.listen(port, () => console.log(`Web server is up on ${port}`));
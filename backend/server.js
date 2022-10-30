import express from 'express';
import { Server } from 'socket.io';
import { connectDB } from './config/db.js';
import { chatRoutes, userRoutes, messageRoutes } from './routes/index.js';
import { notFound, errorHandler } from './middlewares/erroMiddleware.js';
import 'dotenv/config';
import 'colors';

connectDB();
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.send('API is Running');
});

app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/message', messageRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
    PORT,
    console.log(`Server Starterd on PORT ${PORT}`.yellow)
);

const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
        origin: 'http://localhost:3000',
    },
});

io.on('connection', (socket) => {
    console.log(`connected to socket: ${socket.id}`.green);

    socket.on('setup', (userData) => {
        socket.join(userData._id);
        socket.emit('connected');
    });

    socket.on('join chat', (room) => {
        socket.join(room);
        console.log(`connected to romm: ${room}`.cyan);
    });

    socket.on('typing', (room) => socket.in(room).emit('typing'));
    socket.on('stop typing', (room) => socket.in(room).emit('stop typing'));

    socket.on('new message', (newMessageReceived) => {
        var chat = newMessageReceived.chat;

        if (!chat.users) return console.log('chat.users not defined');

        chat.users.forEach((user) => {
            if (user._id === newMessageReceived.sender._id) return;

            socket.in(user._id).emit('message received', newMessageReceived);
        });
    });

    socket.off('setup', () => {
        console.log('User disconnected'.magenta);
        socket.leave(userData._id);
    });
});

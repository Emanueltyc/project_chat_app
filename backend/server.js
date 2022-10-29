import express from 'express';
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

app.listen(PORT, console.log(`Server Starterd on PORT ${PORT}`.yellow));

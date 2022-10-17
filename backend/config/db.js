import mongoose from 'mongoose';
import 'dotenv/config';

const MONGO_URI = process.env.MONGO_URI || '';

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(MONGO_URI);

        console.log(
            `MongoDB Connected: ${conn.connection.host}`.cyan.underline
        );
    } catch (err) {
        console.log(`Error: ${err}`.red.bold);
        process.exit();
    }
};

export { connectDB };

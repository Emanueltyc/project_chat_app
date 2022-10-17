import express from 'express';
import {
    authUser,
    registerUser,
    allUsers,
} from '../controllers/userControllers.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/').post(registerUser).get(protect, allUsers);
router.post('/login', authUser);

export { router };

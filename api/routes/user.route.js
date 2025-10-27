import express from 'express';
import {
  test,
  updateUser,
  deleteUser,
  getUsers,
  createUser,
  getUserById
} from '../controllers/user.controller.js';
import { verifyToken, verifyAdmin } from '../utils/verifyUser.js';

const router = express.Router();

router.get('/test', test);

router.post('/update/:id', verifyToken, updateUser);
router.delete('/delete/:id', verifyToken, deleteUser);

router.get('/', verifyToken, verifyAdmin, getUsers); // GET /api/user?q=search
router.post('/', verifyToken, verifyAdmin, createUser); // Admin create user
router.get('/:id', verifyToken, verifyAdmin, getUserById); // Get single user by admin

export default router;


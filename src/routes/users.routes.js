import { deleteUserById, fetchAllUsers, fetchUserById, updateUserById } from '#controllers/users.controller.js';
import express from 'express';
import { authenticateToken, requiredRole } from '#middleware/auth.middleware.js';

const router = express.Router();

router.get('/', authenticateToken, fetchAllUsers);
router.get('/:id', authenticateToken, fetchUserById);
router.put('/:id', authenticateToken, requiredRole('admin'), updateUserById);
router.delete('/:id', authenticateToken, requiredRole('admin'), deleteUserById);

export default router;

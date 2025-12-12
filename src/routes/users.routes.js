import { deleteUserById, fetchAllUsers, fetchUserById, updateUserById } from '#controllers/users.controller.js';
import express from 'express';

const router = express.Router();

router.get('/', fetchAllUsers);
router.get('/:id', fetchUserById);
router.put('/:id', updateUserById);
router.delete('/:id', deleteUserById);

export default router;

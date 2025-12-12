import { db } from "#config/database.js";
import logger from "#config/logger.js"
import { users } from "#models/user.model.js";
import { eq } from "drizzle-orm";
import bcrypt from 'bcrypt';


export const getAllUsers = async () => {
    try {
        return await db.select({
            id: users.id,
            email: users.email,
            name: users.name,
            role: users.role,
            created_at: users.created_at,
            updated_at: users.updated_at,
        }).from(users);
    } catch(e){
        logger.error('Error getting users', e);
        throw e;
    }
}

export const getUserById = async(id) => {
    try{
        const [user] = await db.select({
            id: users.id,
            email: users.email,
            name: users.name,
            role: users.role,
            created_at: users.created_at,
            updated_at: users.updated_at,
        }).from(users).where(eq(users.id, id)).limit(1);

        if(!user){
            throw new Error('User not found');
        }

        return user;
    } catch(e){
        logger.error('Error getting users', e);
        throw e;
    }
}

export const updateUser = async(id, updates) => {
    try {
        const existingUser = await getUserById(id);

        if(updates.email && updates.email.toLowerCase().trim() !== existingUser.email){
            const [emailExists] = await db.select().from(users).where(eq(users.email, updates.email.toLowerCase().trim())).limit(1);

            if(emailExists){
                throw new Error('Email already exists');
            }
        }

        const payload = {};
        if(typeof updates.name == 'string' && updates.name.trim() !== ''){
            payload.name = updates.name.trim();
        }
        if(typeof updates.email == 'string' && updates.email.trim() !== ''){
            payload.email = updates.email.toLowerCase().trim();
        }
        if(typeof updates.role == 'string' && updates.role.trim() !== ''){
            payload.role = updates.role.trim();
        }
        if(typeof updates.password == 'string' && updates.password.length > 0){
            payload.password = await bcrypt.hash(updates.password, 10);
        }

        if(Object.keys(payload).length === 0){
            return existingUser;
        }

        payload.updated_at = new Date();

        const [updated] = await db.update(users).set(payload).where(eq(users.id, id)).returning({
            id: users.id,
            email: users.email,
            name: users.name,
            role: users.role,
            created_at: users.created_at,
            updated_at: users.updated_at,
        });

        logger.info(`User ${id} updated successfully`);
        return updated;
    } catch(e){
        logger.error('Error updating user', e);
        throw e;
    }
}

export const deleteUser = async(id) => {
   try {
    await getUserById(id);

    const [deletedUser] = await db.delete(users).where(eq(users.id, id)).returning({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
    });

    logger.info(`User ${id} deleted successfully`);
    return deletedUser;
   } catch(e){
    logger.error('Error deleting user', e);
    throw e;
   }
}
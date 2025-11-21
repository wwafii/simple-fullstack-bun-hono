// import type Context dari Hono
import type { Context } from 'hono'

// import prisma client
import prisma from '../../prisma/client'

// import type UserCreateRequest
import type { UserCreateRequest } from '../types/user'

/**
 * @param c 
 * @returns 
 * get all users
 */
export const getUsers = async (c: Context) => {
    try {
        //get all users
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                username: true,
                email: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: { id: 'desc' }
        });

        //return JSON
        return c.json({
            success: true,
            message: 'List Data Users',
            data: users
        }, 200);

    } catch (e: unknown) {
        console.error(`Error getting users: ${e}`);
        return c.json({ success: false, message: 'Internal server error' }, 500)
    }
}

/**
 * @param c 
 * @returns 
 * Create a new user
 */
export const createUser = async (c: Context) => {
    try {

        // ekstrak data yang sudah tervalidasi
        const { name, username, email, password } = c.get('validatedBody') as UserCreateRequest;

        // Cek duplikat email / username
        const existing = await prisma.user.findFirst({
            where: { OR: [{ email }, { username }] },
            select: { id: true, email: true, username: true },
        })

        // Jika ada duplikat, kembalikan error 409 Conflict
        if (existing) {
            const conflictField = existing.email === email ? 'email' : existing.username === username ? 'username' : 'email'
            return c.json(
                {
                    success: false,
                    message:
                        conflictField === 'email'
                            ? 'Email sudah terdaftar'
                            : 'Username sudah digunakan',
                    errors: { [conflictField]: 'Telah digunakan' },
                },
                409
            )
        }

        // Hash password (Bun gunakan Argon2id secara default)
        const hashedPassword = await Bun.password.hash(password)

        // Buat user baru (jangan expose password di select)
        const user = await prisma.user.create({
            data: { name, username, email, password: hashedPassword },
            select: {
                id: true,
                name: true,
                username: true,
                email: true,
                createdAt: true,
                updatedAt: true,
            },
        })

        // return response sukses 201
        return c.json(
            {
                success: true,
                message: 'User Berhasil Dibuat',
                data: user,
            },
            201
        )

    }
    catch (e: unknown) {
        console.error(`Error creating user: ${e}`);
        return c.json({ success: false, message: 'Internal server error' }, 500)
    }
}
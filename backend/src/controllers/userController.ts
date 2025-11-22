// import type Context dari Hono
import type { Context } from 'hono';

// import prisma client
import prisma from '../../prisma/client';

// import type UserCreateRequest
import type { UserCreateRequest, UserUpdaterequest } from '../types/user';

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
      orderBy: { id: 'desc' },
    });

    //return JSON
    return c.json(
      {
        success: true,
        message: 'List Data Users',
        data: users,
      },
      200
    );
  } catch (e: unknown) {
    console.error(`Error getting users: ${e}`);
  }
};

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
    });

    // Jika ada duplikat, kembalikan error 409 Conflict
    if (existing) {
      const conflictField = existing.email === email ? 'email' : existing.username === username ? 'username' : 'email';
      return c.json(
        {
          success: false,
          message: conflictField === 'email' ? 'Email sudah terdaftar' : 'Username sudah digunakan',
          errors: { [conflictField]: 'Telah digunakan' },
        },
        409
      );
    }

    // Hash password (Bun gunakan Argon2id secara default)
    const hashedPassword = await Bun.password.hash(password);

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
    });

    // return response sukses 201
    return c.json(
      {
        success: true,
        message: 'User Berhasil Dibuat',
        data: user,
      },
      201
    );
  } catch (e: unknown) {
    console.error(`Error creating user: ${e}`);
  }
};

/**
 * @param c
 * @returns
 * get user by ID
 */
export const getUserById = async(c: Context) => {
    try {
        const userId = c.req.param('id');

        const user = await prisma.user.findUnique({
            where: { id: Number(userId) },
            select: {
                id: true,
                name: true,
                username: true,
                email: true,
                createdAt: true,
            },
        });

        if (!user) {
            return c.json({
                success: false,
                message: 'User tidak ditemukan!',
            }, 404);
        }

        return c.json({
            success: true,
            message: 'Detail Data User',
            data: user
        }, 200);

    } catch (e: unknown) {
        console.error(`Error getting user by ID: ${e}`);
    }
}

/**
 * @param c 
 * @returns 
 * update user by ID
 */
export const updateUser = async (c: Context) => {
    try {
        const userId = c.req.param('id');
        const user = await prisma.user.findUnique({
            where: { id: Number(userId)}
        });

        if (!user) {
            return c.json({
                success: false,
                message: 'User tidak ditemukan!',
            }, 404);
        }

        const { name, username, email, password } = c.get('validatedBody') as UserUpdaterequest;

        const existing = await prisma.user.findFirst({
            where: {
                OR: [{ email }, { username }],
                NOT: { id: Number(userId) }
            },
            select: { id: true, email: true, username: true },
        });

        if (existing) {
            const conflictField = existing.email === email ? 'email' : existing.username === username ? 'username' : 'email';
            return c.json(
                {
                    success: false,
                    message: conflictField === 'email' ? 'Email sudah terdaftar' : 'Username sudah digunakan',
                    errors: { [conflictField]: 'Telah digunakan' },
                },
                409
            );
        }

        const updatedUser = await prisma.user.update({
            where: { id: Number(userId) },
            data: {
                name,
                username,
                email,
                password: password ? await Bun.password.hash(password) : user.password,
            },
            select: {
                id: true,
                name: true,
                username: true,
                email: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return c.json({
            success: true,
            message: 'User berhasil diupdate!',
            data: updatedUser
        }, 200);
    } catch (e: unknown) {
        console.error(`Error updating user by ID: ${e}`);
    }
}

/**
 * @param c 
 * @returns 
 * delete user by ID
 */
export const deleteUser = async (c: Context) => {
    try {
        //get userId from param
        const userId = c.req.param('id');

        //if user not found
        const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
        if (!user) {
            return c.json({
                success: false,
                message: 'User Tidak Ditemukan!',
            }, 404);
        }

        //delete user by ID
        await prisma.user.delete({ where: { id: Number(userId) } });

        //return JSON
        return c.json({
            success: true,
            message: 'User Berhasil Dihapus!',
        }, 200);
    } catch (e: unknown) {
        console.error(`Error deleting user by ID: ${e}`);
    }
}
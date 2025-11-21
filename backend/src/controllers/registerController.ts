
import type { Context } from 'hono'


import prisma from '../../prisma/client'


import type { RegisterRequest } from '../types/auth'


export const register = async (c: Context) => {
    try {

        
        const { name, username, email, password } = c.get('validatedBody') as RegisterRequest

        
        const existing = await prisma.user.findFirst({
            where: { OR: [{ email }, { username }] },
            select: { id: true, email: true, username: true },
        })

       
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

        
        const hashedPassword = await Bun.password.hash(password)

        
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

        
        return c.json(
            {
                success: true,
                message: 'User Berhasil Dibuat',
                data: user,
            },
            201
        )

    } catch (err) {

        
        return c.json({ success: false, message: 'Internal server error' }, 500)
    }
}
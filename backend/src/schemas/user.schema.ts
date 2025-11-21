
import { z } from 'zod'

export const createUserSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, 'Nama wajib diisi')
        .max(100, 'Nama maksimal 100 karakter'),

    username: z
        .string()
        .trim()
        .min(3, 'Username minimal 3 karakter')
        .max(32, 'Username maksimal 32 karakter')
        .regex(/^[a-z0-9_]+$/i, 'Username hanya boleh mengandung huruf, angka, dan underscore'),

    email: z
        .string()
        .trim()
        .toLowerCase()
        .email('Format email tidak valid'),

    password: z
        .string()
        .min(6, 'Password minimal 6 karakter')
        .max(128, 'Password maksimal 128 karakter'),
})


export const updateUserSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, 'Nama wajib diisi')
        .max(100, 'Nama maksimal 100 karakter')
        .optional(),
    username: z
        .string()
        .trim()
        .min(3, 'Username minimal 3 karakter')
        .max(32, 'Username maksimal 32 karakter')
        .regex(/^[a-z0-9_]+$/i, 'Username hanya boleh mengandung huruf, angka, dan underscore')
        .optional(),
    email: z
        .string()
        .trim()
        .toLowerCase()
        .email('Format email tidak valid')
        .optional(),
    password: z
        .preprocess(
            (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
            z
                .string()
                .min(6, 'Password minimal 6 karakter')
                .max(128, 'Password maksimal 128 karakter')
                .optional()
        ),
})
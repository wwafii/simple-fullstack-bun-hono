
import { z } from 'zod';


import { createUserSchema, updateUserSchema } from '../schemas/user.schema';


export type UserCreateRequest = z.infer<typeof createUserSchema>;
export type UserUpdaterequest = z.infer<typeof updateUserSchema>;
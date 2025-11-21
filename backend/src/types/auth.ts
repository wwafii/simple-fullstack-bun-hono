
import { z } from 'zod';


import { registerSchema, loginSchema } from '../schemas/auth.schema';


export type RegisterRequest = z.infer<typeof registerSchema>;
export type Loginrequest= z.infer<typeof loginSchema>;
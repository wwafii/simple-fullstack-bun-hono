import { Hono } from 'hono';
import { validateBody } from '../middlewares/validate.middleware';
import { verifyToken } from '../middlewares/auth.middleware';
import { loginSchema, registerSchema } from '../schemas/auth.schema';
import { register } from '../controllers/registerController';
import { login } from '../controllers/loginController';
import { createUser, deleteUser, getUserById, getUsers, updateUser } from '../controllers/userController';
import { createUserSchema, updateUserSchema } from '../schemas/user.schema';



const router = new Hono()

router.post('/register', validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);
//protected route
router.get('/users', verifyToken, getUsers);
router.post('/users', verifyToken, validateBody(createUserSchema), createUser);
router.get('/users/:id', verifyToken, getUserById);
router.put('/users/:id', verifyToken, validateBody(updateUserSchema), updateUser);
router.delete('/users/:id', verifyToken, deleteUser);


export const Routes = router;
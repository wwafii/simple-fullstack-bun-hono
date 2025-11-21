import { Hono } from 'hono';
import { validateBody } from '../middlewares/validate.middleware';
import { loginSchema, registerSchema } from '../schemas/auth.schema';
import { register } from '../controllers/registerController';
import { login } from '../controllers/loginController';


const router = new Hono()

router.post('/register', validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);

export const Routes = router;
import { Router } from 'express';
import * as auth from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';

const r = Router();

r.post('/register', auth.register);
r.post('/login', auth.login);
r.get('/me', authenticate, auth.profile);

export default r;

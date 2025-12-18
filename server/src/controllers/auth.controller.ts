import { Request, Response, NextFunction } from 'express';
import { registerUser, loginUser, getProfile } from '../services/auth.service';
import { signToken } from '../utils/jwt';
import { registerSchema, loginSchema } from '../utils/schema';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = registerSchema.parse(req.body);
    const user = await registerUser(email, password);
    const token = signToken({ id: user.id, role: user.role });
    res.status(201).json({ user: { id: user.id, email: user.email, role: user.role }, token });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await loginUser(email, password);
    const token = signToken({ id: user.id, role: user.role });
    res.json({ user: { id: user.id, email: user.email, role: user.role }, token });
  } catch (error) {
    next(error);
  }
};

export const profile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await getProfile(req.user!.id);
    res.json({ user });
  } catch (error) {
    next(error);
  }
};
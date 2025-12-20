import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface JwtUser {
  id: string;
  role: 'STUDENT' | 'MENTOR' | 'ADMIN';
}

export const signToken = (user: JwtUser): string => {
  return jwt.sign(user, env.JWT_SECRET, { expiresIn: String(env.JWT_EXPIRES_IN) } as jwt.SignOptions);
};

export const verifyToken = (token: string): JwtUser => {
  return jwt.verify(token, env.JWT_SECRET) as JwtUser;
};
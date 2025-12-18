import { Request, Response, NextFunction } from 'express';
import { uploadFile } from '../services/upload.service';
import { AppError } from '../utils/AppError';

export const upload = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) throw new AppError('No file provided', 400);
    
    const url = await uploadFile(req.file);
    res.json({ url });
  } catch (error) {
    next(error);
  }
};
import { Request, Response, NextFunction } from 'express';
import * as progress from '../services/progress.service';
import * as certificate from '../services/certificate.service';

export const getProgress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const courseId = req.query.courseId as string;
    if (!courseId) {
      return res.status(400).json({ message: 'Course ID is required' });
    }
    const data = await progress.getChapterProgress(req.user!.id, courseId);
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

export const completeChapter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const chapterId = req.params.chapterId;
    const data = await progress.completeChapter(req.user!.id, chapterId);
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

export const getCertificate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const courseId = req.params.courseId;
    const pdfBuffer = await certificate.generateCertificate(req.user!.id, courseId);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=certificate.pdf');
    res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
}

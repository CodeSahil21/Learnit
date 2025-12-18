import { Router } from 'express';
import * as prog from '../controllers/progress.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';

const r = Router();

r.get('/my', authenticate, authorize(['STUDENT']), prog.getProgress);
r.post('/:chapterId/complete', authenticate, authorize(['STUDENT']), prog.completeChapter);

export default r;

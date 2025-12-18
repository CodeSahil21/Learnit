import { Router } from 'express';
import * as prog from '../controllers/progress.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';

const r = Router();

r.get('/:courseId', authenticate, authorize(['STUDENT']), prog.getCertificate);

export default r;
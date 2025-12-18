import { Router } from 'express';
import * as admin from '../controllers/admin.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';

const r = Router();

r.get('/users', authenticate, authorize(['ADMIN']), admin.getUsers);
r.post('/users', authenticate, authorize(['ADMIN']), admin.createUser);
r.put('/users/:id/approve-mentor', authenticate, authorize(['ADMIN']), admin.approveMentor);
r.put('/users/:id/reject-mentor', authenticate, authorize(['ADMIN']), admin.rejectMentor);
r.delete('/users/:id', authenticate, authorize(['ADMIN']), admin.deleteUser);
r.get('/admin/stats', authenticate, authorize(['ADMIN']), admin.getStats);

export default r;

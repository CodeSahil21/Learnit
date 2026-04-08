import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { env } from './config/env';
import router from './routes/index';
import { AppError } from './utils/AppError';
import helmet from 'helmet';

const app = express();

const allowedOrigins = env.NODE_ENV === 'production'
  ? (env.FRONTEND_URL ? env.FRONTEND_URL.split(',').map(o => o.trim()) : ['https://learnit-ebon.vercel.app'])
  : ['http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));
app.use(helmet());

app.get('/', (_req, res) => {
  res.json({ message: 'LMS API Server', status: 'running' });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', env: env.NODE_ENV });
});

app.use('/api', router);

app.use((req, _res, next) => {
  next(new AppError(`Route ${req.method} ${req.originalUrl} not found`, 404));
});

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const status = err.statusCode || 500;
  const message = err.message || 'Something went wrong';
  if (env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.error(err);
  }
  res.status(status).json({ message });
});

export default app;

// Only listen when running directly (not on Vercel)
if (process.env.VERCEL !== '1') {
  const port = env.PORT;
  app.listen(port, '0.0.0.0', () => {
    // eslint-disable-next-line no-console
    console.log(`Server running on port ${port}`);
  });
}

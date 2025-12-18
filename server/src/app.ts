import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { env } from './config/env';
import router from './routes/index';
import { AppError } from './utils/AppError';
import helmet from 'helmet';

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(helmet());

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

const port = env.PORT;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on http://localhost:${port}`);
});

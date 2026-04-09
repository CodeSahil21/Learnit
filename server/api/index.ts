import app from './src/app';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Vercel passes the path as query param 'path', reconstruct the full URL
  const path = req.query.path;
  if (path) {
    req.url = '/api/' + (Array.isArray(path) ? path.join('/') : path);
  }
  return (app as any)(req, res);
}

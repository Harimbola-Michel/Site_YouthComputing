import compression from 'compression';
import { Request, Response } from 'express';
import { env } from '../config/env';

export const compressionMiddleware = compression({
  threshold: 1024,
  level: 6,
  filter: (req: Request, res: Response) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  brotli: {
    enabled: true,
    params: {
      [compression.constants.BROTLI_PARAM_QUALITY]: 4,
    },
  },
});

export const gzipOnly = compression({
  threshold: 1024,
  level: 6,
  filter: (req: Request, res: Response) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    const type = res.getHeader('Content-Type');
    return typeof type === 'string' && 
      (type.includes('application/json') || 
       type.includes('text/') || 
       type.includes('application/javascript'));
  },
});

export const imageCompression = compression({
  threshold: 0,
  level: 1,
  filter: (req: Request, res: Response) => {
    const type = res.getHeader('Content-Type');
    return typeof type === 'string' && type.includes('image/');
  },
});

export default compressionMiddleware;
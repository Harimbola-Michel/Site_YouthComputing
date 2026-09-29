import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        firstName?: string;
        lastName?: string;
      };
      file?: Multer.File;
      files?: Multer.File[];
      requestId?: string;
      startTime?: number;
    }
  }
}

export interface AuthRequest extends Request {
  user: {
    id: string;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
  };
}

export interface AuthenticatedRequest extends AuthRequest {}

export interface RequestWithFile extends Request {
  file: Express.Multer.File;
}

export interface RequestWithFiles extends Request {
  files: Express.Multer.File[];
}

export interface RequestWithUser extends Request {
  user: {
    id: string;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
  };
}

export interface PaginatedRequest extends Request {
  query: {
    page?: string;
    limit?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    search?: string;
  };
}

export type RequestHandler<T = any> = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<T> | T;

// Add custom properties to Request
declare module 'express' {
  interface Request {
    user?: {
      id: string;
      email: string;
      role: string;
      firstName?: string;
      lastName?: string;
    };
    file?: Multer.File;
    files?: Multer.File[];
    requestId?: string;
    startTime?: number;
  }
}

export {};
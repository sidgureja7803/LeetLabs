import { JwtPayload } from 'jsonwebtoken';

declare namespace Express {
  export interface Request {
    user?: {
      id: string;
      email?: string;
      role?: string;
      isAdmin?: boolean;
      isTeacher?: boolean;
      isStudent?: boolean;
    } & JwtPayload;
  }
}

import { type Request, type Response, type NextFunction } from 'express';
import { type User as PrismaUser } from '@prisma/client';

import { verifyJwt, extractJwtFromHeader } from '../utils/jwtUtils';

export interface RequestWithCurrentUserEmail extends Request<any, any, any, any> {
  currentUserEmail?: PrismaUser['email'];
  currentUserId?: PrismaUser['id'];
}

const getCurrentUserEmailMiddleware = (req: RequestWithCurrentUserEmail, _: Response, next: NextFunction) => {
  const decodedJwt = verifyJwt(extractJwtFromHeader(req.headers.authorization)) as { email?: string; } | undefined;

  req.currentUserEmail = decodedJwt?.email;

  next();
};

export default getCurrentUserEmailMiddleware;

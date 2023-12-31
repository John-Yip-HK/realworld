import * as jwt from 'jsonwebtoken';

import { JWT_SECRET } from '../constants/app';

import { User as PrismaUser } from '@prisma/client';

export function signJwt(payload: Pick<PrismaUser, 'email'> & { userId: PrismaUser['id']; }) {
  return jwt.sign(payload, JWT_SECRET);
}

export function verifyJwt(token?: string) {
  if (!token) return undefined;
  
  return jwt.verify(token, JWT_SECRET);
}

export function extractJwtFromHeader(authHeader?: string | null) {
  return authHeader?.split(' ')[1];
}

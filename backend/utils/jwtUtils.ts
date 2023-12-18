import * as jwt from 'jsonwebtoken';

import { JWT_SECRET } from '../constants/app';

import type { User } from '../routes/User';

export function signJwt(payload: Pick<User, 'email'>) {
  return jwt.sign(payload, JWT_SECRET);
}

export function extractJwtFromHeader(authHeader?: string | null) {
  return authHeader?.split(' ')[1];
}

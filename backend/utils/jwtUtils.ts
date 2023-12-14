import * as jwt from 'jsonwebtoken';

import { JWT_SECRET } from '../constants/app';

export function signJwt(payload: object) {
  return jwt.sign(payload, JWT_SECRET);
}

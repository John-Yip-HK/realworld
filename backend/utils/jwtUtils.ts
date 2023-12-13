import * as jwt from 'jsonwebtoken';

export function signJwtToken(payload: object) {
  return jwt.sign(payload, process.env['JWT_SECRET']!, {
    expiresIn: 60,
  });
}

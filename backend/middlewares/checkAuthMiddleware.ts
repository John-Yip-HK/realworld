import { type RequestHandler } from 'express-serve-static-core';

import statusCodes from '../constants/status-codes';
import { UNAUTHORISED_ERROR } from '../constants/user';
import { extractJwtFromHeader } from '../utils/jwtUtils';

const { UNAUTHORIZED, FORBIDDEN, INTERNAL_SERVER_ERROR } = statusCodes;

export const checkAuthMiddleware: RequestHandler = (req, res, next) => {
  const { headers: { authorization }, authInfo } = req;
  const token = extractJwtFromHeader(authorization);

  if (!token) {
    return res
      .status(UNAUTHORIZED.code)
      .send(UNAUTHORISED_ERROR);
  }

  if (Object.keys(authInfo ?? {}).length > 0) {
    return res
      .status(FORBIDDEN.code)
      .send(authInfo);
  }

  if (req.user) {
    req.user.token = token;
  } else {
    return res
      .status(INTERNAL_SERVER_ERROR.code)
      .send({
        error: INTERNAL_SERVER_ERROR.message,
        details: 'User information has lost unexpectedly.',
      });
  }

  next();
}

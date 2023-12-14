import { type RequestHandler } from 'express-serve-static-core';

import statusCodes from '../constants/status-codes';
import { UNAUTHORISED_ERROR } from '../constants/user';

export const checkAuthMiddleware: RequestHandler<void> = (req, res, next) => {
  const { headers: { authorization }, authInfo } = req;
  const token = authorization?.split(' ')[1];

  if (!token) {
    return res
      .status(statusCodes.UNAUTHORIZED.code)
      .send(UNAUTHORISED_ERROR);
  }

  if (Object.keys(authInfo ?? {}).length > 0) {
    return res
      .status(statusCodes.FORBIDDEN.code)
      .send(authInfo);
  }

  if (req.user) {
    req.user.token = token;
  }

  next();
}

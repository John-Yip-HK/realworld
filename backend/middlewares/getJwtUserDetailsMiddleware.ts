import { type Request, type Response, type NextFunction } from 'express';

import { verifyJwt, extractJwtFromHeader, type SignJwtPayload } from '../utils/jwtUtils';

export interface RequestWithCurrentUserEmail<
  Params = any, 
  ResBody = any, 
  ReqBody = any, 
  ReqQuery = any,
> extends Request<Params, ResBody, ReqBody, ReqQuery> {
  currentUserEmail?: SignJwtPayload['email'];
}

const getJwtUserDetailsMiddleware = (req: RequestWithCurrentUserEmail, _: Response, next: NextFunction) => {
  const jwt = extractJwtFromHeader(req.headers.authorization);
  const decodedJwt = verifyJwt(jwt) as Partial<SignJwtPayload> | undefined;

  if (decodedJwt?.email) {
    req.currentUserEmail = decodedJwt.email;
  }

  next();
};

export default getJwtUserDetailsMiddleware;

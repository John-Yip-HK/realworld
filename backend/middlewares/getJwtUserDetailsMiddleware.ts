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
  const decodedJwt = verifyJwt(extractJwtFromHeader(req.headers.authorization)) as Partial<SignJwtPayload> | undefined;

  req.currentUserEmail = decodedJwt?.email;

  next();
};

export default getJwtUserDetailsMiddleware;

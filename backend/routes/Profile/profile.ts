import { type NextFunction, Router, type Response } from 'express';

import { getProfileByUsername } from '../../controllers/profilesController';
import { extractJwtFromHeader, verifyJwt } from '../../utils/jwtUtils';

import type { ProfileRequest, ProfileResponse } from './types';

const profileRouter = Router();

profileRouter.get(
  '/:username',
  (
    req: ProfileRequest, 
    _: Response<ProfileResponse>, 
    next: NextFunction
  ) => {
    const decodedJwt = verifyJwt(extractJwtFromHeader(req.headers.authorization)) as { email?: string; } | undefined;

    req.currentUserEmail = decodedJwt?.email;

    next();
  },
  getProfileByUsername
);

export { profileRouter };

import { type NextFunction, Router, type Response } from 'express';

import { followUser, getProfileByUsername, unfollowUser } from '../../controllers/profilesController';
import { extractJwtFromHeader, verifyJwt } from '../../utils/jwtUtils';
import jwtPassportMiddleware from '../../middlewares/jwtPassportMiddleware';
import { checkAuthMiddleware } from '../../middlewares/checkAuthMiddleware';

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

profileRouter.post(
  '/:username/follow',
  jwtPassportMiddleware,
  checkAuthMiddleware,
  followUser,
);

profileRouter.delete(
  '/:username/follow',
  jwtPassportMiddleware,
  checkAuthMiddleware,
  unfollowUser,
);

export { profileRouter };

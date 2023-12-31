import { type NextFunction, Router, type Response } from 'express';

import { followUser, getProfileByUsername, unfollowUser } from '../../controllers/profilesController';
import jwtPassportMiddleware from '../../middlewares/jwtPassportMiddleware';
import { checkAuthMiddleware } from '../../middlewares/checkAuthMiddleware';

import getCurrentUserEmailMiddleware from '../../middlewares/getCurrentUserEmailMiddleware';

const profileRouter = Router();

profileRouter.get(
  '/:username',
  getCurrentUserEmailMiddleware,
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

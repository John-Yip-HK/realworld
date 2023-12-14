import { Router } from 'express';
import passport from 'passport';

import { checkAuthMiddleware } from '../../middlewares/checkAuthMiddleware';

import type { UserResponse } from './types';

const userRouter = Router();

userRouter.get<string, void, UserResponse>(
  '/', 
  passport.authenticate('jwt', { session: false }),
  checkAuthMiddleware,
  (req, res) => {
    return res.send({ user: { ...req.user! } });
  }
);

export { userRouter };

import { Router } from 'express';

import { updateCurrentUserController } from '../../controllers/userController';
import { checkAuthMiddleware } from '../../middlewares/checkAuthMiddleware';
import jwtPassportMiddleware from '../../middlewares/jwtPassportMiddleware';

import type { UserReqBody, UserResponse } from './types';

const userRouter = Router();

userRouter.use(jwtPassportMiddleware, checkAuthMiddleware);

userRouter.get<string, void, UserResponse>('/', (req, res) => {
  return res.send({ user: { ...req.user! } });
});

userRouter.put<string, void, UserResponse, UserReqBody>('/', updateCurrentUserController);

export { userRouter };

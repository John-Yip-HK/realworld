import { Router } from 'express';

import { updateCurrentUserController } from '../../controllers/userController';

import type { UserReqBody, UserResponse } from './types';

const userRouter = Router();

userRouter.get<string, void, UserResponse>('/', (req, res) => {
  return res.send({ user: { ...req.user! } });
});

userRouter.put<string, void, UserResponse, UserReqBody>('/', updateCurrentUserController);

export { userRouter };

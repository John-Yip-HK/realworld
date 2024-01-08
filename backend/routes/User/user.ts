import { Router } from 'express';

import { getCurrentUserController, updateCurrentUserController } from '../../controllers/userController';
import { checkAuthMiddleware } from '../../middlewares/checkAuthMiddleware';
import jwtPassportMiddleware from '../../middlewares/jwtPassportMiddleware';

import type { UserReqBody, UserResponse } from './';

const userRouter = Router();

userRouter.use(jwtPassportMiddleware, checkAuthMiddleware);

userRouter.get<void, UserResponse, void>('/', getCurrentUserController);

userRouter.put<void, UserResponse, UserReqBody>('/', updateCurrentUserController);

export { userRouter };

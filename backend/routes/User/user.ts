import { Router } from 'express';

import { updateCurrentUserController } from '../../controllers/userController';
import { checkAuthMiddleware } from '../../middlewares/checkAuthMiddleware';
import jwtPassportMiddleware from '../../middlewares/jwtPassportMiddleware';
import { hasFollowedUsers } from '../../utils/handleUserResponseUtils';

import type { UserReqBody, UserResponse } from './';

const userRouter = Router();

userRouter.use(jwtPassportMiddleware, checkAuthMiddleware);

userRouter.get<string, void, UserResponse>('/', (req, res) => {
  const currentUser = req.user!;
  const otherFields = hasFollowedUsers(currentUser) ? (() => {
    const { followedUsers, ...filteredFields } = currentUser;
    return filteredFields;
  })() : currentUser;
  
  return res.send({ user: otherFields, });
});

userRouter.put<string, void, UserResponse, UserReqBody>('/', updateCurrentUserController);

export { userRouter };

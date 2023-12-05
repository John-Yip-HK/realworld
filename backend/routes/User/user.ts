import { Router } from 'express';

import type { UserResponse } from './types';

const userRouter = Router();

const user: UserResponse = {
  user: {
    email: 'jake@jake.jake',
    token: 'jwt.token.here',
    username: 'jake',
    bio: 'I work at statefarm',
    image: null
  }
};

userRouter.get< , , UserResponse>('/', (req, res) => {
  res.send(user);
});

export { userRouter };

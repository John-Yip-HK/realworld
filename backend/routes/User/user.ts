import { Router } from 'express';

import type { User } from './types';

const userRouter = Router();

const user: User = {
  user: {
    email: 'jake@jake.jake',
    token: 'jwt.token.here',
    username: 'jake',
    bio: 'I work at statefarm',
    image: null
  }
};

userRouter.get('/', (req, res) => {
  res.send(user);
});

export { userRouter };

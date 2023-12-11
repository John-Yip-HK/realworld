import { Router } from 'express';

import { registerUserController } from '../../controllers/users';

const usersRouter = Router();

usersRouter.post('/', registerUserController);

export { usersRouter };

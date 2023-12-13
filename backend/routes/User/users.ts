import { Router } from 'express';

import { logInUserController, registerUserController } from '../../controllers/users';

const usersRouter = Router();

usersRouter.post('/', registerUserController);

usersRouter.post('/login', logInUserController);

export { usersRouter };

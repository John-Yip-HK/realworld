import { Router } from 'express';

import { logInUserController, registerUserController } from '../../controllers/usersController';

const usersRouter = Router();

usersRouter.post('/', registerUserController);

usersRouter.post('/login', logInUserController);

export { usersRouter };

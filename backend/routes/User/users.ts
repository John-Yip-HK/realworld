import { Router } from 'express';

const usersRouter = Router();

usersRouter.post< , , {}, { user: {
  email: string;
  password: string;
} }>('/login', (req, res) => {
  const { user: { email, password }, } = req.body;

  res.send({ email, password });
});

export { usersRouter };

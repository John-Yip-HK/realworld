import 'dotenv/config';

import express from 'express';

import { userRouter, usersRouter } from './routes/User';
import { tagsRouter } from './routes/Tags';
import { parseRoutePath } from './utils/parseRoutePath';

import { PORT } from './constants/app';

import './strategies/jwt';
import statusCodes from './constants/status-codes';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(parseRoutePath('/tags'), tagsRouter);
app.use(parseRoutePath('/users'), usersRouter);

app.use(parseRoutePath('/user'), userRouter);

app.use((_, res) => {
  const { code, message } = statusCodes.NOT_FOUND;
  
  res.status(code).send(message);
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});

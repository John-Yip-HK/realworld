import 'dotenv/config';

import express from 'express';

import { userRouter, usersRouter } from './routes/User';
import { tagsRouter } from './routes/Tags';
import { profileRouter } from './routes/Profile';
import { articlesRouter } from './routes/Articles';
import { parseRoutePath } from './utils/parseRoutePath';

import { PORT } from './constants/app';
import statusCodes from './constants/status-codes';

import './strategies/jwtStrategy';

const { NOT_FOUND } = statusCodes;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(parseRoutePath('/tags'), tagsRouter);
app.use(parseRoutePath('/users'), usersRouter);
app.use(parseRoutePath('/user'), userRouter);
app.use(parseRoutePath('/profiles'), profileRouter);
app.use(parseRoutePath('/articles'), articlesRouter);

app.use((_, res) => {
  const { code, message } = NOT_FOUND;
  
  res.status(code).send({
    error: message,
  });
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});

import 'dotenv/config';

import express from 'express';
import cookieParser from 'cookie-parser';
import session from 'express-session';

import { userRouter, usersRouter } from './routes/User';
import { tagsRouter } from './routes/Tags';
import { parseRoutePath } from './utils/parseRoutePath';

import { DUMMY_SECRET, PORT } from './constants/app';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: process.env['SESSION_SECRET'] || DUMMY_SECRET,
  resave: false,
  saveUninitialized: false,
}));

app.use(parseRoutePath('/tags'), tagsRouter);
app.use(parseRoutePath('/users'), usersRouter);

app.use(parseRoutePath('/user'), userRouter);

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});

import path from 'node:path';

import express from 'express';

import { userRouter } from './routes/User';
import { tagsRouter } from './routes/Tags';

const app = express();
const port = 8080;
const BASE_PATH = '/api';

app.use(path.join(BASE_PATH, '/user'), userRouter);
app.use(path.join(BASE_PATH, '/tags'), tagsRouter);

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});

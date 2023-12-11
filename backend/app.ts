import 'dotenv/config';

import express from 'express';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { PrismaClient } from '@prisma/client'

import { userRouter, usersRouter } from './routes/User';
import { tagsRouter } from './routes/Tags';
import { parseRoutePath } from './utils/parseRoutePath';

import { DUMMY_SECRET, PORT } from './constants/app';

const app = express();

const prisma = new PrismaClient();

async function main() {
  await prisma.users.create({
    data: {
      username: 'john',
      email: 'john@example.com',
      hashedPassword: 'password123',
    }
  });
  
  const allUsers = await prisma.users.findMany();
  console.dir(allUsers);

  await prisma.users.update({
    where: { id: 1 },
    data: { username: 'John' },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.log(e);
    await prisma.$disconnect();
    process.exit(1);
  })

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

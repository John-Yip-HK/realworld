import { Router } from 'express';

import type { Tag } from './types';

const tagsRouter = Router();

const tags: Tag[] = [
  'welcome',
  'implementations',
  'introduction',
  'codebaseShow',
  'ipsum',
  'et',
  'cupiditate',
  'qui',
  'quia',
  'deserunt',
];

tagsRouter.get('/', (_, res) => {
  res.send({ tags });
});

export { tagsRouter };

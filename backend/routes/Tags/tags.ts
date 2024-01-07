import { Router } from 'express';

import { getTagsController } from '../../controllers/tagsController';
import { type TagResponse } from '.';

const tagsRouter = Router();

tagsRouter.get<void, TagResponse, void, void>('/', getTagsController);

export { tagsRouter };

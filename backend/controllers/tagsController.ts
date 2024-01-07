import type { Request, Response } from 'express';

import { tags } from '../constants/tags';

import { type TagResponse } from '../routes/Tags';

export function getTagsController(
  _: Request<void, TagResponse, void, void>,
  res: Response<TagResponse>
) {
  return res.send({ tags });
}

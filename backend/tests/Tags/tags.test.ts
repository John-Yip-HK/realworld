import type { Response, Request } from 'express';
import { vi, test, expect } from 'vitest';

import { getTagsController } from '../../controllers/tagsController';

import { tags } from '../../constants/tags';

import { TagResponse } from '../../routes/Tags';

const request = {} as Request<void, TagResponse, void, void>;
const response = {
  send: vi.fn(() => {}),
} as unknown as Response<TagResponse>;

test('Get tags successfully', () => {
  const { send: mockedSend } = response;
  
  getTagsController(request, response);

  expect(mockedSend).toHaveBeenCalledTimes(1);
  expect(mockedSend).toHaveBeenCalledWith({ tags });
});

import path from 'path';

import { fetchFromServer } from '../api/fetchFromServer';
import { hasAuthCookie } from '../authCookieUtils';

import { ARTICLES_PATH } from '@/app/api/constants';

export async function serverFetchArticleComments(slug: string) {
  const isLoggedIn = hasAuthCookie();
  const commentsResponse: GetCommentResponse = await fetchFromServer(
    path.join(ARTICLES_PATH, slug, 'comments'),
    { isLoggedIn, }
  );

  if (!('comments' in commentsResponse)) {
    const jsonError = 'errors' in commentsResponse ? commentsResponse.errors : commentsResponse;
    throw new Error(JSON.stringify(jsonError));
  }

  return {
    isLoggedIn,
    comments: commentsResponse.comments,
  };
}

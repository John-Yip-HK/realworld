'use server';

import path from 'path';

import { revalidatePath } from 'next/cache'

import { fetchFromServer } from '../api/fetchFromServer';
import { getFormDataAttributeFunc } from './utils';

import { PROFILES_PATH } from '@/app/constants/profile';
import { ARTICLES_PATH } from '@/app/api/constants';
import { ARTICLE_NAV_PATH } from '@/app/constants/article';

export async function followUserServerAction(username: string, following: boolean, revalidateLink?: string) {
  const encodedUsername = encodeURIComponent(username);
  const requestUrl = path.join(PROFILES_PATH, encodedUsername, 'follow');

  await fetchFromServer(requestUrl, {
    method: following ? 'DELETE' : 'POST',
  });

  if (revalidateLink) {
    revalidatePath(revalidateLink);
  }
}

export async function favoriteArticleServerAction(articleSlug: string, favorited: boolean, pathToRevalidate?: string) {
  const requestUrl = path.join(ARTICLES_PATH, articleSlug, 'favorite');

  const articleResponse = await fetchFromServer(requestUrl, {
    method: favorited ? 'DELETE' : 'POST',
  });

  if (pathToRevalidate) {
    revalidatePath(pathToRevalidate);
  }

  return articleResponse;
}

export async function addCommentServerAction(_:unknown , formData: FormData) {
  const getAttributeFunc = getFormDataAttributeFunc(formData);

  const addCommentBody = {
    comment: {
      body: getAttributeFunc('comment-body'),
    }
  } satisfies AddCommentBody;
  const articleSlug = getAttributeFunc('article-slug');

  if (!articleSlug) {
    return {
      errors: {
        'System Error:': ['Cannot get article path. Please refresh the page and try again.'],
      },
    }
  }

  const fetchUrl = path.join(ARTICLES_PATH, articleSlug, 'comments');

  const addCommentResponse: {
    comment: Comment;
  } | ResponseError = await fetchFromServer(fetchUrl, {
    method: 'POST',
    body: addCommentBody,
  });

  if (!('comment' in addCommentResponse)) {
    return 'errors' in addCommentResponse ? addCommentResponse.errors : addCommentResponse;
  }

  revalidatePath(path.join(ARTICLE_NAV_PATH, articleSlug));
}

export async function deleteCommentServerAction(articleSlug: string, articleId: number) {
  const fetchUrl = path.join(ARTICLES_PATH, articleSlug, 'comments', articleId.toString());

  const deleteCommentResponse: object | ResponseError = await fetchFromServer(fetchUrl, {
    method: 'DELETE',
  });

  if (Object.keys(deleteCommentResponse).length > 0) {
    return 'errors' in deleteCommentResponse ? deleteCommentResponse.errors : deleteCommentResponse;
  }

  revalidatePath(path.join(ARTICLE_NAV_PATH, articleSlug));
}

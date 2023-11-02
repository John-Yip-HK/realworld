'use server';

import path from 'path';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { ARTICLES_PATH } from '@/app/api/constants';

import { fetchFromServer } from '../api/fetchFromServer';
import { getFormDataAttributeFunc } from './utils';

export async function createArticleServerAction(_: unknown, formData: FormData) {
  const getAttributeFunc = getFormDataAttributeFunc(formData);
  
  const newArticle = {
    title: getAttributeFunc('title'),
    description: getAttributeFunc('description'),
    body: getAttributeFunc('body'),
    tagList: (formData.getAll('tagList') ?? []).map((tag) => tag.toString()),
  } satisfies CreateArticleBody['article'];

  const username = getAttributeFunc('username');

  if (!username) {
    return {
      errors: {
        'System Error:': ['Cannot get username. Please refresh the page and try again.'],
      },
    };
  }
  
  const response: CreateArticleResponse = await fetchFromServer(ARTICLES_PATH, {
    method: 'POST',
    body: {
      article: newArticle
    } as CreateArticleBody,
  });

  if ('errors' in response) {
    return {
      errors: response.errors,
    };
  }

  const redirectPath = path.join('profile', username);
  
  revalidatePath(redirectPath, 'page');
  redirect(redirectPath);
}

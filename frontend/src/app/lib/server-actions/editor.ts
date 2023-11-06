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
      article: newArticle,
    } as CreateArticleBody,
  });

  if ('errors' in response) {
    const errorKeys = new Set(['title', 'description', 'body']);

    const modifiedErrorObject = Object.entries(structuredClone(response.errors))
      .reduce((errorObj, [key, value]) => {
        if (errorKeys.has(key)) {
          errorObj[key.charAt(0).toLocaleUpperCase() + key.slice(1)] = value;
        } else {
          errorObj[key] = value;
        }
        
        return errorObj;
      }, {} as typeof response.errors);
    
    return {
      errors: modifiedErrorObject,
    };
  }

  const redirectPath = path.join('profile', username);
  
  revalidatePath(redirectPath, 'page');
  redirect(redirectPath);
}

export async function updateArticleServerAction(_: unknown, formData: FormData) {
  const getAttributeFunc = getFormDataAttributeFunc(formData);
  
  const updatedArticle = {
    title: getAttributeFunc('title'),
    description: getAttributeFunc('description'),
    body: getAttributeFunc('body'),
    tagList: (formData.getAll('tagList') ?? []).map((tag) => tag.toString()),
  } satisfies UpdateArticleBody['article'];

  const slug = getAttributeFunc('slug');

  if (!slug) {
    return {
      errors: {
        'System Error:': ['Cannot get redirect path. Please refresh the page and try again.'],
      },
    };
  }

  const response: UpdateArticleResponse = await fetchFromServer(path.join(ARTICLES_PATH, slug), {
    method: 'PUT',
    body: {
      article: updatedArticle,
    } as UpdateArticleBody,
  });

  if ('errors' in response) {
    const errorKeys = new Set(['title', 'description', 'body']);

    const modifiedErrorObject = Object.entries(structuredClone(response.errors))
      .reduce((errorObj, [key, value]) => {
        if (errorKeys.has(key)) {
          errorObj[key.charAt(0).toLocaleUpperCase() + key.slice(1)] = value;
        } else {
          errorObj[key] = value;
        }
        
        return errorObj;
      }, {} as typeof response.errors);
    
    return {
      errors: modifiedErrorObject,
    };
  } else if ('status' in response) {
    return response;
  }

  const { slug: newArticleSlug } = response.article;
  const redirectPath = path.join('/article', newArticleSlug);
  
  redirect(redirectPath);
}

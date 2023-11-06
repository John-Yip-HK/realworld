import path from 'path';

import { redirect } from 'next/navigation';

import { fetchFromServer } from '@/app/lib/api/fetchFromServer';
import { hasAuthCookie } from '@/app/lib/authCookieUtils';

import { ARTICLES_PATH } from '@/app/api/constants';

export async function serverFetchArticle(slug: string): Promise<{
  article: Article;
  isLoggedIn: boolean;
}> {
  const isLoggedIn = hasAuthCookie();
  const articleResponse: GetArticleResponse = await fetchFromServer(
    path.join(ARTICLES_PATH, slug),
    { isLoggedIn, }
  );

  if ('errors' in articleResponse) {
    if ('article' in articleResponse.errors && articleResponse.errors.article[0] === 'not found') {
      redirect('/');
    }

    throw new Error(JSON.stringify(articleResponse.errors));
  }
  
  return {
    article: articleResponse.article,
    isLoggedIn,
  };
}

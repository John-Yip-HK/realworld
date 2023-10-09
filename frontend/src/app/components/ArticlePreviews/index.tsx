'use client';

import { useEffect, useState } from 'react';

import { getJsonFetch } from '@/app/lib/api/customFetch';
import { useAppStore } from '@/app/lib/store/useAppStore';
import { useHasAuthToken } from '@/app/lib/hooks/useHasAuthToken';
import { ARTICLES_PER_PAGE } from '@/app/lib/constants';

import ArticlePreview from './components/ArticlePreview';

export default function ArticlePreviews() {
  const selectedTag = useAppStore(store => store.selectedTag);
  const setNumArticles = useAppStore(store => store.setNumArticles);
  const pageNumber = useAppStore(store => store.pageNum);

  const hasAuthToken = useHasAuthToken();

  const [articles, setArticles] = useState<Article[]>();
  const [getArticlesError, setGetArticlesError] = useState<GetArticlesErrorResponse['errors']>()

  useEffect(() => {
    async function getArticles(selectedTag?: string) {
      const searchParams = new URLSearchParams();
      searchParams.set('limit', `${ARTICLES_PER_PAGE}`);
      searchParams.set('offset', `${pageNumber * ARTICLES_PER_PAGE}`);

      if (selectedTag !== undefined) {
        searchParams.set('tag', selectedTag);
      }

      const fetchUrl = `/api/articles${searchParams.size > 0 ? `?${searchParams.toString()}` : ''}`

      // TODO: Dynamically change URL hostname in different environments.
      const getArticlesPromise = getJsonFetch(fetchUrl, {
        loggedIn: false,
      });
      const getArticlesResponse: GetArticlesResponse = await getArticlesPromise;

      if (!ignore) {
        if ('errors' in getArticlesResponse) {
          setGetArticlesError(getArticlesResponse.errors);
        } else {
          setNumArticles(getArticlesResponse.articlesCount);
          setArticles(getArticlesResponse.articles);
        }
      }
    }

    let ignore = false;

    setNumArticles(0);
    setArticles(undefined);
    setGetArticlesError(undefined);

    getArticles(selectedTag);

    return () => {
      ignore = true;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTag, pageNumber]);

  if (getArticlesError) {
    // TODO: Handle it later.
    throw new Error(getArticlesError.toString());
  }
  else {
    return articles?.map(article => (
      <ArticlePreview
        key={article.slug}
        article={article}
        isLoggedIn={hasAuthToken}
      />
    )) ?? (
      <div className="article-preview">
          <p>Loading articles...</p>
      </div>
    );
  }
}

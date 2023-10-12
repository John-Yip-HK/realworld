'use client';

import { useEffect, useState } from 'react';

import { getJsonFetch } from '@/app/lib/api/customFetch';
import { useAppStore } from '@/app/lib/store/useAppStore';
import { useHasAuthToken } from '@/app/lib/hooks/useHasAuthToken';
import { ARTICLES_PER_PAGE } from '@/app/lib/constants';

import ArticlePreview from './components/ArticlePreview';

export default function ArticlePreviews() {
  const selectedTag = useAppStore(store => store.selectedTag);

  const pageNumber = useAppStore(store => store.pageNum);

  const setNumArticles = useAppStore(store => store.setNumArticles);
  const articles = useAppStore(store => store.articles);
  const setArticles = useAppStore(store => store.setArticles);

  const hasAuthToken = useHasAuthToken();

  const [getArticlesError, setGetArticlesError] = useState<GetArticlesErrorResponse['errors']>();

  const [loadingArticles, setLoadingArticles] = useState(false);

  useEffect(() => {
    async function getArticles(selectedTag?: string) {
      const searchParams = new URLSearchParams();
      searchParams.set('limit', `${ARTICLES_PER_PAGE}`);
      searchParams.set('offset', `${pageNumber * ARTICLES_PER_PAGE}`);

      if (selectedTag !== undefined) {
        searchParams.set('tag', selectedTag);
      }

      // TODO: Dynamically change URL hostname in different environments.
      let fetchUrl = '/api/articles';

      // TODO: Has auth token and selected tab is `your-feed`.
      if (hasAuthToken) {
        fetchUrl += '/feed';
      }

      if (searchParams.size > 0) {
        fetchUrl += `?${searchParams.toString()}`;
      }

      setLoadingArticles(true);
      
      const getArticlesPromise = getJsonFetch(fetchUrl, {
        loggedIn: hasAuthToken,
      });
      const getArticlesResponse: GetArticlesResponse = await getArticlesPromise;

      if (!ignore) {
        if ('errors' in getArticlesResponse) {
          setGetArticlesError(getArticlesResponse.errors);
          setNumArticles(0);
        } else {
          setNumArticles(getArticlesResponse.articlesCount);
          setArticles(getArticlesResponse.articles);
        }
      }

      setLoadingArticles(false);
    }
    
    let ignore = false;
    setGetArticlesError(undefined);
    
    getArticles(selectedTag);

    return () => {
      ignore = true;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTag, pageNumber]);

  useEffect(() => {
    setArticles([]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTag]);

  if (getArticlesError) {
    // TODO: Handle it later.
    throw new Error(getArticlesError.toString());
  }
  else {
    return (
      <>
      {
        articles?.map(article => (
          <ArticlePreview
            key={article.slug}
            article={article}
            isLoggedIn={hasAuthToken}
          />
        )) 
      }
      {
        loadingArticles ? 
        <div className="article-preview">
          <p>Loading articles...</p>
        </div> : 
        null
      }
      </>
    );
  }
}

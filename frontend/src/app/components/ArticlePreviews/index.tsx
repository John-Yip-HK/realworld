'use client';

import { useEffect, useState } from 'react';

import { getJsonFetch } from '@/app/lib/api/customFetch';
import { useHasAuthToken } from '@/app/lib/hooks/useHasAuthToken';
import { useAppStore } from '@/app/lib/store/useAppStore';

import ArticlePreview from './components/ArticlePreview';

import { ARTICLES_PER_PAGE } from '@/app/lib/constants';
import { ARTICLES_FEED_PATH, ARTICLES_PATH } from '@/app/api/constants';

export default function ArticlePreviews() {
  const selectedTag = useAppStore(store => store.selectedTag);
  const pageNumber = useAppStore(store => store.pageNum);
  const setNumArticles = useAppStore(store => store.setNumArticles);

  const hasAuthToken = useHasAuthToken();

  const [articles, setArticles] = useState<Article[]>([])
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

      let fetchUrl = hasAuthToken ? ARTICLES_FEED_PATH : ARTICLES_PATH;

      if (searchParams.size > 0) {
        fetchUrl += `?${searchParams.toString()}`;
      }

      setLoadingArticles(true);

      const getArticlesPromise = getJsonFetch(fetchUrl, {
        loggedIn: hasAuthToken,
        isClientFetch: true,
      });
      const getArticlesResponse: GetArticlesResponse = await getArticlesPromise;

      if (!ignore) {
        if ('errors' in getArticlesResponse) {
          setNumArticles(0);
          setGetArticlesError(getArticlesResponse.errors);
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
          (
            articles.length === 0 ?
            <div className="article-preview">
              <p>No articles are here... yet.</p>
            </div> :
            null
          )
      }
      </>
    );
  }
}

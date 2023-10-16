'use client';

import { useEffect, useState } from 'react';

import { getJsonFetch } from '@/app/lib/api/customFetch';
import { useHasAuthToken } from '@/app/lib/hooks/useHasAuthToken';
import { useAppStore } from '@/app/lib/store/useAppStore';

import ArticlePreview from './components/ArticlePreview';

import { ARTICLES_PER_PAGE } from '@/app/lib/constants';
import { ARTICLES_FEED_PATH, ARTICLES_PATH } from '@/app/api/constants';

import { YOUR_FEED_LINK_NAME } from '../MainPageTabs/constants';

export default function ArticlePreviews() {
  const pageNumber = useAppStore(store => store.pageNum);
  const setNumArticles = useAppStore(store => store.setNumArticles);
  const selectedTab = useAppStore(store => store.selectedTab);
  const tags = useAppStore(store => store.tags);

  const hasAuthToken = useHasAuthToken();

  const [articles, setArticles] = useState<Article[]>([])
  const [getArticlesError, setGetArticlesError] = useState<GetArticlesErrorResponse['errors']>();

  const [loadingArticles, setLoadingArticles] = useState(false);

  useEffect(() => {
    async function getArticles(selectedTab: string) {
      const searchParams = new URLSearchParams();
      searchParams.set('limit', `${ARTICLES_PER_PAGE}`);
      searchParams.set('offset', `${pageNumber * ARTICLES_PER_PAGE}`);

      if (tags.includes(selectedTab)) {
        searchParams.set('tag', selectedTab);
      }

      let fetchUrl = hasAuthToken && selectedTab === YOUR_FEED_LINK_NAME ? ARTICLES_FEED_PATH : ARTICLES_PATH;

      if (searchParams.size > 0) {
        fetchUrl += `?${searchParams.toString()}`;
      }

      setLoadingArticles(true);

      const getArticlesResponse: GetArticlesResponse = await getJsonFetch(fetchUrl, {
        loggedIn: hasAuthToken,
        isClientFetch: true,
      });

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

    getArticles(selectedTab);

    return () => {
      ignore = true;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTab, pageNumber]);

  useEffect(() => {
    setArticles([]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTab]);

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

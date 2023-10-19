import useSWR, { type SWRResponse } from "swr";

import { useEffect, useState } from 'react';

import { useAppStore } from '@/app/lib/store/useAppStore';

import { ARTICLES_FEED_PATH, ARTICLES_PATH } from '@/app/api/constants';
import { YOUR_FEED_LINK_NAME } from '@/app/components/MainPage/components/MainPageTabs/constants';

import { ARTICLES_PER_PAGE } from '../../constants';
import { getJsonFetch } from '../../api/customFetch';

type ExpectedResponse = GetArticlesResponse | GetArticleFeedsResponse;

interface UseArticlesResponse extends Pick<SWRResponse<ExpectedResponse>, 'isValidating' | 'mutate'> {
  articles?: Article[];
  error?: ErrorMessages | GetArticlesFeedAuthError | unknown;
}

export function useArticles(isLoggedIn: boolean): UseArticlesResponse {
  const setNumArticles = useAppStore(store => store.setNumArticles);

  const pageNumber = useAppStore(store => store.pageNum);
  const selectedTab = useAppStore(store => store.selectedTab);
  const tags = useAppStore(store => store.tags);

  const searchParams = new URLSearchParams();
  searchParams.set('limit', `${ARTICLES_PER_PAGE}`);
  searchParams.set('offset', `${pageNumber * ARTICLES_PER_PAGE}`);

  if (tags.includes(selectedTab)) {
    searchParams.set('tag', selectedTab);
  }

  const baseFetchUrl = isLoggedIn && selectedTab === YOUR_FEED_LINK_NAME ? ARTICLES_FEED_PATH : ARTICLES_PATH;
  const fetchUrl = `${baseFetchUrl}?${searchParams.toString()}`;

  const getArticles = useSWR<ExpectedResponse, unknown, [string, boolean]>([fetchUrl, isLoggedIn], ([fetchUrl, isLoggedIn]) => getJsonFetch(fetchUrl, {
    loggedIn: isLoggedIn,
    isClientFetch: true,
  }), {
    revalidateOnFocus: false,
  });

  const { data: articleResponse, error: getArticleError, isLoading, ...otherProps } = getArticles;
  const { isValidating } = otherProps;

  useEffect(() => {
    if (articleResponse) {
      if ('articlesCount' in articleResponse) {
        setNumArticles(articleResponse.articlesCount);
      } else if ('errors' in articleResponse) {
        setNumArticles(0);
      }
    }
    else if (getArticleError) {
      setNumArticles(0);
    }
  }, [articleResponse, getArticleError, setNumArticles]);

  if (articleResponse && !isValidating) {
    if ('articles' in articleResponse) {
      return {
        articles: articleResponse.articles,
        ...otherProps,
      };
    }
    if ('errors' in articleResponse) {
      return {
        error: articleResponse.errors,
        ...otherProps,
      }
    }
    else if ('status' in articleResponse) {
      return {
        error: articleResponse.message,
        ...otherProps,
      }
    }
  }
  else if (getArticleError) {
    return {
      error: getArticleError,
      ...otherProps,
    }
  }

  return otherProps;
}
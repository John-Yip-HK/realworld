import useSWR, { type SWRResponse } from "swr";

import { useAppStore } from '@/app/lib/store/useAppStore';

import { ARTICLES_FEED_PATH, ARTICLES_PATH } from '@/app/api/constants';
import { YOUR_FEED_LINK_NAME } from '@/app/components/MainPage/components/MainPageTabs/constants';

import { ARTICLES_PER_PAGE } from '../../../constants/article';
import { fetchFromClient } from '../../api/fetchFromClient';

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

  const getArticles = useSWR<ExpectedResponse, unknown, [string, boolean]>(
    [fetchUrl, isLoggedIn], 
    ([fetchUrl, isLoggedIn]) => fetchFromClient(
      fetchUrl,
      { isLoggedIn, }
    ), 
    {
      revalidateOnFocus: false,
      dedupingInterval: 0,
    }
  );

  const { data: articleResponse, error: getArticleError, isLoading, ...otherProps } = getArticles;
  const { isValidating } = otherProps;
  let specificProps = {};

  if (articleResponse && !isValidating) {
    const isServerError = typeof articleResponse === 'string';
    
    if (!isServerError && 'articles' in articleResponse) {
      setNumArticles(articleResponse.articlesCount);

      specificProps = {
        articles: articleResponse.articles,
      };
    }
    else {
      setNumArticles(0);
  
      if (isServerError) {
        specificProps = {
          error: articleResponse,
        }
      }
      else if ('errors' in articleResponse) {
        specificProps = {
          error: articleResponse.errors,
        }
      }
      else if ('status' in articleResponse) {
        specificProps = {
          error: articleResponse.message,
        }
      }
    }
  }
  else if (getArticleError) {
    specificProps = {
      error: getArticleError,
    }
  } else {
    setNumArticles(0);
  }

  return {
    ...specificProps,
    ...otherProps,
  };
}
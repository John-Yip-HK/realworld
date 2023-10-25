import useSWR, { type SWRResponse } from "swr";

import { useAppStore } from '@/app/lib/store/useAppStore';

import { ARTICLES_FEED_PATH, ARTICLES_PATH } from '@/app/api/constants';
import { YOUR_FEED_LINK_NAME } from '@/app/components/MainPage/components/MainPageTabs/constants';

import { ARTICLES_PER_PAGE } from '../../../constants/article';
import { routeHandlerFetch } from '../../api/customFetch';

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

  const getArticles = useSWR<ExpectedResponse, unknown, string>(fetchUrl, routeHandlerFetch, {
    revalidateOnFocus: false,
  });

  const { data: articleResponse, error: getArticleError, isLoading, ...otherProps } = getArticles;
  const { isValidating } = otherProps;

  if (articleResponse && !isValidating) {
    if ('articles' in articleResponse) {
      setNumArticles(articleResponse.articlesCount);

      return {
        articles: articleResponse.articles,
        ...otherProps,
      };
    }
    if ('errors' in articleResponse) {
      setNumArticles(0);

      return {
        error: articleResponse.errors,
        ...otherProps,
      }
    }
    else if ('status' in articleResponse) {
      setNumArticles(0);

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
  } else {
    setNumArticles(0);
  }

  return otherProps;
}
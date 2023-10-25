import useSWR, { type SWRResponse } from 'swr';

import { routeHandlerFetch } from '../../api/customFetch';

import { ARTICLES_PATH } from '@/app/api/constants';
import { ARTICLES_PER_PAGE, tabs } from '@/app/constants/profile';

interface UseProfileArticles extends
  Pick<SWRResponse<GetArticlesResponse>, 'isValidating' | 'mutate'>, Partial<GetArticlesSuccessResponse>
    {
      error?: ErrorMessages | unknown;
    }

export function useProfileArticles(username: string, selectedTab: string, pageNum: number): UseProfileArticles {
  const searchParams = new URLSearchParams();
  searchParams.set('limit', `${ARTICLES_PER_PAGE}`);
  searchParams.set('offset', `${pageNum * ARTICLES_PER_PAGE}`);

  if (selectedTab === tabs[0].linkName) {
    searchParams.set('author', username);
  }
  else if (selectedTab === tabs[1].linkName) {
    searchParams.set('favorited', username);
  }

  const fetchUrl = `${ARTICLES_PATH}?${searchParams.toString()}`;

  const { 
    data: profileArticlesResponse, 
    error: getProfileArticlesError, 
    isLoading,
    ...otherProps
  } = useSWR<GetArticlesResponse>(fetchUrl, routeHandlerFetch, {
    revalidateOnFocus: false,
    dedupingInterval: 0,
  });
  const { isValidating } = otherProps;

  if (profileArticlesResponse && !isValidating) {
    const isServerError = typeof profileArticlesResponse === 'string';
    
    if (!isServerError && 'articles' in profileArticlesResponse) {
      return {
        ...profileArticlesResponse,
        ...otherProps,
      };
    }

    if (isServerError) {
      return {
        error: profileArticlesResponse,
        ...otherProps,
      }
    }
    else if ('errors' in profileArticlesResponse) {
      return {
        error: profileArticlesResponse.errors,
        ...otherProps,
      }
    }
    else if ('status' in profileArticlesResponse) {
      return {
        error: profileArticlesResponse.message,
        ...otherProps,
      }
    }
  }
  else if (getProfileArticlesError) {
    return {
      error: getProfileArticlesError,
      ...otherProps,
    }
  }

  return otherProps;
}

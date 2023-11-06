import { getRouteHandlerPath } from '@/app/api/utils';

import { customFetch } from './customFetch';
import { type FetchOptions } from './types';

import { NO_CONTENT_STATUS_CODE } from '@/app/api/constants';

/**
 * Fetches data from the client using the provided URL and options.
 * @param url - The URL to fetch data from.
 * @param options - Optional fetch options.
 * @returns A Promise that resolves to the fetched data.
 */
export const fetchFromClient = async (url: string, options?: FetchOptions) => {
  const response = await customFetch(getRouteHandlerPath(url), {
    ...options,
    clientHasAuth: options?.isLoggedIn,
  });

  if (response.status === NO_CONTENT_STATUS_CODE) {
    return undefined;
  }
  
  return await response.json();
}

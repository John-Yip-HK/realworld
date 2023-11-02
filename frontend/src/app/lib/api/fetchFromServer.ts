import { getApiPath } from "@/app/api/utils";

import { 
  customFetch,
} from './customFetch';
import { getAuthToken } from '../authCookieUtils';
import { type FetchFromServerOptions } from './types';

export const fetchFromServer = async (url: string, options?: FetchFromServerOptions) => {
  const defaultOptions = {
    isLoggedIn: true,
    ...structuredClone(options),
  } satisfies FetchFromServerOptions;
  const serverFetchUrl = getApiPath(url);
  const authToken = getAuthToken();

  const { isLoggedIn, ...otherOptions } = defaultOptions;

  if (isLoggedIn && authToken !== undefined) {
    otherOptions.headers = {
      ...options?.headers,
      'Authorization': `Bearer ${authToken}`,
    }
  }

  const response = await customFetch(serverFetchUrl, otherOptions);

  return response.json();
}

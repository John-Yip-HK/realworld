import { getApiPath } from "@/app/api/utils";

import { 
  type CustomFetchOptions, 
  customFetch,
} from './customFetch';
import { getAuthToken } from '../authCookieUtils';

type FetchFromServerOptions = CustomFetchOptions & {
  isLoggedIn?: boolean;
};

export const fetchFromServer = async (url: string, options?: FetchFromServerOptions) => {
  const defaultOptions = {
    isLoggedIn: true,
    ...structuredClone(options),
  };
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

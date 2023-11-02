import { DEFAULT_HEADERS } from "@/app/api/constants";
import { getApiPath } from "@/app/api/utils";

import { type FetchOptions, type CustomFetchOptions } from './types';

export const customFetch = (url: string, options?: CustomFetchOptions) => {
  const obj: RequestInit = {
    headers: DEFAULT_HEADERS,
  };

  if (options) {
    if ('method' in options) {
      obj.method = options.method;
    }

    if ('body' in options) {
      obj.body = JSON.stringify(options.body);
    }

    if ('headers' in options) {
      obj.headers = {
        ...obj.headers,
        ...options.headers,
      };
    }
  }

  return fetch(url, obj);
};

export const routeHandlerFetch = async (url: string, options?: FetchOptions) => {
  let fetchUrl = `/api${url.charAt(0) === '/' ? url : '/' + url}`;

  const response = await customFetch(fetchUrl, {
    ...options,
    cache: 'no-store',
  });
  return await response.json();
}

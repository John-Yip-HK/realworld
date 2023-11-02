import { DEFAULT_HEADERS } from "@/app/api/constants";

import { type CustomFetchOptions } from './types';

/**
 * Sends a custom fetch request to the specified URL with the given options.
 * 
 * Caching is opt-ed out by default (`cache: 'no-store'`).
 * 
 * @param url - The URL to send the request to.
 * @param options - The options to include in the request.
 * @returns A Promise that resolves to the Response object representing the response to the request.
 */
export const customFetch = (url: string, options?: CustomFetchOptions) => {
  let obj: RequestInit = {
    headers: DEFAULT_HEADERS,
    cache: 'no-store',
  };

  if (options) {
    const { body, headers, ...otherOptions } = options;

    if (body) {
      obj.body = JSON.stringify(body);
    }
    if (headers) {
      obj.headers = {
        ...obj.headers,
        ...headers,
      }
    }

    obj = Object.assign(obj, otherOptions);
  }

  return fetch(url, obj);
};

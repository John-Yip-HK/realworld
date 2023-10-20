import { DEFAULT_HEADERS } from "@/app/api/constants";
import { getApiPath } from "@/app/api/utils";

export type FetchOptions = Omit<RequestInit, 'body'> & {
  body?: object;
  isServerFetch?: boolean;
};
type CustomFetchOptions = Omit<FetchOptions, 'isServerFetch'>;

const customFetch = (url: string, options?: CustomFetchOptions) => {
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

  if (options?.isServerFetch) {
    fetchUrl = url;
  }

  const response = await customFetch(fetchUrl, options);
  return await response.json();
}

export const fetchFromServer = async (url: string, options?: CustomFetchOptions) => {
  const serverFetchUrl = getApiPath(url);

  return routeHandlerFetch(serverFetchUrl, {
    ...options,
    isServerFetch: true,
  });
}
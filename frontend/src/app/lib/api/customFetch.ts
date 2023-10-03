import { DEFAULT_HEADERS } from "@/app/api/constants";
import { useAppStore } from "../store/useAppStore";

export type FetchOptions = {
  method?: string;
  body?: object;
  loggedIn?: boolean;
  headers?: RequestInit['headers'];
};

/**
 * `loggedIn` parameter in `options` is `true` by default.
 */
export const customFetch = (url: string, options: FetchOptions = {
  loggedIn: true,
}) => {
  let obj: RequestInit = {
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

    if (options.loggedIn) {
      const authToken = useAppStore.getState().authToken;

      if (authToken === null) {
        throw new Error('You are not logged in.');
      }
      
      obj.headers = {
        ...obj.headers,
        'Authorization': `Bearer ${authToken}`,
      };
    }
  }
  
  return fetch(url, obj);
};

export const getJsonFetch = (url: string, options: FetchOptions = {
  loggedIn: true,
}) => customFetch(url, options).then(response => response.json());

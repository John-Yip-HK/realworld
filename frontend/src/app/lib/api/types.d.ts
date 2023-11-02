export type FetchOptions = Omit<RequestInit, 'body'> & {
  body?: object;
  isLoggedIn?: boolean;
};

export type CustomFetchOptions = Omit<FetchOptions, 'isServerFetch'>;

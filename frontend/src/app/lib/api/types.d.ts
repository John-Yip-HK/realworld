export type FetchFromServerOptions = Omit<RequestInit, 'body'> & {
  body?: object;
  isLoggedIn?: boolean;
};

export type FetchFromClientOptions = Omit<FetchFromServerOptions, 'isLoggedIn'>;

export type CustomFetchOptions = FetchFromClientOptions;

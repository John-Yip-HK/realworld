export type FetchOptions = Omit<RequestInit, 'body'> & {
  body?: object;
  isLoggedIn?: boolean;
};

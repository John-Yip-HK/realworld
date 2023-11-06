export const TAGS_PATH = '/tags';
export const ARTICLES_PATH = '/articles';
export const ARTICLES_FEED_PATH = ARTICLES_PATH + '/feed';

export const DEFAULT_HEADERS: HeadersInit = {
  'accept': 'application/json',
  'Content-Type': 'application/json',
};

export const CLIENT_NEEDS_AUTH_HEADER_KEY = 'Client-Needs-Auth';

export const UNAUTHORIZED_ERROR: UnauthorizedError = {
  status: "error",
  message: "missing authorization credentials",
};

export const NO_CONTENT_STATUS_CODE = 204;
export const UNAITHORIZED_ERROR_STATUS_CODE = 401;

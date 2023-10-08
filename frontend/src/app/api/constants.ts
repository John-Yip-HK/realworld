export const USERS_PATH = '/users';
export const LOGIN_PATH = USERS_PATH + '/login';
export const USER_PATH = USERS_PATH.slice(0, -1);
export const TAGS_PATH = '/tags';
export const ARTICLES_PATH = '/articles';

export const DEFAULT_HEADERS: HeadersInit = {
  'accept': 'application/json',
  'Content-Type': 'application/json',
};
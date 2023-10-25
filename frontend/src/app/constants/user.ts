export const TOKEN_COOKIE_NAME = 'token';
export const UNKNOWN_ERROR_OBJECT = {
  'Unknown Error:': ['Please try again later.']
};

export const SIGN_UP_PATH = '/register';
export const USERS_PATH = '/users';
export const LOGIN_PATH = USERS_PATH + '/login';
export const USER_PATH = USERS_PATH.slice(0, -1);

export const DUMMY_USER_OBJECT = {
  username: '',
  email: '',
  password: '',
} satisfies User;

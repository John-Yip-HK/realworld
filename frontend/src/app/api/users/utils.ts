import { cookies } from 'next/headers'

const TOKEN_COOKIE_NAME = 'token';

export function createSetCookieHeader(token: string) {
  return {
    'Set-Cookie': `${TOKEN_COOKIE_NAME}=${token}; Secure; HttpOnly; SameSite=Strict`
  }
}

export function createAuthHeader() {
  const cookieStore = cookies()
  const storedToken = cookieStore.get(TOKEN_COOKIE_NAME);

  if (storedToken === undefined) return {};

  return {
    'Authorization': `Bearer ${storedToken.value}`,
  }
}
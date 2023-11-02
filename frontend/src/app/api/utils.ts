import path from 'path';

export function getApiPath(...paths: string[]) {
  const BASE_API_PATH = process.env.API_URL as string;

  return path.join(BASE_API_PATH, ...paths);
}

export function getRouteHandlerPath(url: string) {
  return path.join('/api', url);
}

export function setAuthorizationHeader(header: Headers, token?: string) {
  if (token) {
    header.set('Authorization', `Bearer ${token}`);
  }
}

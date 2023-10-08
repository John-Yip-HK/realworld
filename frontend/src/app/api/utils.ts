import path from 'node:path';

export function getApiPath(...paths: string[]) {
  const BASE_API_PATH = process.env.API_URL as string;
  
  return path.join(BASE_API_PATH, ...paths);
}
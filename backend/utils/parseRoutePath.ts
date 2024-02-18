
import { join } from 'path';

export function parseRoutePath(...paths: string[]): string {
  const basePath = process.env['BASE_PATH']!;

  if (basePath === 'undefined') {
    throw new Error('BASE_PATH is missing');
  }
  
  return join(basePath, ...paths);
}

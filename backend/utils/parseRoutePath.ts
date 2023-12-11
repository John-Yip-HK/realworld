
import { join } from 'path';

export function parseRoutePath(...paths: string[]): string {
  const basePath = process.env['BASE_PATH']!;
  return join(basePath, ...paths);
}

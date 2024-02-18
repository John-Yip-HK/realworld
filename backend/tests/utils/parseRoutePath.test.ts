import { join } from 'path';

import { parseRoutePath } from '../../utils/parseRoutePath';

describe('parseRoutePath', () => {
  test('should return the base path', () => {
    process.env['BASE_PATH'] = '/api';

    const basePath = parseRoutePath();

    expect(basePath).toBe('/api');
  });

  test('should return a valid path', () => {
    process.env['BASE_PATH'] = '/api';

    const basePath = parseRoutePath('a', 'b', 'c');

    expect(basePath).toBe(join(process.env['BASE_PATH'], 'a', 'b', 'c'));
  });

  test('should throw an error if BASE_PATH is not defined', () => {
    process.env['BASE_PATH'] = undefined;

    expect(() => parseRoutePath()).toThrowError('BASE_PATH is missing');
  });
});
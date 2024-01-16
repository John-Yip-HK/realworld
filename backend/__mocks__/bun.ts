import { password as bunPassword } from 'bun';
import { beforeEach } from 'vitest';
import { mockDeep, mockReset } from 'vitest-mock-extended';

beforeEach(() => {
  mockReset(password);
})

const password = mockDeep<typeof bunPassword>();
export { password };

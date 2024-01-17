import * as realJwt from 'jsonwebtoken';
import { beforeEach } from 'vitest';
import { mockDeep, mockReset } from 'vitest-mock-extended';

beforeEach(() => {
  mockReset(mockedJwt);
})

const mockedJwt = mockDeep<typeof realJwt>();
const { sign, verify } = mockedJwt;

export { sign, verify }

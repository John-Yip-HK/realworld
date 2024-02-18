import { Request, Response } from 'express';
import { Mock, vi } from 'vitest';

import { verifyJwt, extractJwtFromHeader } from '../../utils/jwtUtils';
import getJwtUserDetailsMiddleware from '../../middlewares/getJwtUserDetailsMiddleware';

interface RequestWithCurrentUserEmail extends Request {
  currentUserEmail: string | undefined;
}

vi.mock('../../utils/jwtUtils', () => ({
  verifyJwt: vi.fn(),
  extractJwtFromHeader: vi.fn(),
}));

describe('getJwtUserDetailsMiddleware', () => {
  let req: RequestWithCurrentUserEmail;
  let res: Response;
  let next: Mock;

  beforeEach(() => {
    req = {
      headers: {
        authorization: 'Bearer token',
      },
    } as unknown as RequestWithCurrentUserEmail;

    res = {} as Response;

    next = vi.fn();
  });

  it('should set currentUserEmail if jwt is valid', () => {
    const decodedJwt = { email: 'test@example.com' };
    (verifyJwt as Mock).mockReturnValueOnce(decodedJwt);

    getJwtUserDetailsMiddleware(req, res, next);

    expect(extractJwtFromHeader).toHaveBeenCalledWith(req.headers.authorization);
    expect(req.currentUserEmail).toBe(decodedJwt.email);
    expect(next).toHaveBeenCalled();
  });

  it('should not set currentUserEmail if jwt is invalid', () => {
    delete req.headers.authorization;
    (verifyJwt as Mock).mockReturnValueOnce(undefined);

    getJwtUserDetailsMiddleware(req, res, next);

    expect(extractJwtFromHeader).toHaveBeenCalledWith(undefined);
    expect(req).not.toHaveProperty('currentUserEmail');
    expect(next).toHaveBeenCalled();
  });
});